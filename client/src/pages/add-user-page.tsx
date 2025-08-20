import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { useLocation } from "wouter";
import { 
  ArrowLeft,
  Building,
  User,
  Mail,
  Lock,
  IdCard,
  Calendar,
  MapPin,
  Briefcase,
  Award
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AddUserPage() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies for the dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Fetch potential managers (users who can be reporting managers)
  const { data: potentialManagers = [] } = useQuery({
    queryKey: ["/api/users"],
    select: (users: any[]) => users.filter(user => 
      ["admin", "super_admin", "hr_manager", "team_lead"].includes(user.role)
    ),
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      // Navigate back to user management - check current path and redirect appropriately
      if (window.location.pathname.includes('/super-admin/')) {
        setLocation("/super-admin/users");
      } else {
        setLocation("/admin/users");
      }
    },
    onError: (error: any) => {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Parse skills and certifications arrays
    const skills = formData.get("skills")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [];
    const certifications = formData.get("certifications")?.toString().split(",").map(s => s.trim()).filter(Boolean) || [];
    
    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      role: selectedRole,
      employeeId: formData.get("employeeId") as string,
      phone: formData.get("phone") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      location: formData.get("location") as string,
      hireDate: formData.get("hireDate") as string,
      workType: formData.get("workType") as string,
      experience: formData.get("experience") ? parseInt(formData.get("experience") as string) : null,
      reportingManagerId: formData.get("reportingManagerId") ? parseInt(formData.get("reportingManagerId") as string) : null,
      skills,
      certifications,
      companyId: selectedCompany ? parseInt(selectedCompany) : null,
    };

    createUserMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto p-6">
        <RoleGuard allowedRoles={["super_admin", "admin", "hr_manager"]}>
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => {
                if (window.location.pathname.includes('/super-admin/')) {
                  setLocation("/super-admin/users");
                } else {
                  setLocation("/admin/users");
                }
              }}
              style={{
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                border: '1px solid #e5e7eb',
                marginRight: '16px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Users
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
              <p className="text-gray-600 mt-2">Add a new user to the platform with appropriate role and permissions</p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-6 w-6" />
                <span>User Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleCreateUser} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                    <User className="h-5 w-5" />
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
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>

                {/* Role & Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Role & Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div>
                      <Label htmlFor="company">Company</Label>
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
                      <Input id="department" name="department" placeholder="Engineering" />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" name="position" placeholder="Senior Software Engineer" />
                    </div>
                    <div>
                      <Label htmlFor="hireDate">Date of Joining</Label>
                      <Input id="hireDate" name="hireDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" placeholder="San Francisco, CA" />
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
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input id="experience" name="experience" type="number" placeholder="5" min="0" max="50" />
                    </div>
                  </div>
                </div>

                {/* Reporting Structure */}
                {selectedRole !== "super_admin" && selectedRole !== "candidate" && selectedRole && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Reporting Structure
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="reportingManagerId">Reporting Manager</Label>
                        <Select name="reportingManagerId">
                          <SelectTrigger>
                            <SelectValue placeholder="Select reporting manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Manager</SelectItem>
                            {potentialManagers
                              .filter((manager: any) => {
                                // Logical hierarchy: Employees report to Team Leads, Team Leads to Admins/HR, etc.
                                if (selectedRole === "employee") {
                                  return ["team_lead", "admin", "hr_manager", "super_admin"].includes(manager.role);
                                }
                                if (selectedRole === "team_lead") {
                                  return ["admin", "hr_manager", "super_admin"].includes(manager.role);
                                }
                                if (selectedRole === "reviewer") {
                                  return ["admin", "super_admin"].includes(manager.role);
                                }
                                if (selectedRole === "hr_manager") {
                                  return ["admin", "super_admin"].includes(manager.role);
                                }
                                if (selectedRole === "admin") {
                                  return ["super_admin"].includes(manager.role);
                                }
                                return false;
                              })
                              .map((manager: any) => (
                                <SelectItem key={manager.id} value={manager.id.toString()}>
                                  {manager.name} ({manager.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}) - {manager.employeeId || 'No ID'}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedRole === "employee" && "Employees typically report to Team Leads or higher"}
                          {selectedRole === "team_lead" && "Team Leads typically report to Admins or HR Managers"}
                          {selectedRole === "reviewer" && "Reviewers typically report to Admins"}
                          {selectedRole === "hr_manager" && "HR Managers typically report to Admins or Super Admins"}
                          {selectedRole === "admin" && "Admins typically report to Super Admins"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills & Additional Information */}
                {(selectedRole === "employee" || selectedRole === "team_lead" || selectedRole === "reviewer") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Additional Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="skills">Technical Skills</Label>
                      <Textarea 
                        id="skills" 
                        name="skills" 
                        placeholder="JavaScript, React, Node.js, Python, SQL..."
                        className="min-h-[80px]"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Separate skills with commas
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="certifications">Certifications</Label>
                      <Textarea 
                        id="certifications" 
                        name="certifications" 
                        placeholder="AWS Certified Solutions Architect, Google Cloud Professional..."
                        className="min-h-[80px]"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Separate certifications with commas
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio/Summary</Label>
                      <Textarea 
                        id="bio" 
                        name="bio" 
                        placeholder="Brief professional summary..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button 
                    type="button" 
                    onClick={() => setLocation("/super-admin/users")}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      fontWeight: '500',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </div>
  );
}