import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Clock, 
  MousePointer, 
  Keyboard,
  Monitor,
  X,
  CheckCircle,
  CheckCircle2
} from "lucide-react";

interface ViolationEvent {
  id: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  penaltyPoints: number;
}

interface PenaltySystemProps {
  onViolationThresholdReached?: () => void;
}

export function PenaltySystem({ onViolationThresholdReached }: PenaltySystemProps) {
  // Load initial state from sessionStorage to persist across modal open/close
  const loadPersistedData = () => {
    try {
      const saved = sessionStorage.getItem('penaltySystemData');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const violations = (parsed.violations || []).map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp)
        }));
        return {
          violations,
          totalPenaltyPoints: parsed.totalPenaltyPoints || 0,
          securityScore: parsed.securityScore || 100,
          warningLevel: parsed.warningLevel || "safe"
        };
      }
    } catch (error) {
      console.error('Error loading penalty system data:', error);
    }
    return {
      violations: [],
      totalPenaltyPoints: 0,
      securityScore: 100,
      warningLevel: "safe" as const
    };
  };

  const initialData = loadPersistedData();
  const [violations, setViolations] = useState<ViolationEvent[]>(initialData.violations);
  const [totalPenaltyPoints, setTotalPenaltyPoints] = useState(initialData.totalPenaltyPoints);
  const [securityScore, setSecurityScore] = useState(initialData.securityScore);
  const [warningLevel, setWarningLevel] = useState<"safe" | "warning" | "danger" | "critical">(initialData.warningLevel);

  // Save data to sessionStorage whenever state changes
  const saveDataToSession = (newViolations: ViolationEvent[], newPoints: number, newScore: number, newLevel: string) => {
    try {
      const dataToSave = {
        violations: newViolations,
        totalPenaltyPoints: newPoints,
        securityScore: newScore,
        warningLevel: newLevel
      };
      sessionStorage.setItem('penaltySystemData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving penalty system data:', error);
    }
  };

  // Clear session data (called when starting a new test)
  const clearSessionData = () => {
    try {
      sessionStorage.removeItem('penaltySystemData');
      setViolations([]);
      setTotalPenaltyPoints(0);
      setSecurityScore(100);
      setWarningLevel("safe");
    } catch (error) {
      console.error('Error clearing penalty system data:', error);
    }
  };

  // Expose clear function globally for test initialization
  useEffect(() => {
    (window as any).clearPenaltySystem = clearSessionData;
    return () => {
      delete (window as any).clearPenaltySystem;
    };
  }, []);

  const maxPenaltyPoints = 50;
  const thresholds = {
    warning: 15,
    danger: 30,
    critical: 45
  };

  const violationTypes = {
    tab_switch: { points: 5, severity: "medium" as const, description: "Switched away from test tab" },
    copy_attempt: { points: 8, severity: "high" as const, description: "Attempted to copy content" },
    paste_attempt: { points: 8, severity: "high" as const, description: "Attempted to paste content" },
    dev_tools: { points: 10, severity: "high" as const, description: "Developer tools detected" },
    right_click: { points: 3, severity: "low" as const, description: "Right-click attempt blocked" },
    fullscreen_exit: { points: 6, severity: "medium" as const, description: "Exited fullscreen mode" },
    multiple_tabs: { points: 7, severity: "medium" as const, description: "Multiple browser tabs detected" },
    suspicious_timing: { points: 4, severity: "low" as const, description: "Suspicious answer timing pattern" },
    window_resize: { points: 2, severity: "low" as const, description: "Window resized during test" },
    browser_back: { points: 9, severity: "high" as const, description: "Browser back button used" }
  };

  // Real violation detection - persistent event listeners
  useEffect(() => {
    // Tab switching detection with improved reliability
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const violation: ViolationEvent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Ensure unique ID
          type: "tab_switch",
          description: violationTypes.tab_switch.description,
          severity: violationTypes.tab_switch.severity,
          timestamp: new Date(),
          penaltyPoints: violationTypes.tab_switch.points
        };
        addViolation(violation);
        console.log('Tab switch detected:', violation); // Debug logging
      }
    };

    // Alternative tab detection using window blur
    const handleWindowBlur = () => {
      const violation: ViolationEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "tab_switch",
        description: "Window lost focus (possible tab switch)",
        severity: violationTypes.tab_switch.severity,
        timestamp: new Date(),
        penaltyPoints: violationTypes.tab_switch.points
      };
      addViolation(violation);
      console.log('Window blur detected:', violation); // Debug logging
    };

    // Copy/Paste detection
    const handleCopy = (e: Event) => {
      e.preventDefault();
      const violation: ViolationEvent = {
        id: Date.now().toString(),
        type: "copy_attempt",
        description: violationTypes.copy_attempt.description,
        severity: violationTypes.copy_attempt.severity,
        timestamp: new Date(),
        penaltyPoints: violationTypes.copy_attempt.points
      };
      addViolation(violation);
    };

    const handlePaste = (e: Event) => {
      e.preventDefault();
      const violation: ViolationEvent = {
        id: Date.now().toString(),
        type: "paste_attempt",
        description: violationTypes.paste_attempt.description,
        severity: violationTypes.paste_attempt.severity,
        timestamp: new Date(),
        penaltyPoints: violationTypes.paste_attempt.points
      };
      addViolation(violation);
    };

    // Right-click detection
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      const violation: ViolationEvent = {
        id: Date.now().toString(),
        type: "right_click",
        description: violationTypes.right_click.description,
        severity: violationTypes.right_click.severity,
        timestamp: new Date(),
        penaltyPoints: violationTypes.right_click.points
      };
      addViolation(violation);
    };

    // Developer tools detection
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 or Ctrl+Shift+I/J/C
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        const violation: ViolationEvent = {
          id: Date.now().toString(),
          type: "dev_tools",
          description: violationTypes.dev_tools.description,
          severity: violationTypes.dev_tools.severity,
          timestamp: new Date(),
          penaltyPoints: violationTypes.dev_tools.points
        };
        addViolation(violation);
      }
    };

    // Window resize detection
    const handleResize = () => {
      const violation: ViolationEvent = {
        id: Date.now().toString(),
        type: "window_resize",
        description: violationTypes.window_resize.description,
        severity: violationTypes.window_resize.severity,
        timestamp: new Date(),
        penaltyPoints: violationTypes.window_resize.points
      };
      addViolation(violation);
    };

    // Add enhanced event listeners for better detection
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    window.addEventListener('blur', handleWindowBlur, { passive: true });
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize, { passive: true });

    // Store listeners globally to ensure persistence
    (window as any).securityListeners = {
      handleVisibilityChange,
      handleWindowBlur,
      handleCopy,
      handlePaste,
      handleContextMenu,
      handleKeyDown,
      handleResize
    };

    console.log('Security monitoring listeners attached'); // Debug log

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      
      // Clear global listeners
      delete (window as any).securityListeners;
      console.log('Security monitoring listeners removed'); // Debug log
    };
  }, []); // Empty dependency array ensures listeners are only attached once

  const addViolation = (violation: ViolationEvent) => {
    const newViolations = [violation, ...violations].slice(0, 20); // Keep last 20 violations
    const newTotal = Math.min(totalPenaltyPoints + violation.penaltyPoints, maxPenaltyPoints);
    const newScore = Math.max(0, 100 - (newTotal / maxPenaltyPoints) * 100);
    const newLevel = newTotal >= thresholds.critical ? "critical" :
                     newTotal >= thresholds.danger ? "danger" :
                     newTotal >= thresholds.warning ? "warning" : "safe";
    
    // Update all state
    setViolations(newViolations);
    setTotalPenaltyPoints(newTotal);
    setSecurityScore(newScore);
    setWarningLevel(newLevel);
    
    // Save to sessionStorage
    saveDataToSession(newViolations, newTotal, newScore, newLevel);
    
    // Check threshold
    if (newTotal >= maxPenaltyPoints) {
      onViolationThresholdReached?.();
    }
  };

  const updateSecurityScore = (points: number) => {
    const score = Math.max(0, 100 - (points / maxPenaltyPoints) * 100);
    setSecurityScore(score);
  };

  const updateWarningLevel = (points: number) => {
    if (points >= thresholds.critical) {
      setWarningLevel("critical");
    } else if (points >= thresholds.danger) {
      setWarningLevel("danger");
    } else if (points >= thresholds.warning) {
      setWarningLevel("warning");
    } else {
      setWarningLevel("safe");
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case "tab_switch": return <Monitor className="h-4 w-4" />;
      case "copy_attempt":
      case "paste_attempt": return <Keyboard className="h-4 w-4" />;
      case "dev_tools": return <Shield className="h-4 w-4" />;
      case "right_click": return <MousePointer className="h-4 w-4" />;
      case "fullscreen_exit": return <Monitor className="h-4 w-4" />;
      case "suspicious_timing": return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWarningColor = (level: string) => {
    switch (level) {
      case "safe": return "text-green-600 bg-green-50 border-green-200";
      case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "danger": return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Security Status Overview */}
      <Card className={`border-2 ${getWarningColor(warningLevel)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Monitor
            </div>
            <Badge variant={
              warningLevel === "safe" ? "default" :
              warningLevel === "warning" ? "secondary" :
              warningLevel === "danger" ? "destructive" : "destructive"
            }>
              {warningLevel.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                securityScore >= 80 ? "text-green-600" :
                securityScore >= 60 ? "text-yellow-600" :
                securityScore >= 40 ? "text-orange-600" : "text-red-600"
              }`}>
                {securityScore.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Security Score</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                totalPenaltyPoints < thresholds.warning ? "text-green-600" :
                totalPenaltyPoints < thresholds.danger ? "text-yellow-600" :
                totalPenaltyPoints < thresholds.critical ? "text-orange-600" : "text-red-600"
              }`}>
                {totalPenaltyPoints}
              </div>
              <p className="text-sm text-muted-foreground">Penalty Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{violations.length}</div>
              <p className="text-sm text-muted-foreground">Total Violations</p>
            </div>
          </div>

          {/* Penalty Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Penalty Points</span>
              <span>{totalPenaltyPoints}/{maxPenaltyPoints}</span>
            </div>
            <Progress 
              value={(totalPenaltyPoints / maxPenaltyPoints) * 100} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Safe</span>
              <span>Warning ({thresholds.warning})</span>
              <span>Danger ({thresholds.danger})</span>
              <span>Critical ({thresholds.critical})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Messages */}
      {warningLevel !== "safe" && (
        <Alert className={getWarningColor(warningLevel)}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {warningLevel === "warning" && "Unusual activity detected. Please follow test guidelines."}
            {warningLevel === "danger" && "Multiple violations detected. Your test may be flagged for review."}
            {warningLevel === "critical" && "Critical violation threshold reached. Test may be automatically submitted."}
          </AlertDescription>
        </Alert>
      )}

      {/* Active Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Active Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Tab Focus</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Copy/Paste Block</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>DevTools Detection</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Fullscreen Monitor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No violations detected. Keep up the good work!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.slice(0, 5).map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getViolationIcon(violation.type)}
                    <div>
                      <p className="font-medium text-sm">{violation.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {violation.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={getSeverityColor(violation.severity)}
                    >
                      {violation.severity}
                    </Badge>
                    <span className="text-sm font-medium">
                      +{violation.penaltyPoints} pts
                    </span>
                  </div>
                </div>
              ))}
              
              {violations.length > 5 && (
                <Button variant="outline" size="sm" className="w-full">
                  View All Violations ({violations.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Penalty Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Prohibited Actions:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Switching to other browser tabs</li>
                <li>• Copying or pasting content</li>
                <li>• Opening developer tools</li>
                <li>• Exiting fullscreen mode</li>
                <li>• Using browser navigation buttons</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Penalty Thresholds:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Warning: {thresholds.warning} points</li>
                <li>• Danger: {thresholds.danger} points</li>
                <li>• Critical: {thresholds.critical} points</li>
                <li>• Auto-submit: {maxPenaltyPoints} points</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}