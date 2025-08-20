import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Edit, Globe, Sparkles } from "lucide-react";
import { Redirect } from "wouter";
import { QuestionGenerator } from "@/components/question-generator";

export default function ReviewerDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "reviewer") {
    return <Redirect to="/" />;
  }

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/review/questions"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ questionId, status }: { questionId: number; status: string }) => {
      await apiRequest("PUT", `/api/review/questions/${questionId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review/questions"] });
    },
  });

  const pendingCount = questions.filter((q: any) => q.status === "pending").length;
  const approvedCount = questions.filter((q: any) => q.status === "approved").length;
  const rejectedCount = questions.filter((q: any) => q.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Question Review Dashboard</h1>
          <p className="text-muted-foreground">Review and approve questions before they go live</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Needs Changes</p>
                  <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
                </div>
                <Edit3 className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Live Questions</p>
                  <p className="text-2xl font-bold text-primary">1,247</p>
                </div>
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Review Queue</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Generator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Questions Awaiting Review</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="os">Operating Systems</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="L1">L1</SelectItem>
                    <SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem>
                    <SelectItem value="L4">L4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.filter((q: any) => q.status === "pending").map((question: any) => (
                <div key={question.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {question.domain || "Networking"}
                        </Badge>
                        <Badge variant="outline">
                          {question.level || "L2"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">ID: {question.id}</span>
                      </div>
                      <h3 className="font-medium text-foreground mb-2">{question.question}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {Array.isArray(question.options) && question.options.map((option: string, index: number) => (
                          <p key={index} className={option === question.correctAnswer ? "font-semibold" : ""}>
                            {String.fromCharCode(65 + index)}) {option}
                            {option === question.correctAnswer && " ✓"}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                        <span>Created by: System Admin</span>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        <span>Difficulty: {question.difficulty}</span>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col space-y-2">
                      <Button
                        size="sm"
                        onClick={() => reviewMutation.mutate({ questionId: question.id, status: "approved" })}
                        disabled={reviewMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reviewMutation.mutate({ questionId: question.id, status: "rejected" })}
                        disabled={reviewMutation.isPending}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {questions.filter((q: any) => q.status === "pending").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No questions pending review
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="generate" className="mt-6">
            <QuestionGenerator 
              onQuestionsGenerated={(questions) => {
                queryClient.invalidateQueries({ queryKey: ["/api/review/questions"] });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
