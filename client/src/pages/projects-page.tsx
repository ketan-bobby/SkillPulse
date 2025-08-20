import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, FolderKanban, Users, TestTube, Calendar, Briefcase, 
  Target, TrendingUp, AlertCircle, CheckCircle, CheckCircle2, 
  Clock, XCircle, Eye, UserPlus, Trash2 
} from "lucide-react";
import { insertProjectSchema, type Project, type InsertProject } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/hooks/use-auth";

const createProjectSchema = insertProjectSchema.extend({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

export default function ProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ["/api/departments"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Fetch groups data from database
  const { data: groups = [] } = useQuery({
    queryKey: ["/api/groups"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      // Navigate to the newly created project
      handleViewDetails(newProject.id);
    },
    onError: (error: any) => {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      companyId: undefined,
      departmentId: undefined,
      managerId: undefined,
      startDate: undefined,
      endDate: undefined,
      budget: undefined,
      tags: [],
    },
  });

  const onSubmit = (data: z.infer<typeof createProjectSchema>) => {
    createProjectMutation.mutate({
      ...data,
      companyId: data.companyId ? Number(data.companyId) : undefined,
      departmentId: data.departmentId ? Number(data.departmentId) : undefined,
      managerId: data.managerId ? Number(data.managerId) : undefined,
    });
  };

  const handleViewDetails = (projectId: number) => {
    const path = location.includes('/admin/') 
      ? `/admin/projects/${projectId}`
      : `/super-admin/projects/${projectId}`;
    setLocation(path);
  };

  const handleManageGroups = (project: Project) => {
    setSelectedProject(project);
    setSelectedGroups([]); // Reset selections
    setIsManageGroupsOpen(true);
  };

  const handleAssignGroups = () => {
    if (selectedGroups.length === 0) {
      return;
    }

    // Save the groups assignment (in real app, this would be an API call)
    setIsManageGroupsOpen(false);
    setSelectedGroups([]);
    
    // Navigate to project detail page after assigning groups
    if (selectedProject) {
      handleViewDetails(selectedProject.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "on_hold": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="h-3 w-3" />;
      case "completed": return <Target className="h-3 w-3" />;
      case "on_hold": return <Clock className="h-3 w-3" />;
      case "cancelled": return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const activeProjects = projects.filter(p => p.status === "active");
  const completedProjects = projects.filter(p => p.status === "completed");
  const onHoldProjects = projects.filter(p => p.status === "on_hold");

  const renderProjectCard = (project: Project) => (
    <Card key={project.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1">
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {project.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="flex flex-col space-y-1">
            <Badge className={`${getStatusColor(project.status)} text-xs px-2 py-1 flex items-center space-x-1`}>
              {getStatusIcon(project.status)}
              <span className="capitalize">{project.status.replace('_', ' ')}</span>
            </Badge>
            <Badge className={`${getPriorityColor(project.priority)} text-xs px-2 py-1`}>
              {project.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-2">
              <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Groups</p>
              <p className="font-semibold text-blue-600">{project.groupsCount || 1}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-2">
              <TestTube className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Tests</p>
              <p className="font-semibold text-green-600">{project.testsCount || 0}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-2">
              <Briefcase className="h-4 w-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 dark:text-gray-400">People</p>
              <p className="font-semibold text-purple-600">{project.employeesCount || 2}</p>
            </div>
          </div>

          <Separator />

          {/* Project Timeline */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Start: {formatDate(project.startDate)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                End: {formatDate(project.endDate)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleViewDetails(project.id)}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                const path = location.includes('/admin/') 
                  ? `/admin/projects/${project.id}/groups`
                  : `/super-admin/projects/${project.id}/groups`;
                setLocation(path);
              }}
            >
              Manage Groups
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600">
                Organize tests and employee groups within projects for better assessment management
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Active Projects</p>
                    <p className="text-2xl font-bold text-green-600">{activeProjects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{completedProjects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">On Hold</p>
                    <p className="text-2xl font-bold text-yellow-600">{onHoldProjects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Total Projects</p>
                    <p className="text-2xl font-bold text-purple-600">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
              <TabsTrigger value="on_hold">On Hold ({onHoldProjects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {projects.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600">
                      Create your first project to start organizing tests and employee groups.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(renderProjectCard)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active" className="space-y-4">
              {activeProjects.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-gray-600">No active projects</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map(renderProjectCard)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedProjects.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-gray-600">No completed projects</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedProjects.map(renderProjectCard)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="on_hold" className="space-y-4">
              {onHoldProjects.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-gray-600">No projects on hold</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onHoldProjects.map(renderProjectCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize tests and employee groups.
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
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the project objectives and scope"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
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
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manage Groups Dialog */}
      <Dialog open={isManageGroupsOpen} onOpenChange={setIsManageGroupsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Groups - {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Assign employee groups to this project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <ScrollArea className="h-[300px] w-full border rounded-md p-4">
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
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
                      <Label 
                        htmlFor={`group-${group.id}`} 
                        className="cursor-pointer flex-1"
                      >
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-gray-600">{group.members} members</p>
                        </div>
                      </Label>
                    </div>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {group.members}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>{selectedGroups.length}</strong> groups selected
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsManageGroupsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignGroups}>
                Assign Groups
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}