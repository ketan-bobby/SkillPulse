import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { ROLES } from "@shared/roles";
import { 
  Mail, 
  Send, 
  Users, 
  TestTube, 
  BarChart3, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from "lucide-react";

interface EmailStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  lastSent: string;
  templates: {
    welcome: { sent: number; delivered: number };
    assignment: { sent: number; delivered: number };
    completed: { sent: number; delivered: number };
    results: { sent: number; delivered: number };
    admin: { sent: number; delivered: number };
  };
}

export default function EmailManagement() {
  const [testEmail, setTestEmail] = useState("");
  const [adminSubject, setAdminSubject] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminDetails, setAdminDetails] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email statistics
  const { data: emailStats, isLoading: statsLoading } = useQuery<EmailStats>({
    queryKey: ["/api/email/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/email/test", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Check your inbox to verify email delivery is working.",
      });
      setTestEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/email/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Test Email Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin notification mutation
  const adminNotificationMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string; details?: any }) => {
      const res = await apiRequest("POST", "/api/email/admin/notify", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Admin Notification Sent",
        description: `Notification sent to ${data.recipients} administrators.`,
      });
      setAdminSubject("");
      setAdminMessage("");
      setAdminDetails("");
      queryClient.invalidateQueries({ queryKey: ["/api/email/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Notification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestEmail = () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test.",
        variant: "destructive",
      });
      return;
    }
    testEmailMutation.mutate(testEmail);
  };

  const handleAdminNotification = () => {
    if (!adminSubject.trim() || !adminMessage.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter both subject and message.",
        variant: "destructive",
      });
      return;
    }

    const details = adminDetails.trim() ? JSON.parse(adminDetails) : undefined;
    adminNotificationMutation.mutate({
      subject: adminSubject,
      message: adminMessage,
      details,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Email Management</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Manage email notifications, test delivery, and monitor email performance
            </p>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email Statistics Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : emailStats?.totalSent || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time emails</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `${emailStats?.deliveryRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `${emailStats?.openRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">Emails opened</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {statsLoading ? "..." : 
                emailStats?.lastSent ? 
                  new Date(emailStats.lastSent).toLocaleDateString() : 
                  "Never"
              }
            </div>
            <p className="text-xs text-muted-foreground">Most recent email</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Test Email Service</span>
            </CardTitle>
            <CardDescription>
              Send a test email to verify SendGrid integration is working correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleTestEmail}
              disabled={testEmailMutation.isPending}
              className="w-full"
            >
              {testEmailMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Admin Notification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Admin Notification</span>
            </CardTitle>
            <CardDescription>
              Send urgent notifications to all system administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminSubject">Subject</Label>
              <Input
                id="adminSubject"
                placeholder="System Alert: Critical Issue"
                value={adminSubject}
                onChange={(e) => setAdminSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminMessage">Message</Label>
              <Textarea
                id="adminMessage"
                placeholder="Describe the issue or notification..."
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminDetails">Additional Details (JSON)</Label>
              <Textarea
                id="adminDetails"
                placeholder='{"severity": "high", "affected_systems": ["auth", "database"]}'
                value={adminDetails}
                onChange={(e) => setAdminDetails(e.target.value)}
                rows={2}
              />
            </div>
            <Button 
              onClick={handleAdminNotification}
              disabled={adminNotificationMutation.isPending}
              className="w-full"
              variant="destructive"
            >
              {adminNotificationMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Send Admin Alert
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Email Template Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Email Template Statistics</span>
          </CardTitle>
          <CardDescription>
            Breakdown of email delivery by template type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-center py-8">Loading statistics...</div>
          ) : (
            <div className="space-y-4">
              {emailStats?.templates && Object.entries(emailStats.templates).map(([templateName, stats]) => (
                <div key={templateName} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={stats.sent > 0 ? "default" : "secondary"}>
                      {templateName.charAt(0).toUpperCase() + templateName.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {templateName === 'welcome' && 'New user welcome emails'}
                      {templateName === 'assignment' && 'Test assignment notifications'}
                      {templateName === 'completed' && 'Test completion confirmations'}
                      {templateName === 'results' && 'Results release notifications'}
                      {templateName === 'admin' && 'Administrative alerts'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Send className="h-3 w-3" />
                      <span>{stats.sent} sent</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>{stats.delivered} delivered</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Email Service Configuration</span>
          </CardTitle>
          <CardDescription>
            Current email service settings and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Provider</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">SendGrid</Badge>
                <span className="text-sm text-muted-foreground">Configured and active</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Default Sender</Label>
              <div className="text-sm font-mono bg-muted p-2 rounded">
                noreply@linxassess.com
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Templates</Label>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">Welcome</Badge>
                <Badge variant="secondary">Assignment</Badge>
                <Badge variant="secondary">Completion</Badge>
                <Badge variant="secondary">Results</Badge>
                <Badge variant="secondary">Admin Alert</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Auto Notifications</Label>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Enabled for all events</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </RoleGuard>
      </div>
    </div>
  );
}