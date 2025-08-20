import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { AppFooter } from "./components/app-footer";
import { RoleRoute } from "./lib/role-router";
import { RoleRedirect } from "./components/role-redirect";
import { ROLES } from "@shared/roles";
import { useAuth } from "./hooks/use-auth";
import { Redirect } from "wouter";
import { useEffect } from "react";

// Auth and common pages
import AuthPage from "@/pages/auth-page";
import EmployeeLogin from "@/pages/employee-login";
import EmployeeDashboard from "@/pages/employee-dashboard";
import CandidateLogin from "@/pages/candidate-login";
import CandidateDashboard from "@/pages/candidate-dashboard";
import NotFound from "@/pages/not-found";

// Existing pages - we'll reuse them for now and organize them by role
import HomePage from "@/pages/home-page";
import TestPage from "@/pages/test-page";
import AssignmentsPage from "@/pages/assignments-page";
import ResultsPage from "@/pages/results-page";
import ReportsPage from "@/pages/reports-page";
import ReviewerDashboard from "@/pages/reviewer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AnalyticsPage from "@/pages/analytics-page";
import CandidateReportPage from "@/pages/candidate-report-page";
import HRIntegrationPage from "@/pages/hr-integration-page";
import TestManagementPage from "@/pages/test-management-page";
import AssessmentWorkflow from "@/pages/assessment-workflow";
import UserManagementPage from "@/pages/user-management-page";
import AddUserPage from "@/pages/add-user-page";
import SystemSettingsPage from "@/pages/system-settings-page";
import ExportDataPage from "@/pages/export-data-page";
import QuestionManagementPage from "@/pages/question-management-page";
import ProfilePage from "@/pages/profile-page";
import SmartInsights from "@/pages/ai-insights-page";
import TestManagement from "@/pages/test-management";
import QuestionBank from "@/pages/question-bank";
import ResultsManager from "@/pages/results-manager";
import EmailManagement from "@/pages/email-management";
import EmployeeGroupsPage from "@/pages/employee-groups-page";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import ProjectGroupsPage from "@/pages/project-groups-page";
import CompanyManagement from "@/pages/company-management";
import DepartmentManagement from "@/pages/department-management";
import SettingsPage from "@/pages/settings-page";
import TeroTestingPage from "@/pages/tero-testing-page";
import TestAssignmentPage from "@/pages/test-assignment-page";
import TestBatchAssignment from "@/pages/test-batch-assignment";
import ResultManagement from "@/pages/result-management";
import NotificationsPage from "@/pages/notifications-page";
import ActivityLogPage from "@/pages/activity-log-page-new";
import EditUserPage from "@/pages/edit-user-page";
import ViewUserPage from "@/pages/view-user-page";
import TestDetails from "@/pages/test-details";
import SkillGapReports from "@/pages/skill-gap-reports";
import SkillGapFullscreen from "@/pages/skill-gap-fullscreen";
import { SkillGapDetailedReportAdvanced } from "@/pages/skill-gap-detailed-report-advanced";
import SkillCatalogue from "@/pages/skill-catalogue";



function Router() {
  const [location] = useLocation();
  
  // Check for invalid patterns in the URL
  useEffect(() => {
    if (location.includes('-1') || location.includes('undefined') || location.includes('null')) {
      window.location.href = '/';
    }
  }, [location]);

  return (
    <Switch>
      {/* Auth and redirect routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/employee-login" component={EmployeeLogin} />
      <Route path="/candidate-login" component={CandidateLogin} />
      <Route path="/" component={RoleRedirect} />
      
      {/* Direct access routes - redirect to role-specific versions */}
      <RoleRoute path="/users" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={UserManagementPage} />
      <RoleRoute path="/test-management" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TestManagement} />
      <RoleRoute path="/test-assignment" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TestAssignmentPage} />
      <RoleRoute path="/question-bank" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.REVIEWER]} component={QuestionBank} />
      <RoleRoute path="/results-manager" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER]} component={() => {
        const { user } = useAuth();
        if (user?.role === ROLES.SUPER_ADMIN) {
          return <Redirect to="/super-admin/results" />;
        } else if (user?.role === ROLES.ADMIN) {
          return <Redirect to="/admin/results" />;
        } else if (user?.role === ROLES.HR_MANAGER) {
          return <Redirect to="/hr-manager/results" />;
        }
        return <ResultsManager />;
      }} />
      <RoleRoute path="/skill-gap-reports" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.REVIEWER]} component={SkillGapReports} />
      <RoleRoute path="/skill-gap-fullscreen" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.REVIEWER]} component={SkillGapFullscreen} />
      <RoleRoute path="/skill-gap-detailed-report/:userId" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.REVIEWER]} component={SkillGapDetailedReportAdvanced} />
      <RoleRoute path="/reports/skill-gap/:userId" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.REVIEWER]} component={SkillGapDetailedReportAdvanced} />

      {/* Super Admin Routes - Full System Access */}
      <RoleRoute path="/super-admin" allowedRoles={[ROLES.SUPER_ADMIN]} component={AdminDashboard} />
      <RoleRoute path="/super-admin/dashboard" allowedRoles={[ROLES.SUPER_ADMIN]} component={AdminDashboard} />
      <RoleRoute path="/super-admin/users" allowedRoles={[ROLES.SUPER_ADMIN]} component={UserManagementPage} />
      <RoleRoute path="/super-admin/users/:userId/edit" allowedRoles={[ROLES.SUPER_ADMIN]} component={EditUserPage} />
      <RoleRoute path="/super-admin/users/:userId/view" allowedRoles={[ROLES.SUPER_ADMIN]} component={ViewUserPage} />
      <RoleRoute path="/super-admin/add-user" allowedRoles={[ROLES.SUPER_ADMIN]} component={AddUserPage} />
      <RoleRoute path="/super-admin/tests" allowedRoles={[ROLES.SUPER_ADMIN]} component={TestManagement} />
      <RoleRoute path="/super-admin/questions" allowedRoles={[ROLES.SUPER_ADMIN]} component={QuestionBank} />
      <RoleRoute path="/super-admin/workflow" allowedRoles={[ROLES.SUPER_ADMIN]} component={AssessmentWorkflow} />
      <RoleRoute path="/super-admin/analytics" allowedRoles={[ROLES.SUPER_ADMIN]} component={AnalyticsPage} />
      <RoleRoute path="/super-admin/ai-insights" allowedRoles={[ROLES.SUPER_ADMIN]} component={() => <SmartInsights />} />
      <RoleRoute path="/super-admin/skill-gap-reports" allowedRoles={[ROLES.SUPER_ADMIN]} component={SkillGapReports} />
      <RoleRoute path="/super-admin/results" allowedRoles={[ROLES.SUPER_ADMIN]} component={ResultsManager} />
      <RoleRoute path="/super-admin/result-management" allowedRoles={[ROLES.SUPER_ADMIN]} component={ResultManagement} />
      <RoleRoute path="/super-admin/hr-integration" allowedRoles={[ROLES.SUPER_ADMIN]} component={HRIntegrationPage} />
      <RoleRoute path="/super-admin/settings" allowedRoles={[ROLES.SUPER_ADMIN]} component={SystemSettingsPage} />
      <RoleRoute path="/super-admin/export" allowedRoles={[ROLES.SUPER_ADMIN]} component={ExportDataPage} />
      <RoleRoute path="/super-admin/email" allowedRoles={[ROLES.SUPER_ADMIN]} component={EmailManagement} />
      <RoleRoute path="/super-admin/tero" allowedRoles={[ROLES.SUPER_ADMIN]} component={TeroTestingPage} />
      <RoleRoute path="/super-admin/employee-groups" allowedRoles={[ROLES.SUPER_ADMIN]} component={EmployeeGroupsPage} />
      <RoleRoute path="/super-admin/projects" allowedRoles={[ROLES.SUPER_ADMIN]} component={ProjectsPage} />
      <RoleRoute path="/super-admin/projects/:projectId" allowedRoles={[ROLES.SUPER_ADMIN]} component={ProjectDetailPage} />
      <RoleRoute path="/super-admin/projects/:id/groups" allowedRoles={[ROLES.SUPER_ADMIN]} component={ProjectGroupsPage} />
      <RoleRoute path="/admin/projects/:projectId" allowedRoles={[ROLES.ADMIN]} component={ProjectDetailPage} />
      <RoleRoute path="/admin/projects/:id/groups" allowedRoles={[ROLES.ADMIN]} component={ProjectGroupsPage} />
      <RoleRoute path="/super-admin/companies" allowedRoles={[ROLES.SUPER_ADMIN]} component={CompanyManagement} />
      <RoleRoute path="/super-admin/departments" allowedRoles={[ROLES.SUPER_ADMIN]} component={DepartmentManagement} />
      <RoleRoute path="/super-admin/assign-tests" allowedRoles={[ROLES.SUPER_ADMIN]} component={TestAssignmentPage} />
      <RoleRoute path="/super-admin/batch-assignment" allowedRoles={[ROLES.SUPER_ADMIN]} component={TestBatchAssignment} />
      <RoleRoute path="/super-admin/activity-logs" allowedRoles={[ROLES.SUPER_ADMIN]} component={ActivityLogPage} />
      <RoleRoute path="/projects/:projectId/groups" allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} component={EmployeeGroupsPage} />

      {/* Admin Routes */}
      <RoleRoute path="/admin" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AdminDashboard} />
      <RoleRoute path="/admin/dashboard" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AdminDashboard} />
      <RoleRoute path="/admin/users" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={UserManagementPage} />
      <RoleRoute path="/admin/users/:userId/edit" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={EditUserPage} />
      <RoleRoute path="/admin/users/:userId/view" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ViewUserPage} />
      <RoleRoute path="/admin/add-user" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AddUserPage} />
      <RoleRoute path="/admin/tests" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TestManagement} />
      <RoleRoute path="/test-details" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TestDetails} />
      <RoleRoute path="/admin/questions" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={QuestionBank} />
      <RoleRoute path="/admin/workflow" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AssessmentWorkflow} />
      <RoleRoute path="/admin/analytics" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AnalyticsPage} />
      <RoleRoute path="/admin/ai-insights" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={() => <SmartInsights />} />
      <RoleRoute path="/admin/skill-gap-reports" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={SkillGapReports} />
      <RoleRoute path="/admin/skill-catalogue" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={SkillCatalogue} />
      <RoleRoute path="/admin/results" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ResultsManager} />
      <RoleRoute path="/admin/result-management" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ResultManagement} />
      <RoleRoute path="/admin/settings" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={SystemSettingsPage} />
      <RoleRoute path="/admin/tero" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TeroTestingPage} />
      <RoleRoute path="/admin/projects" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ProjectsPage} />
      <RoleRoute path="/admin/companies" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={CompanyManagement} />
      <RoleRoute path="/admin/departments" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={DepartmentManagement} />
      <RoleRoute path="/admin/assign-tests" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TestAssignmentPage} />
      <RoleRoute path="/admin/activity-logs" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ActivityLogPage} />

      {/* HR Manager Routes */}
      <RoleRoute path="/hr-manager" allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={HRIntegrationPage} />
      <RoleRoute path="/hr-manager/results" allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ResultsManager} />
      <RoleRoute path="/hr-manager/integration" allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={HRIntegrationPage} />
      <RoleRoute path="/hr-manager/reports" allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ReportsPage} />
      <RoleRoute path="/hr-manager/analytics" allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AnalyticsPage} />
      <RoleRoute path="/hr-manager/skill-catalogue" allowedRoles={[ROLES.HR_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={SkillCatalogue} />

      {/* Reviewer Routes */}
      <RoleRoute path="/reviewer" allowedRoles={[ROLES.REVIEWER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ReviewerDashboard} />
      <RoleRoute path="/reviewer/questions" allowedRoles={[ROLES.REVIEWER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={QuestionBank} />
      <RoleRoute path="/reviewer/ai-insights" allowedRoles={[ROLES.REVIEWER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={() => <SmartInsights />} />

      {/* Team Lead Routes */}
      <RoleRoute path="/team-lead" allowedRoles={[ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={HomePage} />
      <RoleRoute path="/team-lead/assignments" allowedRoles={[ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AssignmentsPage} />
      <RoleRoute path="/team-lead/results" allowedRoles={[ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ResultsPage} />
      <RoleRoute path="/team-lead/reports" allowedRoles={[ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ReportsPage} />

      {/* Employee Routes */}
      <RoleRoute path="/employee" allowedRoles={[ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={EmployeeDashboard} />
      <RoleRoute path="/employee-dashboard" allowedRoles={[ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={EmployeeDashboard} />
      <RoleRoute path="/employee/test/:testId" allowedRoles={[ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TestPage} />
      <RoleRoute path="/employee/assignments" allowedRoles={[ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={AssignmentsPage} />
      <RoleRoute path="/employee/results" allowedRoles={[ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ResultsPage} />
      <RoleRoute path="/employee/profile" allowedRoles={[ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ProfilePage} />

      {/* Candidate Routes */}
      <RoleRoute path="/candidate" allowedRoles={[ROLES.CANDIDATE]} component={CandidateDashboard} />
      <RoleRoute path="/candidate/test/:testId" allowedRoles={[ROLES.CANDIDATE]} component={TestPage} />
      <RoleRoute path="/candidate/assignments" allowedRoles={[ROLES.CANDIDATE]} component={AssignmentsPage} />
      <RoleRoute path="/candidate/results" allowedRoles={[ROLES.CANDIDATE]} component={ResultsPage} />

      {/* Shared Routes */}
      <RoleRoute path="/profile" allowedRoles={[ROLES.CANDIDATE, ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.HR_MANAGER, ROLES.REVIEWER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ProfilePage} />
      <RoleRoute path="/notifications" allowedRoles={[ROLES.CANDIDATE, ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.HR_MANAGER, ROLES.REVIEWER, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={NotificationsPage} />
      <RoleRoute path="/activity-logs" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={ActivityLogPage} />
      <RoleRoute path="/settings" allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={SettingsPage} />
      <RoleRoute path="/skill-catalogue" allowedRoles={[ROLES.HR_MANAGER, ROLES.REVIEWER, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={SkillCatalogue} />
      <RoleRoute path="/test/:testId" allowedRoles={[ROLES.CANDIDATE, ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={TestPage} />
      <RoleRoute path="/reports/test-result/:resultId" allowedRoles={[ROLES.HR_MANAGER, ROLES.TEAM_LEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]} component={CandidateReportPage} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <AppFooter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
