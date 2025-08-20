import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { ROLES } from "@shared/roles";
import { Loader2 } from "lucide-react";

export function RoleRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/candidate-login" />;
  }

  // Redirect based on user role
  switch (user.role) {
    case ROLES.SUPER_ADMIN:
      return <Redirect to="/super-admin" />;
    case ROLES.ADMIN:
      return <Redirect to="/admin" />;
    case ROLES.HR_MANAGER:
      return <Redirect to="/hr-manager" />;
    case ROLES.REVIEWER:
      return <Redirect to="/reviewer" />;
    case ROLES.TEAM_LEAD:
      return <Redirect to="/team-lead" />;
    case ROLES.EMPLOYEE:
      return <Redirect to="/employee" />;
    case ROLES.CANDIDATE:
      return <Redirect to="/candidate" />;
    default:
      return <Redirect to="/candidate-login" />;
  }
}