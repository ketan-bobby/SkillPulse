import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, MessageSquare, Clock, User, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NTTReviewInterfaceProps {
  questions: any[];
  onReviewComplete: (reviews: any[]) => void;
}

export function NTTReviewInterface({ questions, onReviewComplete }: NTTReviewInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [reviews, setReviews] = useState<any[]>(
    questions.map(() => ({
      status: "pending",
      comments: "",
      suggestions: "",
      rating: 0
    }))
  );
  const { toast } = useToast();

  const handleReviewAction = (action: "approve" | "reject" | "suggest", comments?: string, suggestions?: string) => {
    const newReviews = [...reviews];
    newReviews[currentQuestion] = {
      ...newReviews[currentQuestion],
      status: action,
      comments: comments || newReviews[currentQuestion].comments,
      suggestions: suggestions || newReviews[currentQuestion].suggestions,
      reviewedAt: new Date().toISOString(),
      reviewerId: 1 // Mock reviewer ID
    };
    setReviews(newReviews);

    toast({
      title: `Question ${action}d`,
      description: `Question ${currentQuestion + 1} has been ${action}d successfully.`,
    });

    // Auto-advance to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleCommentsChange = (comments: string) => {
    const newReviews = [...reviews];
    newReviews[currentQuestion] = {
      ...newReviews[currentQuestion],
      comments
    };
    setReviews(newReviews);
  };

  const handleSuggestionsChange = (suggestions: string) => {
    const newReviews = [...reviews];
    newReviews[currentQuestion] = {
      ...newReviews[currentQuestion],
      suggestions
    };
    setReviews(newReviews);
  };

  const handleRatingChange = (rating: number) => {
    const newReviews = [...reviews];
    newReviews[currentQuestion] = {
      ...newReviews[currentQuestion],
      rating
    };
    setReviews(newReviews);
  };

  const currentQ = questions[currentQuestion];
  const currentReview = reviews[currentQuestion];
  const completedReviews = reviews.filter(r => r.status !== "pending").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approve": return "bg-green-100 text-green-800";
      case "reject": return "bg-red-100 text-red-800";
      case "suggest": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderQuestionContent = () => {
    switch (currentQ.type) {
      case "mcq":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Question:</h4>
              <p className="text-sm bg-muted p-3 rounded">{currentQ.question}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Options:</h4>
              <ul className="space-y-1">
                {currentQ.options.map((option: string, index: number) => (
                  <li
                    key={index}
                    className={`text-sm p-2 rounded ${
                      option === currentQ.correctAnswer
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-50"
                    }`}
                  >
                    {option} {option === currentQ.correctAnswer && "✓ Correct"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "coding":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Problem Statement:</h4>
              <p className="text-sm bg-muted p-3 rounded">{currentQ.question}</p>
            </div>
            {currentQ.codeTemplate && (
              <div>
                <h4 className="font-medium mb-2">Code Template:</h4>
                <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                  {currentQ.codeTemplate}
                </pre>
              </div>
            )}
            {currentQ.testCases && (
              <div>
                <h4 className="font-medium mb-2">Test Cases:</h4>
                <div className="space-y-2">
                  {currentQ.testCases.map((testCase: any, index: number) => (
                    <div key={index} className="text-xs bg-muted p-2 rounded">
                      <strong>Input:</strong> {testCase.input}<br />
                      <strong>Expected Output:</strong> {testCase.output}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "scenario":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Scenario:</h4>
              <p className="text-sm bg-muted p-3 rounded">{currentQ.scenario}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Question:</h4>
              <p className="text-sm bg-muted p-3 rounded">{currentQ.question}</p>
            </div>
            {currentQ.sampleAnswer && (
              <div>
                <h4 className="font-medium mb-2">Sample Answer:</h4>
                <p className="text-sm bg-green-50 p-3 rounded">{currentQ.sampleAnswer}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div>
            <h4 className="font-medium mb-2">Question:</h4>
            <p className="text-sm bg-muted p-3 rounded">{currentQ.question}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">NTT Review Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                <User className="h-4 w-4 mr-1" />
                Reviewer: NTT Expert
              </Badge>
              <Badge variant="secondary">
                <Clock className="h-4 w-4 mr-1" />
                {completedReviews}/{questions.length} Completed
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${(completedReviews / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {Math.round((completedReviews / questions.length) * 100)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={index === currentQuestion ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => setCurrentQuestion(index)}
                    >
                      <span>Question {index + 1}</span>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(reviews[index].status)}
                      >
                        {reviews[index].status}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Review Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {currentQuestion + 1}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{currentQ.type.toUpperCase()}</Badge>
                    <Badge variant="outline">{currentQ.difficulty || "Medium"}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderQuestionContent()}
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quality Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Question Quality Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRatingChange(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= currentReview.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium mb-2">Review Comments</label>
                  <Textarea
                    placeholder="Enter your review comments..."
                    value={currentReview.comments}
                    onChange={(e) => handleCommentsChange(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* Suggestions */}
                <div>
                  <label className="block text-sm font-medium mb-2">Improvement Suggestions</label>
                  <Textarea
                    placeholder="Enter suggestions for improvement..."
                    value={currentReview.suggestions}
                    onChange={(e) => handleSuggestionsChange(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleReviewAction("approve", currentReview.comments)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={currentReview.status === "approve"}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReviewAction("reject", currentReview.comments)}
                    variant="destructive"
                    disabled={currentReview.status === "reject"}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleReviewAction("suggest", currentReview.comments, currentReview.suggestions)}
                    className="bg-yellow-600 hover:bg-yellow-700"
                    disabled={currentReview.status === "suggest"}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Suggest Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Complete Review */}
            {completedReviews === questions.length && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      Review Complete!
                    </h3>
                    <p className="text-green-700 mb-4">
                      All questions have been reviewed. Ready to submit the review.
                    </p>
                    <Button
                      onClick={() => onReviewComplete(reviews)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}