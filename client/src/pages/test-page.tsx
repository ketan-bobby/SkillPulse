import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TestInterface } from "@/components/test-interface";
import { MobileResponsiveTest } from "@/components/mobile-responsive-test";
import { PenaltySystem } from "@/components/penalty-system";
import { AppHeader } from "@/components/app-header";
import { TestCompletionModal } from "@/components/test-completion-modal";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "@/components/feedback-form";
import { useAuth } from "@/hooks/use-auth";

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: test, isLoading, error } = useQuery({
    queryKey: [`/api/tests/${testId}`],
    enabled: !!testId,
  });

  const { data: questions = [] } = useQuery<any[]>({
    queryKey: [`/api/tests/${testId}/questions`],
    enabled: !!test && !!testId,
  });

  // All hooks must be called at the top level, before any early returns
  const [isMobile, setIsMobile] = useState(false);
  const [showPenaltySystem, setShowPenaltySystem] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [testResultId, setTestResultId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !test)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Test not found</h1>
            <p className="text-muted-foreground">The requested test could not be loaded.</p>
            <Button onClick={() => setLocation('/employee-dashboard')} className="mt-4">Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If test has no questions, show header with message
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Test Not Ready</h1>
            <p className="text-muted-foreground">This test has no questions yet. Please contact your administrator.</p>
            <Button onClick={() => setLocation('/employee-dashboard')}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  // These duplicate declarations have been moved to the top of the component

  const handleTestCompleted = async (resultId: number) => {
    console.log("Test completed with result ID:", resultId);
    setTestResultId(resultId);
    
    // Fetch the result details for the completion modal
    try {
      const res = await fetch(`/api/results/${resultId}`);
      if (res.ok) {
        const result = await res.json();
        setTestResult(result);
        setShowCompletionModal(true);
      }
    } catch (error) {
      console.error("Error fetching result:", error);
      // Fallback: redirect to dashboard
      setLocation("/employee-dashboard");
    }
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    // Redirect to employee dashboard
    window.location.href = '/employee-dashboard';
  };

  return (
    <div className="relative">
      {/* Test Completion Modal */}
      {showCompletionModal && testResult && (
        <TestCompletionModal
          result={testResult}
          testTitle={test?.title || "Assessment"}
          onClose={() => {
            setShowCompletionModal(false);
            setLocation("/employee-dashboard");
          }}
          onViewReport={() => {
            setShowCompletionModal(false);
            setLocation(`/reports/skill-gap/${user?.id}`);
          }}
        />
      )}

      {/* Feedback Form Modal */}
      {showFeedbackForm && testResultId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-8">
            <FeedbackForm 
              testId={parseInt(testId!)} 
              resultId={testResultId}
              onSubmitted={handleFeedbackSubmitted}
            />
          </div>
        </div>
      )}

      {/* Penalty System Overlay */}
      {showPenaltySystem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Security Monitor</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowPenaltySystem(false)}
              >
                Close
              </Button>
            </div>
            <PenaltySystem 
              onViolationThresholdReached={() => {
                // Auto-submit test when threshold reached
                console.log("Violation threshold reached - auto-submitting test");
              }}
            />
          </div>
        </div>
      )}

      {/* Main Test Interface */}
      {questions && questions.length > 0 && (
        isMobile ? (
          <MobileResponsiveTest 
            test={test} 
            questions={questions} 
            onTestCompleted={handleTestCompleted}
          />
        ) : (
          <TestInterface 
            test={test} 
            questions={questions} 
            onTestCompleted={handleTestCompleted}
          />
        )
      )}

      {/* Security Monitor Button */}
      <Button
        className="fixed bottom-4 right-4 z-40"
        variant="outline"
        size="sm"
        onClick={() => setShowPenaltySystem(!showPenaltySystem)}
      >
        Security Monitor
      </Button>
    </div>
  );
}
