// Role definitions and permissions for LinxIQ

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  REVIEWER: 'reviewer',
  TEAM_LEAD: 'team_lead',
  EMPLOYEE: 'employee',
  CANDIDATE: 'candidate',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permission definitions
export const PERMISSIONS = {
  // User Management
  VIEW_ALL_USERS: 'view_all_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  CHANGE_USER_ROLE: 'change_user_role',
  
  // Test Management
  CREATE_TEST: 'create_test',
  UPDATE_TEST: 'update_test',
  DELETE_TEST: 'delete_test',
  PUBLISH_TEST: 'publish_test',
  VIEW_ALL_TESTS: 'view_all_tests',
  MANAGE_TESTS: 'manage_tests',
  
  // Question Management
  CREATE_QUESTION: 'create_question',
  UPDATE_QUESTION: 'update_question',
  DELETE_QUESTION: 'delete_question',
  APPROVE_QUESTION: 'approve_question',
  REJECT_QUESTION: 'reject_question',
  VIEW_ALL_QUESTIONS: 'view_all_questions',
  
  // Assignment Management
  ASSIGN_TEST: 'assign_test',
  MANAGE_ASSIGNMENTS: 'manage_assignments',
  VIEW_ALL_ASSIGNMENTS: 'view_all_assignments',
  VIEW_TEAM_ASSIGNMENTS: 'view_team_assignments',
  VIEW_OWN_ASSIGNMENTS: 'view_own_assignments',
  
  // Results & Reports
  VIEW_ALL_RESULTS: 'view_all_results',
  VIEW_TEAM_RESULTS: 'view_team_results',
  VIEW_OWN_RESULTS: 'view_own_results',
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_DATA: 'export_data',
  
  // HR Integration
  MANAGE_HR_INTEGRATION: 'manage_hr_integration',
  SYNC_EMPLOYEE_DATA: 'sync_employee_data',
  VIEW_PERFORMANCE_REVIEWS: 'view_performance_reviews',
  CREATE_LEARNING_PATHS: 'create_learning_paths',
  
  // System Settings
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  
  // Company Structure
  MANAGE_COMPANY_STRUCTURE: 'manage_company_structure',
  
  // Analytics
  VIEW_ALL_ANALYTICS: 'view_all_analytics',
  VIEW_TEAM_ANALYTICS: 'view_team_analytics',
  VIEW_OWN_ANALYTICS: 'view_own_analytics',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS] | typeof ADDITIONAL_PERMISSIONS[keyof typeof ADDITIONAL_PERMISSIONS];

// Additional permissions for test workflow
export const ADDITIONAL_PERMISSIONS = {
  // Test Workflow
  MANAGE_RESULTS: 'manage_results',
  REVIEW_QUESTIONS: 'review_questions',
  VIEW_AI_INSIGHTS: 'view_ai_insights',
  TAKE_TEST: 'take_test',
  TAKE_TESTS: 'take_tests',
  EDIT_OWN_PROFILE: 'edit_own_profile',
} as const;

// Merge all permissions
export const ALL_PERMISSIONS = { ...PERMISSIONS, ...ADDITIONAL_PERMISSIONS } as const;

// Role-Permission Matrix
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(ALL_PERMISSIONS), // All permissions
  
  [ROLES.ADMIN]: [
    // User Management
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CHANGE_USER_ROLE,
    
    // Test Management
    PERMISSIONS.CREATE_TEST,
    PERMISSIONS.UPDATE_TEST,
    PERMISSIONS.DELETE_TEST,
    PERMISSIONS.PUBLISH_TEST,
    PERMISSIONS.VIEW_ALL_TESTS,
    PERMISSIONS.MANAGE_TESTS,
    
    // Question Management
    PERMISSIONS.CREATE_QUESTION,
    PERMISSIONS.UPDATE_QUESTION,
    PERMISSIONS.DELETE_QUESTION,
    PERMISSIONS.APPROVE_QUESTION,
    PERMISSIONS.REJECT_QUESTION,
    PERMISSIONS.VIEW_ALL_QUESTIONS,
    
    // Assignment Management
    PERMISSIONS.ASSIGN_TEST,
    PERMISSIONS.MANAGE_ASSIGNMENTS,
    PERMISSIONS.VIEW_ALL_ASSIGNMENTS,
    
    // Results & Reports
    PERMISSIONS.VIEW_ALL_RESULTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    
    // Analytics
    PERMISSIONS.VIEW_ALL_ANALYTICS,
    
    // System Settings (limited)
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    
    // Company Structure
    PERMISSIONS.MANAGE_COMPANY_STRUCTURE,
    
    // Additional Test Workflow Permissions
    ADDITIONAL_PERMISSIONS.MANAGE_RESULTS,
    ADDITIONAL_PERMISSIONS.REVIEW_QUESTIONS,
    ADDITIONAL_PERMISSIONS.VIEW_AI_INSIGHTS,
  ],
  
  [ROLES.HR_MANAGER]: [
    // User Management (limited)
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    
    // Test Management (view only)
    PERMISSIONS.VIEW_ALL_TESTS,
    
    // Assignment Management
    PERMISSIONS.ASSIGN_TEST,
    PERMISSIONS.VIEW_ALL_ASSIGNMENTS,
    
    // Results & Reports
    PERMISSIONS.VIEW_ALL_RESULTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    
    // HR Integration (full access)
    PERMISSIONS.MANAGE_HR_INTEGRATION,
    PERMISSIONS.SYNC_EMPLOYEE_DATA,
    PERMISSIONS.VIEW_PERFORMANCE_REVIEWS,
    PERMISSIONS.CREATE_LEARNING_PATHS,
    
    // Analytics
    PERMISSIONS.VIEW_ALL_ANALYTICS,
  ],
  
  [ROLES.REVIEWER]: [
    // Question Management
    PERMISSIONS.CREATE_QUESTION,
    PERMISSIONS.UPDATE_QUESTION,
    PERMISSIONS.APPROVE_QUESTION,
    PERMISSIONS.REJECT_QUESTION,
    PERMISSIONS.VIEW_ALL_QUESTIONS,
    
    // Test Management (limited)
    PERMISSIONS.CREATE_TEST,
    PERMISSIONS.UPDATE_TEST,
    PERMISSIONS.VIEW_ALL_TESTS,
    
    // Results & Reports (limited)
    PERMISSIONS.VIEW_ALL_RESULTS,
    PERMISSIONS.GENERATE_REPORTS,
    
    // Analytics
    PERMISSIONS.VIEW_ALL_ANALYTICS,
  ],
  
  [ROLES.TEAM_LEAD]: [
    // User Management (team only)
    PERMISSIONS.VIEW_ALL_USERS, // Will be filtered to team members
    
    // Test Management (view only)
    PERMISSIONS.VIEW_ALL_TESTS,
    
    // Assignment Management (team)
    PERMISSIONS.ASSIGN_TEST,
    PERMISSIONS.VIEW_TEAM_ASSIGNMENTS,
    
    // Results & Reports (team)
    PERMISSIONS.VIEW_TEAM_RESULTS,
    PERMISSIONS.GENERATE_REPORTS,
    
    // Analytics (team)
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
  ],
  
  [ROLES.EMPLOYEE]: [
    // View own data only
    PERMISSIONS.VIEW_OWN_ASSIGNMENTS,
    PERMISSIONS.VIEW_OWN_RESULTS,
    PERMISSIONS.VIEW_OWN_ANALYTICS,
    
    // Test taking permissions
    ADDITIONAL_PERMISSIONS.TAKE_TESTS,
    ADDITIONAL_PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  [ROLES.CANDIDATE]: [
    // Very limited - only view own assignments and results
    PERMISSIONS.VIEW_OWN_ASSIGNMENTS,
    PERMISSIONS.VIEW_OWN_RESULTS,
  ],
};

// Role hierarchy for inheritance
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [ROLES.SUPER_ADMIN]: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.REVIEWER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE, ROLES.CANDIDATE],
  [ROLES.ADMIN]: [ROLES.REVIEWER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE, ROLES.CANDIDATE],
  [ROLES.HR_MANAGER]: [ROLES.TEAM_LEAD, ROLES.EMPLOYEE, ROLES.CANDIDATE],
  [ROLES.REVIEWER]: [ROLES.EMPLOYEE, ROLES.CANDIDATE],
  [ROLES.TEAM_LEAD]: [ROLES.EMPLOYEE, ROLES.CANDIDATE],
  [ROLES.EMPLOYEE]: [ROLES.CANDIDATE],
  [ROLES.CANDIDATE]: [],
};

// Helper functions
export function hasPermission(userRole: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function canAccessRole(userRole: Role, targetRole: Role): boolean {
  if (userRole === targetRole) return true;
  const hierarchy = ROLE_HIERARCHY[userRole] || [];
  return hierarchy.includes(targetRole);
}

// Role display information
export const ROLE_INFO = {
  [ROLES.SUPER_ADMIN]: {
    name: 'Super Administrator',
    description: 'Full system access with all privileges',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'Crown',
  },
  [ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Manages platform operations, users, and content',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'Shield',
  },
  [ROLES.HR_MANAGER]: {
    name: 'HR Manager',
    description: 'Manages employee data, assignments, and HR integrations',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'Users',
  },
  [ROLES.REVIEWER]: {
    name: 'Technical Reviewer',
    description: 'Reviews and approves technical questions and tests',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: 'CheckCircle',
  },
  [ROLES.TEAM_LEAD]: {
    name: 'Team Lead',
    description: 'Manages team assessments and performance',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: 'UserCheck',
  },
  [ROLES.EMPLOYEE]: {
    name: 'Employee',
    description: 'Regular employee with access to assigned assessments',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: 'User',
  },
  [ROLES.CANDIDATE]: {
    name: 'Candidate',
    description: 'External candidate for assessment',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'UserMinus',
  },
} as const;