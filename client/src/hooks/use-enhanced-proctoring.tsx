import { useState, useEffect, useRef } from "react";

interface ProctoringEvent {
  eventType: string;
  timestamp: number;
  details?: any;
  severity: "low" | "medium" | "high";
  description: string;
}

interface ProctoringConfig {
  maxTabSwitches: number;
  maxFullscreenExits: number;
  maxCopyPasteAttempts: number;
  enableKeylogging: boolean;
  enableMouseTracking: boolean;
  enableDevToolsDetection: boolean;
  autoSubmitOnViolation: boolean;
}

export function useEnhancedProctoring(config: Partial<ProctoringConfig> = {}) {
  const defaultConfig: ProctoringConfig = {
    maxTabSwitches: 3,
    maxFullscreenExits: 2,
    maxCopyPasteAttempts: 5,
    enableKeylogging: false,
    enableMouseTracking: true,
    enableDevToolsDetection: true,
    autoSubmitOnViolation: false,
    ...config
  };

  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [violations, setViolations] = useState({
    tabSwitches: 0,
    fullscreenExits: 0,
    copyPasteAttempts: 0,
    devToolsOpened: 0,
    mouseLeaves: 0,
    suspiciousKeystrokes: 0,
    rightClicks: 0
  });
  
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const devToolsDetector = useRef<number>();
  const lastActivityTime = useRef(Date.now());

  const logEvent = (
    eventType: string, 
    details?: any, 
    severity: "low" | "medium" | "high" = "medium", 
    description: string = ""
  ) => {
    const event: ProctoringEvent = {
      eventType,
      timestamp: Date.now(),
      details,
      severity,
      description,
    };
    setEvents(prev => [...prev, event]);
    
    // Update last activity
    lastActivityTime.current = Date.now();
  };

  const addWarning = (message: string) => {
    setWarnings(prev => [...prev, message]);
    
    // Auto-remove warning after 10 seconds
    setTimeout(() => {
      setWarnings(prev => prev.filter(w => w !== message));
    }, 10000);
  };

  const checkViolationLimits = () => {
    if (violations.tabSwitches >= defaultConfig.maxTabSwitches) {
      addWarning(`Too many tab switches (${violations.tabSwitches}/${defaultConfig.maxTabSwitches})`);
      if (defaultConfig.autoSubmitOnViolation) {
        setIsBlocked(true);
      }
    }
    
    if (violations.fullscreenExits >= defaultConfig.maxFullscreenExits) {
      addWarning(`Too many fullscreen exits (${violations.fullscreenExits}/${defaultConfig.maxFullscreenExits})`);
    }
    
    if (violations.copyPasteAttempts >= defaultConfig.maxCopyPasteAttempts) {
      addWarning(`Too many copy/paste attempts (${violations.copyPasteAttempts}/${defaultConfig.maxCopyPasteAttempts})`);
    }
  };

  useEffect(() => {
    // Tab switching detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
        logEvent("tab_switch", { count: violations.tabSwitches + 1 }, "high", "User switched away from test tab");
      }
    };

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setViolations(prev => ({ ...prev, fullscreenExits: prev.fullscreenExits + 1 }));
        logEvent("fullscreen_exit", { count: violations.fullscreenExits + 1 }, "medium", "User exited fullscreen mode");
      }
    };

    // Copy/paste detection
    const handleCopy = (e: ClipboardEvent) => {
      setViolations(prev => ({ ...prev, copyPasteAttempts: prev.copyPasteAttempts + 1 }));
      logEvent("copy_attempt", { text: e.clipboardData?.getData('text') || "" }, "medium", "Copy operation detected");
      e.preventDefault();
    };

    const handlePaste = (e: ClipboardEvent) => {
      setViolations(prev => ({ ...prev, copyPasteAttempts: prev.copyPasteAttempts + 1 }));
      logEvent("paste_attempt", { text: e.clipboardData?.getData('text') || "" }, "high", "Paste operation detected");
      e.preventDefault();
    };

    // Right-click prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setViolations(prev => ({ ...prev, rightClicks: prev.rightClicks + 1 }));
      logEvent("right_click", { x: e.clientX, y: e.clientY }, "low", "Right-click attempted");
    };

    // Keyboard monitoring
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent developer tools and other shortcuts
      const blockedKeys = [
        'F12', // Developer tools
        'F5',  // Refresh
        'F3',  // Find
      ];
      
      const blockedCombinations = [
        { ctrl: true, key: 'u' },      // View source
        { ctrl: true, key: 'j' },      // Console
        { ctrl: true, key: 's' },      // Save page
        { ctrl: true, key: 'a' },      // Select all
        { ctrl: true, key: 'c' },      // Copy
        { ctrl: true, key: 'v' },      // Paste
        { ctrl: true, key: 'x' },      // Cut
        { ctrl: true, key: 'z' },      // Undo
        { ctrl: true, key: 'y' },      // Redo
        { ctrl: true, key: 't' },      // New tab
        { ctrl: true, key: 'w' },      // Close tab
        { ctrl: true, key: 'r' },      // Refresh
        { ctrl: true, shift: true, key: 'I' }, // Dev tools
        { ctrl: true, shift: true, key: 'J' }, // Console
        { ctrl: true, shift: true, key: 'C' }, // Inspect
        { alt: true, key: 'Tab' },     // Alt+Tab
      ];

      if (blockedKeys.includes(e.key) || 
          blockedCombinations.some(combo => 
            (!combo.ctrl || e.ctrlKey) && 
            (!combo.shift || e.shiftKey) && 
            (!combo.alt || e.altKey) && 
            combo.key.toLowerCase() === e.key.toLowerCase()
          )) {
        e.preventDefault();
        setViolations(prev => ({ ...prev, suspiciousKeystrokes: prev.suspiciousKeystrokes + 1 }));
        logEvent("blocked_keystroke", { key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey }, "high", "Attempted restricted keystroke");
      }

      // Log all keystrokes if enabled (for pattern analysis)
      if (defaultConfig.enableKeylogging && !e.ctrlKey && !e.altKey && !e.metaKey) {
        logEvent("keystroke", { key: e.key, timestamp: Date.now() }, "low", "Keystroke logged");
      }
    };

    // Mouse leave detection
    const handleMouseLeave = () => {
      setViolations(prev => ({ ...prev, mouseLeaves: prev.mouseLeaves + 1 }));
      logEvent("mouse_leave", { count: violations.mouseLeaves + 1 }, "low", "Mouse left window area");
    };

    // Page unload prevention
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      logEvent("page_unload_attempt", {}, "high", "Attempted to leave test page");
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your test will be submitted automatically.";
      return e.returnValue;
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Dev tools detection (advanced)
    if (defaultConfig.enableDevToolsDetection) {
      const detectDevTools = () => {
        const startTime = performance.now();
        debugger;
        const endTime = performance.now();
        
        if (endTime - startTime > 100) {
          setViolations(prev => ({ ...prev, devToolsOpened: prev.devToolsOpened + 1 }));
          logEvent("dev_tools_detected", { detectionTime: endTime - startTime }, "high", "Developer tools detected");
        }
      };

      // Check for dev tools every 2 seconds
      devToolsDetector.current = window.setInterval(detectDevTools, 2000);
    }

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      if (devToolsDetector.current) {
        clearInterval(devToolsDetector.current);
      }
    };
  }, [violations]);

  // Check violation limits whenever violations change
  useEffect(() => {
    checkViolationLimits();
  }, [violations]);

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      logEvent("fullscreen_requested", {}, "low", "Fullscreen mode requested");
    }
  };

  const getSecurityScore = () => {
    const totalViolations = Object.values(violations).reduce((sum, count) => sum + count, 0);
    const maxScore = 100;
    const deduction = Math.min(totalViolations * 5, maxScore);
    return Math.max(0, maxScore - deduction);
  };

  const getSuspiciousActivities = () => {
    return events.filter(e => e.severity === "high").length;
  };

  return {
    events,
    violations,
    warnings,
    isBlocked,
    logEvent,
    requestFullscreen,
    getSecurityScore,
    getSuspiciousActivities,
    config: defaultConfig,
  };
}