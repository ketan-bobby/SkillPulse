import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TestTube, FileText, Settings, Plus, Eye, Edit, Shield, BarChart3, Brain, Workflow, Database, Download, Mail, FolderKanban, Building2, Building, UserCheck, Activity, BookOpen, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@shared/roles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const { data: allResults = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const getRoleBasedPath = (path: string) => {
    if (user?.role === ROLES.SUPER_ADMIN) {
      return `/super-admin${path}`;
    } else if (user?.role === ROLES.ADMIN) {
      return `/admin${path}`;
    }
    return path;
  };

  const handleCreateTest = () => {
    setLocation(getRoleBasedPath("/tests"));
  };

  const handleManageUsers = () => {
    setLocation(getRoleBasedPath("/users"));
  };

  const handleSystemSettings = () => {
    setLocation(getRoleBasedPath("/settings"));
  };

  const handleExportData = () => {
    setLocation(getRoleBasedPath("/export"));
  };

  const handleEditTest = (testId: number) => {
    // Navigate to test management page where edit functionality is available
    setLocation(getRoleBasedPath("/tests"));
  };

  const handleViewTest = (testId: number) => {
    setLocation(`/test/${testId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
              </h1>
              <p className="text-base text-gray-600 max-w-3xl">
                {isSuperAdmin
                  ? "Complete platform control with advanced AI insights, system configuration, and enterprise-grade management features"
                  : "Streamlined platform management with intelligent tools for users, assessments, and system configuration"}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Common Admin Actions */}
              <div
                className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                onClick={handleCreateTest}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Create Test</span>
              </div>
              <div
                className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(getRoleBasedPath("/assign-tests"))}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-gray-700 font-medium">Assign Tests</span>
              </div>
              <div
                className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                onClick={handleManageUsers}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Manage Users</span>
              </div>
              <div
                className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                onClick={handleSystemSettings}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">System Settings</span>
              </div>
              <div
                className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                onClick={handleExportData}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Download className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-gray-700 font-medium">Export Data</span>
              </div>
              <div
                className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(getRoleBasedPath("/skill-gap-reports"))}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-rose-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-rose-600" />
                </div>
                <span className="text-gray-700 font-medium">Skill Gap Reports</span>
              </div>
            </div>
          </div>

          {/* Super Admin Only Actions */}
          {isSuperAdmin && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Super Admin Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/workflow"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Workflow className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Assessment Workflow</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/questions"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-cyan-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Question Bank</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/ai-insights"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Smart Insights</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/results"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Results Manager</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/email"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-sky-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Email Management</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/employee-groups"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Employee Groups</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/projects"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-violet-100 rounded-lg flex items-center justify-center">
                    <FolderKanban className="h-6 w-6 text-violet-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Projects</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/companies"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-teal-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Companies</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/departments"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Departments</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/activity-logs"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Activity Logs</span>
                </div>
                <div
                  className="card-professional p-6 text-center cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(getRoleBasedPath("/skill-catalogue"))}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-slate-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Skill Catalogue</span>
                </div>
              </div>
            </div>
          )}

          {/* Platform Overview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div
                className="card-professional p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(getRoleBasedPath("/tests?view=all"))}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TestTube className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <p className="text-2xl font-semibold text-gray-900">{(tests as any[]).length}</p>
                  </div>
                </div>
              </div>

              <div
                className="card-professional p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(getRoleBasedPath("/users?filter=active"))}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{new Set((allResults as any[]).map((r: any) => r.userId)).size}</p>
                  </div>
                </div>
              </div>

              <div
                className="card-professional p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(getRoleBasedPath("/results"))}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assessments</p>
                    <p className="text-2xl font-semibold text-gray-900">{(allResults as any[]).length}</p>
                  </div>
                </div>
              </div>

              <div
                className="card-professional p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(getRoleBasedPath("/settings"))}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">System Health</p>
                    <p className="text-2xl font-semibold text-green-600">98%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-professional p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TestTube className="h-5 w-5 mr-2 text-blue-600" />
                Recent Tests
              </h3>
              <div className="space-y-3">
                {(tests as any[]).slice(0, 3).map((test: any) => (
                  <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">{test.title}</h4>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{test.domain}</Badge>
                      <div
                        className="px-3 py-1 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-400 flex items-center text-sm"
                        onClick={() => handleViewTest(test.id)}
                      >
                        <Eye style={{ width: '16px', height: '16px', color: '#1f2937' }} className="mr-2" />
                        View
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 hover-lift">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {(allResults as any[]).length > 0 ? (
                  (allResults as any[]).slice(0, 5).map((result: any, index: number) => {
                    // Find the user for this result
                    const user = (users as any[]).find((u: any) => u.id === result.userId);
                    const username = user ? (user.firstName && user.lastName ? 
                      `${user.firstName} ${user.lastName}` : user.username) : `User ${result.userId}`;
                    
                    return (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">
                            Test completed by {username} with score {result.score}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(result.completedAt).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </RoleGuard>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              To create and manage users with full functionality, please navigate to the User Management page.
            </p>
            <Button
              onClick={() => {
                setIsCreateDialogOpen(false);
                setLocation(getRoleBasedPath("/users"));
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to User Management
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}