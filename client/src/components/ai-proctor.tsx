import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProctorEvent {
  type: "screen_switch" | "tab_change" | "window_blur" | "copy_attempt" | "paste_attempt" | "dev_tools";
  timestamp: Date;
  severity: "low" | "medium" | "high";
  details?: string;
}

interface ProctorProps {
  testSessionId: number;
  onViolation?: (event: ProctorEvent) => void;
  maxViolations?: number;
  autoSubmitOnViolation?: boolean;
}

export function AIProctor({ 
  testSessionId, 
  onViolation, 
  maxViolations = 5,
  autoSubmitOnViolation = true 
}: ProctorProps) {
  const [isActive, setIsActive] = useState(false);
  const [violations, setViolations] = useState<ProctorEvent[]>([]);
  const [securityScore, setSecurityScore] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  
  const lastBlurTime = useRef<number>(0);
  const violationCount = useRef<number>(0);

  const logViolation = async (event: ProctorEvent) => {
    setViolations(prev => [...prev, event]);
    violationCount.current += 1;
    
    // Update security score
    const penalty = event.severity === "high" ? 20 : event.severity === "medium" ? 10 : 5;
    setSecurityScore(prev => Math.max(0, prev - penalty));
    
    // Store in sessionStorage for persistence across components
    const allViolations = JSON.parse(sessionStorage.getItem('securityViolations') || '[]');
    allViolations.push(event);
    sessionStorage.setItem('securityViolations', JSON.stringify(allViolations));
    
    // Log to backend
    try {
      await apiRequest("POST", "/api/test-sessions/proctor-event", {
        sessionId: testSessionId,
        eventType: event.type,
        severity: event.severity,
        timestamp: event.timestamp.toISOString(),
        details: event.details
      });
    } catch (error) {
      console.error("Failed to log proctoring event:", error);
    }
    
    // Show warning to user
    toast({
      title: "Security Warning",
      description: getViolationMessage(event.type),
      variant: "destructive"
    });
    
    // Call parent handler
    onViolation?.(event);
    
    // Auto-submit if threshold reached
    if (autoSubmitOnViolation && violationCount.current >= maxViolations) {
      toast({
        title: "Test Auto-Submitted",
        description: "Too many security violations detected. Test has been automatically submitted.",
        variant: "destructive"
      });
      // Trigger test submission
      window.dispatchEvent(new CustomEvent("autoSubmitTest"));
    }
  };

  const getViolationMessage = (type: string): string => {
    switch (type) {
      case "screen_switch": return "Screen switching detected. Stay focused on the test.";
      case "tab_change": return "Tab switching is not allowed during the test.";
      case "window_blur": return "Switching windows is not permitted.";
      case "copy_attempt": return "Copying content is disabled during the test.";
      case "paste_attempt": return "Pasting content is not allowed.";
      case "dev_tools": return "Developer tools are not permitted during the test.";
      default: return "Suspicious activity detected.";
    }
  };

  const startProctoring = () => {
    setIsActive(true);
    console.log('AI Proctor activated');
    
    // Load existing violations from sessionStorage
    const existingViolations = JSON.parse(sessionStorage.getItem('securityViolations') || '[]');
    setViolations(existingViolations);
    
    // Calculate security score based on existing violations
    const totalPenalty = existingViolations.reduce((sum: number, v: ProctorEvent) => {
      return sum + (v.severity === "high" ? 20 : v.severity === "medium" ? 10 : 5);
    }, 0);
    setSecurityScore(Math.max(0, 100 - totalPenalty));
    violationCount.current = existingViolations.length;
    
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        logViolation({
          type: "screen_switch",
          timestamp: new Date(),
          severity: "medium",
          details: "Failed to enter fullscreen mode"
        });
      });
    }
  };

  const stopProctoring = () => {
    setIsActive(false);
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    if (!isActive) return;

    // Sync with sessionStorage violations on component mount
    const syncViolations = () => {
      const storedViolations = JSON.parse(sessionStorage.getItem('securityViolations') || '[]');
      setViolations(storedViolations);
      violationCount.current = storedViolations.length;
      
      const totalPenalty = storedViolations.reduce((sum: number, v: ProctorEvent) => {
        return sum + (v.severity === "high" ? 20 : v.severity === "medium" ? 10 : 5);
      }, 0);
      setSecurityScore(Math.max(0, 100 - totalPenalty));
    };
    
    syncViolations();

    // Window blur detection (screen switch/alt-tab)
    const handleWindowBlur = () => {
      const now = Date.now();
      if (now - lastBlurTime.current > 2000) { // Debounce rapid blur events
        lastBlurTime.current = now;
        logViolation({
          type: "window_blur",
          timestamp: new Date(),
          severity: "high",
          details: "Window lost focus - AI Proctor detection"
        });
      }
    };

    // Visibility change detection (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation({
          type: "tab_change",
          timestamp: new Date(),
          severity: "high",
          details: "Tab became hidden - AI Proctor detection"
        });
      }
    };

    // Fullscreen change detection
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && isActive) {
        logViolation({
          type: "screen_switch",
          timestamp: new Date(),
          severity: "high",
          details: "Exited fullscreen mode"
        });
      }
    };

    // Copy/paste prevention
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation({
        type: "copy_attempt",
        timestamp: new Date(),
        severity: "medium",
        details: "Attempted to copy content"
      });
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation({
        type: "paste_attempt",
        timestamp: new Date(),
        severity: "medium",
        details: "Attempted to paste content"
      });
    };

    // Keyboard shortcuts prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent developer tools
      if (e.key === "F12" || 
          (e.ctrlKey && e.shiftKey && e.key === "I") ||
          (e.ctrlKey && e.shiftKey && e.key === "C") ||
          (e.ctrlKey && e.key === "U")) {
        e.preventDefault();
        logViolation({
          type: "dev_tools",
          timestamp: new Date(),
          severity: "high",
          details: "Attempted to open developer tools"
        });
      }
      
      // Prevent common shortcuts
      if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "a")) {
        e.preventDefault();
        logViolation({
          type: e.key === "c" ? "copy_attempt" : e.key === "v" ? "paste_attempt" : "copy_attempt",
          timestamp: new Date(),
          severity: "medium",
          details: `Keyboard shortcut blocked: Ctrl+${e.key.toUpperCase()}`
        });
      }
    };

    // Right-click prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Add event listeners
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive, testSessionId]);

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${isActive ? "text-green-500" : "text-gray-400"}`} />
            AI Proctor
          </div>
          <Badge variant={securityScore > 80 ? "default" : securityScore > 50 ? "secondary" : "destructive"}>
            Score: {securityScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status:</span>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Violations:</span>
          <Badge variant={violations.length > 3 ? "destructive" : "secondary"}>
            {violations.length}/{maxViolations}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Fullscreen:</span>
          <Badge variant={isFullscreen ? "default" : "destructive"}>
            {isFullscreen ? "Active" : "Disabled"}
          </Badge>
        </div>
        
        {!isActive ? (
          <Button onClick={startProctoring} className="w-full" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Start Proctoring
          </Button>
        ) : (
          <Button onClick={stopProctoring} variant="outline" className="w-full" size="sm">
            Stop Proctoring
          </Button>
        )}
        
        {violations.length > 0 && (
          <div className="mt-3 space-y-1">
            <h4 className="text-xs font-medium">Recent Violations:</h4>
            <div className="max-h-20 overflow-y-auto space-y-1">
              {violations.slice(-3).map((violation, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <AlertTriangle className={`h-3 w-3 ${
                    violation.severity === "high" ? "text-red-500" : 
                    violation.severity === "medium" ? "text-orange-500" : "text-yellow-500"
                  }`} />
                  <span className="truncate">{violation.type.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}