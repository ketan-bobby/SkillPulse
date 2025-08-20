import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission, hasAnyPermission, Permission, Role } from "@shared/roles";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function PermissionGuard({ 
  children, 
  permissions, 
  requireAll = false,
  fallback,
  redirectTo = "/"
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const userRole = user.role as Role;
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  const hasAccess = requireAll 
    ? permissionArray.every(p => hasPermission(userRole, p))
    : hasAnyPermission(userRole, permissionArray);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}

interface CanAccessProps {
  children: ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function CanAccess({ 
  children, 
  permissions, 
  requireAll = false,
  fallback = null
}: CanAccessProps) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const userRole = user.role as Role;
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  const hasAccess = requireAll 
    ? permissionArray.every(p => hasPermission(userRole, p))
    : hasAnyPermission(userRole, permissionArray);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}