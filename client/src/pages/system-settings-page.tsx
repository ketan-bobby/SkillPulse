import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { ROLES } from "@shared/roles";
import { 
  Settings, 
  Shield, 
  Clock, 
  Mail, 
  Database,
  Server,
  Bell,
  Palette,
  Globe,
  Save
} from "lucide-react";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    // Security Settings
    sessionTimeout: "30",
    maxLoginAttempts: "3",
    passwordMinLength: "8",
    requireSpecialChars: true,
    enableTwoFactor: false,
    
    // Test Settings
    defaultTestDuration: "120",
    maxTabSwitches: "3",
    enableFullscreenMode: true,
    allowCopyPaste: false,
    enableDevToolsDetection: true,
    
    // Email Settings
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "",
    enableEmailNotifications: true,
    
    // System Settings
    siteName: "LinxIQ",
    siteDescription: "Engineer-Grade Assessment Platform",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    enableMaintenance: false,
    
    // Performance Settings
    maxConcurrentTests: "100",
    databaseConnectionPool: "20",
    enableCaching: true,
    cacheExpiration: "3600",
    
    // Notification Settings
    enableSlackIntegration: false,
    slackWebhookUrl: "",
    enableDiscordIntegration: false,
    discordWebhookUrl: "",
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been saved successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure platform security, performance, and functionality
            </p>
          </div>

          <Tabs defaultValue="security" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Testing
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                System
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center">
                <Server className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => handleSettingChange("maxLoginAttempts", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passwordMinLength">Password Minimum Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.passwordMinLength}
                        onChange={(e) => handleSettingChange("passwordMinLength", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">Require Special Characters in Password</Label>
                      <Switch
                        id="requireSpecialChars"
                        checked={settings.requireSpecialChars}
                        onCheckedChange={(checked) => handleSettingChange("requireSpecialChars", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                      <Switch
                        id="enableTwoFactor"
                        checked={settings.enableTwoFactor}
                        onCheckedChange={(checked) => handleSettingChange("enableTwoFactor", checked)}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={() => handleSave("Security")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Testing Settings */}
            <TabsContent value="testing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Test Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="defaultTestDuration">Default Test Duration (minutes)</Label>
                      <Input
                        id="defaultTestDuration"
                        type="number"
                        value={settings.defaultTestDuration}
                        onChange={(e) => handleSettingChange("defaultTestDuration", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxTabSwitches">Max Tab Switches Allowed</Label>
                      <Input
                        id="maxTabSwitches"
                        type="number"
                        value={settings.maxTabSwitches}
                        onChange={(e) => handleSettingChange("maxTabSwitches", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableFullscreenMode">Enforce Fullscreen Mode</Label>
                      <Switch
                        id="enableFullscreenMode"
                        checked={settings.enableFullscreenMode}
                        onCheckedChange={(checked) => handleSettingChange("enableFullscreenMode", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowCopyPaste">Allow Copy/Paste in Tests</Label>
                      <Switch
                        id="allowCopyPaste"
                        checked={settings.allowCopyPaste}
                        onCheckedChange={(checked) => handleSettingChange("allowCopyPaste", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableDevToolsDetection">Enable Developer Tools Detection</Label>
                      <Switch
                        id="enableDevToolsDetection"
                        checked={settings.enableDevToolsDetection}
                        onCheckedChange={(checked) => handleSettingChange("enableDevToolsDetection", checked)}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={() => handleSave("Testing")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Testing Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => handleSettingChange("smtpHost", e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={settings.smtpPort}
                        onChange={(e) => handleSettingChange("smtpPort", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={settings.smtpUsername}
                        onChange={(e) => handleSettingChange("smtpUsername", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => handleSettingChange("smtpPassword", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromEmail">From Email Address</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => handleSettingChange("fromEmail", e.target.value)}
                        placeholder="noreply@linxassess.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                    <Switch
                      id="enableEmailNotifications"
                      checked={settings.enableEmailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("enableEmailNotifications", checked)}
                    />
                  </div>
                  
                  <Button onClick={() => handleSave("Email")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => handleSettingChange("siteName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">EST</SelectItem>
                          <SelectItem value="America/Los_Angeles">PST</SelectItem>
                          <SelectItem value="Europe/London">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange("dateFormat", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableMaintenance">Enable Maintenance Mode</Label>
                    <Switch
                      id="enableMaintenance"
                      checked={settings.enableMaintenance}
                      onCheckedChange={(checked) => handleSettingChange("enableMaintenance", checked)}
                    />
                  </div>
                  
                  <Button onClick={() => handleSave("System")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save System Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Settings */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Performance Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="maxConcurrentTests">Max Concurrent Tests</Label>
                      <Input
                        id="maxConcurrentTests"
                        type="number"
                        value={settings.maxConcurrentTests}
                        onChange={(e) => handleSettingChange("maxConcurrentTests", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="databaseConnectionPool">Database Connection Pool Size</Label>
                      <Input
                        id="databaseConnectionPool"
                        type="number"
                        value={settings.databaseConnectionPool}
                        onChange={(e) => handleSettingChange("databaseConnectionPool", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cacheExpiration">Cache Expiration (seconds)</Label>
                      <Input
                        id="cacheExpiration"
                        type="number"
                        value={settings.cacheExpiration}
                        onChange={(e) => handleSettingChange("cacheExpiration", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableCaching">Enable Caching</Label>
                    <Switch
                      id="enableCaching"
                      checked={settings.enableCaching}
                      onCheckedChange={(checked) => handleSettingChange("enableCaching", checked)}
                    />
                  </div>
                  
                  <Button onClick={() => handleSave("Performance")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Performance Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableSlackIntegration">Enable Slack Integration</Label>
                      <Switch
                        id="enableSlackIntegration"
                        checked={settings.enableSlackIntegration}
                        onCheckedChange={(checked) => handleSettingChange("enableSlackIntegration", checked)}
                      />
                    </div>
                    
                    {settings.enableSlackIntegration && (
                      <div>
                        <Label htmlFor="slackWebhookUrl">Slack Webhook URL</Label>
                        <Input
                          id="slackWebhookUrl"
                          value={settings.slackWebhookUrl}
                          onChange={(e) => handleSettingChange("slackWebhookUrl", e.target.value)}
                          placeholder="https://hooks.slack.com/..."
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableDiscordIntegration">Enable Discord Integration</Label>
                      <Switch
                        id="enableDiscordIntegration"
                        checked={settings.enableDiscordIntegration}
                        onCheckedChange={(checked) => handleSettingChange("enableDiscordIntegration", checked)}
                      />
                    </div>
                    
                    {settings.enableDiscordIntegration && (
                      <div>
                        <Label htmlFor="discordWebhookUrl">Discord Webhook URL</Label>
                        <Input
                          id="discordWebhookUrl"
                          value={settings.discordWebhookUrl}
                          onChange={(e) => handleSettingChange("discordWebhookUrl", e.target.value)}
                          placeholder="https://discord.com/api/webhooks/..."
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={() => handleSave("Notifications")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </RoleGuard>
      </div>
    </div>
  );
}