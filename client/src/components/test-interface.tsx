import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useProctoring } from "@/hooks/use-proctoring";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Minus, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { CodingQuestion } from "./coding-question";
import { ProctoringDashboard } from "./proctoring-dashboard";

interface TestInterfaceProps {
  test: any;
  questions: any[];
  onTestCompleted?: (resultId: number) => void;
}

export function TestInterface({ test, questions, onTestCompleted }: TestInterfaceProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(test.duration * 60); // Convert to seconds
  const [session, setSession] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);

  const { proctoringEvents, logProctoringEvent } = useProctoring();

  // Create test session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sessions", {
        testId: test.id,
        totalQuestions: questions.length,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create session');
      }
      
      return await res.json();
    },
    onSuccess: (newSession) => {
      setSession(newSession);
    },
    onError: (error: any) => {
      console.error("Session creation error:", error);
      if (error.message.includes("already completed")) {
        // Redirect to dashboard with message
        alert("This test has already been completed. Retaking tests is not allowed.");
        setLocation("/employee-dashboard");
      } else {
        alert(`Failed to start test: ${error.message}`);
      }
    },
  });

  // Submit test
  const submitTestMutation = useMutation({
    mutationFn: async (finalAnswers: Record<number, string>) => {
      if (!session) {
        throw new Error("Test session not initialized. Please refresh and try again.");
      }

      // Calculate score
      let correctAnswers = 0;
      questions.forEach((question, index) => {
        if (finalAnswers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = correctAnswers;
      const percentage = Math.round((correctAnswers / questions.length) * 100);
      const passed = percentage >= test.passingScore;

      // Update session
      await apiRequest("PUT", `/api/sessions/${session.id}`, {
        completedAt: new Date(),
        timeSpent: Math.ceil((test.duration * 60 - timeLeft) / 60),
        score,
        totalQuestions: questions.length,
        correctAnswers,
        answers: finalAnswers,
        status: "completed",
      });

      // Create result and return it for feedback collection
      const res = await apiRequest("POST", "/api/results", {
        sessionId: session.id,
        testId: test.id,
        score,
        percentage,
        passed,
        timeSpent: Math.ceil((test.duration * 60 - timeLeft) / 60),
        detailedResults: questions.map((question, index) => ({
          questionId: question.id,
          userAnswer: finalAnswers[index],
          correctAnswer: question.correctAnswer,
          isCorrect: finalAnswers[index] === question.correctAnswer,
        })),
      });
      
      const result = await res.json();
      return result;
    },
    onSuccess: (result) => {
      console.log("Test completed with result ID:", result?.id);
      
      // Show completion modal instead of immediate redirect
      if (onTestCompleted && result?.id) {
        onTestCompleted(result.id);
      }
    },
    onError: (error: any) => {
      console.error("Test submission error:", error);
      alert(`Failed to submit test: ${error.message}. Please try again.`);
    },
  });

  // Send proctoring events
  const logProctoringMutation = useMutation({
    mutationFn: async (event: any) => {
      if (!session) return;
      await apiRequest("POST", `/api/sessions/${session.id}/proctoring`, event);
    },
  });

  // Initialize session on mount
  useEffect(() => {
    createSessionMutation.mutate();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Log proctoring events
  useEffect(() => {
    if (proctoringEvents.length > 0 && session) {
      const latestEvent = proctoringEvents[proctoringEvents.length - 1];
      logProctoringMutation.mutate(latestEvent);
    }
  }, [proctoringEvents, session]);

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Prevent multiple submissions
    if (submitTestMutation.isPending) {
      return;
    }
    
    // Automatically save all responses and submit the test
    submitTestMutation.mutate(answers);
  };

  const handleMarkForReview = () => {
    const newMarked = new Set(markedForReview);
    if (markedForReview.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
    } else {
      newMarked.add(currentQuestion);
    }
    setMarkedForReview(newMarked);
  };

  const handleToggleQuestionPalette = () => {
    setShowQuestionPalette(!showQuestionPalette);
  };

  const goToQuestion = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
    setShowQuestionPalette(false);
  };

  const getQuestionStatus = (index: number) => {
    if (answers[index] !== undefined) {
      return markedForReview.has(index) ? "answered-review" : "answered";
    }
    return markedForReview.has(index) ? "review" : "unanswered";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (createSessionMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Preparing your test...</h2>
          <p className="text-muted-foreground">Please wait while we set up your assessment.</p>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center space-x-4">
          <div>
            <p className="font-medium">{test.title}</p>
            <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time Remaining</p>
            <p className={`font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-foreground'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMinimized(false)}
          >
            Restore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 flex flex-col relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orbs with morphing */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 backdrop-blur-3xl animate-morphing"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 backdrop-blur-3xl animate-slow-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 backdrop-blur-3xl animate-pulsing-glow"></div>
        
        {/* Dynamic floating elements with complex animations */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-blue-300/20 backdrop-blur-xl animate-wave"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-purple-300/15 backdrop-blur-xl animate-morphing"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-indigo-300/25 backdrop-blur-xl animate-spiral"></div>
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-cyan-300/20 backdrop-blur-xl animate-float-reverse"></div>
        <div className="absolute top-10 left-1/2 w-36 h-36 rounded-full bg-blue-400/15 backdrop-blur-xl animate-flowing"></div>
        <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-purple-400/20 backdrop-blur-xl animate-wave"></div>
        
        {/* Enhanced sparkle particles with varied animations */}
        <div className="absolute top-16 right-16 w-3 h-3 rounded-full bg-white/60 animate-twinkle"></div>
        <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-blue-200/80 animate-spiral"></div>
        <div className="absolute bottom-20 right-1/3 w-4 h-4 rounded-full bg-purple-200/70 animate-twinkle-fast"></div>
        <div className="absolute top-3/4 left-16 w-2 h-2 rounded-full bg-cyan-200/90 animate-wave"></div>
        <div className="absolute bottom-1/4 right-20 w-3 h-3 rounded-full bg-indigo-200/60 animate-pulsing-glow"></div>
        <div className="absolute top-40 right-1/4 w-2 h-2 rounded-full bg-white/70 animate-flowing"></div>
        <div className="absolute bottom-40 left-1/3 w-3 h-3 rounded-full bg-blue-300/60 animate-spiral"></div>
        <div className="absolute top-60 left-10 w-2 h-2 rounded-full bg-purple-300/80 animate-twinkle-slow"></div>
        
        {/* Additional flowing elements */}
        <div className="absolute top-0 left-10 w-20 h-20 rounded-full bg-blue-200/30 backdrop-blur-lg animate-flowing" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-0 right-10 w-16 h-16 rounded-full bg-purple-200/25 backdrop-blur-lg animate-flowing" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-0 left-1/3 w-24 h-24 rounded-full bg-indigo-200/20 backdrop-blur-lg animate-flowing" style={{animationDelay: '6s'}}></div>
      </div>
      {/* Test Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border-b border-white/20 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{test.title}</h1>
            <p className="text-sm text-gray-600 font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to exit the test? Your progress will be lost.")) {
                  setLocation("/employee-dashboard");
                }
              }}
              style={{
                backgroundColor: '#DC2626 !important',
                color: 'white !important',
                border: '1px solid #DC2626 !important',
                minHeight: '40px',
                fontWeight: '500'
              }}
            >
              Exit Test
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-foreground'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* Proctoring Alert */}
      {proctoringEvents.length > 0 && (
        <Alert className="mx-6 mt-4 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Warning: Tab switching detected. Please stay focused on the test.
          </AlertDescription>
        </Alert>
      )}
      {/* Question Content - Centered */}
      <div className="flex-1 flex items-center justify-center py-8 px-6 relative z-10 bg-[#080944]">
        <div className="w-full max-w-4xl question-container bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30">
          {currentQ?.type === "coding" ? (
            <CodingQuestion
              question={currentQ}
              onAnswerChange={handleAnswerChange}
              currentAnswer={answers[currentQuestion]}
            />
          ) : currentQ?.type === "fill-blank" || currentQ?.type === "direct-qa" || currentQ?.type === "scenario" || !currentQ?.options || !Array.isArray(currentQ.options) ? (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-6">
                {currentQ?.question}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-answer" className="text-sm font-medium text-foreground">
                    Your Answer:
                  </Label>
                  <textarea
                    id="text-answer"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-full mt-2 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={8}
                    placeholder="Type your answer here..."
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {answers[currentQuestion]?.length || 0} characters
                </div>
              </div>
            </>
          ) : (
            <div className="p-10">
              <div className="mb-10 text-center">
                <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                  {currentQ?.question}
                </h3>
              </div>

              <div className="space-y-4 max-w-3xl mx-auto">
                {Array.isArray(currentQ?.options) && currentQ.options.map((option: string, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => handleAnswerChange(option)}
                    className={`simple-option ${answers[currentQuestion] === option ? 'selected' : ''} transform hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="option-radio">
                      {answers[currentQuestion] === option && <div className="radio-dot"></div>}
                    </div>
                    <div className="option-label">
                      <span className="option-letter-simple text-lg font-bold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="option-text-simple text-lg">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Navigation */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border-t border-white/20 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              backgroundColor: 'transparent',
              color: '#3B82F6',
              border: '1px solid #3B82F6',
              minHeight: '40px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-3">
            <Button 
              variant={markedForReview.has(currentQuestion) ? "default" : "outline"}
              size="sm"
              onClick={handleMarkForReview}
              className={markedForReview.has(currentQuestion) ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
            >
              {markedForReview.has(currentQuestion) ? "Marked ✓" : "Mark for Review"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleQuestionPalette}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Question Palette
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {currentQuestion < questions.length - 1 && (
              <Button
                onClick={handleNext}
                style={{
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: '1px solid #3B82F6',
                  minHeight: '40px',
                  fontWeight: '500'
                }}
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            
            {/* Submit button - always available */}
            <Button
              onClick={handleSubmit}
              disabled={submitTestMutation.isPending}
              style={{
                backgroundColor: '#16A34A',
                color: 'white',
                border: '1px solid #16A34A',
                minHeight: '40px',
                fontWeight: '500'
              }}
            >
              {submitTestMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving & Submitting...</span>
                </>
              ) : (
                <span>Save & Submit</span>
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Question Palette Overlay */}
      {showQuestionPalette && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleToggleQuestionPalette}>
          <div className="bg-background border border-border rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Question Palette</h3>
              <Button variant="ghost" size="sm" onClick={handleToggleQuestionPalette}>
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-8 gap-2 mb-4">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                const isCurrentQuestion = index === currentQuestion;
                
                return (
                  <Button
                    key={index}
                    variant={isCurrentQuestion ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToQuestion(index)}
                    className={`
                      w-12 h-12 text-sm font-medium
                      ${status === "answered" ? "bg-green-100 border-green-300 text-green-800 hover:bg-green-200" : ""}
                      ${status === "review" ? "bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200" : ""}
                      ${status === "answered-review" ? "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200" : ""}
                      ${status === "unanswered" ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200" : ""}
                      ${isCurrentQuestion ? "ring-2 ring-primary ring-offset-2" : ""}
                    `}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
                <span>Answered + Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                <span>Unanswered</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Answered: {Object.keys(answers).length}</span>
                <span>Marked for Review: {markedForReview.size}</span>
                <span>Total: {questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
