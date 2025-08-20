import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ROLES } from "@shared/roles";

// Role-based route configuration
const ROLE_ROUTES = {
  [ROLES.SUPER_ADMIN]: "/super-admin",
  [ROLES.ADMIN]: "/admin", 
  [ROLES.HR_MANAGER]: "/hr-manager",
  [ROLES.REVIEWER]: "/reviewer",
  [ROLES.TEAM_LEAD]: "/team-lead",
  [ROLES.EMPLOYEE]: "/employee",
  [ROLES.CANDIDATE]: "/candidate"
};

// Role-based default pages - using existing dashboard components for now

export function RoleRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Get the appropriate route for the user's role
  const roleRoute = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES];
  
  if (!roleRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Your role ({user.role}) does not have access to this system.</p>
        </div>
      </div>
    );
  }

  return <Redirect to={roleRoute} />;
}

// Role-specific route guard
export function RoleRoute({ 
  path, 
  allowedRoles, 
  component: Component 
}: { 
  path: string;
  allowedRoles: string[];
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user's role is in the allowed roles list
  // Also handle 'superadmin' as an alias for 'super_admin'
  const userRole = user.role === 'superadmin' ? ROLES.SUPER_ADMIN : user.role;
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Required roles: {allowedRoles.join(", ")}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your current role: {user.role}
            </p>
          </div>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}

// Helper function to get role-based path - DEPRECATED: Use local implementations in components
// This function caused React hook errors when called outside components
// Use the local getBasePath implementation in each component instead

// Get role-specific base URL
export function getRoleBaseUrl(role: string): string {
  return ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || "/";
}

// Check if current user can access a role's routes
function canAccessRole(userRole: string, targetRole: string): boolean {
  // Super admin can access all roles
  if (userRole === ROLES.SUPER_ADMIN) return true;
  
  // Admin can access admin and below
  if (userRole === ROLES.ADMIN && targetRole !== ROLES.SUPER_ADMIN) return true;
  
  // HR Manager can access HR and below
  if (userRole === ROLES.HR_MANAGER && 
      [ROLES.HR_MANAGER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE, ROLES.CANDIDATE].includes(targetRole)) {
    return true;
  }
  
  // Others can only access their own role
  return userRole === targetRole;
}