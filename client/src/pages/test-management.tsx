import { useState } from "react";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestCheckbox } from "@/components/test-checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Users, 
  Brain, 
  Settings2, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Calendar,
  Clock,
  Shield,
  ChevronRight,
  BarChart3,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  Zap,
  BookOpen,
  Code2,
  TrendingUp,
  Code,
  FileText,
  PieChart,
  Activity,
  Award
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, AreaChart, Area, Pie } from 'recharts';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ROLES } from "@shared/roles";

// Component to display test questions
function TestQuestions({ testId }: { testId: number }) {
  const [viewingQuestion, setViewingQuestion] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isViewAllDialogOpen, setIsViewAllDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["/api/tests", testId, "questions"],
    queryFn: () => fetch(`/api/tests/${testId}/questions`).then(res => res.json()),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  });

  // Check if current user is admin  
  const isCurrentUserAdmin = (currentUser as any)?.role === 'admin' || (currentUser as any)?.role === 'superadmin';

  const updateQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const res = await apiRequest("PUT", `/api/questions/${questionData.id}`, questionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests", testId, "questions"] });
      setEditingQuestion(null);
      toast({
        title: "Question Updated",
        description: "Question has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const updatedQuestion = {
      ...editingQuestion,
      question: formData.get('question') as string,
      options: editingQuestion.type === 'mcq' ? 
        (formData.get('options') as string).split('\n').filter(opt => opt.trim()) : 
        editingQuestion.options,
      correctAnswer: formData.get('correctAnswer') as string,
      explanation: formData.get('explanation') as string,
      difficulty: formData.get('difficulty') as string,
    };

    updateQuestionMutation.mutate(updatedQuestion);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "coding": return <Code className="h-3 w-3" />;
      case "mcq": return <BookOpen className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };



  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No questions linked to this test yet. Use "Generate More Questions" to add questions.
      </div>
    );
  }

  // Group questions by set
  const questionsBySet = questions.reduce((acc: any, question: any) => {
    const setNumber = question.setNumber || 1;
    if (!acc[setNumber]) {
      acc[setNumber] = [];
    }
    acc[setNumber].push(question);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsViewAllDialogOpen(true)}
          className="text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          View All Questions
        </Button>
        <span className="text-xs text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? 's' : ''} total
        </span>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-3">
        {Object.keys(questionsBySet).map((setNumber) => {
          const setQuestions = questionsBySet[setNumber];
          const isMultipleSets = Object.keys(questionsBySet).length > 1;
          
          return (
            <div key={setNumber} className={`${isMultipleSets ? 'border rounded-lg p-2 bg-muted/30' : ''}`}>
              {isMultipleSets && (
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Question Set {setNumber} ({setQuestions.length} questions)
                </div>
              )}
              
              <div className="space-y-2">
                {setQuestions.slice(0, 3).map((question: any, index: number) => {
                  const creator = (users as any)?.find((user: any) => user.id === question.createdBy);
                  const createdDate = new Date(question.createdAt);
                  
                  return (
                    <div key={question.id} className="text-xs p-2 bg-muted/50 rounded border">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-foreground flex-1">
                          Q{index + 1}: {question.question.slice(0, 80)}...
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {getTypeIcon(question.type)}
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {question.type?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {question.difficulty}
                          </Badge>
                          <span className="text-[10px]">
                            by {creator?.name || 'Unknown User'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-[9px]"
                            onClick={() => setViewingQuestion(question)}
                          >
                            <Eye className="h-2.5 w-2.5 mr-0.5" />
                            View
                          </Button>
                          {isCurrentUserAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-2 text-[9px]"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Edit3 className="h-2.5 w-2.5 mr-0.5" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {setQuestions.length > 3 && (
                  <div className="text-xs text-muted-foreground italic text-center py-1">
                    ... and {setQuestions.length - 3} more questions
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Questions Dialog */}
      <Dialog open={isViewAllDialogOpen} onOpenChange={setIsViewAllDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Questions ({questions.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Organize questions by difficulty level in folder structure */}
            {['easy', 'medium', 'hard', 'expert'].map(difficulty => {
              const difficultyQuestions = questions.filter((q: any) => q.difficulty?.toLowerCase() === difficulty);
              if (difficultyQuestions.length === 0) return null;
              
              return (
                <div key={difficulty} className="border rounded-lg">
                  <div className="bg-muted/30 px-4 py-2 border-b flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      difficulty === 'easy' ? 'bg-green-500' :
                      difficulty === 'medium' ? 'bg-yellow-500' :
                      difficulty === 'hard' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-semibold capitalize">{difficulty} Level</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {difficultyQuestions.length} questions
                    </Badge>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {difficultyQuestions.map((question: any, index: number) => {
                      const creator = (users as any)?.find((user: any) => user.id === question.createdBy);
                      const associatedTests = (tests as any)?.filter((test: any) => 
                        test.questions?.some((tq: any) => tq.id === question.id)
                      ) || [];
                      
                      return (
                        <div key={question.id} className="border rounded-lg p-4 space-y-3 bg-card">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">Q{index + 1}:</span>
                              {getTypeIcon(question.type)}
                              <Badge variant="outline" className="text-xs">
                                {question.type?.toUpperCase()}
                              </Badge>
                              
                              {/* Show associated tests */}
                              {associatedTests.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">Tests:</span>
                                  {associatedTests.slice(0, 2).map((test: any) => (
                                    <Badge key={test.id} variant="secondary" className="text-xs">
                                      {test.title}
                                    </Badge>
                                  ))}
                                  {associatedTests.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{associatedTests.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {/* Show domain/category tags */}
                              {question.domain && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  {question.domain}
                                </Badge>
                              )}
                            </div>
                            {isCurrentUserAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingQuestion(question);
                                  setIsViewAllDialogOpen(false);
                                }}
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <strong>Question:</strong>
                              <p className="mt-1 text-sm bg-muted/50 p-2 rounded">{question.question}</p>
                            </div>
                            
                            {question.type === 'mcq' && question.options && (
                              <div>
                                <strong>Options:</strong>
                                <ul className="mt-1 text-sm bg-muted/50 p-2 rounded space-y-1">
                                  {question.options.map((option: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                        {String.fromCharCode(65 + idx)}
                                      </span>
                                      {option}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {isCurrentUserAdmin && (question.correctAnswer || question.correct_answer) && (
                              <div>
                                <strong className="text-green-600">Correct Answer:</strong>
                                <p className="mt-1 text-sm bg-green-50 p-2 rounded border border-green-200">
                                  {question.correctAnswer || question.correct_answer}
                                </p>
                              </div>
                            )}
                            
                            {question.explanation && (
                              <div>
                                <strong>Explanation:</strong>
                                <p className="mt-1 text-sm bg-muted/50 p-2 rounded">{question.explanation}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                              <span>Created by {creator?.name || 'Unknown User'}</span>
                              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Single Question Dialog */}
      <Dialog open={!!viewingQuestion} onOpenChange={() => setViewingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Question Details
              {viewingQuestion && getTypeIcon(viewingQuestion.type)}
              <Badge variant="outline">{viewingQuestion?.type?.toUpperCase()}</Badge>
            </DialogTitle>
          </DialogHeader>
          {viewingQuestion && (
            <div className="space-y-4">
              <div>
                <strong>Question:</strong>
                <p className="mt-1 text-sm bg-muted/50 p-3 rounded">{viewingQuestion.question}</p>
              </div>
              
              {viewingQuestion.type === 'mcq' && viewingQuestion.options && (
                <div>
                  <strong>Options:</strong>
                  <ul className="mt-1 text-sm bg-muted/50 p-3 rounded space-y-2">
                    {viewingQuestion.options.map((option: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {isCurrentUserAdmin && (viewingQuestion.correctAnswer || viewingQuestion.correct_answer) && (
                <div>
                  <strong className="text-green-600">Correct Answer (Admin Only):</strong>
                  <p className="mt-1 text-sm bg-green-50 p-3 rounded border border-green-200">
                    {viewingQuestion.correctAnswer || viewingQuestion.correct_answer}
                  </p>
                </div>
              )}
              
              {viewingQuestion.explanation && (
                <div>
                  <strong>Explanation:</strong>
                  <p className="mt-1 text-sm bg-muted/50 p-3 rounded">{viewingQuestion.explanation}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Difficulty: <Badge variant="outline">{viewingQuestion.difficulty}</Badge></span>
                <span>Type: <Badge variant="outline">{viewingQuestion.type}</Badge></span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div>
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  name="question"
                  defaultValue={editingQuestion.question}
                  className="min-h-20"
                  required
                />
              </div>
              
              {editingQuestion.type === 'mcq' && (
                <div>
                  <Label htmlFor="options">Options (one per line)</Label>
                  <Textarea
                    id="options"
                    name="options"
                    defaultValue={editingQuestion.options?.join('\n') || ''}
                    placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                    className="min-h-20"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="correctAnswer">Correct Answer</Label>
                <Textarea
                  id="correctAnswer"
                  name="correctAnswer"
                  defaultValue={editingQuestion.correctAnswer || editingQuestion.correct_answer || ''}
                  className="min-h-16"
                />
              </div>
              
              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  name="explanation"
                  defaultValue={editingQuestion.explanation || ''}
                  className="min-h-16"
                />
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
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateQuestionMutation.isPending}
                >
                  {updateQuestionMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DOMAINS = [
  "programming", "frontend", "backend", "devops", "cloud", 
  "mobile", "data-science", "ai-ml", "security", "databases", "networking",
  "vmware-virtualization", "redhat-administration", "oracle-administration", "network-routing-switching"
];

const LEVELS = ["junior", "mid", "senior", "lead", "principal"];
const DIFFICULTIES = ["easy", "medium", "tough"];

export default function TestManagement() {
  const [activeTab, setActiveTab] = useState("create");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("mixed");
  const [customDomain, setCustomDomain] = useState("");
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [aiGenerationSettings, setAiGenerationSettings] = useState({
    sameSetForBatch: true,
    generateMultipleSets: false,
    easyCount: 5,
    mediumCount: 10,
    toughCount: 5,
    numberOfSets: 2
  });
  const [testDescription, setTestDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [assignmentData, setAssignmentData] = useState({
    dueDate: '',
    timeLimit: 60,
    maxAttempts: 1
  });

  // Smart passing score recommendations based on level
  const getRecommendedPassingScore = (level: string) => {
    switch (level) {
      case 'junior': return 60;
      case 'mid': return 70;
      case 'senior': return 75;
      case 'lead': return 80;
      case 'principal': return 85;
      default: return 70;
    }
  };

  // Update passing score when level changes
  const handleLevelChange = (newLevel: string) => {
    setSelectedLevel(newLevel);
    const recommendedScore = getRecommendedPassingScore(newLevel);
    setPassingScore(recommendedScore);
  };
  const { toast } = useToast();

  // Add questions to test mutation
  const addQuestionsToTestMutation = useMutation({
    mutationFn: async ({ testId, questionData }: { testId: number; questionData: any }) => {
      const res = await apiRequest("POST", `/api/tests/${testId}/generate-questions`, questionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      setIsEditTestOpen(false);
      toast({
        title: "Success",
        description: "Questions added to test successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: async ({ testId, testData }: { testId: number; testData: any }) => {
      const res = await apiRequest("PUT", `/api/tests/${testId}`, testData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      setIsEditTestOpen(false);
      setEditingTest(null);
      toast({
        title: "Success",
        description: "Test updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Copy test mutation
  const copyTestMutation = useMutation({
    mutationFn: async (testId: number) => {
      const res = await apiRequest("POST", `/api/tests/${testId}/copy`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({
        title: "Success",
        description: "Test copied successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: async (testId: number) => {
      await apiRequest("DELETE", `/api/tests/${testId}`);
      return true; // DELETE request successful, no response body expected
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({
        title: "Success",
        description: "Test deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const splitBatchesMutation = useMutation({
    mutationFn: async (testId: number) => {
      const res = await apiRequest("POST", `/api/tests/${testId}/split-batches`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({
        title: "Success",
        description: `Test split into ${data.newTests.length} separate tests successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleDeleteTest = (testId: number) => {
    if (confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      deleteTestMutation.mutate(testId);
    }
  };

  const handleEditTest = (test: any) => {
    setEditingTest(test);
    // Set form defaults based on current test data
    setSelectedDomain(test.domain);
    setSelectedLevel(test.level);
    setTestDescription(test.description || '');
    setPassingScore(test.passingScore || 70);
    setIsEditTestOpen(true);
  };

  const handleCopyTest = (testId: number) => {
    copyTestMutation.mutate(testId);
  };

  const handleSplitBatches = (testId: number) => {
    if (confirm("Are you sure you want to split this test into separate tests for each batch? This will create new tests for each question set.")) {
      splitBatchesMutation.mutate(testId);
    }
  };

  // Assignment mutation
  const assignTestsMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const assignments = [];
      for (const testId of selectedTests) {
        for (const userId of selectedEmployees) {
          const assignment = {
            userId,
            testId,
            scheduledAt: new Date(),
            dueDate: new Date(assignmentData.dueDate),
            timeLimit: assignmentData.timeLimit,
            maxAttempts: assignmentData.maxAttempts,
            assignedBy: (currentUser as any)?.id,
            status: 'assigned'
          };
          const res = await apiRequest("POST", "/api/assignments", assignment);
          assignments.push(await res.json());
        }
      }
      return assignments;
    },
    onSuccess: (assignments) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      setSelectedTests([]);
      setSelectedEmployees([]);
      setAssignmentData({ dueDate: '', timeLimit: 60, maxAttempts: 1 });
      toast({
        title: "Tests Assigned Successfully",
        description: `${assignments.length} test assignments created`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignTests = () => {
    if (selectedTests.length === 0) {
      toast({
        title: "No Tests Selected",
        description: "Please select at least one test to assign",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Employees Selected",
        description: "Please select at least one employee to assign tests to",
        variant: "destructive",
      });
      return;
    }
    
    if (!assignmentData.dueDate) {
      toast({
        title: "Due Date Required",
        description: "Please set a due date for the assignments",
        variant: "destructive",
      });
      return;
    }

    assignTestsMutation.mutate(assignmentData);
  };

  const { data: tests = [] } = useQuery({
    queryKey: ["/api/tests"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: testResults = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
  });

  const { data: liveSessions = [] } = useQuery({
    queryKey: ["/api/live-sessions"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get all assignments to show assigned tests statistics
  const { data: allAssignments = [] } = useQuery({
    queryKey: ["/api/all-assignments"],
  });

  const createTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const res = await apiRequest("POST", "/api/tests", testData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Test created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create test", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const generateAIQuestionsMutation = useMutation({
    mutationFn: async (testId?: number) => {
      return await generateQuestionsWithAI(selectedDomain, selectedLevel, testId);
    },
    onSuccess: (data, testId) => {
      const questionsPerSet = aiGenerationSettings.easyCount + aiGenerationSettings.mediumCount + aiGenerationSettings.toughCount;
      const totalSets = aiGenerationSettings.generateMultipleSets ? aiGenerationSettings.numberOfSets : 1;
      
      toast({ 
        title: `Generated ${data.length} AI questions!`,
        description: testId 
          ? aiGenerationSettings.generateMultipleSets 
            ? `Created ${totalSets} unique question sets (${questionsPerSet} questions each) linked to test with generation metadata`
            : `Questions linked to test. Created ${aiGenerationSettings.easyCount} easy, ${aiGenerationSettings.mediumCount} medium, ${aiGenerationSettings.toughCount} tough questions with generation metadata`
          : `Questions added to Question Bank. Created ${aiGenerationSettings.easyCount} easy, ${aiGenerationSettings.mediumCount} medium, ${aiGenerationSettings.toughCount} tough questions`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      // Invalidate test-specific questions
      if (testId) {
        queryClient.invalidateQueries({ queryKey: ["/api/tests", testId, "questions"] });
      }
      // Switch to monitor tab to see the linked questions
      if (testId) {
        setActiveTab("monitor");
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "AI generation failed", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const enhanceDescriptionMutation = useMutation({
    mutationFn: async (data: { title: string; domain: string; level: string; currentDescription?: string }) => {
      const response = await apiRequest("POST", "/api/ai/enhance-description", data);
      return response.json();
    },
    onSuccess: (data) => {
      setTestDescription(data.enhancedDescription);
      toast({ 
        title: "Description Enhanced!",
        description: "AI has improved your test description"
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Enhancement failed", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const generateQuestionsWithAI = async (domain: string, level: string, testId?: number) => {
    try {
      const response = await apiRequest("POST", "/api/ai/generate-questions", {
        domain,
        level,
        testType: selectedTestType,
        testId,
        difficulties: DIFFICULTIES,
        counts: {
          easy: aiGenerationSettings.easyCount,
          medium: aiGenerationSettings.mediumCount,
          tough: aiGenerationSettings.toughCount
        },
        multipleSets: aiGenerationSettings.generateMultipleSets,
        sameSetForBatch: aiGenerationSettings.sameSetForBatch,
        numberOfSets: aiGenerationSettings.numberOfSets
      });
      return response.json();
    } catch (error) {
      console.error("AI question generation failed:", error);
      throw error;
    }
  };

  const handleCreateTest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const finalDomain = isCustomDomain ? customDomain : selectedDomain;
    
    if (!finalDomain || !selectedLevel || !selectedTestType) {
      toast({
        title: "Required Fields Missing",
        description: "Please select domain, skill level, and test type",
        variant: "destructive"
      });
      return;
    }
    
    const testData = {
      title: formData.get('title') as string,
      description: testDescription || (formData.get('description') as string),
      domain: finalDomain,
      level: selectedLevel,
      duration: parseInt(formData.get('duration') as string) || 60,
      totalQuestions: aiGenerationSettings.easyCount + aiGenerationSettings.mediumCount + aiGenerationSettings.toughCount,
      passingScore: passingScore,
    };
    
    createTestMutation.mutate(testData);
  };

  const handleAddQuestions = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTest) return;

    const questionData = {
      domain: editingTest.domain,
      level: editingTest.level,
      easyCount: aiGenerationSettings.easyCount,
      mediumCount: aiGenerationSettings.mediumCount,
      toughCount: aiGenerationSettings.toughCount,
    };

    addQuestionsToTestMutation.mutate({
      testId: editingTest.id,
      questionData
    });
  };

  const employeesByDomain = (users as any[]).filter((user: any) => 
    user.role === ROLES.EMPLOYEE || user.role === 'employee'
  );

  const [, setLocation] = useLocation();

  const handleTabChange = (tab: string) => {
    if (tab === 'assign') {
      // Navigate to the redesigned test assignment page
      setLocation('/test-assignment');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER]}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Test Management</h1>
            <p className="text-muted-foreground">
              Create domain-based assessments, assign to employees, and manage AI-generated question sets
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="create">Create Tests</TabsTrigger>
              <TabsTrigger value="assign">Assign Tests</TabsTrigger>
              <TabsTrigger value="assigned">View Assigned</TabsTrigger>
              <TabsTrigger value="monitor">Monitor Progress</TabsTrigger>
              <TabsTrigger value="results">Manage Results</TabsTrigger>
            </TabsList>

            {/* Create Tests Tab */}
            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    AI-Powered Test Creation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="domain">Technical Domain</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <TestCheckbox 
                              checked={isCustomDomain}
                              onCheckedChange={(checked) => {
                                setIsCustomDomain(checked);
                                if (checked) {
                                  setSelectedDomain("");
                                } else {
                                  setCustomDomain("");
                                }
                              }}
                            />
                            <Label className="text-sm">Create custom domain</Label>
                          </div>
                          
                          {isCustomDomain ? (
                            <Input 
                              placeholder="Enter custom domain (e.g., Blockchain, IoT, Product Management)"
                              value={customDomain}
                              onChange={(e) => setCustomDomain(e.target.value)}
                            />
                          ) : (
                            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain" />
                              </SelectTrigger>
                              <SelectContent>
                                {DOMAINS.map(domain => (
                                  <SelectItem key={domain} value={domain}>
                                    {domain.charAt(0).toUpperCase() + domain.slice(1).replace('-', ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Test Type</Label>
                        <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                          <SelectTrigger className="[&>svg]:!hidden [&>[data-radix-select-icon]]:!hidden [&_svg]:!hidden" style={{backgroundImage: 'none'}}>
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                          <SelectContent className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                            <SelectItem value="mixed">Mixed (MCQ + Programming)</SelectItem>
                            <SelectItem value="mcq">Multiple Choice Only</SelectItem>
                            <SelectItem value="programming">Programming/Coding Only</SelectItem>
                            <SelectItem value="general">General Knowledge MCQ</SelectItem>
                            <SelectItem value="situational">Situational/Scenario-Based</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose the type of questions for this test
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="level">Skill Level</Label>
                        <Select value={selectedLevel} onValueChange={handleLevelChange}>
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
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Smart Generation Settings</Label>
                        <div className="flex items-center space-x-2">
                          <TestCheckbox 
                            checked={aiGenerationSettings.sameSetForBatch}
                            onCheckedChange={(checked) => 
                              setAiGenerationSettings(prev => ({ 
                                ...prev, 
                                sameSetForBatch: checked,
                                generateMultipleSets: !checked 
                              }))
                            }
                          />
                          <Label className="text-sm">Same question set for entire batch</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TestCheckbox 
                            checked={aiGenerationSettings.generateMultipleSets}
                            onCheckedChange={(checked) => 
                              setAiGenerationSettings(prev => ({ 
                                ...prev, 
                                generateMultipleSets: checked,
                                sameSetForBatch: !checked 
                              }))
                            }
                          />
                          <Label className="text-sm">Generate multiple sets automatically</Label>
                        </div>
                        
                        {aiGenerationSettings.generateMultipleSets && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Label htmlFor="numberOfSets" className="text-sm font-medium">Number of Question Sets</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                id="numberOfSets"
                                type="number"
                                min="2"
                                max="10"
                                value={aiGenerationSettings.numberOfSets}
                                onChange={(e) => 
                                  setAiGenerationSettings(prev => ({ 
                                    ...prev, 
                                    numberOfSets: parseInt(e.target.value) || 2 
                                  }))
                                }
                                className="w-20"
                              />
                              <span className="text-xs text-muted-foreground">
                                Each set will have {aiGenerationSettings.easyCount + aiGenerationSettings.mediumCount + aiGenerationSettings.toughCount} unique questions
                              </span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                              💡 Total questions to generate: {(aiGenerationSettings.easyCount + aiGenerationSettings.mediumCount + aiGenerationSettings.toughCount) * aiGenerationSettings.numberOfSets}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Easy Questions</Label>
                          <Input 
                            type="number" 
                            value={aiGenerationSettings.easyCount}
                            onChange={(e) => setAiGenerationSettings(prev => ({ 
                              ...prev, 
                              easyCount: parseInt(e.target.value) || 0 
                            }))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Medium Questions</Label>
                          <Input 
                            type="number" 
                            value={aiGenerationSettings.mediumCount}
                            onChange={(e) => setAiGenerationSettings(prev => ({ 
                              ...prev, 
                              mediumCount: parseInt(e.target.value) || 0 
                            }))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Tough Questions</Label>
                          <Input 
                            type="number" 
                            value={aiGenerationSettings.toughCount}
                            onChange={(e) => setAiGenerationSettings(prev => ({ 
                              ...prev, 
                              toughCount: parseInt(e.target.value) || 0 
                            }))}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCreateTest} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Test Title</Label>
                        <Input name="title" placeholder="e.g., Frontend React Assessment" required />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input name="duration" type="number" placeholder="60" required />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const titleElement = document.querySelector('input[name="title"]') as HTMLInputElement;
                            const title = titleElement?.value;
                            
                            if (!title) {
                              toast({
                                title: "Enter a title first",
                                description: "AI needs the test title to enhance the description",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            const finalDomain = isCustomDomain ? customDomain : selectedDomain;
                            if (!finalDomain || !selectedLevel) {
                              toast({
                                title: "Select domain and level first",
                                description: "AI needs context to create a good description",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            enhanceDescriptionMutation.mutate({
                              title,
                              domain: finalDomain,
                              level: selectedLevel,
                              currentDescription: testDescription
                            });
                          }}
                          disabled={enhanceDescriptionMutation.isPending}
                          className="flex items-center gap-1.5 h-8 px-3"
                        >
                          {enhanceDescriptionMutation.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Enhance with AI
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea 
                        name="description" 
                        placeholder="Brief description of this test..." 
                        value={testDescription}
                        onChange={(e) => setTestDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Select 
                        value={passingScore.toString()} 
                        onValueChange={(value) => setPassingScore(parseInt(value))}
                      >
                        <SelectTrigger className="[&>svg]:!hidden [&>[data-radix-select-icon]]:!hidden [&_svg]:!hidden" style={{backgroundImage: 'none'}}>
                          <SelectValue placeholder="Select passing score" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50% - Entry Level (Basic Understanding)</SelectItem>
                          <SelectItem value="60">60% - Acceptable (Minimum Competency) {selectedLevel === 'junior' && '⭐ Recommended'}</SelectItem>
                          <SelectItem value="65">65% - Good (Above Average)</SelectItem>
                          <SelectItem value="70">70% - Standard (Industry Standard) {selectedLevel === 'mid' && '⭐ Recommended'}</SelectItem>
                          <SelectItem value="75">75% - Proficient (Strong Performance) {selectedLevel === 'senior' && '⭐ Recommended'}</SelectItem>
                          <SelectItem value="80">80% - Advanced (Excellent Performance) {selectedLevel === 'lead' && '⭐ Recommended'}</SelectItem>
                          <SelectItem value="85">85% - Expert (Outstanding Performance) {selectedLevel === 'principal' && '⭐ Recommended'}</SelectItem>
                          <SelectItem value="90">90% - Master (Exceptional Performance)</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {passingScore < 60 && "⚠️ Very low standard - suitable only for basic screening"}
                          {passingScore >= 60 && passingScore < 70 && "📊 Minimum competency - entry-level positions"}
                          {passingScore >= 70 && passingScore < 80 && "✅ Industry standard - most corporate assessments"}
                          {passingScore >= 80 && passingScore < 90 && "🎯 Advanced level - senior/specialist roles"}
                          {passingScore >= 90 && "🏆 Expert level - leadership/architect positions"}
                        </div>
                        {selectedLevel && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            💡 Recommended for {selectedLevel} level: {getRecommendedPassingScore(selectedLevel)}%
                            {passingScore === getRecommendedPassingScore(selectedLevel) && " (currently applied)"}
                          </div>
                        )}
                      </div>
                      <input type="hidden" name="passingScore" value={passingScore} />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        type="submit"
                        disabled={(!selectedDomain && !customDomain) || !selectedLevel || createTestMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {createTestMutation.isPending ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin" />
                            Creating Test...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Create Test
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button"
                        onClick={() => {
                          const finalDomain = isCustomDomain ? customDomain : selectedDomain;
                          if (!finalDomain || !selectedLevel) {
                            toast({ 
                              title: "Please select domain and level first",
                              variant: "destructive"
                            });
                            return;
                          }
                          // First create a test, then generate questions for it
                          const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
                          if (!titleInput?.value) {
                            toast({ 
                              title: "Please enter a test title first",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          // Create test first
                          const testData = {
                            title: titleInput.value,
                            description: testDescription || `AI-Generated test for ${finalDomain} at ${selectedLevel} level`,
                            domain: finalDomain,
                            level: selectedLevel,
                            duration: 60,
                            totalQuestions: aiGenerationSettings.easyCount + aiGenerationSettings.mediumCount + aiGenerationSettings.toughCount,
                            passingScore: passingScore,
                          };
                          
                          // Create test and then generate questions
                          createTestMutation.mutate(testData, {
                            onSuccess: (newTest) => {
                              generateAIQuestionsMutation.mutate(newTest.id);
                            }
                          });
                        }}
                        disabled={(!selectedDomain && !customDomain) || !selectedLevel || generateAIQuestionsMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {generateAIQuestionsMutation.isPending ? (
                          <>
                          <Clock className="h-4 w-4 animate-spin" />
                          {aiGenerationSettings.generateMultipleSets 
                            ? `Creating Test & Generating ${aiGenerationSettings.numberOfSets} Question Sets...`
                            : "Creating Test & Generating Questions..."
                          }
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4" />
                          {aiGenerationSettings.generateMultipleSets 
                            ? `Create Test + Generate ${aiGenerationSettings.numberOfSets} AI Question Sets`
                            : "Create Test + Generate AI Questions"
                          }
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setActiveTab("monitor");
                        toast({
                          title: "View Test Questions",
                          description: "Generated questions linked to tests are shown in the Monitor Progress tab"
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Test Questions
                    </Button>
                    

                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Tests */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  {(tests as any)?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tests created yet. Create your first test above.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(tests as any)?.map((test: any) => (
                        <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setLocation(`/test-details?id=${test.id}`)}
                          >
                            <h4 className="font-medium hover:text-blue-600 transition-colors">{test.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {test.domain} • {test.level} • {test.totalQuestions || 0} questions
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{test.status}</Badge>
                            <div 
                              className="w-8 h-8 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-400 flex items-center justify-center"
                              onClick={() => handleEditTest(test)}
                              title="Add Questions to Test"
                            >
                              <Edit3 style={{ width: '16px', height: '16px', color: '#1f2937' }} />
                            </div>
                            <div 
                              className="w-8 h-8 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-400 flex items-center justify-center"
                              onClick={() => handleCopyTest(test.id)}
                              title="Copy Test"
                            >
                              <Copy style={{ width: '16px', height: '16px', color: '#1f2937' }} />
                            </div>
                            <div 
                              className="w-8 h-8 rounded cursor-pointer bg-blue-100 hover:bg-blue-200 border border-blue-400 flex items-center justify-center"
                              onClick={() => handleSplitBatches(test.id)}
                              title="Split into Separate Tests (Batches)"
                            >
                              <Zap style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                            </div>
                            <div 
                              className="w-8 h-8 rounded cursor-pointer bg-gray-100 hover:bg-red-100 border border-gray-400 flex items-center justify-center"
                              onClick={() => handleDeleteTest(test.id)}
                              title="Delete Test"
                            >
                              <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assign Tests Tab */}
            <TabsContent value="assign" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Assign Tests to Employees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Available Tests</Label>
                      <div className="space-y-2 mt-2">
                        {(tests as any)?.map((test: any) => (
                          <div 
                            key={test.id} 
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedTests.includes(test.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              if (selectedTests.includes(test.id)) {
                                setSelectedTests(prev => prev.filter(id => id !== test.id));
                              } else {
                                setSelectedTests(prev => [...prev, test.id]);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <TestCheckbox 
                                  checked={selectedTests.includes(test.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedTests(prev => [...prev, test.id]);
                                    } else {
                                      setSelectedTests(prev => prev.filter(id => id !== test.id));
                                    }
                                  }}
                                />
                                <div>
                                  <h4 className="font-medium">{test.title}</h4>
                                  <p className="text-sm text-muted-foreground">{test.domain} • {test.level}</p>
                                </div>
                              </div>
                              <Badge>{test.totalQuestions || 0} questions</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Select Employees ({employeesByDomain.length} available)</Label>
                      <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                        {employeesByDomain.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No employees found.</p>
                            <p className="text-xs">Employee accounts will appear here for assignment.</p>
                          </div>
                        ) : (
                          employeesByDomain.map((employee: any) => (
                            <div key={employee.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-muted/30 transition-colors">
                              <TestCheckbox 
                                checked={selectedEmployees.includes(employee.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedEmployees(prev => [...prev, employee.id]);
                                  } else {
                                    setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{employee.name || employee.username}</p>
                                  <div className="flex gap-1">
                                    <Badge variant="outline">{employee.domain || 'General'}</Badge>
                                    <Badge variant="secondary">{employee.position || 'Employee'}</Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {employee.department || 'No Department'} • {employee.email}
                                </p>
                                {employee.skills && employee.skills.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {employee.skills.slice(0, 3).map((skill: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {employee.skills.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{employee.skills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input 
                          type="date" 
                          id="dueDate" 
                          value={assignmentData.dueDate}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input 
                          type="number" 
                          id="timeLimit" 
                          value={assignmentData.timeLimit}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                          placeholder="60" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="attempts">Max Attempts</Label>
                        <Input 
                          type="number" 
                          id="attempts" 
                          value={assignmentData.maxAttempts}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                          placeholder="1" 
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleAssignTests}
                      disabled={assignTestsMutation.isPending || selectedTests.length === 0 || selectedEmployees.length === 0}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {assignTestsMutation.isPending ? "Assigning..." : `Assign ${selectedTests.length} Tests to ${selectedEmployees.length} Employees`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* View Assigned Tests Tab */}
            <TabsContent value="assigned" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Assigned Tests
                  </CardTitle>
                  <CardDescription>
                    View all tests that have been assigned to employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allAssignments.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Tests</h3>
                      <p className="text-gray-500 mb-4">No tests have been assigned to employees yet.</p>
                      <Button onClick={() => setActiveTab("assign")}>
                        Assign Tests Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allAssignments.map((assignment: any, index: number) => (
                        <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                              <div>
                                <h4 className="font-semibold text-lg">{assignment.test?.title || 'Unknown Test'}</h4>
                                <p className="text-sm text-gray-600">{assignment.test?.domain} • {assignment.test?.level}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500">Assigned to</p>
                                <p className="font-medium">{assignment.user?.firstName} {assignment.user?.lastName}</p>
                                <p className="text-xs text-gray-500">@{assignment.user?.username}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Badge variant={
                                  assignment.status === 'completed' ? 'default' : 
                                  assignment.status === 'started' ? 'secondary' : 
                                  'outline'
                                }>
                                  {assignment.status}
                                </Badge>
                                {assignment.dueDate && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500">Assigned by</p>
                                <p className="font-medium">{assignment.assignedBy?.firstName || 'System'}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(assignment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitor Progress Tab */}
            <TabsContent value="monitor" className="space-y-6">
              {/* Progress Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">Assigned Tests</p>
                        <p className="text-3xl font-bold text-blue-900">{(allAssignments as any)?.length || 0}</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-full">
                        <BookOpen className="h-6 w-6 text-blue-800" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-blue-600">Tests assigned to employees</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Completed Tests</p>
                        <p className="text-3xl font-bold text-green-900">{(testResults as any)?.length || 0}</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-green-800" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-green-600">Test submissions received</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700 mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-orange-900">{(users as any)?.length || 0}</p>
                      </div>
                      <div className="p-3 bg-orange-200 rounded-full">
                        <Users className="h-6 w-6 text-orange-800" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-orange-600">Registered users</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700 mb-1">Avg Score</p>
                        <p className="text-3xl font-bold text-purple-900">
                          {(testResults as any)?.length > 0 
                            ? Math.round((testResults as any).reduce((sum: number, result: any) => sum + (result.score || 0), 0) / (testResults as any).length)
                            : 0}%
                        </p>
                      </div>
                      <div className="p-3 bg-purple-200 rounded-full">
                        <Target className="h-6 w-6 text-purple-800" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-purple-600">Average test performance</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Test Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
                    Live Test Sessions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Real-time monitoring of active test sessions</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Real live sessions data */}
                    {liveSessions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {liveSessions.map((session: any) => {
                          const gradients = [
                            'from-green-50 to-blue-50',
                            'from-yellow-50 to-orange-50', 
                            'from-purple-50 to-pink-50',
                            'from-blue-50 to-indigo-50',
                            'from-red-50 to-rose-50'
                          ];
                          const colors = [
                            { dot: 'bg-green-500', bar: 'bg-blue-600' },
                            { dot: 'bg-yellow-500', bar: 'bg-yellow-600' },
                            { dot: 'bg-purple-500', bar: 'bg-purple-600' },
                            { dot: 'bg-blue-500', bar: 'bg-indigo-600' },
                            { dot: 'bg-red-500', bar: 'bg-rose-600' }
                          ];
                          const colorIndex = session.id % gradients.length;
                          const gradient = gradients[colorIndex];
                          const color = colors[colorIndex];
                          
                          return (
                            <div key={session.id} className={`p-4 border rounded-lg bg-gradient-to-r ${gradient}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 ${color.dot} rounded-full animate-pulse`}></div>
                                  <span className="font-medium text-sm">{session.userName}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  Question {session.currentQuestion}/{session.totalQuestions}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{session.testTitle}</p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`${color.bar} h-2 rounded-full`} style={{ width: `${session.progressPercent}%` }}></div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {session.timeRemainingMinutes > 0 
                                  ? `${Math.floor(session.timeRemainingMinutes / 60)}:${String(session.timeRemainingMinutes % 60).padStart(2, '0')} remaining`
                                  : 'Time expired'
                                }
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No active test sessions at the moment</p>
                      </div>
                    )}

                    <div className="text-center py-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Active Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Performance Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Test Performance Analytics
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Average scores by test</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={(() => {
                          // Group test results by domain and calculate average scores
                          const domainData: { [key: string]: { scores: number[], count: number } } = {};
                          
                          (tests as any)?.forEach((test: any) => {
                            const domain = test.domain || 'Other';
                            if (!domainData[domain]) {
                              domainData[domain] = { scores: [], count: 0 };
                            }
                            
                            // Find results for this test
                            const testResultsForDomain = (testResults as any)?.filter((result: any) => result.testId === test.id) || [];
                            testResultsForDomain.forEach((result: any) => {
                              if (result.score !== null && result.score !== undefined) {
                                domainData[domain].scores.push(result.score);
                              }
                            });
                            domainData[domain].count++;
                          });
                          
                          // Convert to chart format
                          return Object.entries(domainData).map(([domain, data]) => ({
                            name: domain,
                            score: data.scores.length > 0 
                              ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length)
                              : 0,
                            tests: data.count
                          })).slice(0, 8); // Limit to 8 domains for readability
                        })()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'score' ? `${value}%` : value,
                              name === 'score' ? 'Average Score' : 'Tests Created'
                            ]}
                          />
                          <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Domain Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-green-500" />
                      Test Distribution by Domain
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Test distribution across domains</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={(() => {
                              // Calculate actual domain distribution from tests
                              const domainCounts: { [key: string]: number } = {};
                              const totalTests = (tests as any)?.length || 0;
                              
                              (tests as any)?.forEach((test: any) => {
                                const domain = test.domain || 'Other';
                                domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                              });
                              
                              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
                              
                              return Object.entries(domainCounts)
                                .map(([domain, count], index) => ({
                                  name: domain,
                                  value: totalTests > 0 ? Math.round((count / totalTests) * 100) : 0,
                                  fill: colors[index % colors.length]
                                }))
                                .filter(item => item.value > 0)
                                .slice(0, 8); // Limit to 8 domains
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(() => {
                              const domainCounts: { [key: string]: number } = {};
                              const totalTests = (tests as any)?.length || 0;
                              
                              (tests as any)?.forEach((test: any) => {
                                const domain = test.domain || 'Other';
                                domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                              });
                              
                              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
                              
                              return Object.entries(domainCounts)
                                .map(([domain, count], index) => ({
                                  name: domain,
                                  value: totalTests > 0 ? Math.round((count / totalTests) * 100) : 0,
                                  fill: colors[index % colors.length]
                                }))
                                .filter(item => item.value > 0)
                                .slice(0, 8);
                            })().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {(() => {
                        const domainCounts: { [key: string]: number } = {};
                        const totalTests = (tests as any)?.length || 0;
                        
                        (tests as any)?.forEach((test: any) => {
                          const domain = test.domain || 'Other';
                          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                        });
                        
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
                        
                        return Object.entries(domainCounts)
                          .map(([domain, count], index) => ({
                            name: domain,
                            value: totalTests > 0 ? Math.round((count / totalTests) * 100) : 0,
                            color: colors[index % colors.length]
                          }))
                          .filter(item => item.value > 0)
                          .slice(0, 8);
                      })().map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Time-based Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Completion Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      Test Completion Timeline
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Daily test completions over time</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { date: 'Jan 15', completed: 12, assigned: 15 },
                          { date: 'Jan 16', completed: 19, assigned: 22 },
                          { date: 'Jan 17', completed: 8, assigned: 12 },
                          { date: 'Jan 18', completed: 25, assigned: 28 },
                          { date: 'Jan 19', completed: 18, assigned: 20 },
                          { date: 'Jan 20', completed: 22, assigned: 25 },
                          { date: 'Today', completed: 15, assigned: 18 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="assigned" stackId="1" stroke="#94a3b8" fill="#e2e8f0" />
                          <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Incidents Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      Security Incidents Trend
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Security violations over time</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { date: 'Jan 15', tabSwitch: 2, copyPaste: 1, devTools: 0 },
                          { date: 'Jan 16', tabSwitch: 5, copyPaste: 3, devTools: 1 },
                          { date: 'Jan 17', tabSwitch: 1, copyPaste: 0, devTools: 0 },
                          { date: 'Jan 18', tabSwitch: 8, copyPaste: 4, devTools: 2 },
                          { date: 'Jan 19', tabSwitch: 3, copyPaste: 2, devTools: 1 },
                          { date: 'Jan 20', tabSwitch: 6, copyPaste: 1, devTools: 0 },
                          { date: 'Today', tabSwitch: 4, copyPaste: 2, devTools: 1 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="tabSwitch" stroke="#ef4444" strokeWidth={2} />
                          <Line type="monotone" dataKey="copyPaste" stroke="#f59e0b" strokeWidth={2} />
                          <Line type="monotone" dataKey="devTools" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-muted-foreground">Tab Switch</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-muted-foreground">Copy/Paste</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-muted-foreground">Dev Tools</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Score Distribution Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Score Distribution Analysis
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Distribution of test scores across all assessments</p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(() => {
                        // Calculate actual score distribution from test results
                        const scoreRanges = [
                          { range: '90-100%', min: 90, max: 100, count: 0 },
                          { range: '80-89%', min: 80, max: 89, count: 0 },
                          { range: '70-79%', min: 70, max: 79, count: 0 },
                          { range: '60-69%', min: 60, max: 69, count: 0 },
                          { range: '50-59%', min: 50, max: 59, count: 0 },
                          { range: '<50%', min: 0, max: 49, count: 0 }
                        ];
                        
                        const totalResults = (testResults as any)?.length || 0;
                        
                        (testResults as any)?.forEach((result: any) => {
                          const score = result.score || 0;
                          for (const range of scoreRanges) {
                            if (score >= range.min && score <= range.max) {
                              range.count++;
                              break;
                            }
                          }
                        });
                        
                        return scoreRanges.map(range => ({
                          range: range.range,
                          count: range.count,
                          percentage: totalResults > 0 ? Math.round((range.count / totalResults) * 100) : 0
                        }));
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'count' ? `${value} submissions` : `${value}%`,
                            name === 'count' ? 'Number of Submissions' : 'Percentage'
                          ]}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Test Questions Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    Test Questions Overview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Manage and monitor questions across all tests</p>
                </CardHeader>
                <CardContent>
                  {(tests as any)?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">No tests created yet</p>
                      <p className="text-sm">Create a test first to view linked questions</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(tests as any)?.map((test: any) => (
                        <div key={test.id} className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-blue-50/30">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                {test.title}
                                <Badge variant="outline" className="text-xs">
                                  {test.total_questions || 0} Questions
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {test.domain} • {test.level} • Created {new Date(test.created_at || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View Questions
                              </Button>
                              <Button size="sm" variant="outline">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Questions
                              </Button>
                            </div>
                          </div>
                          
                          {/* Questions loaded from API */}
                          <TestQuestions testId={test.id} />
                          
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  generateAIQuestionsMutation.mutate(test.id);
                                }}
                                disabled={generateAIQuestionsMutation.isPending}
                              >
                                {generateAIQuestionsMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Brain className="h-3 w-3 mr-1" />
                                )}
                                Generate AI Questions
                              </Button>
                              <Button size="sm" variant="outline">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Enhance Test
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last updated: {new Date().toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    AI Proctoring & Progress Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Tests</p>
                            <p className="text-2xl font-bold">12</p>
                          </div>
                          <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Screen Switches Detected</p>
                            <p className="text-2xl font-bold text-orange-500">8</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-green-500">25</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Real-time Proctoring Alerts</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">Screen switch detected</p>
                            <p className="text-sm text-muted-foreground">John Doe - Frontend Assessment</p>
                          </div>
                        </div>
                        <Badge variant="secondary">2 min ago</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">Multiple tab switches</p>
                            <p className="text-sm text-muted-foreground">Sarah Wilson - Backend Assessment</p>
                          </div>
                        </div>
                        <Badge variant="destructive">5 min ago</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Management Tab */}
            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Results & Manager Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Frontend Development Assessment</h4>
                        <p className="text-sm text-muted-foreground">5 candidates completed • Results pending manager review</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Pending Manager Review</Badge>
                        <Button size="sm">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Review & Declare Results
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Backend Development Assessment</h4>
                        <p className="text-sm text-muted-foreground">8 candidates completed • Results declared</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Results Declared</Badge>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-4">Manager Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col"
                        onClick={() => setLocation("/admin/results")}
                      >
                        <Eye className="h-6 w-6 mb-2" />
                        <span>View Results</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col"
                        onClick={() => setLocation("/admin/results")}
                      >
                        <UserCheck className="h-6 w-6 mb-2" />
                        <span>Declare Results</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col"
                        onClick={() => setLocation("/admin/analytics")}
                      >
                        <BarChart3 className="h-6 w-6 mb-2" />
                        <span>Generate Analytics</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Edit Test Dialog */}
          <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Test: {editingTest?.title}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="properties" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="properties">Test Properties</TabsTrigger>
                  <TabsTrigger value="questions">Add Questions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="properties" className="space-y-4">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const testData = {
                      title: formData.get('title'),
                      description: formData.get('description'),
                      domain: selectedDomain,
                      level: selectedLevel,
                      passingScore: parseInt(formData.get('passingScore') as string) || 70,
                    };
                    updateTestMutation.mutate({ testId: editingTest.id, testData });
                  }} className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Test Title</Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={editingTest?.title}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input
                          id="passingScore"
                          name="passingScore"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={editingTest?.passingScore || 70}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingTest?.description}
                        className="min-h-20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Technology Domain</Label>
                        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOMAINS.map(domain => (
                              <SelectItem key={domain} value={domain}>
                                {domain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Skill Level</Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
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
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditTestOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updateTestMutation.isPending}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {updateTestMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating Test...
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Update Test
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="questions" className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Domain:</strong> {editingTest?.domain} • <strong>Level:</strong> {editingTest?.level}
                      <br />
                      Current questions: {editingTest?.questions?.length || 0}
                    </p>
                  </div>
              
              <form onSubmit={handleAddQuestions} className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Question Distribution</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="easyCount">Easy Questions</Label>
                      <Input
                        type="number"
                        id="easyCount"
                        value={aiGenerationSettings.easyCount}
                        onChange={(e) => setAiGenerationSettings(prev => ({ 
                          ...prev, 
                          easyCount: parseInt(e.target.value) || 0 
                        }))}
                        min="0"
                        max="20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mediumCount">Medium Questions</Label>
                      <Input
                        type="number"
                        id="mediumCount"
                        value={aiGenerationSettings.mediumCount}
                        onChange={(e) => setAiGenerationSettings(prev => ({ 
                          ...prev, 
                          mediumCount: parseInt(e.target.value) || 0 
                        }))}
                        min="0"
                        max="20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="toughCount">Tough Questions</Label>
                      <Input
                        type="number"
                        id="toughCount"
                        value={aiGenerationSettings.toughCount}
                        onChange={(e) => setAiGenerationSettings(prev => ({ 
                          ...prev, 
                          toughCount: parseInt(e.target.value) || 0 
                        }))}
                        min="0"
                        max="20"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Total: {aiGenerationSettings.easyCount + aiGenerationSettings.mediumCount + aiGenerationSettings.toughCount} questions will be generated
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditTestOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addQuestionsToTestMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {addQuestionsToTestMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate AI Questions
                      </>
                    )}
                  </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>
    </div>
  );
}