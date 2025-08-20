import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  Clock, 
  FileText,
  MessageSquare,
  ChevronRight,
  Award
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TestCompletionModalProps {
  result: any;
  testTitle: string;
  onClose: () => void;
  onViewReport: () => void;
}

export function TestCompletionModal({ result, testTitle, onClose, onViewReport }: TestCompletionModalProps) {
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const res = await apiRequest("POST", "/api/feedback", feedbackData);
      return res.json();
    },
    onSuccess: () => {
      setFeedbackSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  });

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return;
    
    submitFeedbackMutation.mutate({
      testId: result.testId,
      resultId: result.id,
      rating: 5, // Default good rating
      feedback: feedback.trim(),
      category: "test_experience"
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return "Exceptional";
    if (percentage >= 80) return "Excellent";
    if (percentage >= 70) return "Good";
    if (percentage >= 60) return "Fair";
    return "Needs Improvement";
  };

  if (feedbackSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md beautiful-card">
          <CardContent className="p-8 text-center">
            <div className="icon-container mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-4">Your feedback has been submitted successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="beautiful-card">
          <CardHeader className="text-center border-b border-gray-100 p-8">
            <div className="icon-container mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              🎉 Test Completed Successfully!
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Thank you for completing the <span className="font-semibold">{testTitle}</span> assessment
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {!showFeedbackForm ? (
              <div className="space-y-8">
                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="beautiful-card text-center">
                    <CardContent className="p-6">
                      <div className="icon-container mx-auto mb-3">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className={`text-3xl font-bold mb-1 ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </CardContent>
                  </Card>

                  <Card className="beautiful-card text-center">
                    <CardContent className="p-6">
                      <div className="icon-container mx-auto mb-3">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {getPerformanceLevel(result.percentage)}
                      </div>
                      <p className="text-sm text-gray-600">Performance</p>
                    </CardContent>
                  </Card>

                  <Card className="beautiful-card text-center">
                    <CardContent className="p-6">
                      <div className="icon-container mx-auto mb-3">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {result.timeSpent} min
                      </div>
                      <p className="text-sm text-gray-600">Time Spent</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Pass/Fail Status */}
                <div className="text-center">
                  <Badge 
                    variant={result.passed ? "default" : "destructive"}
                    className="text-base px-6 py-2"
                  >
                    {result.passed ? "✅ PASSED" : "❌ NOT PASSED"}
                  </Badge>
                </div>

                {/* Next Steps */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">What's Next?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="beautiful-card hover:scale-[1.02] transition-all cursor-pointer" onClick={onViewReport}>
                        <CardContent className="p-6 text-center">
                          <div className="icon-container mx-auto mb-3">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2">View Detailed Report</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Get comprehensive skill gap analysis with personalized recommendations
                          </p>
                          <Button variant="outline" size="sm" className="w-full">
                            View Report <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="beautiful-card hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setShowFeedbackForm(true)}>
                        <CardContent className="p-6 text-center">
                          <div className="icon-container mx-auto mb-3">
                            <MessageSquare className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2">Share Feedback</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Help us improve the assessment experience
                          </p>
                          <Button variant="outline" size="sm" className="w-full">
                            Provide Feedback <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Auto-generated Report Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          Skill Gap Analysis Generated
                        </h4>
                        <p className="text-sm text-blue-700">
                          Your personalized skill gap report has been automatically generated and includes:
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• Detailed performance analysis with security monitoring data</li>
                          <li>• Industry benchmarking and salary positioning</li>
                          <li>• AI-powered career recommendations</li>
                          <li>• Customized training and improvement roadmap</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFeedbackForm(true)}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Provide Feedback
                  </Button>
                  <Button 
                    onClick={onViewReport}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Detailed Report
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              /* Feedback Form */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">We Value Your Feedback</h3>
                  <p className="text-gray-600">
                    Help us improve the LinxIQ assessment experience for future candidates
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How was your test experience? Any suggestions for improvement?
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Please share your thoughts about the test interface, questions, difficulty level, or any technical issues you encountered..."
                      className="min-h-32"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFeedbackForm(false)}
                    className="flex-1"
                  >
                    Skip Feedback
                  </Button>
                  <Button 
                    onClick={handleSubmitFeedback}
                    disabled={!feedback.trim() || submitFeedbackMutation.isPending}
                    className="flex-1"
                  >
                    {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}