import { useState, useEffect } from "react";

interface ProctoringEvent {
  eventType: string;
  timestamp: number;
  details?: any;
  severity: "low" | "medium" | "high";
  description: string;
}

export function useProctoring() {
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const maxTabSwitches = 3;

  const logProctoringEvent = (eventType: string, details?: any) => {
    const event: ProctoringEvent = {
      eventType,
      timestamp: Date.now(),
      details,
    };
    
    setProctoringEvents(prev => [...prev, event]);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          
          if (newCount <= maxTabSwitches) {
            logProctoringEvent("tab_switch", {
              count: newCount,
              timestamp: Date.now(),
            });
          }
          
          return newCount;
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      logProctoringEvent("page_unload_attempt", {
        timestamp: Date.now(),
      });
      
      // Removed annoying popup - let users navigate freely after test completion
      // e.preventDefault();
      // e.returnValue = "Are you sure you want to leave? Your test progress may be lost.";
      // return e.returnValue;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logProctoringEvent("context_menu_attempt", {
        timestamp: Date.now(),
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts that could be used to cheat
      if (
        e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 't') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        logProctoringEvent("restricted_key_attempt", {
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          timestamp: Date.now(),
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    proctoringEvents,
    tabSwitchCount,
    maxTabSwitches,
    logProctoringEvent,
  };
}
