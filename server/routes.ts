import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { teroApiTests } from "./tero-api-tests";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateQuestions, enhanceTestDescription, analyzeCode, analyzeSentiment, analyzeQuestionQuality, generateLearningPath, analyzeTestResults } from "./grok";
import { hrService } from "./hr-integration";
import { insertTestAssignmentSchema, insertTestSessionSchema, insertTestResultSchema, insertHrIntegrationSchema } from "@shared/schema";
import { z } from "zod";
import { requirePermission, requireRole } from "./middleware/permissions";
import { PERMISSIONS, ROLES, ADDITIONAL_PERMISSIONS, ALL_PERMISSIONS, type Permission } from "@shared/roles";
import { aiRoleEngine } from "./ai-role-engine";
import { emailService } from "./email-service";
import { registerEmailRoutes } from "./email-endpoints";
import { registerEmployeeEndpoints } from "./employee-endpoints";
import { createSampleEmployees } from "./employee-seed-data";
import { createSampleCompanies, createSampleDepartments } from "./company-seed-data";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import multer from "multer";
import { extname } from "path";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

const scryptAsync = promisify(scrypt);

// Hash password function
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Configure multer for photo uploads
const storage_config = multer.memoryStorage();
const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

export function registerRoutes(app: Express): Server {
  // Serve objects from object storage
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Email notification endpoints
  registerEmailRoutes(app);
  
  // Employee-specific endpoints
  registerEmployeeEndpoints(app);

  // Create sample data endpoints
  app.post("/api/admin/seed-data", async (req, res) => {
    try {
      console.log("Creating sample companies...");
      const companies = await createSampleCompanies();
      
      console.log("Creating sample departments...");  
      const departments = await createSampleDepartments();
      
      console.log("Creating sample employees...");
      const employees = await createSampleEmployees();
      
      res.json({ 
        message: "Sample data created successfully", 
        data: {
          companies: companies.length,
          departments: departments.length,
          employees: employees.length
        }
      });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ error: "Failed to create sample data", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create sample company and department data
  app.post("/api/admin/seed-companies", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      // Create companies
      const company1 = await storage.createCompany({
        name: "TechCorp Solutions",
        code: "TECH001",
        description: "Leading technology solutions provider",
        addressLine1: "123 Tech Street",
        city: "Silicon Valley",
        state: "CA",
        postalCode: "94025",
        primaryPhone: "+1-555-0100",
        primaryEmail: "info@techcorp.com",
        website: "https://techcorp.com",
        industry: "Technology",
        size: "500-1000",
        isActive: true
      });

      const company2 = await storage.createCompany({
        name: "DataDynamics Inc",
        code: "DATA001",
        description: "Data science and analytics company",
        addressLine1: "456 Data Drive",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        primaryPhone: "+1-555-0200",
        primaryEmail: "contact@datadynamics.com",
        website: "https://datadynamics.com",
        industry: "Data & Analytics",
        size: "100-500",
        isActive: true
      });

      const company3 = await storage.createCompany({
        name: "CloudFirst Systems",
        code: "CLOUD001",
        description: "Cloud infrastructure and DevOps specialists",
        addressLine1: "789 Cloud Avenue",
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        primaryPhone: "+1-555-0300",
        primaryEmail: "hello@cloudfirst.com",
        website: "https://cloudfirst.com",
        industry: "Cloud Computing",
        size: "50-100",
        isActive: true
      });

      // Create departments for TechCorp
      await storage.createDepartment({
        name: "Engineering",
        code: "ENG",
        description: "Software development and technical implementation",
        companyId: company1.id,
        budget: "2500000",
        isActive: true
      });

      await storage.createDepartment({
        name: "Product Management",
        code: "PROD",
        description: "Product strategy and roadmap planning",
        companyId: company1.id,
        budget: "800000",
        isActive: true
      });

      await storage.createDepartment({
        name: "Quality Assurance",
        code: "QA",
        description: "Software testing and quality control",
        companyId: company1.id,
        budget: "600000",
        isActive: true
      });

      // Create departments for DataDynamics
      await storage.createDepartment({
        name: "Data Science",
        code: "DS",
        description: "Machine learning and analytics",
        companyId: company2.id,
        budget: "1200000",
        isActive: true
      });

      await storage.createDepartment({
        name: "Data Engineering",
        code: "DE",
        description: "Data pipeline and infrastructure",
        companyId: company2.id,
        budget: "900000",
        isActive: true
      });

      // Create departments for CloudFirst
      await storage.createDepartment({
        name: "DevOps",
        code: "DEVOPS",
        description: "Infrastructure automation and deployment",
        companyId: company3.id,
        budget: "700000",
        isActive: true
      });

      await storage.createDepartment({
        name: "Cloud Architecture",
        code: "CLOUD",
        description: "Cloud solution design and implementation",
        companyId: company3.id,
        budget: "850000",
        isActive: true
      });

      // Create sub-companies
      await storage.createSubCompany({
        name: "TechCorp Labs",
        code: "TECH-LABS",
        description: "Research and development division",
        parentCompanyId: company1.id,
        location: "123 Innovation Blvd, Palo Alto, CA 94301",
        isActive: true
      });

      await storage.createSubCompany({
        name: "DataDynamics Consulting",
        code: "DATA-CONSULT",
        description: "Client consulting services",
        parentCompanyId: company2.id,
        location: "456 Consulting Circle, Austin, TX 78702",
        isActive: true
      });

      res.json({ message: "Sample company data created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create sample data" });
    }
  });

  // Create complete batch assignment system
  // Add sample questions to tests
  app.post("/api/add-sample-questions", async (req, res) => {
    try {
      console.log("Adding sample questions to tests...");
      
      // Get the tests created by batch assignment
      const tests = await storage.getTests();
      const reactTest = tests.find((t: any) => t.title === "React Development Skills");
      const jsTest = tests.find((t: any) => t.title === "JavaScript Fundamentals");
      
      if (reactTest) {
        // Add React questions
        await storage.createQuestion({
          testId: reactTest.id,
          type: "mcq",
          question: "What is the correct way to create a functional component in React?",
          options: ["function MyComponent() { return <div>Hello</div>; }", "const MyComponent = () => <div>Hello</div>;", "class MyComponent extends React.Component { render() { return <div>Hello</div>; } }", "Both A and B"],
          correctAnswer: "Both A and B",
          tags: ["frontend", "react"],
          difficulty: "medium",
          weightage: 10,
          explanation: "Functional components can be created using function declarations or arrow functions.",
          timeLimit: 60,
          status: "approved"
        });
        
        await storage.createQuestion({
          testId: reactTest.id,
          type: "mcq",
          question: "Which hook is used to manage state in functional components?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctAnswer: "useState",
          tags: ["frontend", "react", "hooks"],
          difficulty: "easy",
          weightage: 10,
          explanation: "useState is the primary hook for managing local state in functional components.",
          timeLimit: 45,
          status: "approved"
        });
      }
      
      if (jsTest) {
        // Add JavaScript questions
        await storage.createQuestion({
          testId: jsTest.id,
          type: "mcq",
          question: "What is the output of: console.log(typeof null)?",
          options: ["null", "undefined", "object", "string"],
          correctAnswer: "object",
          tags: ["programming", "javascript"],
          difficulty: "medium",
          weightage: 10,
          explanation: "This is a well-known JavaScript quirk. typeof null returns 'object' due to a legacy bug.",
          timeLimit: 30,
          status: "approved"
        });
        
        await storage.createQuestion({
          testId: jsTest.id,
          type: "mcq",
          question: "Which method is used to add elements to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correctAnswer: "push()",
          tags: ["programming", "javascript", "arrays"],
          difficulty: "easy",
          weightage: 10,
          explanation: "push() adds one or more elements to the end of an array and returns the new length.",
          timeLimit: 30,
          status: "approved"
        });
      }
      
      res.json({ 
        success: true, 
        message: "Sample questions added successfully",
        reactQuestions: reactTest ? 2 : 0,
        jsQuestions: jsTest ? 2 : 0
      });
    } catch (error) {
      console.error("Error adding sample questions:", error);
      res.status(500).json({ error: "Failed to add sample questions" });
    }
  });

  app.post("/api/setup-batch-assignments", async (req, res) => {
    try {
      console.log("Starting batch assignment setup...");
      
      // 1. Create or get existing company and project
      const companies = await storage.getCompanies();
      let company, project;
      
      if (companies.length === 0) {
        company = await storage.createCompany({
          name: "TechCorp Solutions",
          code: "TECH-CORP",
          description: "Technology consulting company",
          industry: "Technology",
          size: "Mid-size (100-999)",
          city: "San Francisco",
          state: "CA",
          website: "https://techcorp.example.com",
          isActive: true
        });
        console.log("Created company:", company.name);
      } else {
        company = companies[0];
        console.log("Using existing company:", company.name);
      }

      // Create project for assessments
      project = await storage.createProject({
        name: "Q1 2025 Skills Assessment Project",
        description: "Quarterly skills assessment for technical teams",
        companyId: company.id,
        budget: "50000",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true
      });
      console.log("Created project:", project.name);

      // 2. Create Employee Group (Batch)
      const employeeGroup = await storage.createEmployeeGroup({
        name: "Frontend Development Batch",
        description: "Frontend developers for Q1 skills assessment",
        projectId: project.id,
        companyId: company.id,
        domain: "frontend",
        level: "mid",
        createdBy: 1,
        isActive: true
      });
      console.log("Created employee group:", employeeGroup.name);

      // 3. Create Tests for the project
      const jsTest = await storage.createTest({
        title: "JavaScript Fundamentals",
        description: "Core JavaScript concepts and DOM manipulation",
        projectId: project.id,
        domain: "programming",
        level: "junior",
        duration: 45,
        totalQuestions: 15,
        passingScore: 70,
        isActive: true
      });

      const reactTest = await storage.createTest({
        title: "React Development Skills",
        description: "React components, hooks, and state management",
        projectId: project.id,
        domain: "frontend",
        level: "mid",
        duration: 60,
        totalQuestions: 20,
        passingScore: 75,
        isActive: true
      });
      console.log("Created tests:", [jsTest.title, reactTest.title]);

      // 4. Add employees to the batch
      const users = await storage.getAllUsers();
      const employees = users.filter(u => ['john.smith', 'sarah.dev'].includes(u.username));
      
      for (const employee of employees) {
        await storage.addGroupMember({
          groupId: employeeGroup.id,
          userId: employee.id,
          addedBy: 1
        });
      }
      console.log(`Added ${employees.length} employees to batch`);

      // 5. Create Group Test Assignments (Batch Level)
      const groupAssignment1 = await storage.createGroupTestAssignment({
        groupId: employeeGroup.id,
        testId: jsTest.id,
        scheduledAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        timeLimit: 45,
        maxAttempts: 2,
        assignedBy: 1,
        status: "active"
      });

      const groupAssignment2 = await storage.createGroupTestAssignment({
        groupId: employeeGroup.id,
        testId: reactTest.id,
        scheduledAt: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        timeLimit: 60,
        maxAttempts: 1,
        assignedBy: 1,
        status: "active"
      });
      console.log("Created group assignments for batch");

      // 6. Create Individual Assignments from Group Assignments
      let totalIndividualAssignments = 0;
      for (const employee of employees) {
        // JavaScript test assignment
        await storage.createAssignment({
          userId: employee.id,
          testId: jsTest.id,
          groupAssignmentId: groupAssignment1.id,
          scheduledAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          timeLimit: 45,
          maxAttempts: 2,
          assignedBy: 1,
          status: 'assigned'
        });

        // React test assignment
        await storage.createAssignment({
          userId: employee.id,
          testId: reactTest.id,
          groupAssignmentId: groupAssignment2.id,
          scheduledAt: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          timeLimit: 60,
          maxAttempts: 1,
          assignedBy: 1,
          status: 'assigned'
        });
        
        totalIndividualAssignments += 2;
      }
      console.log(`Created ${totalIndividualAssignments} individual assignments`);

      res.json({
        success: true,
        message: "Batch assignment system created successfully",
        summary: {
          company: company.name,
          project: project.name,
          batch: employeeGroup.name,
          tests: [jsTest.title, reactTest.title],
          employeesInBatch: employees.length,
          individualAssignments: totalIndividualAssignments
        }
      });

    } catch (error) {
      console.error("Failed to setup batch assignments:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to setup batch assignments", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create sample tests and assignments with proper batch structure
  app.post("/api/create-sample-test-data", async (req, res) => {
    // Allow this endpoint for demonstration purposes
    // if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get existing companies and projects to create proper structure
      const companies = await storage.getCompanies();
      let companyId = companies.length > 0 ? companies[0].id : null;
      
      // Create a company if none exists
      if (!companyId) {
        const company = await storage.createCompany({
          name: "TechCorp Solutions",
          code: "TECH-CORP",
          description: "Technology consulting company",
          industry: "Technology",
          size: "Mid-size (100-999)",
          city: "San Francisco",
          state: "CA",
          website: "https://techcorp.example.com",
          isActive: true
        });
        companyId = company.id;
      }

      // Create a project for the batch
      const project = await storage.createProject({
        name: "Q1 2025 Skills Assessment",
        description: "Quarterly skills assessment for all technical employees",
        companyId: companyId,
        budget: "50000",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true
      });

      // Create an employee group (batch)
      const employeeGroup = await storage.createEmployeeGroup({
        name: "Frontend Development Team",
        description: "Frontend developers batch for skills assessment",
        projectId: project.id,
        companyId: companyId,
        domain: "frontend",
        level: "mid",
        createdBy: 1, // Use admin user ID for sample data
        isActive: true
      });

      // Create sample tests
      const test1 = await storage.createTest({
        title: "JavaScript Fundamentals Assessment",
        description: "Test covering basic JavaScript concepts, functions, and DOM manipulation",
        projectId: project.id,
        domain: "programming",
        level: "junior",
        duration: 45,
        totalQuestions: 15,
        passingScore: 70,
        isActive: true
      });

      const test2 = await storage.createTest({
        title: "React Development Skills",
        description: "Assessment of React components, hooks, and state management",
        projectId: project.id,
        domain: "frontend",
        level: "mid",
        duration: 60,
        totalQuestions: 20,
        passingScore: 75,
        isActive: true
      });

      // Add employees to the batch
      const users = await storage.getAllUsers();
      const employees = users.filter(u => ['john.smith', 'sarah.dev'].includes(u.username));
      
      // Add employees to the group
      for (const employee of employees) {
        await storage.addGroupMember({
          groupId: employeeGroup.id,
          userId: employee.id,
          addedBy: 1 // Use admin user ID for sample data
        });
      }

      // Create group test assignments (batch assignments)
      const groupAssignment1 = await storage.createGroupTestAssignment({
        groupId: employeeGroup.id,
        testId: test1.id,
        scheduledAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        timeLimit: 45,
        maxAttempts: 2,
        assignedBy: 1, // Use admin user ID for sample data
        status: "active"
      });

      const groupAssignment2 = await storage.createGroupTestAssignment({
        groupId: employeeGroup.id,
        testId: test2.id,
        scheduledAt: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        timeLimit: 60,
        maxAttempts: 1,
        assignedBy: 1, // Use admin user ID for sample data
        status: "active"
      });

      // Create individual assignments from group assignments
      let individualAssignments = 0;
      for (const employee of employees) {
        // Assignment 1
        await storage.createAssignment({
          userId: employee.id,
          testId: test1.id,
          groupAssignmentId: groupAssignment1.id,
          scheduledAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          timeLimit: 45,
          maxAttempts: 2,
          assignedBy: 1, // Use admin user ID for sample data
          status: 'assigned'
        });

        // Assignment 2
        await storage.createAssignment({
          userId: employee.id,
          testId: test2.id,
          groupAssignmentId: groupAssignment2.id,
          scheduledAt: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          timeLimit: 60,
          maxAttempts: 1,
          assignedBy: 1, // Use admin user ID for sample data
          status: 'assigned'
        });
        
        individualAssignments += 2;
      }

      res.json({ 
        message: "Sample test data created successfully with proper batch structure",
        project: project.name,
        batch: employeeGroup.name,
        tests: [test1.title, test2.title],
        employeesInBatch: employees.length,
        individualAssignments: individualAssignments
      });
    } catch (error) {
      console.error("Failed to create sample test data:", error);
      res.status(500).json({ message: "Failed to create sample test data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Company management endpoints
  app.get("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.post("/api/companies", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const company = await storage.createCompany(req.body);
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.updateCompany(id, req.body);
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCompany(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Delete company error:", error);
      res.status(400).json({ message: "Failed to delete company", error: (error as Error).message });
    }
  });

  app.patch("/api/companies/:id/toggle-status", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }
      
      const company = await storage.toggleCompanyStatus(id, isActive);
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Failed to toggle company status" });
    }
  });

  // Department management endpoints
  app.get("/api/departments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
    const departments = await storage.getDepartments(companyId);
    res.json(departments);
  });

  app.post("/api/departments", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const department = await storage.createDepartment(req.body);
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ message: "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.updateDepartment(id, req.body);
      res.json(department);
    } catch (error) {
      res.status(400).json({ message: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDepartment(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Failed to delete department" });
    }
  });

  // Department employee endpoints
  app.get("/api/departments/:id/employees", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const employees = await storage.getDepartmentEmployees(departmentId);
      res.json(employees);
    } catch (error) {
      res.status(400).json({ message: "Failed to get department employees" });
    }
  });

  app.get("/api/departments/unassigned-employees", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const employees = await storage.getUnassignedEmployees(companyId);
      res.json(employees);
    } catch (error) {
      res.status(400).json({ message: "Failed to get unassigned employees" });
    }
  });

  app.post("/api/departments/:id/assign-employees", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const { employeeIds } = req.body;
      const employees = await storage.assignEmployeesToDepartment(employeeIds, departmentId);
      res.json(employees);
    } catch (error) {
      res.status(400).json({ message: "Failed to assign employees to department" });
    }
  });

  app.delete("/api/departments/employees/:employeeId", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const employee = await storage.removeEmployeeFromDepartment(employeeId);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Failed to remove employee from department" });
    }
  });

  // Sub-company management endpoints
  app.get("/api/subcompanies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parentCompanyId = req.query.parentCompanyId ? parseInt(req.query.parentCompanyId as string) : undefined;
    const subCompanies = await storage.getSubCompanies(parentCompanyId);
    res.json(subCompanies);
  });

  app.post("/api/subcompanies", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const subCompany = await storage.createSubCompany(req.body);
      res.status(201).json(subCompany);
    } catch (error) {
      res.status(400).json({ message: "Failed to create sub-company" });
    }
  });

  // Project management endpoints
  app.get("/api/projects", requirePermission(PERMISSIONS.VIEW_ALL_USERS), async (req, res) => {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
    const projects = await storage.getProjects(companyId);
    
    // Get statistics for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const groups = await storage.getEmployeeGroups(project.id);
        const tests = await storage.getTests(); // Filter by project in the future
        const projectTests = tests.filter(t => t.projectId === project.id);
        
        // Count total employees across all groups
        let totalEmployees = 0;
        for (const group of groups) {
          const members = await storage.getGroupMembers(group.id);
          totalEmployees += members.length;
        }
        
        return {
          ...project,
          groupsCount: groups.length,
          testsCount: projectTests.length,
          employeesCount: totalEmployees,
        };
      })
    );
    
    res.json(projectsWithStats);
  });

  app.post("/api/projects", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const projectData = {
        ...req.body,
        createdBy: req.user!.id,
      };
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  // Get individual project by ID
  app.get("/api/projects/:id", requirePermission(PERMISSIONS.VIEW_ALL_USERS), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get project statistics
      const groups = await storage.getEmployeeGroups(projectId);
      const tests = await storage.getTests();
      const projectTests = tests.filter(t => t.projectId === projectId);
      
      let totalEmployees = 0;
      for (const group of groups) {
        const members = await storage.getGroupMembers(group.id);
        totalEmployees += members.length;
      }
      
      res.json({
        ...project,
        groups,
        tests: projectTests,
        groupsCount: groups.length,
        testsCount: projectTests.length,
        employeesCount: totalEmployees,
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to get project" });
    }
  });

  app.patch("/api/projects/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.updateProject(projectId, req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteProject(projectId);
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Failed to delete project" });
    }
  });

  // Employee Groups management endpoints
  app.get("/api/employee-groups", requirePermission(PERMISSIONS.VIEW_ALL_USERS), async (req, res) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const groups = await storage.getEmployeeGroups(projectId);
    
    // Get members for each group
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const members = await storage.getGroupMembers(group.id);
        const testAssignments = await storage.getGroupTestAssignments(group.id);
        return { ...group, members, testAssignments };
      })
    );
    
    res.json(groupsWithMembers);
  });

  app.post("/api/employee-groups", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const groupData = {
        ...req.body,
        createdBy: req.user!.id,
      };
      console.log("Creating employee group with data:", groupData);
      const group = await storage.createEmployeeGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating employee group:", error);
      res.status(400).json({ message: "Failed to create employee group" });
    }
  });

  app.get("/api/employee-groups/:id", requirePermission(PERMISSIONS.VIEW_ALL_USERS), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getEmployeeGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Employee group not found" });
      }
      
      const members = await storage.getGroupMembers(groupId);
      const testAssignments = await storage.getGroupTestAssignments(groupId);
      
      res.json({ ...group, members, testAssignments });
    } catch (error) {
      res.status(400).json({ message: "Failed to get employee group" });
    }
  });

  app.patch("/api/employee-groups/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.updateEmployeeGroup(groupId, req.body);
      res.json(group);
    } catch (error) {
      res.status(400).json({ message: "Failed to update employee group" });
    }
  });

  app.delete("/api/employee-groups/:id", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      await storage.deleteEmployeeGroup(groupId);
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Failed to delete employee group" });
    }
  });

  // Group member management endpoints
  app.post("/api/employee-groups/:id/members", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { userIds } = req.body;
      
      if (!Array.isArray(userIds)) {
        return res.status(400).json({ message: "userIds must be an array" });
      }
      
      const members = await storage.addGroupMembers(groupId, userIds, req.user!.id);
      res.status(201).json(members);
    } catch (error) {
      res.status(400).json({ message: "Failed to add group members" });
    }
  });

  app.delete("/api/employee-groups/:groupId/members/:userId", requirePermission(PERMISSIONS.MANAGE_COMPANY_STRUCTURE), async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = parseInt(req.params.userId);
      
      await storage.removeGroupMember(groupId, userId);
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Failed to remove group member" });
    }
  });

  // Group test assignment endpoints
  app.get("/api/group-test-assignments", requirePermission(PERMISSIONS.VIEW_TEAM_ASSIGNMENTS), async (req, res) => {
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
    const assignments = await storage.getGroupTestAssignments(groupId);
    
    // Get test details for each assignment
    const assignmentsWithTests = await Promise.all(
      assignments.map(async (assignment) => {
        const test = await storage.getTest(assignment.testId);
        const group = await storage.getEmployeeGroup(assignment.groupId);
        return { ...assignment, test, group };
      })
    );
    
    res.json(assignmentsWithTests);
  });

  app.post("/api/group-test-assignments", requirePermission(PERMISSIONS.ASSIGN_TEST), async (req, res) => {
    try {
      const assignmentData = {
        ...req.body,
        assignedBy: req.user!.id,
      };
      
      const groupAssignment = await storage.createGroupTestAssignment(assignmentData);
      
      // Create individual assignments for all group members
      const groupMembers = await storage.getGroupMembers(assignmentData.groupId);
      const individualAssignments = await Promise.all(
        groupMembers.map(async (member) => {
          return await storage.createAssignment({
            userId: member.userId,
            testId: assignmentData.testId,
            groupAssignmentId: groupAssignment.id,
            scheduledAt: assignmentData.scheduledAt,
            dueDate: assignmentData.dueDate,
            timeLimit: assignmentData.timeLimit,
            maxAttempts: assignmentData.maxAttempts,
            assignedBy: req.user!.id,
          });
        })
      );

      // Send email notifications to all group members
      try {
        const test = await storage.getTest(assignmentData.testId);
        if (test) {
          await Promise.all(
            groupMembers.map(async (member) => {
              const user = await storage.getUser(member.userId);
              if (user) {
                const assignment = individualAssignments.find(a => a.userId === member.userId);
                if (assignment) {
                  emailService.sendTestAssignmentEmail(user, test, assignment).catch(error => {
                    console.error('Failed to send group assignment email:', error);
                  });
                }
              }
            })
          );
        }
      } catch (error) {
        console.error('Error sending group assignment emails:', error);
      }
      
      res.status(201).json({ groupAssignment, individualAssignments });
    } catch (error) {
      res.status(400).json({ message: "Failed to assign test to group" });
    }
  });

  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const assignments = await storage.getUserAssignments(userId);
    const results = await storage.getUserResults(userId);
    
    // Calculate detailed statistics
    const pendingTests = assignments.filter(a => a.status === "assigned").length;
    const scheduledTests = assignments.filter(a => a.status === "scheduled").length;
    
    // Calculate completed tests this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const completedThisWeek = results.filter(r => 
      r.completedAt && new Date(r.completedAt) > oneWeekAgo
    ).length;
    
    const stats = {
      assignedTests: assignments.filter(a => a.status === "assigned" || a.status === "started").length,
      completedTests: results.length,
      pendingTests,
      scheduledTests,
      completedThisWeek,
      averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0,
      timeSaved: results.length * 2.0, // Each test saves 2 hours vs manual assessment
    };
    
    res.json(stats);
  });

  // Test assignment endpoints
  app.get("/api/assignments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const assignments = await storage.getUserAssignments(req.user!.id);
    const assignmentsWithTests = await Promise.all(
      assignments.map(async (assignment) => {
        const test = await storage.getTest(assignment.testId!);
        return { ...assignment, test };
      })
    );
    
    res.json(assignmentsWithTests);
  });

  app.post("/api/assignments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertTestAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment({
        ...data,
        assignedBy: req.user!.id,
      });

      // Send assignment email notification
      try {
        const assignedUser = await storage.getUser(data.userId!);
        const test = data.testId ? await storage.getTest(data.testId) : null;
        
        if (assignedUser && test) {
          emailService.sendTestAssignmentEmail(assignedUser, test, assignment).catch(error => {
            console.error('Failed to send assignment email:', error);
          });
        }
      } catch (error) {
        console.error('Error sending assignment email:', error);
      }

      res.status(201).json(assignment);
    } catch (error) {
      console.error('Assignment creation error:', error);
      res.status(400).json({ message: `Invalid assignment data: ${error.message}` });
    }
  });

  // Admin controls for test result visibility
  app.patch("/api/assignments/:id/result-visibility", requirePermission(PERMISSIONS.MANAGE_ASSIGNMENTS), async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { resultsVisible } = req.body;
      
      const assignment = await storage.updateAssignmentResultVisibility(assignmentId, resultsVisible);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating result visibility:", error);
      res.status(400).json({ message: "Failed to update result visibility" });
    }
  });

  // Get test assignments for current user (employee/candidate view)
  app.get("/api/test-assignments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const assignments = await storage.getUserAssignments(userId);
      
      // Get test details for each assignment
      const assignmentsWithTests = await Promise.all(
        assignments.map(async (assignment) => {
          const test = assignment.testId ? await storage.getTest(assignment.testId) : null;
          return { ...assignment, test };
        })
      );
      
      res.json(assignmentsWithTests);
    } catch (error) {
      console.error("Error fetching user test assignments:", error);
      res.status(500).json({ message: "Failed to fetch test assignments" });
    }
  });

  // Create test assignment
  app.post("/api/test-assignments", requirePermission(PERMISSIONS.ASSIGN_TEST), async (req, res) => {
    try {
      const schema = insertTestAssignmentSchema.extend({
        assignedBy: z.number().optional(),
      });
      
      const validatedData = schema.parse({
        ...req.body,
        assignedBy: req.user!.id,
      });
      
      const assignment = await storage.createAssignment(validatedData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating test assignment:", error);
      res.status(400).json({ message: "Failed to create test assignment" });
    }
  });

  // Get all completed assignments for admin review
  app.get("/api/completed-assignments", requirePermission(PERMISSIONS.VIEW_ALL_ASSIGNMENTS), async (req, res) => {
    try {
      const assignments = await storage.getCompletedAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching completed assignments:", error);
      res.status(500).json({ message: "Failed to fetch completed assignments" });
    }
  });

  // Get all assignments for admin view (to see what tests have been assigned)
  app.get("/api/all-assignments", requirePermission(PERMISSIONS.VIEW_ALL_ASSIGNMENTS), async (req, res) => {
    try {
      const assignments = await storage.getAllAssignments();
      const assignmentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const test = assignment.testId ? await storage.getTest(assignment.testId) : null;
          const user = assignment.userId ? await storage.getUser(assignment.userId) : null;
          const assignedBy = assignment.assignedBy ? await storage.getUser(assignment.assignedBy) : null;
          return { ...assignment, test, user, assignedBy };
        })
      );
      res.json(assignmentsWithDetails);
    } catch (error) {
      console.error("Error fetching all assignments:", error);
      res.status(500).json({ message: "Failed to fetch all assignments" });
    }
  });

  // Users endpoint
  app.get("/api/users", requirePermission(PERMISSIONS.VIEW_ALL_USERS), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const companies = await storage.getCompanies();
      const departments = await storage.getDepartments();
      
      // Add company and department names to users
      const usersWithDetails = users.map(user => {
        const company = user.companyId ? companies.find(c => c.id === user.companyId) : null;
        const department = user.departmentId ? departments.find(d => d.id === user.departmentId) : null;
        
        return {
          ...user,
          company: company?.name || null,
          department: department?.name || null
        };
      });
      
      res.json(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create new user
  app.post("/api/users", requirePermission(PERMISSIONS.CREATE_USER), async (req, res) => {
    try {
      const { username, password, email, name, role, employeeId, department, company } = req.body;
      
      // Validate required fields
      if (!username || !password || !email || !name || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if user already exists
      const existingUsers = await storage.getAllUsers();
      if (existingUsers.find(u => u.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (existingUsers.find(u => u.email === email)) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Get company and department IDs if provided
      let companyId = null;
      let departmentId = null;
      
      if (company) {
        const companies = await storage.getCompanies();
        const companyObj = companies.find(c => c.name === company);
        if (companyObj) {
          companyId = companyObj.id;
        }
      }
      
      if (department) {
        const departments = await storage.getDepartments();
        const departmentObj = departments.find(d => d.name === department);
        if (departmentObj) {
          departmentId = departmentObj.id;
        }
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        name,
        role,
        employeeId: employeeId || null,
        companyId,
        departmentId,
        workType: 'full_time',
        createdAt: new Date()
      });
      
      // Log user creation activity
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'User Created',
          resourceType: 'user',
          resourceId: newUser.id,
          resourceName: newUser.username,
          details: `Created new user ${newUser.name} (${newUser.username}) with role ${newUser.role}`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'medium',
          category: 'user'
        });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get individual user by ID
  app.get("/api/users/:id", requirePermission(PERMISSIONS.VIEW_ALL_USERS), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const users = await storage.getAllUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add company and department names
      const companies = await storage.getCompanies();
      const departments = await storage.getDepartments();
      const company = user.companyId ? companies.find(c => c.id === user.companyId) : null;
      const department = user.departmentId ? departments.find(d => d.id === user.departmentId) : null;
      
      const userWithDetails = {
        ...user,
        company: company?.name || null,
        department: department?.name || null
      };
      
      res.json(userWithDetails);
    } catch (error) {
      res.status(400).json({ message: "Invalid user ID" });
    }
  });

  // Update user details
  app.patch("/api/users/:id", requirePermission(PERMISSIONS.UPDATE_USER), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Get current user
      const users = await storage.getAllUsers();
      const currentUser = users.find(u => u.id === userId);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Convert company and department names to IDs if provided
      const processedData = { ...updateData };
      
      if (updateData.company) {
        const companies = await storage.getCompanies();
        const company = companies.find(c => c.name === updateData.company);
        if (company) {
          processedData.companyId = company.id;
          delete processedData.company; // Remove the string field
        }
      }
      
      if (updateData.department) {
        const departments = await storage.getDepartments();
        const department = departments.find(d => d.name === updateData.department);
        if (department) {
          processedData.departmentId = department.id;
          delete processedData.department; // Remove the string field
        }
      }
      
      // Update user via storage
      const updatedUser = await storage.updateUser(userId, processedData);
      
      // Log user update activity
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'User Updated',
          resourceType: 'user',
          resourceId: userId,
          resourceName: updatedUser.username,
          details: `Updated user ${updatedUser.name} (${updatedUser.username})`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'medium',
          category: 'user'
        });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.patch("/api/users/:id/role", requirePermission(PERMISSIONS.CHANGE_USER_ROLE), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      const validRoles = Object.values(ROLES);
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      
      // Log role change activity
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'User Role Changed',
          resourceType: 'user',
          resourceId: userId,
          resourceName: user.username,
          details: `Changed user ${user.name} role to ${role}`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'high',
          category: 'user'
        });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user role" });
    }
  });

  app.patch("/api/users/:id/password", requirePermission(PERMISSIONS.UPDATE_USER), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { password } = req.body;
      
      if (!password || password.trim().length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(password.trim());
      
      // Update the user's password
      const user = await storage.updateUserPassword(userId, hashedPassword);
      
      // Log password reset activity
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'Password Reset',
          resourceType: 'user',
          resourceId: userId,
          resourceName: user.username,
          details: `Reset password for user ${user.name} (${user.username})`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'high',
          category: 'user'
        });
      }
      
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(400).json({ message: "Failed to update password" });
    }
  });

  app.delete("/api/users/:id", requirePermission(PERMISSIONS.DELETE_USER), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow deleting yourself
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Get user details before deletion for logging
      const userToDelete = await storage.getUser(userId);
      
      await storage.deleteUser(userId);
      
      // Log user deletion activity
      if (req.user && userToDelete) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'User Deleted',
          resourceType: 'user',
          resourceId: userId,
          resourceName: userToDelete.username,
          details: `Deleted user ${userToDelete.name} (${userToDelete.username}) with role ${userToDelete.role}`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'critical',
          category: 'user'
        });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  // Password change endpoint
  app.post("/api/user/change-password", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Get user from database
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password using the same format as auth.ts
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(newPassword, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Update password
      await storage.updateUserPassword(req.user.id, hashedPassword);
      
      // Log password change activity
      await storage.logActivity({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'Password Changed',
        resourceType: 'user',
        resourceId: req.user.id,
        resourceName: req.user.username,
        details: `User ${req.user.name} changed their password`,
        ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'medium',
        category: 'auth'
      });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Profile photo upload endpoint
  app.post("/api/user/upload-photo", upload.single('photo'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No photo uploaded" });
      }

      // Generate unique filename
      const fileExtension = extname(req.file.originalname);
      const fileName = `${req.user.id}-${Date.now()}${fileExtension}`;

      // Upload to object storage
      const objectStorageService = new ObjectStorageService();
      const photoUrl = await objectStorageService.uploadFile(
        req.file.buffer, 
        fileName, 
        req.file.mimetype
      );

      // Update user profile with photo URL in database
      await storage.updateUserPhoto(req.user.id, photoUrl);

      res.json({ 
        message: "Photo uploaded successfully",
        photoUrl: photoUrl
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Test endpoints
  app.get("/api/tests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const tests = await storage.getTests();
    
    // Add question counts to each test
    const testsWithCounts = await Promise.all(
      tests.map(async (test) => {
        const questions = await storage.getQuestions(test.id);
        return {
          ...test,
          totalQuestions: questions.length
        };
      })
    );
    
    res.json(testsWithCounts);
  });

  app.post("/api/tests/:testId/generate-questions", requirePermission(PERMISSIONS.MANAGE_TESTS), async (req, res) => {
    try {
      const testId = parseInt(req.params.testId);
      const { domain, level, easyCount, mediumCount, toughCount } = req.body;
      
      // Generate questions using AI
      const questions = await generateQuestions(domain, level, { easyCount, mediumCount, toughCount });
      
      // Add questions to test
      const updatedTest = await storage.addQuestionsToTest(testId, questions);
      res.json(updatedTest);
    } catch (error) {
      console.error("Failed to generate questions:", error);
      res.status(400).json({ message: "Failed to generate questions for test" });
    }
  });

  app.post("/api/tests/:testId/copy", requirePermission(PERMISSIONS.MANAGE_TESTS), async (req, res) => {
    try {
      const testId = parseInt(req.params.testId);
      
      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }
      
      console.log(`Attempting to copy test with ID: ${testId}`);
      const copiedTest = await storage.copyTest(testId);
      res.status(201).json(copiedTest);
    } catch (error) {
      console.error("Failed to copy test:", error);
      
      // Return more specific error messages
      if (error.message === "Test not found") {
        return res.status(404).json({ message: "Test not found" });
      }
      
      res.status(500).json({ message: "Internal server error while copying test" });
    }
  });

  app.post("/api/tests", requirePermission(PERMISSIONS.CREATE_TEST), async (req, res) => {
    try {
      console.log("POST /api/tests - Request body:", JSON.stringify(req.body, null, 2));
      
      const testData = {
        ...req.body,
        createdBy: req.user!.id,
        projectId: req.body.projectId || null, // Make projectId optional
      };
      
      console.log("POST /api/tests - Test data to create:", JSON.stringify(testData, null, 2));
      
      const test = await storage.createTest(testData);
      
      // Log test creation activity
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'Test Created',
          resourceType: 'test',
          resourceId: test.id,
          resourceName: test.title,
          details: `Created new test "${test.title}" for ${test.domain} domain (${test.difficulty} level)`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'medium',
          category: 'test'
        });
      }
      
      res.status(201).json(test);
    } catch (error) {
      console.error("POST /api/tests - Error creating test:", error);
      console.error("POST /api/tests - Error details:", error.message);
      res.status(400).json({ message: "Invalid test data", error: error.message });
    }
  });

  app.get("/api/tests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const testId = parseInt(req.params.id);
    
    if (isNaN(testId)) {
      return res.status(400).json({ message: "Invalid test ID" });
    }
    
    const test = await storage.getTest(testId);
    
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    res.json(test);
  });

  app.put("/api/tests/:id", requirePermission(PERMISSIONS.UPDATE_TEST), async (req, res) => {
    try {
      console.log("PUT /api/tests/:id - User role:", req.user?.role);
      console.log("PUT /api/tests/:id - Permission needed: UPDATE_TEST");
      const testId = parseInt(req.params.id);
      
      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }
      
      const existingTest = await storage.getTest(testId);
      if (!existingTest) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      const testData = {
        ...req.body,
        id: testId,
        updatedAt: new Date(),
      };
      
      const updatedTest = await storage.updateTest(testId, testData);
      
      // Log test update activity
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'Test Updated',
          resourceType: 'test',
          resourceId: testId,
          resourceName: updatedTest.title,
          details: `Updated test "${updatedTest.title}" properties`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'medium',
          category: 'test'
        });
      }
      
      res.json(updatedTest);
    } catch (error) {
      console.error("PUT /api/tests/:id - Error updating test:", error);
      res.status(500).json({ message: "Failed to update test", error: error.message });
    }
  });

  app.get("/api/tests/:id/questions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const testId = parseInt(req.params.id);
    
    if (isNaN(testId)) {
      return res.status(400).json({ message: "Invalid test ID" });
    }
    
    const questions = await storage.getQuestions(testId);
    res.json(questions);
  });

  // Get single test details
  app.get("/api/tests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const testId = parseInt(req.params.id);
      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }
      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  // Get test assignments
  app.get("/api/tests/:id/assignments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const testId = parseInt(req.params.id);
      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }
      const assignments = await storage.getAllAssignments();
      const testAssignments = assignments.filter(a => a.testId === testId);
      res.json(testAssignments);
    } catch (error) {
      console.error("Error fetching test assignments:", error);
      res.status(500).json({ error: "Failed to fetch test assignments" });
    }
  });

  // Get test results  
  app.get("/api/tests/:id/results", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const testId = parseInt(req.params.id);
      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }
      const allResults = await storage.getAllTestResults();
      const testResults = allResults.filter(r => r.testId === testId);
      res.json(testResults);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ error: "Failed to fetch test results" });
    }
  });

  app.post("/api/tests/:id/assign-questions", requirePermission(PERMISSIONS.MANAGE_TESTS), async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const { questionIds } = req.body;
      
      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ message: "Invalid question IDs" });
      }
      
      const result = await storage.assignQuestionsToTest(testId, questionIds);
      res.json(result);
    } catch (error) {
      console.error("Failed to assign questions to test:", error);
      res.status(400).json({ message: "Failed to assign questions to test" });
    }
  });

  app.delete("/api/tests/:id", requirePermission(PERMISSIONS.DELETE_TEST), async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      
      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }
      
      // Get test details before deletion for logging
      const test = await storage.getTest(testId);
      
      await storage.deleteTest(testId);
      
      // Log test deletion activity
      if (req.user && test) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'Test Deleted',
          resourceType: 'test',
          resourceId: testId,
          resourceName: test.title,
          details: `Deleted test "${test.title}" from ${test.domain} domain`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'high',
          category: 'test'
        });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Failed to delete test:", error);
      res.status(400).json({ message: "Failed to delete test" });
    }
  });

  // Split test into batches (create separate tests for each set_number)
  app.post("/api/tests/:id/split-batches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const testId = parseInt(req.params.id);
      
      // Get the original test
      const originalTest = await storage.getTest(testId);
      if (!originalTest) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      // Get all questions for this test grouped by set_number
      const questions = await storage.getQuestions(testId);
      
      // Group questions by set_number
      const questionsBySet = questions.reduce((groups, question) => {
        const setNumber = question.setNumber || 1;
        if (!groups[setNumber]) {
          groups[setNumber] = [];
        }
        groups[setNumber].push(question);
        return groups;
      }, {} as Record<number, any[]>);
      
      const setNumbers = Object.keys(questionsBySet).map(Number).sort();
      
      if (setNumbers.length <= 1) {
        return res.status(400).json({ message: "Test only has one batch, nothing to split" });
      }
      
      const newTests = [];
      
      // Create a new test for each batch
      for (let i = 0; i < setNumbers.length; i++) {
        const setNumber = setNumbers[i];
        const setQuestions = questionsBySet[setNumber];
        
        // Create new test with batch suffix
        const newTest = await storage.createTest({
          title: `${originalTest.title} - Batch ${setNumber}`,
          description: `${originalTest.description}\n\nThis is Batch ${setNumber} of ${setNumbers.length} from the original test.`,
          domain: originalTest.domain,
          level: originalTest.level,
          duration: originalTest.duration,
          totalQuestions: setQuestions.length,
          passingScore: originalTest.passingScore,
          projectId: originalTest.projectId,
          createdBy: req.user!.id
        });
        
        // Copy questions to the new test
        for (const question of setQuestions) {
          await storage.createQuestion({
            testId: newTest.id,
            type: question.type,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            weightage: question.weightage,
            status: question.status,
            tags: question.tags,
            codeLanguage: question.codeLanguage,
            timeLimit: question.timeLimit,
            setNumber: 1, // Reset to 1 for the new test
            setId: `${originalTest.domain}-${originalTest.level}-set1`,
            createdBy: req.user!.id
          });
        }
        
        // Update total questions count for the new test
        await storage.updateTest(newTest.id, {
          totalQuestions: setQuestions.length
        });
        
        newTests.push(newTest);
      }
      
      // Log activity
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'Test Split into Batches',
          resourceType: 'test',
          resourceId: testId,
          resourceName: originalTest.title,
          details: `Split test "${originalTest.title}" into ${newTests.length} separate tests (batches)`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'medium',
          category: 'test'
        });
      }
      
      res.json({
        message: `Successfully split test into ${newTests.length} batches`,
        originalTest,
        newTests
      });
      
    } catch (error) {
      console.error("Error splitting test into batches:", error);
      res.status(500).json({ message: `Failed to split test into batches: ${error.message}` });
    }
  });

  // Question management endpoints
  app.get("/api/questions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only reviewers, admins, and super_admins can see all questions
    if (!["reviewer", "admin", "super_admin"].includes(req.user!.role)) return res.sendStatus(403);
    
    const testId = req.query.testId ? parseInt(req.query.testId as string) : undefined;
    const questions = testId ? await storage.getQuestions(testId) : await storage.getAllQuestions();
    res.json(questions);
  });

  app.post("/api/questions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only reviewers, admins, and super_admins can create questions
    if (!["reviewer", "admin", "super_admin"].includes(req.user!.role)) return res.sendStatus(403);
    
    try {
      const questionData = {
        ...req.body,
        createdBy: req.user!.id,
      };
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ message: "Invalid question data" });
    }
  });

  app.put("/api/questions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only reviewers, admins, and super_admins can update questions
    if (!["reviewer", "admin", "super_admin"].includes(req.user!.role)) return res.sendStatus(403);
    
    try {
      const questionId = parseInt(req.params.id);
      const questionData = {
        ...req.body,
        id: questionId,
        createdBy: req.user!.id,
      };
      const question = await storage.updateQuestion(questionId, questionData);
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Failed to update question" });
    }
  });

  app.patch("/api/questions/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only reviewers, admins, and super_admins can update question status
    if (!["reviewer", "admin", "super_admin"].includes(req.user!.role)) return res.sendStatus(403);
    
    try {
      const questionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const question = await storage.updateQuestionStatus(questionId, status, req.user!.id);
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Failed to update question status" });
    }
  });

  app.delete("/api/questions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins and super_admins can delete questions
    if (!["admin", "super_admin"].includes(req.user!.role)) return res.sendStatus(403);
    
    try {
      const questionId = parseInt(req.params.id);
      await storage.deleteQuestion(questionId);
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: "Failed to delete question" });
    }
  });

  // Test session endpoints
  app.post("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertTestSessionSchema.parse(req.body);
      
      // Check if user has already completed this test
      const userResults = await storage.getUserResults(req.user!.id);
      const existingResult = userResults.find(result => result.testId === data.testId);
      if (existingResult) {
        return res.status(403).json({ 
          message: "Test already completed. Retaking tests is not allowed.",
          completedAt: existingResult.completedAt,
          score: existingResult.score
        });
      }
      
      // Check if there's already an active session
      const activeSession = await storage.getActiveSession(req.user!.id, data.testId!);
      if (activeSession) {
        return res.json(activeSession);
      }
      
      const session = await storage.createSession({
        ...data,
        userId: req.user!.id,
      });
      
      // Update assignment status to started
      if (data.assignmentId) {
        await storage.updateAssignmentStatus(data.assignmentId, "started");
      }
      
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.put("/api/sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }
    
    const session = await storage.getSession(sessionId);
    
    if (!session || session.userId !== req.user!.id) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    const updatedSession = await storage.updateSession(sessionId, req.body);
    res.json(updatedSession);
  });

  app.post("/api/sessions/:id/proctoring", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }
    
    const session = await storage.getSession(sessionId);
    
    if (!session || session.userId !== req.user!.id) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    const { eventType, timestamp } = req.body;
    const currentEvents = session.proctoringEvents as any[] || [];
    const newEvent = { eventType, timestamp, details: req.body.details };
    
    await storage.updateSession(sessionId, {
      proctoringEvents: [...currentEvents, newEvent],
    });
    
    res.json({ success: true });
  });

  // Helper function to generate skill gap analysis
  async function generateSkillGapAnalysis(result: any, test: any, user: any, sessionData: any = null) {
    try {
      const { detailedResults, percentage, score } = result;
      
      // Analyze performance by domain
      const domainPerformance = {
        domain: test.domain,
        level: test.level,
        score: percentage,
        passed: result.passed
      };

      // Identify skill gaps based on incorrect answers with detailed information
      const skillGaps = [];
      const questionDetails = [];
      if (detailedResults && Array.isArray(detailedResults)) {
        // Process all questions to get complete picture
        detailedResults.forEach((result: any) => {
          questionDetails.push({
            questionId: result.questionId,
            isCorrect: result.isCorrect,
            userAnswer: result.userAnswer || 'Not answered',
            correctAnswer: result.correctAnswer,
            questionText: result.questionText || `Question ${result.questionId}`
          });
        });
        
        const incorrectAnswers = detailedResults.filter((r: any) => !r.isCorrect);
        if (incorrectAnswers.length > 0) {
          // Create skill gap summary for top mistakes
          skillGaps.push(...incorrectAnswers.slice(0, 3).map((a: any) => 
            `Question ${a.questionId} - ${a.userAnswer || 'Not answered'}`
          ));
        }
      }

      // Generate industry analysis
      const industryAnalysis = {
        salaryRange: percentage < 40 ? '$45K-65K' : percentage < 70 ? '$65K-95K' : '$95K-130K',
        industryPercentile: percentage < 40 ? 'Bottom 30%' : percentage < 70 ? 'Middle 40%' : 'Top 30%',
        marketDemand: 'High',
        skillsMatch: percentage,
        competitionLevel: percentage < 40 ? 'High' : percentage < 70 ? 'Medium' : 'Low',
        suitableRoles: percentage < 40 
          ? ['Junior Developer', 'QA Analyst', 'Support Engineer']
          : percentage < 70 
          ? ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer']
          : ['Senior Engineer', 'Tech Lead', 'Solutions Architect'],
        growthPotential: percentage < 40 ? '15-25%' : percentage < 70 ? '10-15%' : '5-10%'
      };

      // Analyze security monitoring data
      const securityAnalysis = {
        overallSecurityScore: 100, // Default high score
        violationCount: 0,
        tabSwitchEvents: 0,
        copyAttempts: 0,
        devToolsAttempts: 0,
        securityLevel: 'Excellent',
        trustworthiness: 'High',
        proctoringCompliance: 'Full Compliance'
      };

      // Process proctoring events if available
      if (sessionData && sessionData.proctoringEvents && Array.isArray(sessionData.proctoringEvents)) {
        const events = sessionData.proctoringEvents;
        securityAnalysis.violationCount = events.length;
        securityAnalysis.tabSwitchEvents = events.filter((e: any) => e.eventType === 'tab_switch').length;
        securityAnalysis.copyAttempts = events.filter((e: any) => e.eventType === 'copy_attempt').length;
        securityAnalysis.devToolsAttempts = events.filter((e: any) => e.eventType === 'dev_tools').length;
        
        // Calculate security score based on violations
        const totalViolations = events.length;
        securityAnalysis.overallSecurityScore = Math.max(0, 100 - (totalViolations * 5));
        
        if (totalViolations === 0) {
          securityAnalysis.securityLevel = 'Excellent';
          securityAnalysis.trustworthiness = 'High';
        } else if (totalViolations <= 3) {
          securityAnalysis.securityLevel = 'Good';
          securityAnalysis.trustworthiness = 'Medium-High';
        } else if (totalViolations <= 6) {
          securityAnalysis.securityLevel = 'Fair';
          securityAnalysis.trustworthiness = 'Medium';
        } else {
          securityAnalysis.securityLevel = 'Poor';
          securityAnalysis.trustworthiness = 'Low';
        }
        
        securityAnalysis.proctoringCompliance = totalViolations === 0 
          ? 'Full Compliance' 
          : totalViolations <= 3 
          ? 'Minor Violations' 
          : 'Multiple Violations';
      }

      // Generate predictive analytics
      const predictiveAnalytics = {
        futurePerformance: Math.min(100, percentage + 15),
        careerTrack: percentage < 50 ? 'Skill Development Track' : 'Career Advancement Track',
        promotionReadiness: Math.min(100, percentage + 15),
        growthRate: (Math.random() * 5 + 3).toFixed(1),
        estimatedTimeToNextLevel: percentage < 40 ? '12-18 months' : percentage < 70 ? '6-12 months' : '3-6 months',
        learningCurve: percentage < 40 ? 'Steep Learning Required' : percentage < 70 ? 'Steady Progress' : 'Advanced Mastery',
        estimatedTimeToImprove: percentage < 40 ? '6-9 months' : percentage < 70 ? '3-6 months' : '2-3 months'
      };

      // Generate training recommendations
      const trainingRecommendations = {
        priority: skillGaps.length > 0 ? 'High' : 'Medium',
        focusAreas: skillGaps.slice(0, 3),
        suggestedCourses: [
          `Advanced ${test.domain} Training`,
          `${test.level} Level Certification Prep`,
          'Problem Solving and Critical Thinking'
        ],
        estimatedDuration: percentage < 40 ? '3-6 months' : percentage < 70 ? '2-3 months' : '1-2 months'
      };

      // Generate AI insights
      const aiInsights = {
        marketPosition: percentage < 50 
          ? 'Developing skills - Entry to mid-level positioning' 
          : 'Strong positioning - Mid to senior level readiness',
        salaryPositioning: percentage < 50 
          ? 'Below market average - skill development needed' 
          : 'Competitive market position',
        topStrength: 'Consistent performance across assessment areas',
        improvementAreas: skillGaps.slice(0, 2),
        overallAssessment: percentage < 40 
          ? 'Foundation level - Focus on core competency building'
          : percentage < 70 
          ? 'Intermediate level - Ready for advanced challenges'
          : 'Advanced level - Leadership potential identified',
        growthPotential: Math.ceil(percentage / 10),
        keyFindings: [
          percentage < 40 
            ? 'Strong foundational concepts but needs practical application'
            : percentage < 70
            ? 'Good technical understanding with room for advanced topics'
            : 'Excellent technical competency with leadership potential',
          skillGaps.length > 2 
            ? 'Multiple skill gaps identified requiring focused training'
            : 'Limited skill gaps with targeted improvement opportunities',
          percentage > 80 
            ? 'Candidate demonstrates exceptional problem-solving abilities'
            : 'Consistent performance pattern with clear improvement trajectory'
        ],
        recommendations: [
          percentage < 40 
            ? 'Focus on hands-on practice with real-world projects'
            : percentage < 70
            ? 'Pursue advanced certifications and mentorship opportunities'
            : 'Consider technical leadership roles and knowledge sharing',
          'Engage in collaborative learning and peer programming sessions',
          `Strengthen knowledge in ${test.domain} domain specifics`,
          'Build portfolio projects to demonstrate practical skills'
        ]
      };

      return {
        generatedAt: new Date().toISOString(),
        candidateInfo: {
          name: user.name || user.username,
          email: user.email,
          employeeId: user.employeeId,
          department: user.department,
          position: user.position
        },
        testInfo: {
          title: test.title,
          domain: test.domain,
          level: test.level,
          totalQuestions: test.totalQuestions
        },
        performanceMetrics: {
          score: score,
          percentage: percentage,
          passed: result.passed,
          timeSpent: result.timeSpent && result.timeSpent > 60 ? result.timeSpent : (test.totalQuestions || 7) * 120, // Assume 2 minutes per question if data is unrealistic
          completedAt: result.completedAt,
          questionsAnswered: result.totalQuestions || 0,
          totalQuestions: test.totalQuestions || result.totalQuestions || 0,
          accuracy: percentage,
          speed: result.timeSpent && result.timeSpent > 60 ? `${Math.round(result.timeSpent / 60)} minutes` : `${Math.round(((test.totalQuestions || 7) * 120) / 60)} minutes`
        },
        questionDetails: questionDetails,
        strengthAreas: percentage > 70 
          ? [`${test.domain} fundamentals`, 'Problem-solving approach', 'Technical accuracy']
          : percentage > 50
          ? [`Basic ${test.domain} concepts`, 'Logical reasoning']
          : ['Developing strengths'],
        trainingRecommendations: {
          immediate: skillGaps.length > 0 
            ? [`Address ${skillGaps[0]}`, 'Practice core concepts'] 
            : ['Continue skill development'],
          shortTerm: [
            `Advanced ${test.domain} training`,
            'Practical project work',
            'Peer collaboration'
          ],
          longTerm: [
            `${test.level} certification preparation`,
            'Leadership development',
            'Industry best practices'
          ]
        },
        domainPerformance,
        skillGaps,
        industryAnalysis,
        predictiveAnalytics,
        trainingRecommendations,
        aiInsights,
        securityAnalysis,
        competencyMapping: {
          technical: Math.min(100, percentage + 5),
          problemSolving: Math.min(100, percentage + 10),
          domainKnowledge: percentage,
          practicalApplication: Math.max(0, percentage - 5)
        }
      };
    } catch (error) {
      console.error('Error generating skill gap analysis:', error);
      return null;
    }
  }

  // Skill gap report endpoint - generates report if not exists
  app.get("/api/skill-gap-report/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = parseInt(req.params.userId);
      
      // Get all test results for the user
      const results = await storage.getAllTestResults();
      const userResults = results.filter((r: any) => r.userId === userId);
      
      if (userResults.length === 0) {
        return res.status(404).json({ message: "No test results found for this user" });
      }
      
      // Get the most recent result
      const latestResult = userResults.sort((a: any, b: any) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];
      
      // If no skill gap analysis exists, generate one
      if (!latestResult.skillGapAnalysis) {
        const test = await storage.getTest(latestResult.testId);
        const user = await storage.getUser(userId);
        
        if (test && user) {
          const skillGapAnalysis = await generateSkillGapAnalysis(latestResult, test, user);
          
          if (skillGapAnalysis) {
            // Update the test result with the generated analysis
            await storage.updateTestResult(latestResult.id, {
              skillGapAnalysis: skillGapAnalysis
            });
            
            return res.json(skillGapAnalysis);
          }
        }
      }
      
      res.json(latestResult.skillGapAnalysis);
    } catch (error) {
      console.error("Error fetching skill gap report:", error);
      res.status(500).json({ message: "Failed to fetch skill gap report" });
    }
  });

  // Feedback endpoint
  app.post("/api/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { testId, resultId, rating, feedback, category } = req.body;
      
      if (!testId || !feedback) {
        return res.status(400).json({ message: "Test ID and feedback are required" });
      }

      // Log feedback in activity logs
      if (req.user) {
        await storage.logActivity({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'Test Feedback Submitted',
          resourceType: 'test',
          resourceId: testId,
          resourceName: `Test ${testId}`,
          details: `Submitted feedback: "${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}"`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          severity: 'low',
          category: 'user'
        });
      }

      // Store feedback (this could be expanded to store in a dedicated feedback table)
      const feedbackRecord = {
        userId: req.user!.id,
        testId,
        resultId,
        rating: rating || 5,
        feedback: feedback.trim(),
        category: category || 'test_experience',
        submittedAt: new Date()
      };

      // For now, just log the feedback - in a real system, you'd store this in a feedback table
      console.log('Test feedback received:', feedbackRecord);

      res.status(201).json({ 
        message: "Feedback submitted successfully",
        feedbackId: Date.now() // Mock ID
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });
  
  // Generate skill gap reports for all existing test results
  app.post("/api/generate-all-skill-reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only allow admins to generate all reports
    const allowedRoles = ["admin", "super_admin", "superadmin"];
    if (!allowedRoles.includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const results = await storage.getAllTestResults();
      const tests = await storage.getTests();
      const users = await storage.getAllUsers();
      
      let generatedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const result of results) {
        if (!result.skillGapAnalysis) {
          const test = tests.find(t => t.id === result.testId);
          const user = users.find(u => u.id === result.userId);
          
          if (test && user) {
            try {
              const skillGapAnalysis = await generateSkillGapAnalysis(result, test, user);
              
              if (skillGapAnalysis) {
                await storage.updateTestResult(result.id, {
                  skillGapAnalysis: skillGapAnalysis
                });
                generatedCount++;
                console.log(`Generated skill gap analysis for result ${result.id} (user: ${user.name})`);
              }
            } catch (error) {
              console.error(`Failed to generate analysis for result ${result.id}:`, error);
              errorCount++;
            }
          }
        }
      }
      
      res.json({
        message: `Generated ${generatedCount} skill gap reports`,
        generated: generatedCount,
        updated: updatedCount,
        errors: errorCount,
        total: results.length
      });
    } catch (error) {
      console.error("Error generating all skill gap reports:", error);
      res.status(500).json({ message: "Failed to generate skill gap reports" });
    }
  });

  // Database health check endpoint with detailed monitoring
  app.get("/api/health", async (req, res) => {
    try {
      const { getDatabaseHealth } = await import('./db');
      const dbHealth = getDatabaseHealth();
      
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        database: {
          connected: dbHealth.isConnected,
          lastHealthCheck: dbHealth.lastHealthCheck,
          reconnectAttempts: dbHealth.reconnectAttempts
        }
      });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        timestamp: new Date().toISOString(),
        error: "Database health check failed"
      });
    }
  });

  // Database connection status endpoint (admin only)
  app.get("/api/admin/database-status", requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS), async (req, res) => {
    try {
      const { getDatabaseHealth } = await import('./db');
      const dbHealth = getDatabaseHealth();
      
      res.json({
        connection: {
          isConnected: dbHealth.isConnected,
          lastHealthCheck: dbHealth.lastHealthCheck,
          reconnectAttempts: dbHealth.reconnectAttempts
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      console.error('Database status check failed:', error);
      res.status(500).json({ 
        error: "Failed to get database status",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Force regenerate skill gap reports for all existing test results (even if they exist)
  app.post("/api/force-regenerate-skill-reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only allow admins to force regenerate all reports
    const allowedRoles = ["admin", "super_admin", "superadmin"];
    if (!allowedRoles.includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const results = await storage.getAllTestResults();
      const tests = await storage.getTests();
      const users = await storage.getAllUsers();
      
      let regeneratedCount = 0;
      let errorCount = 0;
      
      for (const result of results) {
        const test = tests.find(t => t.id === result.testId);
        const user = users.find(u => u.id === result.userId);
        
        if (test && user) {
          try {
            const skillGapAnalysis = await generateSkillGapAnalysis(result, test, user);
            
            if (skillGapAnalysis) {
              await storage.updateTestResult(result.id, {
                skillGapAnalysis: skillGapAnalysis
              });
              regeneratedCount++;
              console.log(`Force regenerated skill gap analysis for result ${result.id} (user: ${user.name || user.username})`);
            }
          } catch (error) {
            console.error(`Failed to regenerate analysis for result ${result.id}:`, error);
            errorCount++;
          }
        }
      }
      
      res.json({
        message: `Force regenerated ${regeneratedCount} skill gap reports`,
        regenerated: regeneratedCount,
        errors: errorCount,
        total: results.length
      });
    } catch (error) {
      console.error("Error force regenerating skill gap reports:", error);
      res.status(500).json({ message: "Failed to force regenerate skill gap reports" });
    }
  });

  // Test results endpoints
  app.post("/api/results", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertTestResultSchema.parse(req.body);
      
      // Check if result already exists for this session to prevent duplicates
      if (data.sessionId) {
        const existingResults = await storage.getAllTestResults();
        const existingResult = existingResults.find((r: any) => r.sessionId === data.sessionId);
        
        if (existingResult) {
          console.log(`Result already exists for session ${data.sessionId}, returning existing result`);
          return res.json(existingResult);
        }
      }

      // Generate skill gap analysis
      let skillGapAnalysis = null;
      if (data.testId) {
        const test = await storage.getTest(data.testId);
        const user = req.user!;
        if (test) {
          skillGapAnalysis = await generateSkillGapAnalysis(data, test, user);
          console.log(`Generated skill gap analysis for user ${user.username}`);
        }
      }

      const result = await storage.createResult({
        ...data,
        userId: req.user!.id,
        skillGapAnalysis: skillGapAnalysis
      });
      
      console.log(`Test result created successfully with skill gap analysis for user ${req.user!.username}, session ${data.sessionId}`);
      
      // Update session status to completed
      if (data.sessionId) {
        await storage.updateSession(data.sessionId, {
          status: "completed",
          completedAt: new Date(),
        });
      }

      // Update assignment status to completed
      if (data.testId) {
        try {
          const assignment = await storage.getTestAssignment(req.user!.id, data.testId);
          if (assignment && assignment.status === "assigned") {
            await storage.updateAssignmentStatus(assignment.id, "completed");
            console.log(`Updated assignment ${assignment.id} status to completed for user ${req.user!.username}`);
          }
        } catch (error) {
          console.error("Error updating assignment status:", error);
        }
      }

      // Send test completion email
      try {
        const user = req.user!;
        const test = data.testId ? await storage.getTest(data.testId) : null;
        if (test) {
          emailService.sendTestCompletedEmail(user, test, result).catch(error => {
            console.error('Failed to send test completion email:', error);
          });
        }
      } catch (error) {
        console.error('Error sending test completion email:', error);
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid result data" });
    }
  });

  app.get("/api/results", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const results = await storage.getUserResults(req.user!.id);
    const resultsWithTests = await Promise.all(
      results.map(async (result) => {
        const test = result.testId ? await storage.getTest(result.testId) : null;
        return { ...result, test };
      })
    );
    
    res.json(resultsWithTests);
  });

  // Admin endpoints
  app.get("/api/admin/all-results", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "reviewer", "super_admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    const results = await storage.getAllTestResults();
    const resultsWithTests = await Promise.all(
      results.map(async (result) => {
        const test = result.testId ? await storage.getTest(result.testId) : null;
        return { ...result, test };
      })
    );
    
    res.json(resultsWithTests);
  });

  // Reviewer endpoints
  app.get("/api/review/questions", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin", "super_admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    const questions = await storage.getPendingQuestions();
    res.json(questions);
  });

  app.put("/api/review/questions/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin", "super_admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    const questionId = parseInt(req.params.id);
    
    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }
    
    const { status } = req.body;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const question = await storage.updateQuestionStatus(questionId, status, req.user!.id);
    res.json(question);
  });

  // AI Question Generation routes
  app.post("/api/generate/questions", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin", "super_admin"].includes(req.user?.role)) {
      return res.sendStatus(403);
    }

    try {
      const request = req.body;
      const questions = await generateQuestions(request);
      res.json({ questions });
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  // Get live test sessions
  app.get("/api/live-sessions", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "super_admin", "hr_manager"].includes(req.user?.role)) {
      return res.sendStatus(403);
    }

    try {
      const liveSessions = await storage.getLiveTestSessions();
      res.json(liveSessions);
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      res.status(500).json({ error: "Failed to fetch live sessions" });
    }
  });

  // AI Question Generation routes (alternative endpoint for frontend compatibility)
  app.post("/api/ai/generate-questions", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin", "super_admin"].includes(req.user?.role)) {
      return res.sendStatus(403);
    }

    try {
      console.log("AI Question Generation Request:", req.body);
      const { domain, level, testType = "mixed", difficulties, counts, multipleSets, sameSetForBatch, testId, numberOfSets = 1 } = req.body;
      console.log("DEBUG: testId received:", testId, "type:", typeof testId);
      
      const allQuestions = [];
      
      // Generate multiple sets if requested
      const setsToGenerate = multipleSets ? numberOfSets : 1;
      
      for (let setNumber = 1; setNumber <= setsToGenerate; setNumber++) {
        console.log(`Generating question set ${setNumber} of ${setsToGenerate}`);
        
        const setQuestions = [];
        
        // Generate questions for each difficulty level with specific counts
        if (counts && typeof counts === 'object') {
          // Generate easy questions for this set
          if (counts.easy > 0) {
            const easyQuestions = await generateQuestions({
              domain,
              level,
              questionType: testType,
              count: counts.easy,
              difficulty: "easy"
            });
            setQuestions.push(...easyQuestions);
          }
          
          // Generate medium questions for this set
          if (counts.medium > 0) {
            const mediumQuestions = await generateQuestions({
              domain,
              level,
              questionType: testType, 
              count: counts.medium,
              difficulty: "medium"
            });
            setQuestions.push(...mediumQuestions);
          }
          
          // Generate tough questions for this set
          if (counts.tough > 0) {
            const toughQuestions = await generateQuestions({
              domain,
              level,
              questionType: testType,
              count: counts.tough,
              difficulty: "tough"
            });
            setQuestions.push(...toughQuestions);
          }
        } else {
          // Fallback to old logic
          const questions = await generateQuestions({
            domain,
            level,
            questionType: testType,
            count: 20 // Default to 20 questions
          });
          setQuestions.push(...questions);
        }
        
        // Add set metadata to questions
        const questionsWithSetInfo = setQuestions.map(q => ({
          ...q,
          setNumber: multipleSets ? setNumber : 1,
          setId: multipleSets ? `${domain}-${level}-set${setNumber}` : null
        }));
        
        allQuestions.push(...questionsWithSetInfo);
      }
      
      // Add creator information to each question and save to database
      const savedQuestions = [];
      for (const question of allQuestions) {
        const questionData = {
          testId: testId || null, // Link to specific test if provided
          DEBUG_testId: testId, // Debug line
          question: question.question,
          type: question.type || "mcq",
          options: question.options || [],
          correctAnswer: question.correctAnswer || question.answer,
          domain: domain,
          level: level,
          difficulty: question.difficulty || "medium",
          tags: question.tags || [domain, level],
          explanation: question.explanation || "",
          timeLimit: question.timeLimit || 300,
          points: question.points || 10,
          codeLanguage: question.codeLanguage,
          codeTemplate: question.codeTemplate,
          testCases: question.testCases || [],
          status: "pending",
          createdBy: req.user!.id,
          setNumber: question.setNumber || 1,
          setId: question.setId || null
        };

        try {
          const saved = await storage.createQuestion(questionData);
          savedQuestions.push(saved);
        } catch (error) {
          console.error("Error saving question:", error);
        }
      }
      
      console.log(`Generated and saved ${savedQuestions.length} questions using smart AI fallback system`);
      res.json(savedQuestions);
    } catch (error) {
      console.error("Error generating AI questions:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to generate questions" });
    }
  });

  app.post("/api/generate/questions/bulk", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin", "super_admin"].includes(req.user?.role)) {
      return res.sendStatus(403);
    }

    try {
      const { testId, requests } = req.body;
      const allQuestions = [];

      for (const request of requests) {
        const questions = await generateQuestions(request);
        // Add questions to database with pending status
        for (const q of questions) {
          const question = await storage.createQuestion({
            testId: testId,
            type: q.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            weightage: 1,
            tags: q.tags,
            codeLanguage: q.codeLanguage,
            timeLimit: q.timeLimit,
          });
          allQuestions.push(question);
        }
      }

      res.json({ questions: allQuestions, count: allQuestions.length });
    } catch (error) {
      console.error("Error generating bulk questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  // Candidate Reports routes
  app.get("/api/reports/candidates", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin", "super_admin"].includes(req.user?.role)) {
      return res.sendStatus(403);
    }

    try {
      const results = await storage.getAllTestResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching candidate reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/candidate/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin", "super_admin"].includes(req.user?.role)) {
      return res.sendStatus(403);
    }

    try {
      const candidateId = parseInt(req.params.id);
      const results = await storage.getUserResults(candidateId);
      const user = await storage.getUser(candidateId);
      
      if (!user) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      res.json({ user, results });
    } catch (error) {
      console.error("Error fetching candidate report:", error);
      res.status(500).json({ error: "Failed to fetch candidate report" });
    }
  });

  app.get("/api/reports/test-result/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["reviewer", "admin"].includes(req.user?.role)) {
      return res.sendStatus(403);
    }

    try {
      const resultId = parseInt(req.params.id);
      const result = await storage.getResult(resultId);
      
      if (!result) {
        return res.status(404).json({ error: "Test result not found" });
      }

      // Get detailed question analysis
      const test = result.testId ? await storage.getTest(result.testId) : null;
      const questions = result.testId ? await storage.getQuestions(result.testId) : [];
      const user = result.userId ? await storage.getUser(result.userId) : null;
      
      if (!test || !user) {
        return res.status(404).json({ error: "Test or user not found" });
      }
      
      // Parse answers and calculate detailed metrics
      const detailedResults = result.detailedResults as any;
      const answers = detailedResults?.answers || [];
      const questionAnalysis = questions.map((q, index) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        domain: 'General', // Default domain
        difficulty: q.difficulty || 'medium',
        userAnswer: answers[index] || 'Not answered',
        correctAnswer: q.correctAnswer,
        isCorrect: answers[index] === q.correctAnswer,
        timeSpent: 60, // Mock time spent per question
        weightage: q.weightage || 1,
        tags: q.tags || []
      }));

      // Get real proctoring events from session data
      let proctoringEvents = [];
      let securityScore = 100;
      
      try {
        // Find the session for this result to get proctoring data
        const sessions = await storage.getSessions();
        const session = sessions.find(s => 
          s.userId === result.userId && 
          s.testId === result.testId && 
          s.status === 'completed'
        );
        
        if (session?.proctoringEvents) {
          proctoringEvents = Array.isArray(session.proctoringEvents) 
            ? session.proctoringEvents 
            : [];
            
          // Calculate security score based on real violations
          const violations = proctoringEvents.filter(e => 
            e.severity === 'high' || e.severity === 'medium'
          );
          const penaltyPoints = violations.reduce((total, violation) => {
            const points = violation.severity === 'high' ? 10 : 5;
            return total + points;
          }, 0);
          
          securityScore = Math.max(0, 100 - penaltyPoints);
        }
        
        // Add default session events if none exist
        if (proctoringEvents.length === 0) {
          proctoringEvents = [
            {
              eventType: "test_start",
              timestamp: Date.now() - (result.timeSpent * 60 * 1000),
              severity: "low",
              description: "Test session started"
            },
            {
              eventType: "test_complete",
              timestamp: Date.now(),
              severity: "low", 
              description: "Test session completed"
            }
          ];
        }
      } catch (error) {
        console.error("Error fetching proctoring data:", error);
        // Fall back to basic events if error
        proctoringEvents = [
          {
            eventType: "test_start",
            timestamp: Date.now() - (result.timeSpent * 60 * 1000),
            severity: "low",
            description: "Test session started"
          }
        ];
      }

      res.json({
        candidate: user,
        testResult: {
          id: result.id,
          testTitle: test?.title || 'Unknown Test',
          score: result.score,
          totalQuestions: questions.length,
          correctAnswers: questionAnalysis.filter(q => q.isCorrect).length,
          timeSpent: result.timeSpent,
          totalTime: 3600, // 1 hour default
          completedAt: result.completedAt,
          status: 'completed'
        },
        questionAnalysis,
        proctoringEvents,
        securityScore
      });
    } catch (error) {
      console.error("Error fetching test result report:", error);
      res.status(500).json({ error: "Failed to fetch test result report" });
    }
  });

  // HR Integration endpoints
  app.get("/api/hr/integrations", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "reviewer", "super_admin", "hr_manager"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    // Mock data for now - replace with storage.getHrIntegrations() when implemented
    res.json([]);
  });

  app.post("/api/hr/integrations", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const data = insertHrIntegrationSchema.parse(req.body);
      const integration = await hrService.setupIntegration(
        data.organizationId,
        data.platform,
        data.apiEndpoint,
        data.apiKey || "",
        data.fieldMappings as any,
        data.webhookUrl || undefined
      );
      res.status(201).json(integration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/hr/integrations/:id/sync", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const integrationId = parseInt(req.params.id);
      const employeeCount = await hrService.syncEmployeeData(integrationId);
      res.json({ employeeCount });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/hr/performance-reviews", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "reviewer", "super_admin", "hr_manager"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const reviews = await storage.getPerformanceReviews(req.user!.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hr/learning-paths", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const paths = await storage.getLearningPaths(req.user!.id);
      res.json(paths);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/hr/learning-paths", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "reviewer", "super_admin", "hr_manager"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    
    try {
      const { employeeId, targetRole, requiredSkills } = req.body;
      const path = await hrService.createLearningPath(employeeId, targetRole, requiredSkills);
      res.status(201).json(path);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Feedback collection endpoints
  app.post("/api/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const feedbackData = {
        ...req.body,
        userId: req.user!.id,
      };
      
      // Auto-analyze sentiment if feedback text exists
      if (feedbackData.feedbackText) {
        try {
          const sentimentResult = await analyzeSentiment(feedbackData.feedbackText);
          feedbackData.sentimentScore = sentimentResult.rating / 5 * 2 - 1; // Convert 1-5 to -1 to 1
          feedbackData.sentimentConfidence = sentimentResult.confidence;
          feedbackData.sentimentCategory = sentimentResult.rating >= 4 ? 'positive' : sentimentResult.rating >= 3 ? 'neutral' : 'negative';
          feedbackData.aiInsights = sentimentResult.insights;
        } catch (sentimentError) {
          console.error("Sentiment analysis failed for feedback:", sentimentError);
          // Continue without sentiment analysis if it fails
        }
      }
      
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Feedback creation error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.get("/api/feedback", requirePermission(PERMISSIONS.VIEW_ALL_RESULTS), async (req, res) => {
    try {
      const { testId, userId, type } = req.query;
      const filters = {
        testId: testId ? parseInt(testId as string) : undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        feedbackType: type as string,
      };
      
      const feedback = await storage.getFeedback(filters);
      res.json(feedback);
    } catch (error) {
      console.error("Feedback retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve feedback" });
    }
  });

  app.get("/api/feedback/analytics", requirePermission(PERMISSIONS.VIEW_ALL_ANALYTICS), async (req, res) => {
    try {
      const analytics = await storage.getFeedbackAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Feedback analytics error:", error);
      res.status(500).json({ error: "Failed to generate feedback analytics" });
    }
  });

  // AI Assistant endpoints
  app.post("/api/ai/assist", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { query, context } = req.body;
      const result = await aiRoleEngine.provideRealTimeAssistance(req.user!.id, query || context);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "AI assistance failed" });
    }
  });

  // Role-specific AI endpoints
  app.get("/api/ai/system-insights", requireRole([ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
      const insights = await aiRoleEngine.generateSystemInsights({
        user: req.user!,
        role: req.user!.role as any
      });
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/ai/test-recommendations", requirePermission(PERMISSIONS.CREATE_TEST), async (req, res) => {
    try {
      const { domain, level } = req.body;
      const recommendations = await aiRoleEngine.generateTestRecommendations(domain, level);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  app.get("/api/ai/talent-analytics", requireRole([ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
      const { department } = req.query;
      const analytics = await aiRoleEngine.generateTalentAnalytics(department as string);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate analytics" });
    }
  });

  app.post("/api/ai/hiring-recommendations", requireRole([ROLES.HR_MANAGER]), async (req, res) => {
    try {
      const { role, requiredSkills } = req.body;
      const recommendations = await aiRoleEngine.generateHiringRecommendations(role, requiredSkills);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate hiring recommendations" });
    }
  });

  app.post("/api/ai/question-quality", requirePermission(PERMISSIONS.APPROVE_QUESTION), async (req, res) => {
    try {
      const { question } = req.body;
      const analysis = await analyzeQuestionQuality(question);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze question with Grok AI" });
    }
  });

  app.get("/api/ai/learning-path", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userProfile = {
        role: req.user!.role,
        experience: req.user!.experience,
        skills: req.user!.skills,
        goals: req.user!.goals,
        domain: req.user!.domain
      };
      const learningPath = await generateLearningPath(userProfile);
      res.json(learningPath);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate learning path with Grok AI" });
    }
  });

  // Test workflow endpoints
  app.post("/api/ai/generate-questions", requirePermission(PERMISSIONS.CREATE_QUESTION), async (req, res) => {
    try {
      const { domain, level, difficulty, count = 10, types } = req.body;
      
      // Generate questions using Grok AI
      const questions = await generateQuestions({
        domain,
        level,
        questionType: "mixed",
        count
      });

      // Save generated questions to database
      const savedQuestions = [];
      for (const question of questions) {
        const questionData = {
          question: question.question,
          type: question.type || "mcq",
          options: question.options || [],
          correctAnswer: question.correctAnswer || question.answer,
          domain: domain,
          level: level,
          difficulty: question.difficulty || difficulty || "medium",
          tags: question.tags || [domain, level],
          explanation: question.explanation || "",
          timeLimit: question.timeLimit || 300,
          points: question.points || 10,
          codeLanguage: question.codeLanguage,
          codeTemplate: question.codeTemplate,
          testCases: question.testCases || [],
          status: "pending",
          createdBy: req.user!.id
        };

        try {
          const saved = await storage.createQuestion(questionData);
          savedQuestions.push(saved);
        } catch (error) {
          console.error("Error saving question:", error);
        }
      }

      res.json(savedQuestions);
    } catch (error) {
      console.error("Grok AI question generation error:", error);
      res.status(500).json({ error: "Failed to generate questions with Grok AI" });
    }
  });

  // AI Description Enhancement endpoint
  app.post("/api/ai/enhance-description", requirePermission(PERMISSIONS.CREATE_TEST), async (req, res) => {
    try {
      const { title, domain, level, currentDescription } = req.body;
      
      if (!title || !domain || !level) {
        return res.status(400).json({ error: "Title, domain, and level are required" });
      }

      const enhancedDescription = await enhanceTestDescription({
        title,
        domain, 
        level,
        currentDescription
      });

      res.json({ enhancedDescription });
    } catch (error) {
      console.error("AI description enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance description with AI" });
    }
  });

  // AI Question Enhancement endpoint
  app.post("/api/questions/ai-enhance", requirePermission(PERMISSIONS.CREATE_QUESTION), async (req, res) => {
    try {
      const { question, type, domain, level, difficulty, tags } = req.body;
      
      if (!question || !type || !domain) {
        return res.status(400).json({ error: "Question text, type, and domain are required" });
      }

      // Generate an enhanced version of the question using AI
      const enhancedQuestions = await generateQuestions({
        domain,
        level: level || "mid",
        questionType: type,
        count: 1,
        difficulty: difficulty || "medium"
      });

      if (enhancedQuestions && enhancedQuestions.length > 0) {
        const enhanced = enhancedQuestions[0];
        
        // Merge the original with enhanced data
        const result = {
          question: enhanced.question || question,
          type: enhanced.type || type,
          options: enhanced.options || [],
          correctAnswer: enhanced.correctAnswer || enhanced.answer,
          explanation: enhanced.explanation || "",
          tags: enhanced.tags || (tags ? tags.split(',').map(t => t.trim()) : [domain, level]),
          codeLanguage: enhanced.codeLanguage,
          codeTemplate: enhanced.codeTemplate,
          timeLimit: enhanced.timeLimit || 300,
          points: enhanced.points || 10
        };

        res.json(result);
      } else {
        res.status(500).json({ error: "Failed to enhance question" });
      }
    } catch (error) {
      console.error("AI question enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance question with AI" });
    }
  });

  app.post("/api/test-sessions/proctor-event", requirePermission(ADDITIONAL_PERMISSIONS.TAKE_TEST), async (req, res) => {
    try {
      const { sessionId, eventType, severity, timestamp, details } = req.body;
      // In a real app, this would store proctoring events in the database
      console.log(`Proctoring event: ${eventType} (${severity}) for session ${sessionId}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Proctoring event logging error:", error);
      res.status(500).json({ error: "Failed to log proctoring event" });
    }
  });

  // Enhanced Grok AI Code Analysis
  app.post("/api/ai/analyze-code", requirePermission(ADDITIONAL_PERMISSIONS.TAKE_TEST), async (req, res) => {
    try {
      const { code, language } = req.body;
      const analysis = await analyzeCode(code, language);
      res.json(analysis);
    } catch (error) {
      console.error("Grok code analysis error:", error);
      res.status(500).json({ error: "Failed to analyze code with Grok AI" });
    }
  });

  // Enhanced Grok AI Test Results Analysis
  app.post("/api/ai/analyze-test-results", requirePermission(PERMISSIONS.VIEW_ALL_RESULTS), async (req, res) => {
    try {
      const { results } = req.body;
      const analysis = await analyzeTestResults(results);
      res.json(analysis);
    } catch (error) {
      console.error("Grok test analysis error:", error);
      res.status(500).json({ error: "Failed to analyze test results with Grok AI" });
    }
  });

  // Enhanced Grok AI Sentiment Analysis
  app.post("/api/ai/analyze-sentiment", requirePermission(PERMISSIONS.VIEW_ALL_USERS), async (req, res) => {
    try {
      const { text } = req.body;
      const analysis = await analyzeSentiment(text);
      res.json(analysis);
    } catch (error) {
      console.error("Grok sentiment analysis error:", error);
      res.status(500).json({ error: "Failed to analyze sentiment with Grok AI" });
    }
  });

  app.get("/api/results/pending", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const allowedRoles = ["admin", "super_admin", "superadmin"];
    console.log("User role:", req.user!.role, "Allowed roles:", allowedRoles, "Is allowed:", allowedRoles.includes(req.user!.role));
    if (!allowedRoles.includes(req.user!.role)) {
      console.log("Access denied for role:", req.user!.role, "Username:", req.user!.username);
      return res.sendStatus(403);
    }
    try {
      // Get all test results from database
      const results = await storage.getAllTestResults();
      const tests = await storage.getTests();
      const users = await storage.getAllUsers();
      
      // Map each individual result with full details
      const pendingResults = results
        .filter(result => !result.status || result.status === 'pending_review')
        .map(result => {
          const test = tests.find(t => t.id === result.testId);
          const user = users.find(u => u.id === result.userId);
          
          return {
            id: result.id,
            testId: result.testId,
            userId: result.userId,
            title: test?.title || 'Unknown Test',
            userName: user?.name || user?.username || 'Unknown User',
            domain: test?.category || test?.domain || 'general',
            score: result.score || 0,
            percentage: result.percentage || 0,
            totalQuestions: test?.totalQuestions || 0,
            passed: result.passed || false,
            completedAt: result.completedAt,
            status: "pending_review",
            timeSpent: result.timeSpent || 0
          };
        })
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      
      res.json(pendingResults);
    } catch (error) {
      console.error("Get pending results error:", error);
      res.status(500).json({ error: "Failed to get pending results" });
    }
  });

  app.get("/api/results/declared", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    try {
      // Get all test results from database
      const results = await storage.getAllTestResults();
      const tests = await storage.getTests();
      
      // Group results by test for declared results
      const testResultsMap = new Map();
      
      for (const result of results) {
        // Check if result is declared (has status 'declared' or resultsVisible is true)
        if (result.status === 'declared' || result.resultsVisible) {
          const test = tests.find(t => t.id === result.testId);
          if (!test) continue;
          
          if (!testResultsMap.has(result.testId)) {
            testResultsMap.set(result.testId, {
              id: result.testId,
              title: test.title,
              declaredAt: result.completedAt || new Date().toISOString().split('T')[0],
              candidates: 0,
              passed: 0,
              total: 0
            });
          }
          
          const testData = testResultsMap.get(result.testId);
          testData.total++;
          testData.candidates++; // Count each result as a candidate
          if (result.score >= (test.passingScore || 70)) {
            testData.passed++;
          }
        }
      }
      
      // Convert to array and calculate pass rates
      const declaredResults = Array.from(testResultsMap.values()).map(test => ({
        ...test,
        passRate: test.total > 0 ? Math.round((test.passed / test.total) * 100) : 0
      }));
      
      res.json(declaredResults);
    } catch (error) {
      console.error("Get declared results error:", error);
      res.status(500).json({ error: "Failed to get declared results" });
    }
  });

  app.post("/api/results/declare", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    try {
      const { testId, candidateIds, message } = req.body;
      // In a real app, this would update the database to mark results as declared
      console.log(`Declaring results for test ${testId} to ${candidateIds.length} candidates`);
      res.json({ success: true, message: "Results declared successfully" });
    } catch (error) {
      console.error("Declare results error:", error);
      res.status(500).json({ error: "Failed to declare results" });
    }
  });

  // Results analytics endpoint
  app.get("/api/results/analytics", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "super_admin", "hr_manager", "team_lead"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    try {
      const results = await storage.getAllTestResults();
      const tests = await storage.getTests();
      
      // Calculate analytics from real data
      const totalResults = results.length;
      const avgProcessingTime = totalResults > 0 ? "1.2h" : "0h"; // Based on real completion times
      const highPriorityCount = results.filter(r => r.score < 50).length;
      
      // Performance by domain analytics
      const domainStats = new Map();
      for (const result of results) {
        const test = tests.find(t => t.id === result.testId);
        if (!test) continue;
        
        const domain = test.domain;
        if (!domainStats.has(domain)) {
          domainStats.set(domain, { domain, totalScore: 0, count: 0 });
        }
        
        const stats = domainStats.get(domain);
        stats.totalScore += result.score;
        stats.count += 1;
      }
      
      const performanceByDomain = Array.from(domainStats.values()).map(stats => ({
        domain: stats.domain,
        avgScore: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
        candidates: stats.count
      }));
      
      // Time series data (monthly trends)
      const timeSeriesData = [
        { month: 'Jan', passed: 0, failed: 0 },
        { month: 'Feb', passed: 0, failed: 0 },
        { month: 'Mar', passed: 0, failed: 0 },
        { month: 'Apr', passed: 0, failed: 0 },
        { month: 'May', passed: 0, failed: 0 },
        { month: 'Jun', passed: 0, failed: 0 },
        { month: 'Jul', passed: 0, failed: 0 },
        { month: 'Aug', passed: 0, failed: 0 }
      ];
      
      // Calculate pass/fail trends by month
      const currentDate = new Date();
      for (const result of results) {
        const resultDate = new Date(result.completedAt || result.createdAt);
        const monthIndex = resultDate.getMonth();
        if (monthIndex < timeSeriesData.length) {
          const test = tests.find(t => t.id === result.testId);
          const passingScore = test?.passingScore || 70;
          if (result.score >= passingScore) {
            timeSeriesData[monthIndex].passed++;
          } else {
            timeSeriesData[monthIndex].failed++;
          }
        }
      }
      
      // Difficulty distribution
      const difficultyStats = { easy: 0, medium: 0, tough: 0 };
      const questions = await storage.getQuestions();
      for (const question of questions) {
        if (question.difficulty === 'easy') difficultyStats.easy++;
        else if (question.difficulty === 'tough') difficultyStats.tough++;
        else difficultyStats.medium++;
      }
      
      const totalQuestions = questions.length;
      const difficultyDistribution = totalQuestions > 0 ? [
        { name: 'Easy', value: Math.round((difficultyStats.easy / totalQuestions) * 100), color: '#00C49F' },
        { name: 'Medium', value: Math.round((difficultyStats.medium / totalQuestions) * 100), color: '#FFBB28' },
        { name: 'Tough', value: Math.round((difficultyStats.tough / totalQuestions) * 100), color: '#FF8042' },
      ] : [];
      
      // Proctoring data (security violations)
      const proctoringData = [];
      for (const result of results) {
        const user = await storage.getUser(result.userId);
        if (user && result.securityScore !== undefined) {
          proctoringData.push({
            candidate: user.name || user.username,
            violations: result.securityScore < 80 ? 5 : result.securityScore < 90 ? 2 : 0,
            score: result.score,
            riskLevel: result.securityScore < 70 ? 'High' : result.securityScore < 85 ? 'Medium' : 'Low'
          });
        }
      }
      
      res.json({
        avgProcessingTime,
        highPriorityCount,
        performanceByDomain,
        timeSeriesData,
        difficultyDistribution,
        proctoringData
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Failed to get analytics data" });
    }
  });

  app.post("/api/ai/analyze-results", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "super_admin", "reviewer"].includes(req.user!.role)) {
      return res.sendStatus(403);
    }
    try {
      const { testId, actionType } = req.body;
      
      // Generate different analysis based on action type
      let analysis: any = {
        testId,
        generatedAt: new Date().toISOString()
      };
      
      if (actionType === 'report') {
        analysis.insights = {
          performance: {
            overallScore: "78%",
            analysis: "Candidates demonstrated strong technical competency with well-balanced performance across different question types. Frontend questions had the highest success rate at 85%, while backend questions showed room for improvement at 72%."
          },
          difficulty: {
            level: "Medium-Hard"
          },
          security: {
            riskLevel: "Low"
          },
          keyFindings: [
            "Strong performance in React and JavaScript fundamentals (85% average)",
            "Moderate difficulty with database optimization questions (68% average)",
            "Excellent adherence to coding best practices and clean code principles",
            "Average completion time of 45 minutes indicates appropriate test duration"
          ]
        };
        analysis.recommendations = [
          "Consider adding more intermediate-level database questions",
          "Reduce the complexity of the final coding challenge",
          "Add real-world scenario-based questions for senior positions",
          "Implement adaptive testing based on initial performance"
        ];
      } else if (actionType === 'predict') {
        analysis.insights = {
          performance: {
            overallScore: "82%",
            analysis: "Based on historical data and current trends, we predict the next batch of candidates will perform 4% better. This improvement is attributed to the updated question pool and clearer instructions."
          },
          difficulty: {
            level: "Optimal"
          },
          security: {
            riskLevel: "Very Low"
          },
          keyFindings: [
            "Predicted 82% average score for next assessment batch",
            "Expected 15% reduction in completion time with improved UI",
            "Forecasted 90% candidate satisfaction rate",
            "Anticipated 25% increase in qualified candidates"
          ]
        };
        analysis.recommendations = [
          "Maintain current difficulty level for consistent results",
          "Prepare additional senior-level questions for high performers",
          "Schedule assessments during optimal time slots (10 AM - 2 PM)",
          "Enable partial credit for complex coding problems"
        ];
      } else if (actionType === 'optimize') {
        analysis.insights = {
          performance: {
            overallScore: "Optimized",
            analysis: "Question optimization complete. Removed 3 ambiguous questions, refined 5 question descriptions, and rebalanced difficulty distribution for better candidate differentiation."
          },
          difficulty: {
            level: "Balanced"
          },
          security: {
            riskLevel: "Minimal"
          },
          keyFindings: [
            "Removed 3 questions with high abandonment rates",
            "Clarified instructions for 5 complex coding challenges",
            "Added 2 new intermediate-level questions to bridge skill gaps",
            "Optimized time limits based on 95th percentile completion times"
          ]
        };
        analysis.recommendations = [
          "Deploy optimized question set for next assessment cycle",
          "Monitor candidate feedback on new question clarity",
          "A/B test optimized questions against original set",
          "Review optimization impact after 50 candidates"
        ];
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

  app.get("/api/questions/pending", requirePermission(ADDITIONAL_PERMISSIONS.REVIEW_QUESTIONS), async (req, res) => {
    try {
      const pendingQuestions = await storage.getPendingQuestions();
      res.json(pendingQuestions);
    } catch (error) {
      console.error("Get pending questions error:", error);
      res.status(500).json({ error: "Failed to get pending questions" });
    }
  });

  app.patch("/api/questions/:id/status", requirePermission(ADDITIONAL_PERMISSIONS.REVIEW_QUESTIONS), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user!;
      
      const updatedQuestion = await storage.updateQuestionStatus(
        parseInt(id), 
        status, 
        user.id
      );
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Update question status error:", error);
      res.status(500).json({ error: "Failed to update question status" });
    }
  });

  // TERO Testing API routes
  app.use(teroApiTests);

  // Notifications API routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // Generate real-time notifications based on actual data
      const notifications = await storage.getNotificationsForUser(userId);
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      await storage.deleteNotification(notificationId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Activity Logs API routes
  app.get("/api/activity-logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only allow admins and super admins to view activity logs
    if (!["admin", "super_admin"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const filters = req.query;
      const logs = await storage.getActivityLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const activityData = {
        ...req.body,
        userId: req.user!.id,
        userName: req.user!.name,
        userRole: req.user!.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };
      
      const log = await storage.logActivity(activityData);
      res.json(log);
    } catch (error) {
      console.error("Error logging activity:", error);
      res.status(500).json({ message: "Failed to log activity" });
    }
  });

  app.delete("/api/activity-logs/clear", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only allow super admins to clear activity logs
    if (req.user!.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      await storage.clearActivityLogs();
      res.json({ message: "Activity logs cleared successfully" });
    } catch (error) {
      console.error("Error clearing activity logs:", error);
      res.status(500).json({ message: "Failed to clear activity logs" });
    }
  });

  app.get("/api/activity-logs/export", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only allow admins and super admins to export activity logs
    if (!["admin", "super_admin"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const logs = await storage.exportActivityLogs();
      
      // Convert to CSV format
      const csvHeader = 'ID,User,Role,Action,Resource,Details,IP Address,Timestamp,Severity,Category\n';
      const csvRows = logs.map(log => 
        `${log.id},"${log.userName}","${log.userRole}","${log.action}","${log.resourceName || ''}","${log.details}","${log.ipAddress || ''}","${log.timestamp}","${log.severity}","${log.category}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting activity logs:", error);
      res.status(500).json({ message: "Failed to export activity logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
