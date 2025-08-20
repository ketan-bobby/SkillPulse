import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessRole, Role, ROLE_INFO } from "@shared/roles";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: (Role | string)[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user.role as Role;
  const hasAccess = allowedRoles.some(role => 
    typeof role === 'string' 
      ? userRole === role 
      : canAccessRole(userRole, role)
  );

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const roleInfo = ROLE_INFO[userRole as Role];
    const allowedRoleNames = allowedRoles.map(role => {
      const info = ROLE_INFO[role as Role];
      return info ? info.name : role;
    });

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-2">
              You don't have permission to access this section.
            </p>
            <p className="text-sm text-muted-foreground">
              Your role: {roleInfo?.name || userRole}
            </p>
            <p className="text-sm text-muted-foreground">
              Required roles: {allowedRoleNames.join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}