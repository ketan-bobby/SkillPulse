import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trophy, Target, Clock, Eye } from "lucide-react";
import { useLocation } from "wouter";

export function RecentResults() {
  const [, setLocation] = useLocation();
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["/api/results"],
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return Trophy;
    if (score >= 60) return Target;
    return TrendingDown;
  };

  const getGradeBadge = (score: number) => {
    if (score >= 90) return { grade: "A+", className: "bg-green-100 text-green-800" };
    if (score >= 80) return { grade: "A", className: "bg-green-100 text-green-800" };
    if (score >= 70) return { grade: "B", className: "bg-blue-100 text-blue-800" };
    if (score >= 60) return { grade: "C", className: "bg-yellow-100 text-yellow-800" };
    if (score >= 50) return { grade: "D", className: "bg-orange-100 text-orange-800" };
    return { grade: "F", className: "bg-red-100 text-red-800" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Results</CardTitle>
        {results.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/reports")}
          >
            View All Reports
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No test results yet
          </div>
        ) : (
          <div className="space-y-4">
            {results.slice(0, 5).map((result: any) => {
              const ScoreIcon = getScoreIcon(result.score);
              const gradeBadge = getGradeBadge(result.score);
              
              return (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setLocation(`/reports/test-result/${result.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      result.score >= 80 ? 'bg-green-100' : 
                      result.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <ScoreIcon className={`h-5 w-5 ${getScoreColor(result.score)}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{result.test?.title || 'Test Assessment'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Score: {result.score}% • {result.passed ? 'Passed' : 'Failed'} • {result.test?.domain}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={gradeBadge.className}>
                      {gradeBadge.grade}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}