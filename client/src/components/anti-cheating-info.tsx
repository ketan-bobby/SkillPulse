import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  Monitor, 
  Keyboard, 
  MousePointer, 
  Clock, 
  AlertTriangle,
  Lock,
  Camera,
  Maximize,
  Activity
} from "lucide-react";

export function AntiCheatingInfo() {
  const securityFeatures = [
    {
      icon: Monitor,
      title: "Tab Switching Detection",
      description: "Monitors when users switch away from the test window",
      severity: "High",
      details: "Tracks page visibility changes and limits allowed tab switches (default: 3 maximum)"
    },
    {
      icon: Maximize,
      title: "Fullscreen Mode",
      description: "Enforces fullscreen testing environment",
      severity: "Medium", 
      details: "Detects fullscreen exits and can auto-enable fullscreen mode"
    },
    {
      icon: Keyboard,
      title: "Keystroke Monitoring",
      description: "Blocks common shortcuts used for cheating",
      severity: "High",
      details: "Prevents F12, Ctrl+C/V, Ctrl+U, Ctrl+Shift+I, and other developer shortcuts"
    },
    {
      icon: MousePointer,
      title: "Mouse Behavior Tracking",
      description: "Monitors mouse movements and right-click attempts",
      severity: "Medium",
      details: "Prevents context menus and tracks when mouse leaves window area"
    },
    {
      icon: Eye,
      title: "Developer Tools Detection",
      description: "Advanced detection of browser developer tools",
      severity: "High",
      details: "Uses timing-based detection to identify when dev tools are opened"
    },
    {
      icon: Clock,
      title: "Time-based Security",
      description: "Monitors test timing and prevents manipulation",
      severity: "Medium",
      details: "Tracks activity patterns and auto-submits on suspicious timing"
    },
    {
      icon: Lock,
      title: "Copy/Paste Prevention",
      description: "Blocks clipboard operations during tests",
      severity: "High",
      details: "Prevents copying questions or pasting external content"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Live tracking of all suspicious activities",
      severity: "Critical",
      details: "Comprehensive event logging with severity classification"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Shield className="h-5 w-5" />
            <span>Comprehensive Anti-Cheating System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our platform employs multiple layers of security to ensure test integrity without requiring camera access.
            All monitoring is done through web browser APIs and behavioral analysis.
          </p>
          
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> Tests are monitored in real-time. Excessive violations will result in automatic submission.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                </div>
                <Badge className={getSeverityColor(feature.severity)}>
                  {feature.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-2">
                {feature.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {feature.details}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security Levels & Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded border">
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
                <span className="text-sm">Mouse movements, minor focus changes</span>
              </div>
              <span className="text-xs text-muted-foreground">Logged for analysis</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded border">
              <div className="flex items-center space-x-3">
                <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                <span className="text-sm">Fullscreen exits, right-clicks</span>
              </div>
              <span className="text-xs text-muted-foreground">Warning displayed</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded border">
              <div className="flex items-center space-x-3">
                <Badge className="bg-red-100 text-red-800">High Risk</Badge>
                <span className="text-sm">Tab switching, dev tools, copy/paste</span>
              </div>
              <span className="text-xs text-muted-foreground">Auto-submit after limits</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-sm text-blue-700">Best Practices for Test Takers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use a dedicated browser window for the test</li>
            <li>• Close all unnecessary applications and browser tabs</li>
            <li>• Ensure stable internet connection</li>
            <li>• Use fullscreen mode when prompted</li>
            <li>• Avoid using browser shortcuts or right-clicking</li>
            <li>• Complete the test in one session without interruptions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}