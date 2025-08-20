import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AppHeader } from "@/components/app-header";
import { 
  Plus, 
  Users, 
  Send, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileText,
  UserCheck,
  TrendingUp,
  UsersIcon,
  User,
  Calendar,
  Target,
  Activity
} from "lucide-react";

export default function AssessmentWorkflow() {
  const [activeStep, setActiveStep] = useState("assign");
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [assignmentType, setAssignmentType] = useState<"individual" | "group">("individual");
  const [statusMessage, setStatusMessage] = useState("");
  const [candidateSearchTerm, setCandidateSearchTerm] = useState("");
  const [candidateDepartmentFilter, setCandidateDepartmentFilter] = useState("all");
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupDomainFilter, setGroupDomainFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch data
  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["/api/employee-groups"],
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const { data: results = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
  });

  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const res = await apiRequest("POST", "/api/tests", testData);
      return res.json();
    },
    onSuccess: () => {
      setStatusMessage("Test created successfully! You can now assign it to candidates or groups.");
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      setActiveStep("assign");
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });

  // Assign test mutation
  const assignTestMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await apiRequest("POST", "/api/assignments", assignmentData);
      return res.json();
    },
    onSuccess: () => {
      const count = assignmentType === "individual" ? selectedCandidates.length : selectedGroups.length;
      const type = assignmentType === "individual" ? "candidates" : "groups";
      setStatusMessage(`Test assigned successfully to ${count} ${type}!`);
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      setActiveStep("monitor");
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const testData = {
      title: formData.get("title"),
      description: formData.get("description") || "",
      domain: formData.get("domain"),
      level: formData.get("level"),
      duration: parseInt(formData.get("duration") as string),
      total_questions: parseInt(formData.get("total_questions") as string),
      passing_score: parseInt(formData.get("passing_score") as string),
      is_active: true,
    };

    createTestMutation.mutate(testData);
  };

  const handleAssignTest = () => {
    if (!selectedTest) {
      setStatusMessage("Please select a test to assign.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    if (assignmentType === "individual" && selectedCandidates.length === 0) {
      setStatusMessage("Please select at least one candidate.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    if (assignmentType === "group" && selectedGroups.length === 0) {
      setStatusMessage("Please select at least one group.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    if (assignmentType === "individual") {
      selectedCandidates.forEach(candidateId => {
        assignTestMutation.mutate({
          userId: candidateId,
          testId: selectedTest.id,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "assigned",
        });
      });
    } else {
      // For groups, assign to all members of selected groups
      selectedGroups.forEach(groupId => {
        const group = groups.find((g: any) => g.id === groupId);
        if (group && group.members) {
          group.members.forEach((memberId: number) => {
            assignTestMutation.mutate({
              userId: memberId,
              testId: selectedTest.id,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: "assigned",
              groupId: groupId,
            });
          });
        }
      });
    }
  };

  const WorkflowStep = ({ step, title, description, isActive, isCompleted }: any) => (
    <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
      isActive ? 'border-blue-500 bg-blue-50' : 
      isCompleted ? 'border-green-500 bg-green-50' : 
      'border-gray-200 hover:border-gray-300'
    }`} onClick={() => setActiveStep(step)}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isActive ? 'bg-blue-500 text-white' : 
          isCompleted ? 'bg-green-500 text-white' : 
          'bg-gray-200'
        }`}>
          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : 
           step === "create" ? "1" : 
           step === "assign" ? "2" : 
           step === "monitor" ? "3" : "4"}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  const candidates = Array.isArray(users) ? users.filter((user: any) => user.role === 'employee' || user.role === 'candidate') : [];
  const safeResults = Array.isArray(results) ? results : [];
  const safeAssignments = Array.isArray(assignments) ? assignments : [];
  
  // Filter candidates based on search and department
  const filteredCandidates = candidates.filter((candidate: any) => {
    const matchesSearch = candidateSearchTerm === "" || 
      candidate.username?.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
      candidate.firstName?.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
      candidate.lastName?.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(candidateSearchTerm.toLowerCase());
    
    const matchesDepartment = candidateDepartmentFilter === "all" || 
      candidate.department === candidateDepartmentFilter;
    
    return matchesSearch && matchesDepartment;
  });
  
  // Filter groups based on search and domain
  const filteredGroups = Array.isArray(groups) ? groups.filter((group: any) => {
    const matchesSearch = groupSearchTerm === "" || 
      group.name?.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(groupSearchTerm.toLowerCase());
    
    const matchesDomain = groupDomainFilter === "all" || 
      group.domain === groupDomainFilter;
    
    return matchesSearch && matchesDomain;
  }) : [];
  
  // Get unique departments from candidates
  const departments = [...new Set(candidates.map((c: any) => c.department).filter(Boolean))];
  
  // Get unique domains from groups
  const domains = [...new Set(groups.map((g: any) => g.domain).filter(Boolean))];
  
  // Fix monitoring logic - count actual assignment statuses
  const activeAssignments = safeAssignments.filter((a: any) => 
    a.status === 'assigned' || a.status === 'in_progress'
  ).length;
  
  const completedAssignments = safeAssignments.filter((a: any) => 
    a.status === 'completed'
  ).length;
  
  // Use assignment completion, not just results length
  const completedTests = completedAssignments;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assessment Workflow</h1>
          <p className="text-gray-600 mt-2">
            Complete assessment process: Create → Assign → Monitor → Review
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-6 flex items-center gap-2 p-3 rounded-lg text-sm ${
            statusMessage.includes("success") || statusMessage.includes("successfully") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : statusMessage.includes("error") || statusMessage.includes("failed")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
            {statusMessage.includes("success") || statusMessage.includes("successfully") ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            {statusMessage}
          </div>
        )}

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <WorkflowStep 
            step="create" 
            title="Create Test" 
            description="Design and configure assessment"
            isActive={activeStep === "create"}
            isCompleted={Array.isArray(tests) && tests.length > 0}
          />
          <WorkflowStep 
            step="assign" 
            title="Assign Candidates" 
            description="Select and assign test to engineers"
            isActive={activeStep === "assign"}
            isCompleted={safeAssignments.length > 0}
          />
          <WorkflowStep 
            step="monitor" 
            title="Monitor Progress" 
            description="Track candidate progress and performance"
            isActive={activeStep === "monitor"}
            isCompleted={activeAssignments > 0}
          />
          <WorkflowStep 
            step="review" 
            title="Review Results" 
            description="Analyze results and make decisions"
            isActive={activeStep === "review"}
            isCompleted={completedTests > 0}
          />
        </div>

        {/* Content based on active step */}
        {activeStep === "create" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Test Title</Label>
                    <Input id="title" name="title" required placeholder="e.g., Senior React Developer Assessment" />
                  </div>
                  <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Select name="domain" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Programming">Programming</SelectItem>
                        <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                        <SelectItem value="Backend Development">Backend Development</SelectItem>
                        <SelectItem value="DevOps & Cloud">DevOps & Cloud</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Data Science & AI">Data Science & AI</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="Database Management">Database Management</SelectItem>
                        <SelectItem value="Network Administration">Network Administration</SelectItem>
                        <SelectItem value="VMware Virtualization">VMware Virtualization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe the test purpose and requirements..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select name="level" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" name="duration" type="number" required placeholder="60" />
                  </div>
                  <div>
                    <Label htmlFor="total_questions">Total Questions</Label>
                    <Input id="total_questions" name="total_questions" type="number" required placeholder="20" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passing_score">Passing Score (%)</Label>
                  <Input id="passing_score" name="passing_score" type="number" required placeholder="70" />
                </div>

                <Button type="submit" disabled={createTestMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  {createTestMutation.isPending ? "Creating..." : "Create Test"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeStep === "assign" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Select Test and Candidates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Selection */}
                <div>
                  <Label>Select Test</Label>
                  <Select 
                    value={selectedTest?.id?.toString() || ""} 
                    onValueChange={(value) => {
                      const test = tests.find((t: any) => t.id.toString() === value);
                      setSelectedTest(test);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a test to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(tests) && tests.map((test: any) => (
                        <SelectItem key={test.id} value={test.id.toString()}>
                          {test.title} ({test.domain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignment Type Selection */}
                <div>
                  <Label>Assignment Type</Label>
                  <Tabs value={assignmentType} onValueChange={(value) => setAssignmentType(value as "individual" | "group")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="individual" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Individual Candidates
                      </TabsTrigger>
                      <TabsTrigger value="group" className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4" />
                        Employee Groups
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="individual" className="mt-4">
                      <div>
                        <Label>Select Candidates</Label>
                        
                        {/* Filter Controls for Candidates */}
                        <div className="flex gap-3 mb-4 mt-2">
                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder="Search by name, username, or email..."
                              value={candidateSearchTerm}
                              onChange={(e) => setCandidateSearchTerm(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="w-48">
                            <Select
                              value={candidateDepartmentFilter}
                              onValueChange={setCandidateDepartmentFilter}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All Departments" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept: string) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <ScrollArea className="h-[300px] border rounded-lg p-4">
                          {filteredCandidates.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                              {filteredCandidates.map((candidate: any) => (
                                <div key={candidate.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`candidate-${candidate.id}`}
                                    checked={selectedCandidates.includes(candidate.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedCandidates([...selectedCandidates, candidate.id]);
                                      } else {
                                        setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`candidate-${candidate.id}`} className="cursor-pointer flex-1">
                                    <div>
                                      <p className="font-medium">{candidate.username}</p>
                                      <p className="text-sm text-gray-600">{candidate.firstName} {candidate.lastName}</p>
                                      {candidate.department && (
                                        <p className="text-xs text-gray-500">{candidate.department}</p>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">No candidates found.</p>
                              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                            </div>
                          )}
                        </ScrollArea>
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedCandidates.length} candidates selected
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="group" className="mt-4">
                      <div>
                        <Label>Select Employee Groups</Label>
                        
                        {/* Filter Controls for Groups */}
                        <div className="flex gap-3 mb-4 mt-2">
                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder="Search by group name or description..."
                              value={groupSearchTerm}
                              onChange={(e) => setGroupSearchTerm(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="w-48">
                            <Select
                              value={groupDomainFilter}
                              onValueChange={setGroupDomainFilter}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All Domains" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Domains</SelectItem>
                                {domains.map((domain: string) => (
                                  <SelectItem key={domain} value={domain}>
                                    {domain}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <ScrollArea className="h-[300px] border rounded-lg p-4">
                          <div className="space-y-4">
                            {filteredGroups.length > 0 ? (
                              filteredGroups.map((group: any) => (
                                <div key={group.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                  <Checkbox
                                    id={`group-${group.id}`}
                                    checked={selectedGroups.includes(group.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedGroups([...selectedGroups, group.id]);
                                      } else {
                                        setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`group-${group.id}`} className="cursor-pointer flex-1">
                                    <div>
                                      <p className="font-medium">{group.name}</p>
                                      <p className="text-sm text-gray-600">{group.description}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {group.memberCount || 0} members
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {group.domain || 'General'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No employee groups available.</p>
                                <p className="text-sm text-gray-500">Create groups first to assign tests to multiple employees at once.</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedGroups.length} groups selected
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Button onClick={handleAssignTest} disabled={assignTestMutation.isPending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {assignTestMutation.isPending ? "Assigning..." : `Assign Test to ${
                    assignmentType === "individual" ? selectedCandidates.length : selectedGroups.length
                  } ${assignmentType === "individual" ? "Candidates" : "Groups"}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeStep === "monitor" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Monitor Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Assignments</p>
                        <p className="text-2xl font-bold">{activeAssignments}</p>
                        <p className="text-xs text-gray-400">Total: {safeAssignments.length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-2xl font-bold">{completedTests}</p>
                        <p className="text-xs text-gray-400">From {safeAssignments.length} total</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                        <p className="text-2xl font-bold">
                          {safeAssignments.length > 0 ? 
                            Math.round((completedTests / safeAssignments.length) * 100) : 0}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Recent Assignments</h3>
                {safeAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {safeAssignments.slice(0, 5).map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Assignment #{assignment.id}</p>
                          <p className="text-sm text-gray-600">User ID: {assignment.userId} • Test ID: {assignment.testId}</p>
                        </div>
                        <Badge className={
                          assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {assignment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No assignments yet.</p>
                    <p className="text-sm text-gray-500">Start by assigning tests to candidates or groups.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === "review" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Review Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Results</p>
                        <p className="text-2xl font-bold">{completedTests}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                        <p className="text-2xl font-bold">
                          {completedTests > 0 ? 
                            Math.round((safeResults.filter((r: any) => r.passed).length / completedTests) * 100) : 0}%
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Score</p>
                        <p className="text-2xl font-bold">
                          {completedTests > 0 ? 
                            Math.round(safeResults.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) / completedTests) : 0}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Participants</p>
                        <p className="text-2xl font-bold">{candidates.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Recent Test Results</h3>
                {safeResults.length > 0 ? (
                  <div className="space-y-2">
                    {safeResults.slice(0, 5).map((result: any) => {
                      // Find the user for this result
                      const user = users.find((u: any) => u.id === result.userId);
                      const userName = user ? (user.name || `${user.firstName} ${user.lastName}`.trim() || user.username) : `User ${result.userId}`;
                      
                      // Find the test for this result  
                      const test = tests.find((t: any) => t.id === result.testId);
                      const testName = test ? test.title : `Test ${result.testId}`;
                      
                      return (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Result #{result.id}</p>
                            <p className="text-sm text-gray-600">{userName} • {testName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.percentage || 0}%</Badge>
                            <Badge className={result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {result.passed ? 'Pass' : 'Fail'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No results available yet.</p>
                    <p className="text-sm text-gray-500">Results will appear here after candidates complete their tests.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}