import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Clock, Award, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CompletedAssignment {
  id: number;
  userId: number;
  testId: number;
  status: string;
  resultsVisible: boolean;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  test: {
    id: number;
    title: string;
    domain: string;
    level: string;
  };
  result: {
    id: number;
    score: number;
    percentage: number;
    passed: boolean;
    completedAt: string;
  };
}

export default function ResultManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: completedAssignments = [], isLoading } = useQuery({
    queryKey: ["/api/completed-assignments"],
  });

  const visibilityMutation = useMutation({
    mutationFn: async ({ assignmentId, resultsVisible }: { assignmentId: number; resultsVisible: boolean }) => {
      return await apiRequest(`/api/assignments/${assignmentId}/result-visibility`, {
        method: "PATCH",
        body: JSON.stringify({ resultsVisible }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/completed-assignments"] });
      toast({
        title: "Success",
        description: "Result visibility updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update result visibility",
        variant: "destructive",
      });
    },
  });

  const handleVisibilityToggle = (assignmentId: number, currentVisibility: boolean) => {
    visibilityMutation.mutate({
      assignmentId,
      resultsVisible: !currentVisibility,
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (passed: boolean) => {
    return passed ? "default" : "destructive";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="flex space-x-4">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Test Result Management
        </h1>
        <p className="text-gray-600 mt-2">
          Control which test results are visible to candidates
        </p>
      </div>

      {completedAssignments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Tests</h3>
            <p className="text-gray-500">
              Completed test assignments will appear here for result management.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedAssignments.map((assignment: CompletedAssignment) => (
            <Card key={assignment.id} className="backdrop-blur-md bg-white/70 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">
                        {assignment.user.firstName} {assignment.user.lastName}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        @{assignment.user.username}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getScoreBadgeVariant(assignment.result.passed)}>
                      {assignment.result.passed ? "Passed" : "Failed"}
                    </Badge>
                    <Badge variant="outline" className={getScoreColor(assignment.result.percentage)}>
                      {assignment.result.percentage}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">{assignment.test.title}</span>
                    </div>
                    <Badge variant="secondary">
                      {assignment.test.domain} • {assignment.test.level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(assignment.result.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-white/30">
                  <div className="flex items-center space-x-3">
                    {assignment.resultsVisible ? (
                      <>
                        <Eye className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700">Results Visible</p>
                          <p className="text-sm text-green-600">Candidate can see their test results</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-orange-700">Results Hidden</p>
                          <p className="text-sm text-orange-600">Candidate cannot see their test results</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={assignment.resultsVisible}
                      onCheckedChange={() => handleVisibilityToggle(assignment.id, assignment.resultsVisible)}
                      disabled={visibilityMutation.isPending}
                    />
                    <Button
                      variant={assignment.resultsVisible ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleVisibilityToggle(assignment.id, assignment.resultsVisible)}
                      disabled={visibilityMutation.isPending}
                      className="min-w-[100px]"
                    >
                      {assignment.resultsVisible ? "Hide Results" : "Show Results"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{assignment.result.score}</p>
                    <p className="text-sm text-gray-600">Score</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(assignment.result.percentage)}`}>
                      {assignment.result.percentage}%
                    </p>
                    <p className="text-sm text-gray-600">Percentage</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${assignment.result.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {assignment.result.passed ? 'PASS' : 'FAIL'}
                    </p>
                    <p className="text-sm text-gray-600">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}