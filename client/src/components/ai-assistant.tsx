import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Send, Loader2, Brain, TrendingUp, Users, Target, BookOpen } from "lucide-react";
import { ROLE_INFO } from "@shared/roles";
import { Badge } from "@/components/ui/badge";

interface AIAssistantProps {
  context?: string;
  onInsight?: (insight: any) => void;
}

export function AIAssistant({ context, onInsight }: AIAssistantProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<any>(null);
  
  const assistantMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const res = await apiRequest("POST", "/api/ai/assist", { 
        query: userQuery,
        context: context || "general"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResponse(data);
      if (onInsight) onInsight(data);
    }
  });

  if (!user) return null;

  const roleInfo = ROLE_INFO[user.role as keyof typeof ROLE_INFO];
  
  const getSuggestedActions = () => {
    switch (user.role) {
      case "super_admin":
        return [
          { icon: TrendingUp, text: "Generate system insights", action: "system-insights" },
          { icon: Brain, text: "Analyze skill gaps", action: "skill-gaps" },
          { icon: Target, text: "Platform optimization", action: "optimization" }
        ];
      case "admin":
        return [
          { icon: BookOpen, text: "Test recommendations", action: "test-recommendations" },
          { icon: Users, text: "User analytics", action: "user-analytics" },
          { icon: Target, text: "Question quality", action: "question-quality" }
        ];
      case "hr_manager":
        return [
          { icon: Users, text: "Talent analytics", action: "talent-analytics" },
          { icon: TrendingUp, text: "Hiring insights", action: "hiring-insights" },
          { icon: Target, text: "Training needs", action: "training-needs" }
        ];
      case "reviewer":
        return [
          { icon: Brain, text: "Question analysis", action: "question-analysis" },
          { icon: Target, text: "Quality metrics", action: "quality-metrics" },
          { icon: BookOpen, text: "Review efficiency", action: "review-efficiency" }
        ];
      case "team_lead":
        return [
          { icon: Users, text: "Team performance", action: "team-performance" },
          { icon: Target, text: "Mentoring plans", action: "mentoring-plans" },
          { icon: TrendingUp, text: "Skill development", action: "skill-development" }
        ];
      case "employee":
        return [
          { icon: BookOpen, text: "Learning path", action: "learning-path" },
          { icon: Target, text: "Test preparation", action: "test-prep" },
          { icon: TrendingUp, text: "Career growth", action: "career-growth" }
        ];
      case "candidate":
        return [
          { icon: BookOpen, text: "Preparation tips", action: "prep-tips" },
          { icon: Target, text: "Performance insights", action: "performance" },
          { icon: Brain, text: "Skill assessment", action: "skill-assessment" }
        ];
      default:
        return [];
    }
  };

  const handleSuggestedAction = (action: string) => {
    const queries: Record<string, string> = {
      "system-insights": "Generate comprehensive system insights and platform health analysis",
      "skill-gaps": "Analyze skill gaps across the organization",
      "optimization": "Suggest platform optimization strategies",
      "test-recommendations": "Recommend optimal test configurations",
      "user-analytics": "Provide user engagement analytics",
      "question-quality": "Analyze question quality metrics",
      "talent-analytics": "Generate talent analytics report",
      "hiring-insights": "Provide hiring recommendations",
      "training-needs": "Identify training needs",
      "question-analysis": "Analyze question effectiveness",
      "quality-metrics": "Show quality metrics dashboard",
      "review-efficiency": "Suggest review process improvements",
      "team-performance": "Generate team performance report",
      "mentoring-plans": "Create mentoring recommendations",
      "skill-development": "Suggest skill development priorities",
      "learning-path": "Generate my personalized learning path",
      "test-prep": "Help me prepare for upcoming tests",
      "career-growth": "Provide career growth recommendations",
      "prep-tips": "Give me test preparation tips",
      "performance": "Analyze my performance insights",
      "skill-assessment": "Assess my current skill levels"
    };
    
    const selectedQuery = queries[action] || "";
    setQuery(selectedQuery);
    if (selectedQuery) {
      assistantMutation.mutate(selectedQuery);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>AI Assistant</span>
          </div>
          <Badge variant="outline" className={roleInfo?.color}>
            {roleInfo?.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            I'm your AI-powered assistant, specialized for {roleInfo?.name} tasks.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {getSuggestedActions().map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSuggestedAction(action.action)}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.text}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Ask me anything related to your role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            onClick={() => assistantMutation.mutate(query)}
            disabled={!query || assistantMutation.isPending}
            className="w-full"
          >
            {assistantMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Get AI Insights
              </>
            )}
          </Button>
        </div>

        {response && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
            <h4 className="font-medium flex items-center">
              <Brain className="h-4 w-4 mr-2 text-purple-600" />
              AI Insights
            </h4>
            <div className="text-sm space-y-2">
              {Object.entries(response).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="font-medium capitalize">{key.replace(/_/g, ' ')}:</p>
                  <p className="text-muted-foreground">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}