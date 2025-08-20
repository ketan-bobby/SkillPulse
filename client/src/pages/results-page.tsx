import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Target, TrendingUp, TrendingDown, Eye, Shield, UserCheck, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function ResultsPage() {
  const [, setLocation] = useLocation();
  // Fetch results data from database
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["/api/results"],
  });

  // Fetch declared results from database
  const { data: declaredResults = [] } = useQuery({
    queryKey: ["/api/results/declared"],
  });

  // Fetch pending results from database
  const { data: pendingResults = [] } = useQuery({
    queryKey: ["/api/results/pending"],
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
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">Test Results</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const averageScore = declaredResults.length > 0 
    ? declaredResults.reduce((sum: number, result: any) => sum + result.score, 0) / declaredResults.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Test Results</h1>
          <p className="text-muted-foreground">
            Track your performance and progress across all completed assessments
          </p>
        </div>

        {/* Manager Control Notice */}
        {pendingResults.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800 dark:text-orange-200">Results Under Review</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You have {pendingResults.length} completed test(s) under review. Results will be visible once declared by your manager.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {declaredResults.length === 0 && pendingResults.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
              <p className="text-muted-foreground mb-4">
                You haven't completed any tests yet, or your results haven't been declared.
              </p>
              <Button onClick={() => setLocation("/")}>
                View Available Tests
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Results Declared</p>
                  <p className="text-2xl font-bold">{declaredResults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{Math.round(averageScore)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-bold">
                    {results.length > 0 
                      ? Math.round((results.filter((r: any) => r.passed).length / results.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold">
                    {Math.round(results.reduce((sum: number, r: any) => sum + (r.timeSpent || 0), 0) / 60)}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {declaredResults.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Declared Results Yet</h3>
              <p className="text-muted-foreground">
                Complete tests and wait for your manager to declare results
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {declaredResults.map((result: any) => {
              const ScoreIcon = getScoreIcon(result.score);
              const gradeBadge = getGradeBadge(result.score);
              
              return (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          result.score >= 80 ? 'bg-green-100' : 
                          result.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <ScoreIcon className={`h-6 w-6 ${getScoreColor(result.score)}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{result.test?.title || 'Test Assessment'}</h3>
                          <p className="text-muted-foreground">
                            {result.test?.domain} • {result.test?.level}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>Score: {result.score}%</span>
                            <span>•</span>
                            <span>Time: {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}</span>
                            <span>•</span>
                            <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={gradeBadge.className}>
                          {gradeBadge.grade}
                        </Badge>
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? "Passed" : "Failed"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation(`/reports/test-result/${result.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}