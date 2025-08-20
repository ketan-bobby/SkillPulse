import { Request, Response, NextFunction } from "express";
import { hasPermission, Permission, Role, ADDITIONAL_PERMISSIONS } from "@shared/roles";

export function requirePermission(permission: Permission | Permission[], requireAll = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = req.user.role as Role;
    const permissions = Array.isArray(permission) ? permission : [permission];

    const hasAccess = requireAll
      ? permissions.every(p => hasPermission(userRole, p))
      : permissions.some(p => hasPermission(userRole, p));

    if (!hasAccess) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "You don't have permission to perform this action" 
      });
    }

    next();
  };
}

export function requireRole(roles: Role | Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = req.user.role as Role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "Your role doesn't have access to this resource" 
      });
    }

    next();
  };
}