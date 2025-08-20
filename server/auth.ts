import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { emailService } from "./email-service";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored) {
    return false;
  }
  
  // Handle new format: hash.salt
  if (stored.includes(".")) {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      return false; // Missing hash or salt
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return hashedBuf.length === suppliedBuf.length && timingSafeEqual(hashedBuf, suppliedBuf);
  }
  
  // Handle old format: raw hash (for backward compatibility)
  // This should not be used for new passwords, but helps with migration
  return false; // Old format passwords need to be reset
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User no longer exists, clear the session
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      // Handle any database errors gracefully
      done(null, false);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    // Log user registration activity
    await storage.logActivity({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'User Registration',
      resourceType: 'user',
      resourceId: user.id,
      resourceName: user.username,
      details: `New user ${user.name} registered with role ${user.role}`,
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      severity: 'medium',
      category: 'user'
    });

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail(user).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    // Log successful login activity
    if (req.user) {
      await storage.logActivity({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'User Login',
        resourceType: 'auth',
        resourceId: req.user.id,
        resourceName: req.user.username,
        details: `User ${req.user.name} successfully logged into LinxIQ`,
        ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'low',
        category: 'auth'
      });
    }
    res.status(200).json(req.user);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect("https://linxap.com");
      });
    });
  });

  app.post("/api/logout", async (req, res, next) => {
    // Log logout activity before logging out
    if (req.user) {
      await storage.logActivity({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'User Logout',
        resourceType: 'auth',
        resourceId: req.user.id,
        resourceName: req.user.username,
        details: `User ${req.user.name} logged out of LinxIQ`,
        ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'low',
        category: 'auth'
      });
    }
    
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.json({ success: true, message: "Logout successful" });
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Candidate-specific routes
  app.get("/api/candidate/assignments", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "candidate") {
      return res.sendStatus(401);
    }
    
    try {
      const assignments = await storage.getUserAssignments(req.user.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching candidate assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get("/api/candidate/results", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "candidate") {
      return res.sendStatus(401);
    }
    
    try {
      const results = await storage.getUserResults(req.user.id);
      res.json(results);
    } catch (error) {
      console.error("Error fetching candidate results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });
}
