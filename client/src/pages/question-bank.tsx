import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Search,
  Filter,
  Brain,
  Code2,
  FileQuestion,
  Settings2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  GraduationCap,
  Shield,
  AlertTriangle,
  Star,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ROLES } from "@shared/roles";

const DOMAINS = [
  "programming", "frontend", "backend", "devops", "cloud", 
  "mobile", "data-science", "ai-ml", "security", "databases", "networking",
  "vmware-virtualization", "redhat-administration", "oracle-administration", "network-routing-switching"
];

const LEVELS = ["junior", "mid", "senior", "lead", "principal"];
const DIFFICULTIES = ["easy", "medium", "tough"];
const QUESTION_TYPES = ["mcq", "coding", "scenario", "drag-drop", "fill-blank"];

export default function QuestionBank() {
  const [activeTab, setActiveTab] = useState("review");  // Start with review tab for approval workflow
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [viewingQuestion, setViewingQuestion] = useState<any>(null);
  const [selectedCreator, setSelectedCreator] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [isAssignToTestOpen, setIsAssignToTestOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  
  // Form state for create question
  const [formData, setFormData] = useState({
    type: "",
    domain: "",
    level: "",
    difficulty: "",
    questionText: "",
    tags: "",
    timeLimit: "30",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    codeLanguage: "",
    codeTemplate: ""
  });
  
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      type: "",
      domain: "",
      level: "",
      difficulty: "",
      questionText: "",
      tags: "",
      timeLimit: "30",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      codeLanguage: "",
      codeTemplate: ""
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleCreateQuestion = () => {
    if (!formData.type || !formData.domain || !formData.level || !formData.difficulty || !formData.questionText) {
      setStatusMessage("Please fill in all required fields.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    const questionData = {
      question: formData.questionText,
      type: formData.type,
      domain: formData.domain,
      level: formData.level,
      difficulty: formData.difficulty,
      timeLimit: parseInt(formData.timeLimit),
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      explanation: formData.explanation,
      status: "pending"
    };

    // Add type-specific fields
    if (formData.type === "mcq" || formData.type === "multiple-choice") {
      questionData.options = formData.options.filter(opt => opt.trim() !== "");
      questionData.correctAnswer = formData.correctAnswer;
    } else if (formData.type === "coding") {
      questionData.codeLanguage = formData.codeLanguage;
      questionData.codeTemplate = formData.codeTemplate;
    } else if (formData.type === "scenario") {
      questionData.correctAnswer = formData.correctAnswer;
    }

    createQuestionMutation.mutate(questionData);
  };

  const handleAiEnhance = () => {
    if (!formData.questionText || !formData.type || !formData.domain) {
      setStatusMessage("Please provide at least question text, type, and domain for AI enhancement.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    const enhanceData = {
      question: formData.questionText,
      type: formData.type,
      domain: formData.domain,
      level: formData.level,
      difficulty: formData.difficulty,
      tags: formData.tags
    };

    aiEnhanceMutation.mutate(enhanceData);
  };

  const handleSaveAsDraft = () => {
    const draftData = {
      ...formData,
      status: "draft"
    };
    // For now, just save to localStorage
    localStorage.setItem('questionDraft', JSON.stringify(draftData));
    setStatusMessage("Question saved as draft!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleAssignToTest = () => {
    if (selectedQuestions.length === 0) {
      setStatusMessage("No questions selected. Please select questions to assign.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
    setIsAssignToTestOpen(true);
  };

  const confirmAssignToTest = () => {
    if (!selectedTestId) {
      setStatusMessage("No test selected. Please select a test.");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
    
    assignQuestionsToTestMutation.mutate({
      testId: parseInt(selectedTestId),
      questionIds: selectedQuestions
    });
  };

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/questions", selectedDomain, selectedLevel, selectedDifficulty, selectedType],
  });

  const { data: pendingQuestions = [] } = useQuery({
    queryKey: ["/api/questions/pending"],
  });

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  // Type the data properly
  const typedQuestions = questions as any[];
  const typedPendingQuestions = pendingQuestions as any[];
  const typedTests = tests as any[];

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const res = await apiRequest("POST", "/api/questions", questionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/pending"] });
      setIsCreateDialogOpen(false);
      setStatusMessage("Question created successfully and sent for approval!");
      resetForm();
      setTimeout(() => setStatusMessage(""), 5000);
    },
    onError: (error: any) => {
      setStatusMessage(`Failed to create question: ${error.message}`);
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });

  const aiEnhanceMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const res = await apiRequest("POST", "/api/questions/ai-enhance", questionData);
      return res.json();
    },
    onSuccess: (data) => {
      // Update form with AI enhanced data
      setFormData(prev => ({
        ...prev,
        questionText: data.question || prev.questionText,
        options: data.options || prev.options,
        correctAnswer: data.correctAnswer || prev.correctAnswer,
        explanation: data.explanation || prev.explanation,
        tags: data.tags ? data.tags.join(", ") : prev.tags
      }));
      setStatusMessage("Question enhanced with AI suggestions!");
      setTimeout(() => setStatusMessage(""), 5000);
    },
    onError: (error: any) => {
      setStatusMessage(`AI enhancement failed: ${error.message}`);
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });

  const approveQuestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/questions/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/pending"] });
      setStatusMessage(`Question ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setTimeout(() => setStatusMessage(""), 3000);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/questions/${id}`);
      return true; // DELETE request successful, no response body expected
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/pending"] });
      setStatusMessage("Question deleted successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    },
    onError: (error: any) => {
      setStatusMessage(`Failed to delete question: ${error.message}`);
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });

  const copyQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const originalQuestion = typedQuestions.find((q: any) => q.id === questionId);
      if (!originalQuestion) throw new Error("Question not found");
      
      // Create a clean copy without system-generated fields
      const questionData = {
        question: `${originalQuestion.question} (Copy)`,
        type: originalQuestion.type,
        options: originalQuestion.options,
        correctAnswer: originalQuestion.correctAnswer,
        explanation: originalQuestion.explanation || "",
        difficulty: originalQuestion.difficulty,
        domain: originalQuestion.domain,
        technology: originalQuestion.technology || "",
        tags: originalQuestion.tags || [],
        timeLimit: originalQuestion.timeLimit || 30,
        points: originalQuestion.points || 1,
        status: "pending"
      };
      
      const res = await apiRequest("POST", "/api/questions", questionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/pending"] });
      setStatusMessage("Question copied successfully and sent for approval!");
      setTimeout(() => setStatusMessage(""), 3000);
    },
    onError: (error: any) => {
      setStatusMessage(`Failed to copy question: ${error.message}`);
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, questionData }: { id: number; questionData: any }) => {
      const res = await apiRequest("PUT", `/api/questions/${id}`, questionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/pending"] });
      setEditingQuestion(null);
      setStatusMessage("Question updated successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    },
    onError: (error: any) => {
      setStatusMessage(`Failed to update question: ${error.message}`);
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });

  const assignQuestionsToTestMutation = useMutation({
    mutationFn: async ({ testId, questionIds }: { testId: number; questionIds: number[] }) => {
      const res = await apiRequest("POST", `/api/tests/${testId}/assign-questions`, { questionIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      setSelectedQuestions([]);
      setIsAssignToTestOpen(false);
      setStatusMessage("Questions assigned to test successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    },
    onError: (error: any) => {
      setStatusMessage(`Failed to assign questions: ${error.message}`);
      setTimeout(() => setStatusMessage(""), 5000);
    },
  });



  const generateAIQuestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/generate-questions", {
        domain: selectedDomain,
        level: selectedLevel,
        difficulty: selectedDifficulty || "medium",
        count: questionCount,
        types: ["mcq", "coding", "scenario"]
      });
      return response.json();
    },
    onSuccess: (generated) => {
      setStatusMessage(`Generated ${generated.length} AI questions successfully! Smart AI system created advanced questions now pending review.`);
      setTimeout(() => setStatusMessage(""), 5000);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/pending"] });
    },
    onError: (error: any) => {
      console.error("AI generation error:", error);
      setStatusMessage(`Failed to generate AI questions: ${error.message || "Please try again"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  });

  const generateAIQuestions = () => {
    if (!selectedDomain || !selectedLevel) {
      toast({ 
        title: "Please select domain and level first",
        variant: "destructive"
      });
      return;
    }

    generateAIQuestionsMutation.mutate();
  };

  const filteredQuestions = typedQuestions.filter((q: any) => {
    // Text search
    if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !q.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Domain filter
    if (selectedDomain && selectedDomain !== "all" && q.domain !== selectedDomain) {
      return false;
    }
    
    // Difficulty filter  
    if (selectedDifficulty && selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) {
      return false;
    }
    
    // Type filter
    if (selectedType && selectedType !== "all" && q.type !== selectedType) {
      return false;
    }
    
    // Status filter
    if (selectedStatus && selectedStatus !== "all" && q.status !== selectedStatus) {
      return false;
    }
    
    // Creator filter
    if (selectedCreator && selectedCreator !== "all") {
      if (selectedCreator === "ai" && !q.creatorUsername?.includes("AI") && !q.creatorUsername?.includes("Grok")) {
        return false;
      }
      if (selectedCreator === "manual" && (q.creatorUsername?.includes("AI") || q.creatorUsername?.includes("Grok"))) {
        return false;
      }
      if (selectedCreator === "admin" && q.creatorRole !== "admin" && q.creatorRole !== "super_admin") {
        return false;
      }
      if (selectedCreator === "reviewer" && q.creatorRole !== "reviewer") {
        return false;
      }
    }
    
    // Date filter
    if (selectedDateRange && selectedDateRange !== "all" && q.createdAt) {
      const questionDate = new Date(q.createdAt);
      const now = new Date();
      
      if (selectedDateRange === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (questionDate < today) return false;
      }
      
      if (selectedDateRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (questionDate < weekAgo) return false;
      }
      
      if (selectedDateRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (questionDate < monthAgo) return false;
      }
      
      if (selectedDateRange === "ai-generated" && !q.createdBy?.includes("AI")) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.REVIEWER]}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Bank</h1>
            <p className="text-gray-600 mb-4">
              Manage, create, and organize questions with AI assistance and manual override capabilities
            </p>
            
            {/* Pending Questions Alert */}
            {typedPendingQuestions.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900">
                        {typedPendingQuestions.length} Questions Need Approval
                      </h3>
                      <p className="text-orange-700">
                        Review and approve pending questions to make them available for tests
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => setActiveTab("review")}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review Questions
                    </Button>
                    <Button 
                      onClick={() => {
                        typedPendingQuestions.forEach((question: any) => {
                          approveQuestionMutation.mutate({ id: question.id, status: "approved" });
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={approveQuestionMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {approveQuestionMutation.isPending ? "Approving..." : `Quick Approve All`}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
              <TabsTrigger 
                value="review" 
                className={`flex items-center justify-center font-medium transition-all ${
                  typedPendingQuestions.length > 0 
                    ? "data-[state=active]:bg-orange-600 data-[state=active]:text-white bg-orange-50 text-orange-700 border border-orange-200" 
                    : "data-[state=active]:bg-green-600 data-[state=active]:text-white"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                {typedPendingQuestions.length > 0 
                  ? `APPROVE ${typedPendingQuestions.length} QUESTIONS` 
                  : "Review Queue"
                }
              </TabsTrigger>
              <TabsTrigger value="browse" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Browse Questions
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Create Questions
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Manage Tests
              </TabsTrigger>
            </TabsList>

            {/* Browse Questions Tab */}
            <TabsContent value="browse" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Search Questions</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search by content, tags..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Domain</Label>
                      <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger>
                          <SelectValue placeholder="All domains" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All domains</SelectItem>
                          {DOMAINS.map(domain => (
                            <SelectItem key={domain} value={domain}>
                              {domain.charAt(0).toUpperCase() + domain.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="All difficulties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All difficulties</SelectItem>
                          {DIFFICULTIES.map(difficulty => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Question Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          {QUESTION_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label>Created By</Label>
                      <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any creator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any creator</SelectItem>
                          <SelectItem value="ai">🤖 AI Generated (Grok/OpenAI)</SelectItem>
                          <SelectItem value="manual">👤 Manually Created</SelectItem>
                          <SelectItem value="admin">👑 Admin</SelectItem>
                          <SelectItem value="reviewer">✅ Reviewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any status</SelectItem>
                          <SelectItem value="pending">⏳ Pending Review</SelectItem>
                          <SelectItem value="approved">✅ Approved</SelectItem>
                          <SelectItem value="rejected">❌ Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Created</Label>
                      <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any time</SelectItem>
                          <SelectItem value="today">📅 Today</SelectItem>
                          <SelectItem value="week">📆 This week</SelectItem>
                          <SelectItem value="month">🗓️ This month</SelectItem>
                          <SelectItem value="ai-generated">🤖 AI Generated Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedDomain("all");
                          setSelectedDifficulty("all");
                          setSelectedType("all");
                          setSelectedCreator("all");
                          setSelectedStatus("all");
                          setSelectedDateRange("all");
                        }}
                      >
                        Clear All Filters
                      </Button>
                      <Badge variant="secondary" className="px-2 py-1">
                        {filteredQuestions.length} questions found
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Label className="text-sm">Generate:</Label>
                      <Input 
                        type="number" 
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                        min="1"
                        max="50"
                        placeholder="10"
                        className="w-20 h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={generateAIQuestions}
                      disabled={!selectedDomain || !selectedLevel || generateAIQuestionsMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {generateAIQuestionsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}
                      {generateAIQuestionsMutation.isPending ? 
                        `Generating AI Questions... (${questionCount} questions)` : 
                        "Generate AI Questions"
                      }
                    </Button>
                    
                    {selectedQuestions.length > 0 && (
                      <Button variant="outline" onClick={handleAssignToTest}>
                        Add {selectedQuestions.length} to Test
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No questions found matching the current filters.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuestions.map((question: any) => (
                        <div key={question.id} className="border rounded-lg p-4 hover:bg-muted/50">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={() => toggleQuestionSelection(question.id)}
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {question.type === "coding" && <Code2 className="h-4 w-4 text-blue-500" />}
                                {question.type === "mcq" && <FileQuestion className="h-4 w-4 text-green-500" />}
                                {question.type === "scenario" && <Settings2 className="h-4 w-4 text-purple-500" />}
                                <Badge variant="outline">{question.type.toUpperCase()}</Badge>
                                <Badge variant="secondary">{question.difficulty}</Badge>
                                <Badge>{question.domain}</Badge>
                              </div>
                              
                              <h4 className="font-medium mb-3">{question.question}</h4>
                              
                              {/* MCQ Options */}
                              {(question.type === "mcq" || question.type === "multiple-choice") && question.options && question.options.length > 0 && (
                                <div className="mb-3 space-y-2">
                                  <div className="text-sm font-medium text-muted-foreground">Options:</div>
                                  {question.options.map((option: string, index: number) => (
                                    <div key={index} className={`flex items-center gap-2 p-2 rounded border ${
                                      option === question.correctAnswer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-muted/30'
                                    }`}>
                                      <span className="font-mono text-xs w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <span className="flex-1">{option}</span>
                                      {option === question.correctAnswer && (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  ))}
                                  <div className="text-sm text-green-700 font-medium">
                                    ✓ Correct Answer: {question.correctAnswer}
                                  </div>
                                </div>
                              )}

                              {/* Coding Questions */}
                              {question.type === "coding" && (
                                <div className="mb-3 space-y-2">
                                  {question.codeLanguage && (
                                    <div className="text-sm"><strong>Language:</strong> {question.codeLanguage}</div>
                                  )}
                                  {question.codeTemplate && (
                                    <div className="text-sm">
                                      <strong>Template:</strong>
                                      <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
                                        {question.codeTemplate}
                                      </pre>
                                    </div>
                                  )}
                                  {question.testCases && question.testCases.length > 0 && (
                                    <div className="text-sm">
                                      <strong>Test Cases:</strong> {question.testCases.length} cases
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Scenario Questions */}
                              {question.type === "scenario" && question.correctAnswer && (
                                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                  <div className="text-sm font-medium text-blue-800 mb-1">Expected Answer:</div>
                                  <div className="text-sm text-blue-700">{question.correctAnswer}</div>
                                </div>
                              )}

                              {/* Explanation */}
                              {question.explanation && (
                                <div className="mb-3 p-3 bg-muted/50 rounded">
                                  <div className="text-sm font-medium mb-1">Explanation:</div>
                                  <div className="text-sm text-muted-foreground">{question.explanation}</div>
                                </div>
                              )}
                              
                              {question.tags && question.tags.length > 0 && (
                                <div className="flex gap-1 mb-2">
                                  {question.tags.map((tag: string, index: number) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                      onClick={() => setSearchQuery(tag)}
                                      title={`Filter by tag: ${tag}`}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    {question.status === "pending" && <Clock className="h-3 w-3" />}
                                    {question.status === "approved" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                    {question.status === "rejected" && <XCircle className="h-3 w-3 text-red-500" />}
                                    Status: {question.status}
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    {question.creatorUsername?.includes("AI") || question.creatorUsername?.includes("Grok") ? (
                                      <span className="flex items-center gap-1">
                                        🤖 <span className="font-medium">AI Generated</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        👤 <span className="font-medium">{question.creatorName || question.creatorUsername || 'Admin'}</span>
                                        {question.creatorRole && (
                                          <Badge variant="outline" className="text-xs">
                                            {question.creatorRole === "super_admin" ? "Super Admin" : 
                                             question.creatorRole === "admin" ? "Admin" :
                                             question.creatorRole === "reviewer" ? "Reviewer" : question.creatorRole}
                                          </Badge>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {question.createdAt && (
                                    <div className="text-xs">
                                      {new Date(question.createdAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                
                                {question.timeLimit && (
                                  <div className="text-xs text-muted-foreground">
                                    Time: {question.timeLimit}s
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Edit Button - Orange for Modification */}
                              <div 
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: '#fed7aa',
                                  border: '1px solid #fdba74',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fcd34d'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fed7aa'}
                                onClick={() => setEditingQuestion(question)}
                                title="Edit Question"
                              >
                                <Edit3 style={{ width: '16px', height: '16px', color: '#ea580c' }} />
                              </div>

                              {/* View Button - Blue for Primary Action */}
                              <div 
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: '#dbeafe',
                                  border: '1px solid #93c5fd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bfdbfe'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                onClick={() => setViewingQuestion(question)}
                                title="View Question Details"
                              >
                                <Eye style={{ width: '16px', height: '16px', color: '#1d4ed8' }} />
                              </div>

                              {/* Copy Button - Green for Creation */}
                              <div 
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: '#dcfce7',
                                  border: '1px solid #86efac',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbf7d0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                                onClick={() => copyQuestionMutation.mutate(question.id)}
                                title="Copy Question"
                              >
                                <Copy style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                              </div>

                              {/* Delete Button - Red for Destructive Action */}
                              <div 
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
                                    deleteQuestionMutation.mutate(question.id);
                                  }
                                }}
                                title="Delete Question"
                              >
                                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create Questions Tab */}
            <TabsContent value="create" className="space-y-6">
              {/* Status Message */}
              {statusMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  statusMessage.includes("success") || statusMessage.includes("successfully") 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : statusMessage.includes("error") || statusMessage.includes("failed")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {statusMessage.includes("success") || statusMessage.includes("successfully") ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                  {statusMessage}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Question Type *</Label>
                        <Select value={formData.type} onValueChange={(value) => handleFormChange("type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="coding">Coding Challenge</SelectItem>
                            <SelectItem value="scenario">Scenario-based</SelectItem>
                            <SelectItem value="drag-drop">Drag & Drop</SelectItem>
                            <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Domain *</Label>
                        <Select value={formData.domain} onValueChange={(value) => handleFormChange("domain", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Programming">Programming</SelectItem>
                            <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                            <SelectItem value="Backend Development">Backend Development</SelectItem>
                            <SelectItem value="DevOps & Cloud">DevOps & Cloud</SelectItem>
                            <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                            <SelectItem value="Data Science & AI">Data Science & AI</SelectItem>
                            <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                            <SelectItem value="Database Management">Database Management</SelectItem>
                            <SelectItem value="Network Administration">Network Administration</SelectItem>
                            <SelectItem value="VMware Virtualization">VMware Virtualization</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Level *</Label>
                        <Select value={formData.level} onValueChange={(value) => handleFormChange("level", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map(level => (
                              <SelectItem key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Difficulty *</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => handleFormChange("difficulty", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTIES.map(difficulty => (
                              <SelectItem key={difficulty} value={difficulty}>
                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Question Text *</Label>
                        <Textarea 
                          placeholder="Enter your question..."
                          className="min-h-32"
                          value={formData.questionText}
                          onChange={(e) => handleFormChange("questionText", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Tags (comma-separated)</Label>
                        <Input 
                          placeholder="javascript, react, hooks..." 
                          value={formData.tags}
                          onChange={(e) => handleFormChange("tags", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Time Limit (minutes)</Label>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          value={formData.timeLimit}
                          onChange={(e) => handleFormChange("timeLimit", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic fields based on question type */}
                  {(formData.type === "mcq" || formData.type === "multiple-choice") && (
                    <div className="mt-6 space-y-4">
                      <Label>Answer Options</Label>
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                          />
                          <Checkbox
                            checked={formData.correctAnswer === option}
                            onCheckedChange={(checked) => {
                              if (checked) handleFormChange("correctAnswer", option);
                            }}
                          />
                          <Label className="text-sm">Correct</Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.type === "coding" && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label>Programming Language</Label>
                        <Select value={formData.codeLanguage} onValueChange={(value) => handleFormChange("codeLanguage", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                            <SelectItem value="rust">Rust</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Code Template (Optional)</Label>
                        <Textarea
                          placeholder="function solution() { \n  // Your code here \n}"
                          className="font-mono"
                          value={formData.codeTemplate}
                          onChange={(e) => handleFormChange("codeTemplate", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {(formData.type === "scenario" || formData.type === "fill-blank") && (
                    <div className="mt-6">
                      <Label>Expected Answer</Label>
                      <Textarea
                        placeholder="Enter the expected answer or solution approach..."
                        value={formData.correctAnswer}
                        onChange={(e) => handleFormChange("correctAnswer", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mt-6">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      placeholder="Provide an explanation for the correct answer..."
                      value={formData.explanation}
                      onChange={(e) => handleFormChange("explanation", e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <Button 
                      onClick={handleCreateQuestion}
                      disabled={createQuestionMutation.isPending}
                    >
                      {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                    </Button>
                    <Button variant="outline" onClick={handleSaveAsDraft}>
                      Save as Draft
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleAiEnhance}
                      disabled={aiEnhanceMutation.isPending}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {aiEnhanceMutation.isPending ? "Enhancing..." : "AI Enhance"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Queue Tab - COMPLETELY REDESIGNED for Maximum Clarity */}
            <TabsContent value="review" className="space-y-8">
              {/* Large, Obvious Header */}
              <div className="text-center bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-orange-900 mb-2">
                  Question Approval Required
                </h1>
                <p className="text-lg text-orange-800 mb-6">
                  {typedPendingQuestions.length > 0 
                    ? `${typedPendingQuestions.length} questions are waiting for your approval before they can be used in tests`
                    : "All questions have been reviewed and approved!"
                  }
                </p>
                
                {typedPendingQuestions.length > 0 && (
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      size="lg"
                      onClick={() => {
                        typedPendingQuestions.forEach((question: any) => {
                          approveQuestionMutation.mutate({ id: question.id, status: "approved" });
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
                      disabled={approveQuestionMutation.isPending}
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      {approveQuestionMutation.isPending 
                        ? "Approving All Questions..." 
                        : `✓ APPROVE ALL ${typedPendingQuestions.length} QUESTIONS`
                      }
                    </Button>
                    <div className="text-orange-700 font-medium">
                      OR review individually below ↓
                    </div>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">Individual Question Review</h2>
                  <p className="text-sm text-gray-600 mt-1">Click the green APPROVE button for each question you want to approve</p>
                </div>

                <div className="p-6">
                  {typedPendingQuestions.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All questions approved!</h3>
                      <p className="text-gray-600">No questions pending review at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {typedPendingQuestions.map((question: any, index: number) => (
                        <div key={question.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          {/* Question Header */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    #{index + 1}
                                  </span>
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {question.type.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {question.domain}
                                  </Badge>
                                </div>
                                
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{question.question}</h3>
                                
                                <div className="text-sm text-gray-500">
                                  Created by: <span className="font-medium">{question.createdBy}</span> • {new Date(question.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 ml-4">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setViewingQuestion(question)}
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => approveQuestionMutation.mutate({ id: question.id, status: "rejected" })}
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  disabled={approveQuestionMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => approveQuestionMutation.mutate({ id: question.id, status: "approved" })}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={approveQuestionMutation.isPending}
                                >
                                  {approveQuestionMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Question Content */}
                          <div className="px-6 py-4">
                            {/* MCQ Options */}
                            {(question.type === "mcq" || question.type === "multiple-choice") && question.options && question.options.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Answer Options:</h4>
                                <div className="grid gap-2">
                                  {question.options.map((option: string, optionIndex: number) => (
                                    <div key={optionIndex} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                                      option === question.correctAnswer 
                                        ? 'bg-green-50 border-green-200 text-green-900' 
                                        : 'bg-white border-gray-200'
                                    }`}>
                                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </span>
                                      <span className="flex-1">{option}</span>
                                      {option === question.correctAnswer && (
                                        <div className="flex items-center gap-1 text-green-600">
                                          <CheckCircle2 className="h-4 w-4" />
                                          <span className="text-xs font-medium">Correct</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Coding Questions */}
                            {question.type === "coding" && (
                              <div className="space-y-3">
                                {question.codeLanguage && (
                                  <div className="flex items-center gap-2">
                                    <Code2 className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">Language: {question.codeLanguage}</span>
                                  </div>
                                )}
                                {question.codeTemplate && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Code Template:</h4>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                                      {question.codeTemplate}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Scenario Questions */}
                            {question.type === "scenario" && question.correctAnswer && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Expected Answer:</h4>
                                <p className="text-blue-800">{question.correctAnswer}</p>
                              </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="font-medium text-amber-900 mb-2">Explanation:</h4>
                                <p className="text-amber-800">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Manage Tests Tab */}
            <TabsContent value="manage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Question Sets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Test management functionality will be available here.
                    You can assign selected questions to specific tests and manage question pools.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </RoleGuard>
      </div>
      
      {/* View Question Dialog */}
      {viewingQuestion && (
        <Dialog open={!!viewingQuestion} onOpenChange={() => setViewingQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Question Preview
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{viewingQuestion.type.toUpperCase()}</Badge>
                <Badge variant="secondary">{viewingQuestion.difficulty}</Badge>
                <Badge>{viewingQuestion.domain}</Badge>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Question:</h3>
                <p>{viewingQuestion.question}</p>
              </div>
              
              {viewingQuestion.options && viewingQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Options:</h4>
                  {viewingQuestion.options.map((option: string, index: number) => (
                    <div key={index} className={`flex items-center gap-2 p-2 rounded border ${
                      option === viewingQuestion.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-muted/30'
                    }`}>
                      <span className="font-mono text-xs w-6 h-6 rounded-full bg-background flex items-center justify-center">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {option === viewingQuestion.correctAnswer && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {viewingQuestion.correctAnswer && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-green-800">Correct Answer:</div>
                  <div className="text-green-700">{viewingQuestion.correctAnswer}</div>
                </div>
              )}
              
              {viewingQuestion.explanation && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-blue-800">Explanation:</div>
                  <div className="text-blue-700">{viewingQuestion.explanation}</div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit Question
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedQuestion = {
                question: formData.get("question"),
                type: formData.get("type"),
                domain: formData.get("domain"),
                difficulty: formData.get("difficulty"),
                options: formData.get("options") ? (formData.get("options") as string).split('\n').filter(Boolean) : [],
                correctAnswer: formData.get("correctAnswer"),
                explanation: formData.get("explanation"),
                tags: formData.get("tags") ? (formData.get("tags") as string).split(',').map(t => t.trim()) : []
              };
              updateQuestionMutation.mutate({ id: editingQuestion.id, questionData: updatedQuestion });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question Text</Label>
                  <Textarea
                    id="question"
                    name="question"
                    defaultValue={editingQuestion.question}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue={editingQuestion.type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="scenario">Scenario</SelectItem>
                        <SelectItem value="drag-drop">Drag & Drop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select name="difficulty" defaultValue={editingQuestion.difficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="tough">Tough</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Select name="domain" defaultValue={editingQuestion.domain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map(domain => (
                        <SelectItem key={domain} value={domain}>
                          {domain.charAt(0).toUpperCase() + domain.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {editingQuestion.type === "mcq" && (
                  <>
                    <div>
                      <Label htmlFor="options">Options (one per line)</Label>
                      <Textarea
                        id="options"
                        name="options"
                        defaultValue={editingQuestion.options?.join('\n') || ''}
                        className="min-h-[100px]"
                        placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Input
                        id="correctAnswer"
                        name="correctAnswer"
                        defaultValue={editingQuestion.correctAnswer}
                        placeholder="Enter the correct answer exactly as written in options"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    name="explanation"
                    defaultValue={editingQuestion.explanation}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    defaultValue={editingQuestion.tags?.join(', ') || ''}
                    placeholder="react, javascript, frontend"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingQuestion(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateQuestionMutation.isPending}>
                    {updateQuestionMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign to Test Dialog */}
      <Dialog open={isAssignToTestOpen} onOpenChange={setIsAssignToTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Questions to Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                You are about to assign {selectedQuestions.length} questions to a test.
              </p>
              
              <Label>Select Test</Label>
              <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a test" />
                </SelectTrigger>
                <SelectContent>
                  {typedTests.map((test: any) => (
                    <SelectItem key={test.id} value={test.id.toString()}>
                      {test.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAssignToTestOpen(false);
                  setSelectedTestId("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmAssignToTest}
                disabled={assignQuestionsToTestMutation.isPending || !selectedTestId}
              >
                {assignQuestionsToTestMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  "Assign Questions"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}