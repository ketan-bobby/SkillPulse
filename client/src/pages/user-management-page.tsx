import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Users, Search, Filter, Download, Eye, Edit2, Trash2, UserCheck, Shield, Building, Crown, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/hooks/use-auth";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  
  // Handle URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    
    if (filter === 'active') {
      setFilterStatus('active');
    } else if (filter === 'inactive') {
      setFilterStatus('inactive');
    }
  }, []);

  // Fetch users data
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch companies for filtering
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Fetch departments for filtering
  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Role",
        description: error.message || "An error occurred while updating the role.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete User",
        description: error.message || "An error occurred while deleting the user.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/password`, { password: newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "Password has been reset successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Reset Password",
        description: error.message || "An error occurred while resetting the password.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    // Status filtering - assume users are active by default unless explicitly inactive
    const isActive = user.isActive !== false && user.status !== 'inactive';
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && isActive) ||
      (filterStatus === "inactive" && !isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Debug logging for total filtered results
  console.log(`Total users: ${users.length}, Filtered users: ${filteredUsers.length}, Filter role: ${filterRole}, Search term: ${searchTerm}`);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "hr_manager":
        return <Building className="h-4 w-4 text-purple-600" />;
      case "reviewer":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case "team_lead":
        return <Users className="h-4 w-4 text-green-600" />;
      case "employee":
        return <Users className="h-4 w-4 text-gray-600" />;
      case "candidate":
        return <Eye className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "admin":
        return "bg-red-50 text-red-800 border-red-200";
      case "hr_manager":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "reviewer":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "team_lead":
        return "bg-green-50 text-green-800 border-green-200";
      case "employee":
        return "bg-gray-50 text-gray-800 border-gray-200";
      case "candidate":
        return "bg-orange-50 text-orange-800 border-orange-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const formatRoleName = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                User Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage user accounts, roles, and permissions across your organization
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const basePath = currentUser?.role === 'super_admin' ? '/super-admin' : '/admin';
                  setLocation(`${basePath}/add-user`);
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Add User
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <Card className="mt-6 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, username, employee ID, company, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[200px] bg-white border-gray-200">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">Super Administrator</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="hr_manager">HR Manager</SelectItem>
                      <SelectItem value="reviewer">Technical Reviewer</SelectItem>
                      <SelectItem value="team_lead">Team Lead</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="candidate">Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px] bg-white border-gray-200">
                      <UserCheck className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="inactive">Inactive Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-3 text-gray-600" />
                <span className="text-xl">
                  {(() => {
                    let title = "All Users";
                    if (filterStatus !== "all" && filterRole !== "all") {
                      title = `${filterStatus === "active" ? "Active" : "Inactive"} ${filterRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Users`;
                    } else if (filterStatus !== "all") {
                      title = `${filterStatus === "active" ? "Active" : "Inactive"} Users`;
                    } else if (filterRole !== "all") {
                      title = `${filterRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Users`;
                    }
                    return `${title} (${filteredUsers.length})`;
                  })()}
                </span>
              </div>
              {filteredUsers.length !== users.length && (
                <Badge variant="secondary" className="text-sm">
                  Filtered from {users.length} total
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company & Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {user.employeeId || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{user.email || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{user.phone || 'No phone'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{user.company || 'No company'}</div>
                        <div className="text-xs text-muted-foreground">{user.department || 'No department'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.role)} font-medium flex items-center gap-1 w-fit`}>
                        {getRoleIcon(user.role)}
                        {formatRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            // Navigate to user profile/view page - use current user's role path
                            const basePath = currentUser?.role === 'super_admin' ? '/super-admin' : '/admin';
                            setLocation(`${basePath}/users/${user.id}/view`);
                          }}
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#374151'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Navigate to edit user page - use current user's role path
                            const basePath = currentUser?.role === 'super_admin' ? '/super-admin' : '/admin';
                            setLocation(`${basePath}/users/${user.id}/edit`);
                          }}
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#374151'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Prompt for new password
                            const newPassword = window.prompt(
                              `Reset password for "${user.name || user.username}"?\n\nEnter new password:`,
                              'password123'
                            );
                            if (newPassword && newPassword.trim()) {
                              resetPasswordMutation.mutate({ 
                                userId: user.id, 
                                newPassword: newPassword.trim() 
                              });
                            }
                          }}
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#059669'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Confirm before deleting
                            if (window.confirm(`Are you sure you want to delete user "${user.name || user.username}"? This action cannot be undone.`)) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterRole !== "all" 
                ? "Try adjusting your search criteria or filters."
                : "Get started by creating your first user."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}