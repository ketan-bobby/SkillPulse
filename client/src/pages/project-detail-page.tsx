import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Settings,
  UserPlus,
  TestTube,
  BarChart3,
  Edit3,
  Plus,
  LineChart,
  TrendingUp,
  PieChart,
  Activity
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  companyId?: number;
  departmentId?: number;
  managerId?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  company?: { name: string };
  department?: { name: string };
  manager?: { firstName: string; lastName: string };
}

const editProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
});

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId || params.id;
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAssignTestOpen, setIsAssignTestOpen] = useState(false);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const handleBackNavigation = () => {
    if (location.includes('/super-admin/')) {
      setLocation('/super-admin/projects');
    } else if (location.includes('/admin/')) {
      setLocation('/admin/projects');
    } else {
      setLocation('/super-admin/projects');
    }
  };

  const { data: project, isLoading } = useQuery<ProjectDetail>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: availableTests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const { data: availableGroups = [] } = useQuery({
    queryKey: ["/api/employee-groups"],
  });

  // Fetch real analytics data
  const { data: results = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Calculate analytics from real data
  const analyticsData = React.useMemo(() => {
    if (!results.length || !users.length) return {
      totalEmployees: 0,
      testsCompleted: 0,
      averageScore: 0,
      completionRate: 0,
      performanceMetrics: [],
      topPerformers: []
    };

    const userScores = users.map((user: any) => {
      const userResults = results.filter((r: any) => r.userId === user.id);
      const avgScore = userResults.length > 0 
        ? userResults.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) / userResults.length 
        : 0;
      
      return {
        name: user.name || user.username,
        score: Math.round(avgScore),
        tests: userResults.length
      };
    }).filter(user => user.tests > 0);

    return {
      totalEmployees: users.length,
      testsCompleted: results.length,
      averageScore: userScores.length > 0 
        ? Math.round(userScores.reduce((sum, u) => sum + u.score, 0) / userScores.length) 
        : 0,
      completionRate: users.length > 0 ? Math.round((userScores.length / users.length) * 100) : 0,
      performanceMetrics: [], // Would need time-series data
      topPerformers: userScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    };
  }, [results, users]);

  const form = useForm({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "active",
      priority: project?.priority || "medium",
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
      endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
      budget: project?.budget || undefined,
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/projects/${projectId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      setIsEditDialogOpen(false);
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/employee-groups", {
        ...data,
        projectId: parseInt(projectId as string),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-groups"] });
      setIsAddGroupOpen(false);
      setNewGroupName("");
      setNewGroupDescription("");
    },
  });

  const assignTestsMutation = useMutation({
    mutationFn: async (testIds: number[]) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/assign-tests`, {
        testIds,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tests`] });
      setIsAssignTestOpen(false);
      setSelectedTests([]);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "on_hold": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const onSubmit = (data: z.infer<typeof editProjectSchema>) => {
    updateProjectMutation.mutate({
      ...data,
      budget: data.budget ? Number(data.budget) : undefined,
    });
  };

  const handleCreateGroup = () => {
    if (!newGroupName) return;
    createGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription,
    });
  };

  const handleAssignTests = () => {
    if (selectedTests.length === 0) return;
    assignTestsMutation.mutate(selectedTests);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
              <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
              <Button onClick={handleBackNavigation}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackNavigation}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
            </div>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Project
            </Button>
          </div>
        </div>

        {/* Project Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">Employee Groups</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company</p>
                        <p className="text-sm">{project.company?.name || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="text-sm">{project.department?.name || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Project Manager</p>
                        <p className="text-sm">
                          {project.manager ? 
                            `${project.manager.firstName} ${project.manager.lastName}` : 
                            "Not assigned"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Budget</p>
                        <p className="text-sm">{project.budget ? `$${project.budget.toLocaleString()}` : "Not set"}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">End Date</p>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(project.endDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Employee Groups</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Tests</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <TestTube className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                        <p className="text-2xl font-bold">78%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Employee Groups
                  <Button onClick={() => setIsAddGroupOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Group
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {availableGroups.length > 0 ? (
                    availableGroups.map((group: any) => (
                      <Card key={group.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{group.name}</h3>
                              <p className="text-sm text-gray-600">{group.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {group.memberCount || 0} members
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No groups assigned to this project.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setIsAddGroupOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Group
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Associated Tests
                  <Button onClick={() => setIsAssignTestOpen(true)}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Assign Test
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {availableTests.length > 0 ? (
                    availableTests.slice(0, 3).map((test: any) => (
                      <Card key={test.id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{test.title}</h3>
                              <p className="text-sm text-gray-600">{test.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>Domain: {test.domain}</span>
                                <span>Questions: {test.questionCount || 10}</span>
                                <span>Duration: {test.duration || 60} min</span>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Assigned</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tests assigned to this project.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setIsAssignTestOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign First Test
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Employees</p>
                      <p className="text-2xl font-bold">{analyticsData.totalEmployees}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tests Completed</p>
                      <p className="text-2xl font-bold">{analyticsData.testsCompleted}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Average Score</p>
                      <p className="text-2xl font-bold">{analyticsData.averageScore}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                      <p className="text-2xl font-bold">{analyticsData.completionRate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.performanceMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-sm text-gray-600">{metric.tests} tests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{metric.score}%</p>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${metric.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {performer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{performer.name}</p>
                            <p className="text-sm text-gray-600">{performer.tests} tests completed</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {performer.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details, timeline, and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter budget amount"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>
              Create a new employee group for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Frontend Team"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                placeholder="Brief description of the group"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddGroupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending}>
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Test Dialog */}
      <Dialog open={isAssignTestOpen} onOpenChange={setIsAssignTestOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Tests to Project</DialogTitle>
            <DialogDescription>
              Select tests to assign to this project.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {availableTests.map((test: any) => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`test-${test.id}`}
                      checked={selectedTests.includes(test.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTests([...selectedTests, test.id]);
                        } else {
                          setSelectedTests(selectedTests.filter(id => id !== test.id));
                        }
                      }}
                    />
                    <Label htmlFor={`test-${test.id}`} className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">{test.title}</p>
                        <p className="text-sm text-gray-600">{test.description}</p>
                        <p className="text-xs text-gray-500">{test.domain} • {test.duration || 60} min</p>
                      </div>
                    </Label>
                  </div>
                  <Badge variant="outline">{test.questionCount || 10} questions</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              {selectedTests.length} tests selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAssignTestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTests} disabled={assignTestsMutation.isPending}>
                {assignTestsMutation.isPending ? "Assigning..." : "Assign Tests"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}