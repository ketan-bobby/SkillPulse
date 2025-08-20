import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Code,
  List,
  FileText
} from "lucide-react";

export default function QuestionManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/questions"],
  });

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const res = await apiRequest("POST", "/api/questions", questionData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Question Created",
        description: "New question has been created and is pending review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setIsCreateDialogOpen(false);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, status }: { questionId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/questions/${questionId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Question Updated",
        description: "Question status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      await apiRequest("DELETE", `/api/questions/${questionId}`);
    },
    onSuccess: () => {
      toast({
        title: "Question Deleted",
        description: "Question has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
  });

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const questionData = {
      testId: parseInt(formData.get("testId") as string),
      type: formData.get("type"),
      question: formData.get("question"),
      options: formData.get("type") === "mcq" ? 
        JSON.parse(formData.get("options") as string || "[]") : 
        null,
      correctAnswer: formData.get("correctAnswer"),
      explanation: formData.get("explanation"),
      difficulty: formData.get("difficulty"),
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : [],
      timeLimit: parseInt(formData.get("timeLimit") as string) || 60,
      status: "pending",
    };

    createQuestionMutation.mutate(questionData);
  };

  const filteredQuestions = questions.filter((question: any) => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === "all" || question.domain === filterDomain;
    const matchesStatus = filterStatus === "all" || question.status === filterStatus;
    const matchesType = filterType === "all" || question.type === filterType;
    return matchesSearch && matchesDomain && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "coding": return <Code className="h-4 w-4" />;
      case "mcq": return <List className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "default" as const;
      case "rejected": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  const pendingQuestions = questions.filter((q: any) => q.status === "pending");
  const approvedQuestions = questions.filter((q: any) => q.status === "approved");

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <RoleGuard allowedRoles={["admin", "reviewer"]}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Question Management</h1>
            <p className="text-muted-foreground mt-2">
              Create, review, and manage assessment questions across all domains
            </p>
          </div>

          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Questions</TabsTrigger>
              <TabsTrigger value="review">Review Queue ({pendingQuestions.length})</TabsTrigger>
              <TabsTrigger value="create">Create Question</TabsTrigger>
            </TabsList>

            {/* Browse Questions */}
            <TabsContent value="browse">
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Select value={filterDomain} onValueChange={setFilterDomain}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="scenario">Scenario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question: any) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium truncate">{question.question}</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {question.id} • Time: {question.timeLimit}min
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(question.type)}
                              <span className="capitalize">{question.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {question.domain || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {question.tags && question.tags.length > 0 ? (
                                question.tags.map((tag: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={() => setSearchTerm(tag)}
                                    title={`Filter by tag: ${tag}`}
                                  >
                                    {tag}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No tags</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(question.status)}
                              <Badge variant={getStatusBadgeVariant(question.status)}>
                                {question.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteQuestionMutation.mutate(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Queue */}
            <TabsContent value="review">
              <Card>
                <CardHeader>
                  <CardTitle>Questions Pending Review ({pendingQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingQuestions.map((question: any) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(question.type)}
                              <Badge variant="outline" className="capitalize">
                                {question.type}
                              </Badge>
                              <Badge variant="secondary" className="capitalize">
                                {question.difficulty}
                              </Badge>
                            </div>
                            <h3 className="font-medium mb-2">{question.question}</h3>
                            {question.type === "mcq" && question.options && (
                              <div className="mb-2">
                                <p className="text-sm font-medium">Options:</p>
                                <ul className="text-sm list-disc list-inside">
                                  {JSON.parse(question.options).map((option: string, index: number) => (
                                    <li key={index}>{option}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="text-sm"><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                            {question.explanation && (
                              <p className="text-sm mt-2"><strong>Explanation:</strong> {question.explanation}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateQuestionMutation.mutate({ questionId: question.id, status: "approved" })}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateQuestionMutation.mutate({ questionId: question.id, status: "rejected" })}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingQuestions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No questions pending review
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create Question */}
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateQuestion} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="testId">Associated Test</Label>
                        <Select name="testId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test" />
                          </SelectTrigger>
                          <SelectContent>
                            {tests.map((test: any) => (
                              <SelectItem key={test.id} value={test.id.toString()}>
                                {test.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Question Type</Label>
                        <Select name="type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="coding">Coding Challenge</SelectItem>
                            <SelectItem value="scenario">Scenario-Based</SelectItem>
                            <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="question">Question Text</Label>
                      <Textarea id="question" name="question" required placeholder="Enter the question..." />
                    </div>
                    
                    <div>
                      <Label htmlFor="options">Options (JSON format for MCQ)</Label>
                      <Textarea id="options" name="options" placeholder='["Option A", "Option B", "Option C", "Option D"]' />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select name="difficulty" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input id="timeLimit" name="timeLimit" type="number" placeholder="60" />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" name="tags" placeholder="react, javascript, frontend" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Input id="correctAnswer" name="correctAnswer" required placeholder="Enter correct answer..." />
                    </div>
                    
                    <div>
                      <Label htmlFor="explanation">Explanation (Optional)</Label>
                      <Textarea id="explanation" name="explanation" placeholder="Explain why this is the correct answer..." />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={createQuestionMutation.isPending}>
                      {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Pending Review</p>
                    <p className="text-2xl font-bold">{pendingQuestions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Approved Questions</p>
                    <p className="text-2xl font-bold">{approvedQuestions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Questions</p>
                    <p className="text-2xl font-bold">{questions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}