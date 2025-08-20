import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Building2, Link as LinkIcon, Settings, Users, BarChart, RefreshCw, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HRIntegrationPage() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [setupStep, setSetupStep] = useState(1);
  const [connectionTested, setConnectionTested] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const { data: integrations = [] } = useQuery({
    queryKey: ["/api/hr/integrations"],
  });

  const { data: performanceReviews = [] } = useQuery({
    queryKey: ["/api/hr/performance-reviews"],
  });

  const { data: learningPaths = [] } = useQuery({
    queryKey: ["/api/hr/learning-paths"],
  });

  const setupIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/hr/integrations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/integrations"] });
      toast({
        title: "Integration Setup",
        description: "HR integration configured successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Integration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncDataMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      const res = await apiRequest("POST", `/api/hr/integrations/${integrationId}/sync`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Synchronized ${data.employeeCount} employee records`,
      });
    },
  });

  const hrPlatforms = [
    { id: "workday", name: "Workday", description: "Enterprise HR platform with comprehensive workforce management" },
    { id: "bamboohr", name: "BambooHR", description: "Modern HR software for growing companies" },
    { id: "adp", name: "ADP", description: "Comprehensive payroll and HR solutions" },
    { id: "successfactors", name: "SAP SuccessFactors", description: "Cloud-based HCM suite" },
    { id: "custom", name: "Custom API", description: "Connect your custom HR system via REST API" }
  ];

  const testConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/hr/test-connection", data);
      return res.json();
    },
    onSuccess: () => {
      setConnectionTested(true);
      toast({
        title: "Connection Successful",
        description: "Successfully connected to your HR platform",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlatform) {
      toast({
        title: "Platform Required",
        description: "Please select an HR platform first",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const testData = {
      platform: selectedPlatform,
      apiEndpoint: formData.get("apiEndpoint"),
      apiKey: formData.get("apiKey"),
    };

    setTestingConnection(true);
    testConnectionMutation.mutate(testData);
    setTimeout(() => setTestingConnection(false), 2000);
  };

  const handleSetupIntegration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!connectionTested) {
      toast({
        title: "Test Connection First",
        description: "Please test your connection before setting up the integration",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    const integrationData = {
      organizationId: formData.get("organizationId"),
      platform: selectedPlatform,
      apiEndpoint: formData.get("apiEndpoint"),
      apiKey: formData.get("apiKey"),
      webhookUrl: formData.get("webhookUrl"),
      fieldMappings: {
        employeeId: formData.get("employeeIdField") || "employee_id",
        name: formData.get("nameField") || "full_name",
        email: formData.get("emailField") || "email",
        department: formData.get("departmentField") || "department",
        jobTitle: formData.get("jobTitleField") || "job_title",
        managerId: formData.get("managerIdField") || "manager_id",
        hireDate: formData.get("hireDateField") || "hire_date",
        location: formData.get("locationField") || "location"
      }
    };

    setupIntegrationMutation.mutate(integrationData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={["super_admin", "admin", "hr_manager"]}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">HR System Integration</h1>
            <p className="text-muted-foreground">
              Connect LinxIQ with your HR systems for seamless employee data synchronization and performance management
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="setup">Setup Integration</TabsTrigger>
              <TabsTrigger value="performance">Performance Management</TabsTrigger>
              <TabsTrigger value="learning">Learning Paths</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
                        <p className="text-2xl font-bold">{(integrations as any[]).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Performance Reviews</p>
                        <p className="text-2xl font-bold">{(performanceReviews as any[]).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Learning Paths</p>
                        <p className="text-2xl font-bold">{(learningPaths as any[]).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Active HR Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  {(integrations as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4" />
                      <p>No HR integrations configured</p>
                      <p className="text-sm">Set up your first integration to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(integrations as any[]).map((integration: any) => (
                        <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium capitalize">{integration.platform}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : "Never"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={integration.isActive ? "default" : "secondary"}>
                              {integration.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => syncDataMutation.mutate(integration.id)}
                              disabled={syncDataMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="setup">
              <Card>
                <CardHeader>
                  <CardTitle>Setup New HR Integration</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Follow these steps to connect your HR system with LinxIQ
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Step Progress Indicator */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        setupStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        1
                      </div>
                      <span className="text-sm font-medium">Select Platform</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        setupStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        2
                      </div>
                      <span className="text-sm font-medium">Test Connection</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        setupStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        3
                      </div>
                      <span className="text-sm font-medium">Configure Fields</span>
                    </div>
                  </div>

                  <form onSubmit={setupStep === 2 ? handleTestConnection : handleSetupIntegration} className="space-y-6">
                    {/* Step 1: Platform Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Step 1: Choose Your HR Platform</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hrPlatforms.map((platform) => (
                          <div
                            key={platform.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              selectedPlatform === platform.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setSelectedPlatform(platform.id);
                              setSetupStep(2);
                              setConnectionTested(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{platform.name}</h4>
                                <p className="text-sm text-muted-foreground">{platform.description}</p>
                              </div>
                              {selectedPlatform === platform.id && (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Connection Details */}
                    {selectedPlatform && setupStep >= 2 && (
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold">Step 2: Enter Connection Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="organizationId">Organization ID *</Label>
                            <Input 
                              id="organizationId" 
                              name="organizationId" 
                              placeholder="Your organization identifier"
                              required 
                            />
                            <p className="text-xs text-muted-foreground">
                              Usually found in your HR platform's API settings
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="apiEndpoint">API Endpoint *</Label>
                            <Input 
                              id="apiEndpoint" 
                              name="apiEndpoint" 
                              placeholder="https://api.yourhr.com/v1"
                              required 
                            />
                            <p className="text-xs text-muted-foreground">
                              Base URL for your HR platform's API
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key *</Label>
                            <Input 
                              id="apiKey" 
                              name="apiKey" 
                              type="password"
                              placeholder="Your API key"
                              required 
                            />
                            <p className="text-xs text-muted-foreground">
                              Generate this from your HR platform's developer console
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="webhookUrl">Webhook URL</Label>
                            <Input 
                              id="webhookUrl" 
                              name="webhookUrl" 
                              placeholder="https://your-app.com/webhooks/hr"
                            />
                            <p className="text-xs text-muted-foreground">
                              Optional: For real-time data synchronization
                            </p>
                          </div>
                        </div>

                        {setupStep === 2 && (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm">
                              {connectionTested && (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Connection verified
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-3">
                              <Button 
                                type="submit" 
                                disabled={testingConnection}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {testingConnection ? "Testing..." : "Test Connection"}
                              </Button>
                              {connectionTested && (
                                <Button 
                                  type="button"
                                  onClick={() => setSetupStep(3)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Next: Configure Fields
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Field Mapping */}
                    {connectionTested && setupStep >= 3 && (
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold">Step 3: Configure Field Mapping</h3>
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <p className="text-sm text-blue-800">
                            Map your HR system's field names to LinxIQ fields. These are the exact field names as they appear in your HR system's API response.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="employeeIdField">Employee ID Field</Label>
                            <Input 
                              id="employeeIdField" 
                              name="employeeIdField" 
                              placeholder="employee_id"
                              defaultValue="employee_id"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nameField">Full Name Field</Label>
                            <Input 
                              id="nameField" 
                              name="nameField" 
                              placeholder="full_name"
                              defaultValue="full_name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailField">Email Field</Label>
                            <Input 
                              id="emailField" 
                              name="emailField" 
                              placeholder="email"
                              defaultValue="email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="departmentField">Department Field</Label>
                            <Input 
                              id="departmentField" 
                              name="departmentField" 
                              placeholder="department"
                              defaultValue="department"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jobTitleField">Job Title Field</Label>
                            <Input 
                              id="jobTitleField" 
                              name="jobTitleField" 
                              placeholder="job_title"
                              defaultValue="job_title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="managerIdField">Manager ID Field</Label>
                            <Input 
                              id="managerIdField" 
                              name="managerIdField" 
                              placeholder="manager_id"
                              defaultValue="manager_id"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={setupIntegrationMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {setupIntegrationMutation.isPending ? "Setting up..." : "Complete Integration Setup"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Management Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Automated Performance Reviews</h3>
                        <p className="text-sm text-muted-foreground">
                          Sync performance data from HR systems and combine with technical assessments
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Skills Gap Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                          Automatically identify skill gaps based on role requirements and assessment results
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Goal Tracking Integration</h3>
                        <p className="text-sm text-muted-foreground">
                          Sync learning goals and track progress through technical assessments
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Path Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(learningPaths as any[]).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart className="h-12 w-12 mx-auto mb-4" />
                        <p>No learning paths configured</p>
                      </div>
                    ) : (
                      (learningPaths as any[]).map((path: any) => (
                        <div key={path.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{path.pathName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Target: {path.targetRole} • Progress: {path.currentProgress?.completedSkills || 0}/{path.currentProgress?.totalSkills || 0} skills
                            </p>
                          </div>
                          <Badge variant={path.status === "active" ? "default" : "secondary"}>
                            {path.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </RoleGuard>
      </div>
    </div>
  );
}