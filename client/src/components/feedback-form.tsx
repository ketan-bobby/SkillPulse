import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Lightbulb, AlertTriangle } from "lucide-react";

interface FeedbackFormProps {
  testId: number;
  resultId: number;
  onSubmitted?: () => void;
}

export function FeedbackForm({ testId, resultId, onSubmitted }: FeedbackFormProps) {
  const [overallExperience, setOverallExperience] = useState(0);
  const [testDifficulty, setTestDifficulty] = useState(0);
  const [questionClarity, setQuestionClarity] = useState(0);
  const [platformUsability, setPlatformUsability] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [technicalIssues, setTechnicalIssues] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const { toast } = useToast();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const res = await apiRequest("POST", "/api/feedback", feedbackData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve the assessment experience.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      onSubmitted?.();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (overallExperience === 0) {
      toast({
        title: "Missing Rating",
        description: "Please provide an overall experience rating.",
        variant: "destructive",
      });
      return;
    }

    const feedbackData = {
      testId,
      resultId,
      feedbackType: "post_test",
      overallExperience,
      testDifficulty,
      questionClarity,
      platformUsability,
      feedbackText: feedbackText.trim() || null,
      suggestions: suggestions.trim() || null,
      technicalIssues: technicalIssues.trim() || null,
      wouldRecommend,
      isAnonymous,
    };

    submitFeedbackMutation.mutate(feedbackData);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <MessageSquare className="h-6 w-6 text-blue-500" />
          Assessment Feedback
        </CardTitle>
        <p className="text-muted-foreground">
          Help us improve! Your feedback is valuable for enhancing the assessment experience.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StarRating
            value={overallExperience}
            onChange={setOverallExperience}
            label="Overall Experience *"
          />
          <StarRating
            value={testDifficulty}
            onChange={setTestDifficulty}
            label="Test Difficulty (1=Too Easy, 5=Too Hard)"
          />
          <StarRating
            value={questionClarity}
            onChange={setQuestionClarity}
            label="Question Clarity"
          />
          <StarRating
            value={platformUsability}
            onChange={setPlatformUsability}
            label="Platform Usability"
          />
        </div>

        {/* Recommendation */}
        <div className="space-y-2">
          <Label>Would you recommend this assessment platform?</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={wouldRecommend === true ? "default" : "outline"}
              onClick={() => setWouldRecommend(true)}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Yes
            </Button>
            <Button
              type="button"
              variant={wouldRecommend === false ? "default" : "outline"}
              onClick={() => setWouldRecommend(false)}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              No
            </Button>
          </div>
        </div>

        {/* Text Feedback */}
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              General Feedback
            </Label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts about the test content, difficulty, or overall experience..."
              className="mt-2"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggestions for Improvement
            </Label>
            <Textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="How can we make the assessment experience better?"
              className="mt-2"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Technical Issues
            </Label>
            <Textarea
              value={technicalIssues}
              onChange={(e) => setTechnicalIssues(e.target.value)}
              placeholder="Did you encounter any technical problems during the test?"
              className="mt-2"
            />
          </div>
        </div>

        {/* Privacy Options */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="anonymous" 
            checked={isAnonymous} 
            onCheckedChange={setIsAnonymous}
          />
          <Label htmlFor="anonymous" className="text-sm">
            Submit feedback anonymously
          </Label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={submitFeedbackMutation.isPending || overallExperience === 0}
            className="px-8"
          >
            {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}