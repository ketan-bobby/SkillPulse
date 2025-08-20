import { useEnhancedProctoring } from "@/hooks/use-enhanced-proctoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  Monitor, 
  Clock, 
  Activity,
  Maximize,
  MousePointer,
  Keyboard
} from "lucide-react";

interface ProctoringDashboardProps {
  onViolationThresholdReached?: () => void;
}

export function ProctoringDashboard({ onViolationThresholdReached }: ProctoringDashboardProps) {
  const proctoring = useEnhancedProctoring({
    maxTabSwitches: 3,
    maxFullscreenExits: 2,
    enableDevToolsDetection: true,
    autoSubmitOnViolation: true
  });

  const securityScore = proctoring.getSecurityScore();
  const suspiciousCount = proctoring.getSuspiciousActivities();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getViolationColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 0.8) return "bg-red-100 text-red-800";
    if (ratio >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-4">
      {/* Security Score */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security Score</span>
            </div>
            <span className={`text-lg font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}/100
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={securityScore} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Violations: {suspiciousCount}</span>
            <span>Activities monitored: {proctoring.events.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Warnings */}
      {proctoring.warnings.length > 0 && (
        <div className="space-y-2">
          {proctoring.warnings.map((warning, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Violation Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tab Switches</span>
            </div>
            <Badge className={getViolationColor(proctoring.violations.tabSwitches, proctoring.config.maxTabSwitches)}>
              {proctoring.violations.tabSwitches}/{proctoring.config.maxTabSwitches}
            </Badge>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Maximize className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Fullscreen</span>
            </div>
            <Badge className={getViolationColor(proctoring.violations.fullscreenExits, proctoring.config.maxFullscreenExits)}>
              {proctoring.violations.fullscreenExits}/{proctoring.config.maxFullscreenExits}
            </Badge>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Copy/Paste</span>
            </div>
            <Badge className={getViolationColor(proctoring.violations.copyPasteAttempts, proctoring.config.maxCopyPasteAttempts)}>
              {proctoring.violations.copyPasteAttempts}/{proctoring.config.maxCopyPasteAttempts}
            </Badge>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Dev Tools</span>
            </div>
            <Badge variant={proctoring.violations.devToolsOpened > 0 ? "destructive" : "secondary"}>
              {proctoring.violations.devToolsOpened}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={proctoring.requestFullscreen}
          size="sm"
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Maximize className="h-4 w-4" />
          <span>Enable Fullscreen</span>
        </Button>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Monitoring active</span>
        </div>
      </div>

      {/* Recent Activity (last 5 events) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {proctoring.events.slice(-5).reverse().map((event, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-2 rounded border">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={event.severity === "high" ? "destructive" : event.severity === "medium" ? "default" : "secondary"}
                    className="text-xs px-1 py-0"
                  >
                    {event.severity}
                  </Badge>
                  <span className="text-muted-foreground">{event.description || event.eventType}</span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {proctoring.events.length === 0 && (
              <div className="text-center text-muted-foreground py-2">
                No activity detected yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blocked State */}
      {proctoring.isBlocked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Test has been blocked due to too many violations. Please contact the administrator.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}