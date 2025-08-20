import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Trophy, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Play,
  FileText,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface TestAssignment {
  id: number;
  testId: number;
  testTitle: string;
  testDescription: string;
  domain: string;
  level: string;
  duration: number;
  totalQuestions: number;
  scheduledAt: string;
  dueDate: string;
  status: string;
  timeLimit: number;
  maxAttempts: number;
}

interface TestResult {
  id: number;
  testId: number;
  testTitle: string;
  score: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch candidate assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/candidate/assignments"],
    enabled: !!user && user.role === "candidate",
  });

  // Fetch candidate results
  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/candidate/results"],
    enabled: !!user && user.role === "candidate",
  });

  // Calculate dashboard stats
  const pendingTests = assignments.filter((a: TestAssignment) => a.status === "assigned").length;
  const completedTests = results.length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum: number, r: TestResult) => sum + r.percentage, 0) / results.length)
    : 0;
  const passRate = results.length > 0
    ? Math.round((results.filter((r: TestResult) => r.passed).length / results.length) * 100)
    : 0;

  const handleStartTest = (assignmentId: number) => {
    setLocation(`/test/${assignmentId}`);
  };

  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case "programming": return "💻";
      case "frontend": return "🎨";
      case "backend": return "⚙️";
      case "devops": return "🔧";
      case "cloud": return "☁️";
      case "security": return "🔒";
      case "data-science": return "📊";
      case "ai-ml": return "🤖";
      default: return "📝";
    }
  };

  if (!user || user.role !== "candidate") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page is only available for candidates.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LinxIQ
                </h1>
                <p className="text-xs text-gray-600">Candidate Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            Track your assessment progress and access your assigned tests.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Tests</p>
                  <p className="text-3xl font-bold text-blue-600">{pendingTests}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedTests}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-purple-600">{averageScore}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-3xl font-bold text-orange-600">{passRate}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Tests */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Assigned Tests
                </CardTitle>
                <CardDescription>
                  Tests assigned to you that need to be completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tests assigned yet</p>
                    <p className="text-sm">Check back later for new assignments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment: TestAssignment) => (
                      <div
                        key={assignment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getDomainIcon(assignment.domain)}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {assignment.testTitle}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {assignment.domain} • {assignment.level} level
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          {assignment.testDescription}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {assignment.duration} mins
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {assignment.totalQuestions} questions
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </div>

                        {assignment.status === "assigned" && (
                          <Button
                            onClick={() => handleStartTest(assignment.id)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Test
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Results */}
          <div>
            <Card className="bg-white/70 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  Recent Results
                </CardTitle>
                <CardDescription>
                  Your latest test performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results yet</p>
                    <p className="text-sm">Complete your first test to see results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.slice(0, 5).map((result: TestResult) => (
                      <div
                        key={result.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900">
                            {result.testTitle}
                          </h4>
                          <Badge 
                            className={result.passed 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                            }
                          >
                            {result.passed ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Score</span>
                            <span>{result.percentage}%</span>
                          </div>
                          <Progress 
                            value={result.percentage} 
                            className="h-2"
                          />
                        </div>

                        <p className="text-xs text-gray-500">
                          Completed {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}