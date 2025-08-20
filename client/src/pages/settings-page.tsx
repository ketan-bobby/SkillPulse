import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Users, 
  Server, 
  Globe, 
  Key,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Manage platform configuration and system preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 shadow-sm rounded-lg">
              <TabsTrigger 
                value="general" 
                className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger 
                value="database" 
                className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
              >
                <Database className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Database</span>
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
              >
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="text-gray-600 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium transition-colors"
              >
                <Server className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-blue-600" />
                      Platform Settings
                    </CardTitle>
                    <CardDescription>Configure basic platform information and branding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input 
                        id="platform-name" 
                        defaultValue="LinxIQ" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform-description">Description</Label>
                      <Input 
                        id="platform-description" 
                        defaultValue="Engineer-Grade Assessments Platform" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input 
                        id="company-name" 
                        placeholder="Your Company Name" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Support Email</Label>
                      <Input 
                        id="support-email" 
                        type="email" 
                        placeholder="support@yourcompany.com" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-600" />
                      User Management
                    </CardTitle>
                    <CardDescription>Configure user registration and access settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow User Registration</Label>
                        <p className="text-sm text-gray-500">Enable new users to register accounts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Verification Required</Label>
                        <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Admin Approval Required</Label>
                        <p className="text-sm text-gray-500">New accounts need admin approval</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-role">Default User Role</Label>
                      <Select defaultValue="candidate">
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="w-5 h-5 mr-2 text-red-600" />
                      Authentication Settings
                    </CardTitle>
                    <CardDescription>Configure security and authentication options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="session-timeout" 
                        type="number" 
                        defaultValue="60" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input 
                        id="max-login-attempts" 
                        type="number" 
                        defaultValue="5" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Force Strong Passwords</Label>
                        <p className="text-sm text-gray-500">Require complex password requirements</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Enable 2FA for all users</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                      Security Monitoring
                    </CardTitle>
                    <CardDescription>Monitor and log security events</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Log Failed Login Attempts</Label>
                        <p className="text-sm text-gray-500">Track unsuccessful login attempts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Security Alerts</Label>
                        <p className="text-sm text-gray-500">Send alerts for suspicious activities</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="security-email">Security Alert Email</Label>
                      <Input 
                        id="security-email" 
                        type="email" 
                        placeholder="security@yourcompany.com" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Security Status: Good</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">All security features are properly configured</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Database Settings */}
            <TabsContent value="database" className="space-y-6">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2 text-purple-600" />
                    Database Configuration
                  </CardTitle>
                  <CardDescription>Manage database settings and maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="db-host">Database Host</Label>
                        <Input 
                          id="db-host" 
                          defaultValue="localhost" 
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="db-port">Port</Label>
                        <Input 
                          id="db-port" 
                          defaultValue="5432" 
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="db-name">Database Name</Label>
                        <Input 
                          id="db-name" 
                          defaultValue="linxassess" 
                          className="bg-white border-gray-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-green-800">Connection Status</h3>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm text-green-600">Database connection is healthy</p>
                        <p className="text-xs text-green-500 mt-1">Last checked: Just now</p>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-white border-gray-300"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Test Connection
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-white border-gray-300"
                        >
                          <Database className="w-4 h-4 mr-2" />
                          Run Migrations
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email" className="space-y-6">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>Configure SMTP settings for email delivery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input 
                        id="smtp-host" 
                        placeholder="smtp.gmail.com" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input 
                        id="smtp-port" 
                        placeholder="587" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">Username</Label>
                      <Input 
                        id="smtp-username" 
                        placeholder="your-email@gmail.com" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">Password</Label>
                      <Input 
                        id="smtp-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable SSL/TLS</Label>
                      <p className="text-sm text-gray-500">Use secure connection for email delivery</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 bg-white border-gray-300"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="glass-card border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-600" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure system-wide notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Test Assignment Notifications</Label>
                        <p className="text-sm text-gray-500">Notify users when tests are assigned</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Result Notifications</Label>
                        <p className="text-sm text-gray-500">Notify users when results are available</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">System Maintenance Alerts</Label>
                        <p className="text-sm text-gray-500">Send alerts before system maintenance</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Weekly Summary Reports</Label>
                        <p className="text-sm text-gray-500">Send weekly platform usage summaries</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass-card border-none shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="w-5 h-5 mr-2 text-indigo-600" />
                      System Information
                    </CardTitle>
                    <CardDescription>Current system status and information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Platform Version</p>
                        <p className="text-gray-600">v2.1.0</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Uptime</p>
                        <p className="text-gray-600">15 days, 4 hours</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Total Users</p>
                        <p className="text-gray-600">1,247</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Active Tests</p>
                        <p className="text-gray-600">23</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="font-medium text-gray-900 mb-2">Server Health</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">CPU Usage</span>
                          <span className="text-sm font-medium text-green-600">23%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Memory Usage</span>
                          <span className="text-sm font-medium text-yellow-600">67%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Disk Usage</span>
                          <span className="text-sm font-medium text-green-600">45%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-gray-600" />
                      Maintenance
                    </CardTitle>
                    <CardDescription>System maintenance and backup options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-white border-gray-300"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Backup Database
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-white border-gray-300"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Cache
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-white border-gray-300"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        View System Logs
                      </Button>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-1">Next Maintenance</h3>
                        <p className="text-sm text-blue-600">Scheduled for Sunday, 2:00 AM UTC</p>
                        <p className="text-xs text-blue-500 mt-1">Duration: 30 minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#2563eb', color: 'white' }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}