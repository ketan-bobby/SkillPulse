import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserCheck, Clock, BookOpen, Target, Calendar, Send, Users, CheckCircle2, Search, ArrowRight, Filter, Grid3X3, List, Building2, Briefcase, UsersIcon } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role: string;
  domain?: string;
  position?: string;
}

interface Test {
  id: number;
  title: string;
  description?: string;
  domain: string;
  level: string;
  duration: number;
  total_questions: number;
  is_active: boolean;
  created_at: string;
}

export default function TestAssignmentPage() {
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [viewMode, setViewMode] = useState<string>("grid");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees (users with employee role)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch available tests
  const { data: tests = [] } = useQuery<Test[]>({
    queryKey: ["/api/tests"],
  });

  // Fetch employee groups
  const { data: employeeGroups = [] } = useQuery({
    queryKey: ["/api/employee-groups"],
  });

  // Filter employees only
  const employees = users.filter(user => user.role === 'employee');
  
  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomain = filterDomain === "all" || emp.domain === filterDomain;
    const matchesPosition = filterPosition === "all" || emp.position === filterPosition;
    
    return matchesSearch && matchesDomain && matchesPosition;
  });

  // Get unique domains and positions for filter options
  const uniqueDomains = Array.from(new Set(employees.map(emp => emp.domain).filter(Boolean)));
  const uniquePositions = Array.from(new Set(employees.map(emp => emp.position).filter(Boolean)));

  // Group employees if grouping is enabled
  const groupedEmployees = groupBy === "none" ? 
    { "All Employees": filteredEmployees } :
    groupBy === "domain" ?
      filteredEmployees.reduce((groups, emp) => {
        const key = emp.domain || "No Domain";
        if (!groups[key]) groups[key] = [];
        groups[key].push(emp);
        return groups;
      }, {} as Record<string, User[]>) :
    groupBy === "position" ?
      filteredEmployees.reduce((groups, emp) => {
        const key = emp.position || "No Position";
        if (!groups[key]) groups[key] = [];
        groups[key].push(emp);
        return groups;
      }, {} as Record<string, User[]>) :
      { "All Employees": filteredEmployees };

  // Get all active tests (show all tests for now since is_active might not be properly set)
  const activeTests = tests.filter(test => test.id); // Just filter valid tests

  const assignTestMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      return apiRequest("POST", "/api/assignments", assignmentData);
    },
  });

  const handleEmployeeToggle = (employeeId: number) => {
    console.log('Toggle called for employee:', employeeId);
    setSelectedEmployees(prev => {
      const newSelection = prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handleAssignTest = async () => {
    if (!selectedTest || selectedEmployees.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a test and at least one employee",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create assignments for each selected employee
      const assignmentPromises = selectedEmployees.map(employeeId => 
        assignTestMutation.mutateAsync({
          userId: employeeId,
          testId: selectedTest,
          dueDate: dueDate || undefined,
          status: 'assigned'
        })
      );
      
      await Promise.all(assignmentPromises);
      
      toast({
        title: "Tests assigned successfully",
        description: `Test assigned to ${selectedEmployees.length} employee(s)`,
      });
      
      // Reset form
      setSelectedEmployees([]);
      setSelectedTest(null);
      setDueDate("");
      setInstructions("");
      setIsAssignDialogOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Assignment failed",
        description: error.message || "Failed to assign test",
        variant: "destructive",
      });
    }
  };

  const selectedTestDetails = activeTests.find(test => test.id === selectedTest);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AppHeader />
      <div className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Assign Tests to Employees
          </h1>
          <p className="text-gray-600 text-lg">Create targeted assessments for your team members</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Test Selection - Left Panel */}
          <div className="xl:col-span-1">
            <Card className="h-fit bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Select Test
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Choose the assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Select onValueChange={(value) => setSelectedTest(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTests.length === 0 ? (
                      <SelectItem value="no-tests" disabled>
                        No tests available
                      </SelectItem>
                    ) : (
                      activeTests.map((test) => (
                        <SelectItem key={test.id} value={test.id.toString()}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{test.title}</span>
                            <span className="text-sm text-gray-500">
                              {test.domain} • {test.level} • {test.duration}min
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>



                {selectedTestDetails && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">{selectedTestDetails.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span>{selectedTestDetails.domain} • {selectedTestDetails.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{selectedTestDetails.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>{selectedTestDetails.total_questions} questions</span>
                      </div>
                    </div>
                    {selectedTestDetails.description && (
                      <p className="text-sm text-gray-600 mt-3 p-2 bg-white rounded border">
                        {selectedTestDetails.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Assignment Details */}
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Additional instructions for employees..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Selection - Main Panel */}
          <div className="xl:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Employees ({selectedEmployees.length} selected)
                </CardTitle>
                <CardDescription className="text-green-100">
                  Choose team members to assign the test
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Search and Controls */}
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search employees by name, username, or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEmployees(filteredEmployees.map(emp => emp.id))}
                          className="whitespace-nowrap"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEmployees([])}
                          className="whitespace-nowrap"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters & Grouping</span>
                      </div>
                      
                      <div>
                        <Select value={filterDomain} onValueChange={setFilterDomain}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All Domains" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            {uniqueDomains.map(domain => (
                              <SelectItem key={domain} value={domain}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-3 w-3" />
                                  {domain}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select value={filterPosition} onValueChange={setFilterPosition}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All Positions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Positions</SelectItem>
                            {uniquePositions.map(position => (
                              <SelectItem key={position} value={position}>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3 w-3" />
                                  {position}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select value={groupBy} onValueChange={setGroupBy}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Group By" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Grouping</SelectItem>
                            <SelectItem value="domain">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                Group by Domain
                              </div>
                            </SelectItem>
                            <SelectItem value="position">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                Group by Position
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Employee Groups Selection */}
                    {(employeeGroups as any[]).length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <UsersIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Select Employee Groups:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(employeeGroups as any[]).slice(0, 4).map((group: any) => {
                            const groupEmployeeIds = group.members || [];
                            const validEmployeeIds = groupEmployeeIds.filter((id: number) => 
                              filteredEmployees.some(emp => emp.id === id)
                            );
                            return (
                              <Button
                                key={group.id}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-white hover:bg-purple-50 border-purple-300"
                                onClick={() => {
                                  setSelectedEmployees(prev => Array.from(new Set([...prev, ...validEmployeeIds])));
                                }}
                              >
                                <UsersIcon className="h-3 w-3 mr-1" />
                                {group.name} ({validEmployeeIds.length})
                              </Button>
                            );
                          })}
                          {(employeeGroups as any[]).length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{(employeeGroups as any[]).length - 4} more groups
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Batch Selection by Domain */}
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-800">Quick Domain Selection:</span>
                      {uniqueDomains.slice(0, 3).map(domain => {
                        const domainEmployees = filteredEmployees.filter(emp => emp.domain === domain);
                        return (
                          <Button
                            key={domain}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              const ids = domainEmployees.map(emp => emp.id);
                              setSelectedEmployees(prev => Array.from(new Set([...prev, ...ids])));
                            }}
                          >
                            All {domain} ({domainEmployees.length})
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Selection Summary */}
                  {filteredEmployees.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedEmployees.length} of {filteredEmployees.length} employees selected
                      </span>
                      {selectedEmployees.length > 0 && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Ready to assign
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Employee Display */}
                  <div className="max-h-96 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No employees found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    ) : groupBy === "none" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployees.map((employee) => (
                          <EmployeeCard key={employee.id} employee={employee} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(groupedEmployees).map(([groupName, employees]) => (
                          <div key={groupName} className="border rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {groupBy === "domain" ? (
                                  <Building2 className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <Briefcase className="h-4 w-4 text-gray-600" />
                                )}
                                <span className="font-semibold text-gray-800">{groupName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {employees.length} employees
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  const ids = employees.map(emp => emp.id);
                                  setSelectedEmployees(prev => Array.from(new Set([...prev, ...ids])));
                                }}
                              >
                                Select All ({employees.length})
                              </Button>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {employees.map((employee) => (
                                <EmployeeCard key={employee.id} employee={employee} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Action */}
          <div className="xl:col-span-4 mt-6">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-800">Ready to Assign</span>
                    </div>
                    {selectedTest && selectedEmployees.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {selectedTestDetails?.title} → {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleAssignTest}
                    disabled={!selectedTest || selectedEmployees.length === 0 || assignTestMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {assignTestMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Assign Test to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // Employee Card Component
  function EmployeeCard({ employee }: { employee: User }) {
    return (
      <div
        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
          selectedEmployees.includes(employee.id)
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-lg scale-105'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEmployeeToggle(employee.id);
        }}
      >
        {/* Selection Indicator */}
        <div className="absolute top-3 right-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selectedEmployees.includes(employee.id)
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300 bg-white hover:border-blue-400'
          }`}>
            {selectedEmployees.includes(employee.id) && (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Employee Info */}
        <div className="pr-8">
          <div className="font-semibold text-gray-900 mb-1">
            {employee.name || employee.username}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {employee.email}
          </div>
          <div className="flex flex-wrap gap-1">
            {employee.domain && (
              <Badge variant="outline" className="text-xs">
                {employee.domain}
              </Badge>
            )}
            {employee.position && (
              <Badge variant="secondary" className="text-xs">
                {employee.position}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AppHeader />
      <div className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Assign Tests to Employees
          </h1>
          <p className="text-gray-600 text-lg">Create targeted assessments for your team members</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Test Selection - Left Panel */}
          <div className="xl:col-span-1">
            <Card className="h-fit bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Select Test
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Choose the assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Select onValueChange={(value) => setSelectedTest(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTests.length === 0 ? (
                      <SelectItem value="no-tests" disabled>
                        No tests available
                      </SelectItem>
                    ) : (
                      activeTests.map((test) => (
                        <SelectItem key={test.id} value={test.id.toString()}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{test.title}</span>
                            <span className="text-sm text-gray-500">
                              {test.domain} • {test.level} • {test.duration}min
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {selectedTestDetails && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">{selectedTestDetails.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span>{selectedTestDetails.domain} • {selectedTestDetails.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{selectedTestDetails.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>{selectedTestDetails.total_questions} questions</span>
                      </div>
                    </div>
                    {selectedTestDetails.description && (
                      <p className="text-sm text-gray-600 mt-3 p-2 bg-white rounded border">
                        {selectedTestDetails.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Assignment Details */}
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Additional instructions for employees..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Selection - Main Panel */}
          <div className="xl:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Employees ({selectedEmployees.length} selected)
                </CardTitle>
                <CardDescription className="text-green-100">
                  Choose team members to assign the test
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Search and Controls */}
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search employees by name, username, or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEmployees(filteredEmployees.map(emp => emp.id))}
                          className="whitespace-nowrap"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEmployees([])}
                          className="whitespace-nowrap"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters & Grouping</span>
                      </div>
                      
                      <div>
                        <Select value={filterDomain} onValueChange={setFilterDomain}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All Domains" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            {uniqueDomains.map(domain => (
                              <SelectItem key={domain} value={domain}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-3 w-3" />
                                  {domain}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select value={filterPosition} onValueChange={setFilterPosition}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All Positions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Positions</SelectItem>
                            {uniquePositions.map(position => (
                              <SelectItem key={position} value={position}>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3 w-3" />
                                  {position}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select value={groupBy} onValueChange={setGroupBy}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Group By" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Grouping</SelectItem>
                            <SelectItem value="domain">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                Group by Domain
                              </div>
                            </SelectItem>
                            <SelectItem value="position">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                Group by Position
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Employee Groups Selection */}
                    {(employeeGroups as any[]).length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <UsersIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Select Employee Groups:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(employeeGroups as any[]).slice(0, 4).map((group: any) => {
                            const groupEmployeeIds = group.members || [];
                            const validEmployeeIds = groupEmployeeIds.filter((id: number) => 
                              filteredEmployees.some(emp => emp.id === id)
                            );
                            return (
                              <Button
                                key={group.id}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-white hover:bg-purple-50 border-purple-300"
                                onClick={() => {
                                  setSelectedEmployees(prev => Array.from(new Set([...prev, ...validEmployeeIds])));
                                }}
                              >
                                <UsersIcon className="h-3 w-3 mr-1" />
                                {group.name} ({validEmployeeIds.length})
                              </Button>
                            );
                          })}
                          {(employeeGroups as any[]).length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{(employeeGroups as any[]).length - 4} more groups
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Batch Selection by Domain */}
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-800">Quick Domain Selection:</span>
                      {uniqueDomains.slice(0, 3).map(domain => {
                        const domainEmployees = filteredEmployees.filter(emp => emp.domain === domain);
                        return (
                          <Button
                            key={domain}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              const ids = domainEmployees.map(emp => emp.id);
                              setSelectedEmployees(prev => Array.from(new Set([...prev, ...ids])));
                            }}
                          >
                            All {domain} ({domainEmployees.length})
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Selection Summary */}
                  {filteredEmployees.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedEmployees.length} of {filteredEmployees.length} employees selected
                      </span>
                      {selectedEmployees.length > 0 && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Ready to assign
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Employee Display */}
                  <div className="max-h-96 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No employees found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    ) : groupBy === "none" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployees.map((employee) => (
                          <EmployeeCard key={employee.id} employee={employee} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(groupedEmployees).map(([groupName, employees]) => (
                          <div key={groupName} className="border rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {groupBy === "domain" ? (
                                  <Building2 className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <Briefcase className="h-4 w-4 text-gray-600" />
                                )}
                                <span className="font-semibold text-gray-800">{groupName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {employees.length} employees
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  const ids = employees.map(emp => emp.id);
                                  setSelectedEmployees(prev => Array.from(new Set([...prev, ...ids])));
                                }}
                              >
                                Select All ({employees.length})
                              </Button>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {employees.map((employee) => (
                                <EmployeeCard key={employee.id} employee={employee} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Action */}
          <div className="xl:col-span-4 mt-6">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-800">Ready to Assign</span>
                    </div>
                    {selectedTest && selectedEmployees.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {selectedTestDetails?.title} → {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleAssignTest}
                    disabled={!selectedTest || selectedEmployees.length === 0 || assignTestMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {assignTestMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Assign Test to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // Employee Card Component
  function EmployeeCard({ employee }: { employee: User }) {
    return (
      <div
        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
          selectedEmployees.includes(employee.id)
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-lg scale-105'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEmployeeToggle(employee.id);
        }}
      >
        {/* Selection Indicator */}
        <div className="absolute top-3 right-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selectedEmployees.includes(employee.id)
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300 bg-white hover:border-blue-400'
          }`}>
            {selectedEmployees.includes(employee.id) && (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Employee Info */}
        <div className="pr-8">
          <div className="font-semibold text-gray-900 mb-1">
            {employee.name || employee.username}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {employee.email}
          </div>
          <div className="flex flex-wrap gap-1">
            {employee.domain && (
              <Badge variant="outline" className="text-xs">
                {employee.domain}
              </Badge>
            )}
            {employee.position && (
              <Badge variant="secondary" className="text-xs">
                {employee.position}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }
}

