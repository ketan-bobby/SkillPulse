import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed Dialog imports - using custom modal instead
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  UserCheck,
  UserX,
  Crown,
  Shield,
  User,
  Building,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Award
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [, setLocation] = useLocation();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSubCompany, setSelectedSubCompany] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  }) as { data: any[] };

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  }) as { data: any[] };





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
    
    // Debug logging
    if (filterRole !== "all") {
      console.log(`Filtering by role: ${filterRole}, user role: ${user.role}, matches: ${matchesRole}, searchTerm: ${searchTerm}, matchesSearch: ${matchesSearch}`);
    }
    
    const finalMatch = matchesSearch && matchesRole;
    
    if (filterRole !== "all") {
      console.log(`Final match result: ${finalMatch} (search: ${matchesSearch}, role: ${matchesRole})`);
    }
    
    return finalMatch;
  });

  // Debug logging for total filtered results
  console.log(`Total users: ${users.length}, Filtered users: ${filteredUsers.length}, Filter role: ${filterRole}, Search term: ${searchTerm}`);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin": return <Crown className="h-4 w-4 text-purple-600" />;
      case "admin": return <Shield className="h-4 w-4 text-red-600" />;
      case "hr_manager": return <Users className="h-4 w-4 text-blue-600" />;
      case "reviewer": return <UserCheck className="h-4 w-4 text-indigo-600" />;
      case "team_lead": return <UserCheck className="h-4 w-4 text-teal-600" />;
      case "employee": return <User className="h-4 w-4 text-green-600" />;
      case "candidate": return <UserX className="h-4 w-4 text-gray-800" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin": return "outline" as const;
      case "admin": return "destructive" as const;
      case "hr_manager": return "default" as const;
      case "reviewer": return "secondary" as const;
      case "team_lead": return "secondary" as const;
      case "employee": return "secondary" as const;
      case "candidate": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <RoleGuard allowedRoles={["super_admin", "admin", "hr_manager"]}>
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Manage platform users, roles, and permissions across your organization
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{users.length}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="h-12 w-px bg-border mx-4" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{companies?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Companies</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users, companies, departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
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
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLocation("/super-admin/add-user");
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


                <div 
                  className="modal-overlay"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 999999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setIsCreateDialogOpen(false);
                  }}
                >
                  <div 
                    className="modal-content"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '32px',
                      maxWidth: '900px',
                      maxHeight: '95vh',
                      overflowY: 'auto',
                      width: '100%',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      border: '1px solid #e5e7eb'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937' }}>
                        <Building style={{ width: '24px', height: '24px' }} />
                        Create New User
                      </h2>
                      <button 
                        onClick={() => setIsCreateDialogOpen(false)}
                        style={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '18px',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          color: '#374151',
                          fontWeight: 'bold'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        ✕
                      </button>
                    </div>
                <form onSubmit={handleCreateUser} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" name="name" required placeholder="John Doe" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" required placeholder="john.doe@company.com" />
                      </div>
                      <div>
                        <Label htmlFor="username">Username *</Label>
                        <Input id="username" name="username" required placeholder="john.doe" />
                      </div>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input id="password" name="password" type="password" required placeholder="Enter secure password" />
                      </div>
                      <div>
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input id="employeeId" name="employeeId" placeholder="EMP001" />
                      </div>
                      <div>
                        <Label htmlFor="role">Platform Role *</Label>
                        <Select name="role" required onValueChange={setSelectedRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="candidate">Candidate (External)</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="team_lead">Team Lead</SelectItem>
                            <SelectItem value="reviewer">Technical Reviewer</SelectItem>
                            <SelectItem value="hr_manager">HR Manager</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="super_admin">Super Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Company & Department Assignment - Show for internal roles */}
                  {selectedRole && !["candidate"].includes(selectedRole) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      Company & Department Assignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="company">Company *</Label>
                        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company: any) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={!selectedCompany}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept: any) => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subCompany">Sub-Company (Optional)</Label>
                        <Select value={selectedSubCompany} onValueChange={setSelectedSubCompany} disabled={!selectedCompany}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub-company" />
                          </SelectTrigger>
                          <SelectContent>
                            {subCompanies.map((subCo: any) => (
                              <SelectItem key={subCo.id} value={subCo.id.toString()}>
                                {subCo.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Employment Details - Show for internal employee roles */}
                  {selectedRole && ["employee", "team_lead", "reviewer", "hr_manager"].includes(selectedRole) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      Employment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="department">Legacy Department</Label>
                        <Select name="department">
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="qa">Quality Assurance</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                            <SelectItem value="data">Data Science</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="hr">Human Resources</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="position">Position Level</Label>
                        <Select name="position">
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="intern">Intern</SelectItem>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid-level</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="principal">Principal</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="domain">Technical Domain</Label>
                        <Select name="domain">
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frontend">Frontend Development</SelectItem>
                            <SelectItem value="backend">Backend Development</SelectItem>
                            <SelectItem value="full-stack">Full Stack Development</SelectItem>
                            <SelectItem value="mobile">Mobile Development</SelectItem>
                            <SelectItem value="devops">DevOps Engineering</SelectItem>
                            <SelectItem value="cloud">Cloud Engineering</SelectItem>
                            <SelectItem value="data-science">Data Science</SelectItem>
                            <SelectItem value="ai-ml">AI/ML Engineering</SelectItem>
                            <SelectItem value="security">Cybersecurity</SelectItem>
                            <SelectItem value="databases">Database Engineering</SelectItem>
                            <SelectItem value="networking">Network Engineering</SelectItem>
                            <SelectItem value="qa">Quality Assurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="workType">Work Type</Label>
                        <Select name="workType">
                          <SelectTrigger>
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="intern">Internship</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="San Francisco, CA" />
                      </div>
                      <div>
                        <Label htmlFor="hireDate">Hire Date</Label>
                        <Input id="hireDate" name="hireDate" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input id="experience" name="experience" type="number" min="0" max="50" placeholder="5" />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Skills & Qualifications - Only show for technical roles */}
                  {selectedRole && ["employee", "team_lead", "reviewer"].includes(selectedRole) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      Skills & Qualifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="skills">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4" />
                            <span>Technical Skills</span>
                          </div>
                        </Label>
                        <Textarea 
                          id="skills" 
                          name="skills" 
                          placeholder="JavaScript, React, Node.js, Python, AWS (comma-separated)"
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate skills with commas
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="certifications">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4" />
                            <span>Certifications</span>
                          </div>
                        </Label>
                        <Textarea 
                          id="certifications" 
                          name="certifications" 
                          placeholder="AWS Solutions Architect, Google Cloud Professional, Certified Kubernetes Administrator (comma-separated)"
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate certifications with commas
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button 
                      type="button" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        color: '#374151',
                        fontWeight: '500',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={createUserMutation.isPending}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        color: '#374151',
                        fontWeight: '600',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: createUserMutation.isPending ? 'not-allowed' : 'pointer',
                        opacity: createUserMutation.isPending ? 0.6 : 1,
                        fontSize: '16px'
                      }}
                      onMouseEnter={(e) => !createUserMutation.isPending && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                      onMouseLeave={(e) => !createUserMutation.isPending && (e.currentTarget.style.backgroundColor = 'white')}
                    >
                      {createUserMutation.isPending ? "Creating..." : 
                       selectedRole === "super_admin" || selectedRole === "admin" ? "Create Administrator" :
                       selectedRole === "hr_manager" ? "Create HR Manager" :
                       selectedRole === "reviewer" ? "Create Reviewer" :
                       selectedRole === "candidate" ? "Create Candidate" :
                       "Create User"}
                    </button>
                  </div>
                </form>
                  </div>
                </div>

            </div>
          </div>

          {/* Users Table */}
          <Card className="mt-8 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-600" />
                  <span className="text-xl">
                    {filterRole !== "all" ? `${filterRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Users` : "All Users"} ({filteredUsers.length})
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
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found matching the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                          {getRoleIcon(user.role)}
                          <div>
                            <div className="font-medium">{user.name || user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.position && `${user.position}`}
                              {user.domain && ` • ${user.domain}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm font-medium">
                            {user.employeeId || 
                              <span className="text-muted-foreground italic">Not assigned</span>
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{user.email || "No email"}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{user.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{user.company || "Not assigned"}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.department || "No department"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={user.role} 
                            onValueChange={(role) => updateUserRoleMutation.mutate({ userId: user.id, role })}
                          >
                            <SelectTrigger className="w-32 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="candidate">Candidate</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="team_lead">Team Lead</SelectItem>
                              <SelectItem value="reviewer">Technical Reviewer</SelectItem>
                              <SelectItem value="hr_manager">HR Manager</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="super_admin">Super Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={user.id === 1} // Don't allow deleting the main admin
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors h-9 px-3"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Companies Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground flex items-center">
                <Building className="h-6 w-6 mr-3 text-blue-600" />
                Companies ({companies?.length || 0})
              </h3>
              <div className="flex items-center gap-2">
                {(searchTerm || filterRole !== "all") && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterRole("all");
                      toast({
                        title: "All Filters Cleared",
                        description: "Showing all users",
                      });
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
                <div className="text-sm text-muted-foreground">
                  Click cards to filter users
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {companies?.map((company: any, index: number) => {
                const employeeCount = users.filter((u: any) => u.company === company.name).length;
                const gradients = [
                  "from-blue-500 to-blue-600",
                  "from-purple-500 to-purple-600", 
                  "from-green-500 to-green-600",
                  "from-orange-500 to-orange-600",
                  "from-teal-500 to-teal-600",
                  "from-pink-500 to-pink-600"
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <Card 
                    key={company.id} 
                    className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-border/50 hover:border-blue-200 dark:hover:border-blue-800 overflow-hidden bg-card/50 backdrop-blur-sm"
                    onClick={() => {
                      setSearchTerm(company.name);
                      toast({
                        title: "Filtered by Company",
                        description: `Showing users from ${company.name}`,
                      });
                    }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                              <Building className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-lg group-hover:text-blue-600 transition-colors">
                                {company.name}
                              </h4>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {company.code}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Employees</span>
                              <span className="text-2xl font-bold text-foreground">
                                {employeeCount}
                              </span>
                            </div>
                            
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                                style={{ 
                                  width: employeeCount > 0 ? `${Math.min((employeeCount / 10) * 100, 100)}%` : '5%'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-muted">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>Click to view all employees</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Role Statistics Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                User Roles ({users.length} total)
              </h3>
              <div className="text-sm text-muted-foreground">
                Distribution by role type
              </div>
            </div>

            {/* Primary Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                { role: "super_admin", label: "Super Admins", icon: Crown, color: "purple", gradient: "from-purple-500 to-purple-600" },
                { role: "admin", label: "Administrators", icon: Shield, color: "red", gradient: "from-red-500 to-red-600" },
                { role: "hr_manager", label: "HR Managers", icon: Users, color: "blue", gradient: "from-blue-500 to-blue-600" },
                { role: "reviewer", label: "Reviewers", icon: UserCheck, color: "indigo", gradient: "from-indigo-500 to-indigo-600" }
              ].map(({ role, label, icon: Icon, color, gradient }) => {
                const count = users.filter((u: any) => u.role === role).length;
                return (
                  <Card 
                    key={role}
                    className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-border/50 hover:border-blue-200 dark:hover:border-blue-800 overflow-hidden bg-card/50 backdrop-blur-sm"
                    onClick={() => {
                      setFilterRole(role);
                      toast({
                        title: "Filtered by Role",
                        description: `Showing ${label.toLowerCase()}`,
                      });
                    }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
                            <Icon className={`h-6 w-6 text-${color}-600`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <p className="text-3xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                              {count}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-muted">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                            style={{ 
                              width: users.length > 0 ? `${Math.min((count / users.length) * 100, 100)}%` : '0%'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {users.length > 0 ? `${Math.round((count / users.length) * 100)}%` : '0%'} of total
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Click to filter
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Secondary Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { role: "team_lead", label: "Team Leads", icon: UserCheck, color: "teal", gradient: "from-teal-500 to-teal-600" },
                { role: "employee", label: "Employees", icon: User, color: "green", gradient: "from-green-500 to-green-600" },
                { role: "candidate", label: "Candidates", icon: UserX, color: "gray", gradient: "from-gray-500 to-gray-600" }
              ].map(({ role, label, icon: Icon, color, gradient }) => {
                const count = users.filter((u: any) => u.role === role).length;
                return (
                  <Card 
                    key={role}
                    className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-border/50 hover:border-blue-200 dark:hover:border-blue-800 overflow-hidden bg-card/50 backdrop-blur-sm"
                    onClick={() => {
                      setFilterRole(role);
                      toast({
                        title: "Filtered by Role",
                        description: `Showing ${label.toLowerCase()}`,
                      });
                    }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
                            <Icon className={`h-6 w-6 text-${color}-600`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <p className="text-3xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                              {count}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-muted">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                            style={{ 
                              width: users.length > 0 ? `${Math.min((count / users.length) * 100, 100)}%` : '0%'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {users.length > 0 ? `${Math.round((count / users.length) * 100)}%` : '0%'} of total
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Click to filter
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}