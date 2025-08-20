import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { AIProctor } from "@/components/ai-proctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  FileQuestion,
  Monitor,
  Shield,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  Flag
} from "lucide-react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Question {
  id: number;
  type: string;
  question: string;
  options?: Record<string, string>;
  codeLanguage?: string;
  timeLimit?: number;
  difficulty: string;
}

interface TestSession {
  id: number;
  testId: number;
  userId: number;
  startedAt: Date;
  timeLimit: number;
  questions: Question[];
}

export default function TestTakingInterface() {
  const { testId } = useParams<{ testId: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: testSession, isLoading } = useQuery({
    queryKey: ["/api/test-session", testId],
    enabled: !!testId,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/questions", testId],
    enabled: !!testId,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answerData: any) => {
      const res = await apiRequest("POST", "/api/test-sessions/answer", answerData);
      return res.json();
    },
    onSuccess: () => {
      // Answer saved successfully
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to save answer", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const submitTestMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      const res = await apiRequest("POST", "/api/test-sessions/submit", submissionData);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Test submitted successfully!" });
      // Redirect to results page
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit test", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Auto-submit on proctoring violations
  useEffect(() => {
    const handleAutoSubmit = () => {
      handleSubmitTest();
    };
    
    window.addEventListener("autoSubmitTest", handleAutoSubmit);
    return () => window.removeEventListener("autoSubmitTest", handleAutoSubmit);
  }, []);

  // Initialize test session
  useEffect(() => {
    if (testSession) {
      setSessionId(testSession.id);
      setTimeRemaining(testSession.timeLimit * 60); // Convert to seconds
    }
  }, [testSession]);

  // Start immediate security monitoring (automatic tab switch detection)
  useEffect(() => {
    if (testId) {
      console.log('Starting automatic security monitoring for test:', testId);
      
      // Enhanced tab switch detection
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log('Tab switch detected automatically:', new Date());
          
          // Store violation in sessionStorage for persistence
          const violations = JSON.parse(sessionStorage.getItem('securityViolations') || '[]');
          const newViolation = {
            type: 'tab_change',
            timestamp: new Date().toISOString(),
            severity: 'high', 
            details: 'Tab became hidden - automatic detection'
          };
          violations.push(newViolation);
          sessionStorage.setItem('securityViolations', JSON.stringify(violations));
          
          // Show immediate feedback
          toast({
            title: "Security Warning",
            description: "Tab switching detected. Stay focused on the test.",
            variant: "destructive"
          });
        }
      };

      // Enhanced window blur detection (Alt+Tab, etc.)
      const handleWindowBlur = () => {
        console.log('Window blur detected automatically:', new Date());
        
        const violations = JSON.parse(sessionStorage.getItem('securityViolations') || '[]');
        const newViolation = {
          type: 'window_blur',
          timestamp: new Date().toISOString(),
          severity: 'high',
          details: 'Window lost focus - automatic detection'
        };
        violations.push(newViolation);
        sessionStorage.setItem('securityViolations', JSON.stringify(violations));
        
        toast({
          title: "Security Warning",
          description: "Window switching detected. Please return to the test.",
          variant: "destructive"
        });
      };

      // Add listeners immediately when component mounts
      document.addEventListener('visibilitychange', handleVisibilityChange, true);
      window.addEventListener('blur', handleWindowBlur, true);
      
      // Cleanup on unmount
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange, true);
        window.removeEventListener('blur', handleWindowBlur, true);
      };
    }
  }, [testId, toast]);

  const handleAutoSubmit = () => {
    toast({
      title: "Time's up!",
      description: "Test has been automatically submitted.",
      variant: "destructive"
    });
    handleSubmitTest();
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Auto-save answer
    submitAnswerMutation.mutate({
      sessionId,
      questionId,
      answer
    });
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return newFlagged;
    });
  };

  const handleSubmitTest = () => {
    setIsSubmitting(true);
    submitTestMutation.mutate({
      sessionId,
      answers,
      submittedAt: new Date().toISOString()
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds > 600) return "text-green-600"; // > 10 minutes
    if (seconds > 300) return "text-orange-600"; // > 5 minutes
    return "text-red-600"; // < 5 minutes
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Test Not Available</h3>
            <p className="text-muted-foreground">This test is not currently available or you don't have permission to access it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      {/* AI Proctor Component */}
      {sessionId && (
        <AIProctor 
          testSessionId={sessionId}
          maxViolations={5}
          autoSubmitOnViolation={true}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Assessment in Progress</h1>
                <p className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-mono font-bold ${getTimeColor(timeRemaining)}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
                  <p className="text-xs text-muted-foreground">Answered</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{flaggedQuestions.size}</div>
                  <p className="text-xs text-muted-foreground">Flagged</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Progress: {Math.round(progress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Question Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={`h-10 relative ${
                      answers[questions[index]?.id] ? "bg-green-100 border-green-300" : ""
                    } ${
                      flaggedQuestions.has(questions[index]?.id) ? "bg-orange-100 border-orange-300" : ""
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                    {answers[questions[index]?.id] && (
                      <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                    {flaggedQuestions.has(questions[index]?.id) && (
                      <Flag className="h-3 w-3 absolute -top-1 -right-1 text-orange-600" />
                    )}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-muted-foreground rounded"></div>
                  <span>Not Visited</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Content */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentQuestion?.type === "coding" && <Code className="h-5 w-5 text-blue-500" />}
                  {currentQuestion?.type === "mcq" && <FileQuestion className="h-5 w-5 text-green-500" />}
                  <Badge variant="outline">{currentQuestion?.type.toUpperCase()}</Badge>
                  <Badge variant="secondary">{currentQuestion?.difficulty}</Badge>
                  {currentQuestion?.timeLimit && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {currentQuestion.timeLimit}min
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFlagQuestion(currentQuestion.id)}
                  className={flaggedQuestions.has(currentQuestion.id) ? "bg-orange-100" : ""}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.has(currentQuestion.id) ? "Unflag" : "Flag"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div>
                <h3 className="font-medium text-lg mb-4">{currentQuestion?.question}</h3>
              </div>

              {/* Answer Interface based on question type */}
              {currentQuestion?.type === "mcq" && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={`option-${key}`} />
                      <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">
                        {key}. {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion?.type === "coding" && (
                <div className="space-y-4">
                  <div>
                    <Label>Your Code Solution</Label>
                    <Textarea
                      placeholder={`Write your ${currentQuestion.codeLanguage || "code"} solution here...`}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="font-mono text-sm min-h-48"
                    />
                  </div>
                  {currentQuestion.codeLanguage && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Language: {currentQuestion.codeLanguage}</Badge>
                    </div>
                  )}
                </div>
              )}

              {currentQuestion?.type === "scenario" && (
                <div>
                  <Label>Your Answer</Label>
                  <Textarea
                    placeholder="Provide your detailed answer..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="min-h-32"
                  />
                </div>
              )}

              {currentQuestion?.type === "fill-blank" && (
                <div>
                  <Label>Fill in the blank</Label>
                  <Input
                    placeholder="Enter your answer..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  />
                </div>
              )}

              {/* Navigation and Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitTest}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Test"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mt-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800 dark:text-orange-200">AI Proctoring Active</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  This test is monitored for security. Avoid switching tabs, using developer tools, or leaving fullscreen mode.
                  Multiple violations may result in automatic test submission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}