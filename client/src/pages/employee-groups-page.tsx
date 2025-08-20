import { useState } from "react";
import { useParams } from "wouter";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, UserPlus, Settings, Calendar, TestTube, Trash2, Edit3, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ROLES } from "@shared/roles";
import { apiRequest } from "@/lib/queryClient";

const DOMAINS = ["programming", "frontend", "backend", "devops", "cloud", "mobile", "data-science", "ai-ml", "security", "databases", "networking"];
const LEVELS = ["junior", "mid", "senior", "lead", "principal"];

export default function EmployeeGroupsPage() {
  const params = useParams();
  const projectId = params.projectId;
  const [activeTab, setActiveTab] = useState("groups");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isAssignTestOpen, setIsAssignTestOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: groups = [] } = useQuery<any[]>({
    queryKey: ["/api/employee-groups"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: tests = [] } = useQuery<any[]>({
    queryKey: ["/api/tests"],
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch project details if accessed via project route
  const { data: project } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  // Mutations
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      const res = await apiRequest("POST", "/api/employee-groups", groupData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-groups"] });
      setIsCreateGroupOpen(false);
      toast({
        title: "Success",
        description: "Employee group created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create employee group",
        variant: "destructive",
      });
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: async ({ groupId, userIds }: { groupId: number; userIds: number[] }) => {
      const res = await apiRequest("POST", `/api/employee-groups/${groupId}/members`, { userIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-groups"] });
      setIsManageMembersOpen(false);
      setSelectedEmployees([]);
      toast({
        title: "Success",
        description: "Members added to group successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add members to group",
        variant: "destructive",
      });
    },
  });

  const assignTestToGroupMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await apiRequest("POST", "/api/group-test-assignments", assignmentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-test-assignments"] });
      setIsAssignTestOpen(false);
      setSelectedTestId("");
      toast({
        title: "Success",
        description: "Test assigned to group successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign test to group",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      return apiRequest("DELETE", `/api/employee-groups/${groupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-groups"] });
      toast({
        title: "Success",
        description: "Employee group deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete employee group",
        variant: "destructive",
      });
    },
  });

  const employees = users.filter((user: any) => 
    user.role === ROLES.EMPLOYEE || user.role === 'employee'
  );

  const handleCreateGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const groupData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      companyId: parseInt(formData.get('companyId') as string) || null,
      departmentId: parseInt(formData.get('departmentId') as string) || null,
      domain: formData.get('domain') as string || null,
      level: formData.get('level') as string || null,
    };

    console.log("Creating group with data:", groupData);
    createGroupMutation.mutate(groupData);
  };

  const handleAddMembers = () => {
    if (!selectedGroup || selectedEmployees.length === 0) {
      toast({
        title: "Error",
        description: "Please select employees to add",
        variant: "destructive",
      });
      return;
    }

    addMembersMutation.mutate({
      groupId: selectedGroup.id,
      userIds: selectedEmployees,
    });
  };

  const handleAssignTest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedGroup || !selectedTestId) {
      toast({
        title: "Error",
        description: "Please select a test to assign",
        variant: "destructive",
      });
      return;
    }

    const assignmentData = {
      groupId: selectedGroup.id,
      testId: parseInt(selectedTestId),
      dueDate: formData.get('dueDate') as string || null,
      timeLimit: parseInt(formData.get('timeLimit') as string) || null,
      maxAttempts: parseInt(formData.get('maxAttempts') as string) || 1,
    };

    assignTestToGroupMutation.mutate(assignmentData);
  };

  const getGroupStats = (group: any) => {
    const memberCount = group.members?.length || 0;
    const testCount = group.testAssignments?.length || 0;
    return { memberCount, testCount };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER]}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              {projectId && project 
                ? `Groups - ${(project as any).name}` 
                : "Employee Groups"
              }
            </h1>
            <p className="text-black text-base">
              {projectId && project 
                ? `Create groups based on project requirements, then assign relevant tests to assess needed skills`
                : "Create groups by company, department, domain, and skill level - then assign targeted tests"
              }
            </p>
            
            {/* Workflow Guide */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-black mb-2">Logical Workflow:</h3>
              <div className="flex items-center gap-4 text-sm text-black">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Create groups by criteria</span>
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Assign employees to groups</span>
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Assign tests to groups</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="groups">Manage Groups</TabsTrigger>
              <TabsTrigger value="assignments">Group Assignments</TabsTrigger>
              <TabsTrigger value="analytics">Group Analytics</TabsTrigger>
            </TabsList>

            {/* Manage Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">Employee Groups</h2>
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => {
                        console.log("Create Group button clicked");
                        setIsCreateGroupOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" aria-describedby="create-group-description">
                    <DialogHeader>
                      <DialogTitle>Create Employee Group</DialogTitle>
                    </DialogHeader>
                    <div id="create-group-description" className="sr-only">
                      Create a new employee group to organize team members by skills, department, or project needs.
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <strong>Purpose:</strong> Groups help you organize employees based on their skills, department, or project needs. After creating a group, you can assign employees and then create targeted tests for that specific group.
                      </p>
                    </div>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Group Name</Label>
                          <Input id="name" name="name" placeholder="e.g., Senior Frontend Engineers, Junior Data Scientists" required />
                          <p className="text-xs text-gray-500 mt-1">Choose a name that reflects the role and skill level</p>
                        </div>
                        <div>
                          <Label htmlFor="companyId">Company</Label>
                          <Select name="companyId">
                            <SelectTrigger>
                              <SelectValue placeholder="Select company (optional)" />
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
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="departmentId">Department</Label>
                          <Select name="departmentId">
                            <SelectTrigger>
                              <SelectValue placeholder="Select department (optional)" />
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
                          <Label htmlFor="domain">Technical Domain</Label>
                          <Select name="domain">
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {DOMAINS.map(domain => (
                                <SelectItem key={domain} value={domain}>
                                  {domain.charAt(0).toUpperCase() + domain.slice(1).replace('-', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="level">Skill Level</Label>
                        <Select name="level">
                          <SelectTrigger>
                            <SelectValue placeholder="Select level (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map(level => (
                              <SelectItem key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="description">Description & Assessment Focus</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          placeholder="e.g., 'React developers working on customer-facing applications. Will be tested on React hooks, state management, and API integration.'"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">Describe what skills this group should be assessed for</p>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateGroupOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createGroupMutation.isPending}>
                          {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group: any) => {
                  const { memberCount, testCount } = getGroupStats(group);
                  return (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            {group.name}
                          </span>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsManageMembersOpen(true);
                              }}
                              title="Edit Group"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deleteGroupMutation.mutate(group.id)}
                              title="Delete Group"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {group.description && (
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {group.domain && (
                            <Badge variant="secondary">{group.domain}</Badge>
                          )}
                          {group.level && (
                            <Badge variant="outline">{group.level}</Badge>
                          )}
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {memberCount} member{memberCount !== 1 ? 's' : ''}
                          </span>
                          <span className="text-muted-foreground">
                            {testCount} test{testCount !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedGroup(group);
                              setIsManageMembersOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Members
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedGroup(group);
                              setIsAssignTestOpen(true);
                            }}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Assign Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Group Assignments Tab */}
            <TabsContent value="assignments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Test Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black">
                    View and manage test assignments for employee groups
                  </p>
                  {/* Assignment management interface will be implemented here */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Group Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black">
                    Analyze performance metrics across employee groups
                  </p>
                  {/* Analytics interface will be implemented here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Manage Members Dialog */}
          <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  Manage Members - {selectedGroup?.name}
                </DialogTitle>
                <DialogDescription>
                  Select employees to add to this group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {employees.map((employee: any) => (
                    <div key={employee.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees([...selectedEmployees, employee.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                        <div className="flex gap-2 mt-1">
                          {employee.domain && (
                            <Badge variant="secondary" className="text-xs">{employee.domain}</Badge>
                          )}
                          {employee.position && (
                            <Badge variant="outline" className="text-xs">{employee.position}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsManageMembersOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddMembers}
                    disabled={selectedEmployees.length === 0 || addMembersMutation.isPending}
                  >
                    {addMembersMutation.isPending ? "Adding..." : `Add ${selectedEmployees.length} Member${selectedEmployees.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assign Test Dialog */}
          <Dialog open={isAssignTestOpen} onOpenChange={setIsAssignTestOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Assign Test to {selectedGroup?.name}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignTest} className="space-y-4">
                <div>
                  <Label htmlFor="testId">Select Test</Label>
                  <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a test" />
                    </SelectTrigger>
                    <SelectContent>
                      {tests.map((test: any) => (
                        <SelectItem key={test.id} value={test.id.toString()}>
                          {test.title} ({test.domain} - {test.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      name="dueDate" 
                      type="datetime-local"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input 
                      id="timeLimit" 
                      name="timeLimit" 
                      type="number" 
                      placeholder="Override test default"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input 
                    id="maxAttempts" 
                    name="maxAttempts" 
                    type="number" 
                    defaultValue="1"
                    min="1"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAssignTestOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!selectedTestId || assignTestToGroupMutation.isPending}
                  >
                    {assignTestToGroupMutation.isPending ? "Assigning..." : "Assign Test"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>
    </div>
  );
}