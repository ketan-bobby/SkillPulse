import { ROLES } from "@shared/roles";

// Navigation utility to properly redirect users to their role-based dashboard
export const redirectToDashboard = (userRole?: string, setLocation?: (path: string) => void) => {
  if (!setLocation) return;
  
  switch (userRole) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      setLocation('/admin-dashboard');
      break;
    case ROLES.HR_MANAGER:
      setLocation('/hr-dashboard');
      break;
    case ROLES.REVIEWER:
      setLocation('/reviewer-dashboard');
      break;
    case ROLES.TEAM_LEAD:
      setLocation('/team-lead-dashboard');
      break;
    case ROLES.EMPLOYEE:
      setLocation('/employee-dashboard');
      break;
    case ROLES.CANDIDATE:
      setLocation('/candidate-dashboard');
      break;
    default:
      setLocation('/');
      break;
  }
};

// Get the appropriate dashboard path for a user role
export const getDashboardPath = (userRole?: string): string => {
  switch (userRole) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return '/admin-dashboard';
    case ROLES.HR_MANAGER:
      return '/hr-dashboard';
    case ROLES.REVIEWER:
      return '/reviewer-dashboard';
    case ROLES.TEAM_LEAD:
      return '/team-lead-dashboard';
    case ROLES.EMPLOYEE:
      return '/employee-dashboard';
    case ROLES.CANDIDATE:
      return '/candidate-dashboard';
    default:
      return '/';
  }
};