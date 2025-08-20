import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  FileText, 
  BarChart3, 
  Eye, 
  UserCheck,
  Calendar,
  Target,
  CheckCircle2,
  AlertTriangle,
  Play,
  Download,
  Settings,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface TestDetails {
  id: number;
  title: string;
  description: string;
  domain: string;
  level: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  createdAt: string;
  createdBy: number;
  projectId?: number;
}

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: string;
  weightage: number;
  status: string;
  tags?: string[];
  codeLanguage?: string;
  setNumber?: number;
}

interface Assignment {
  id: number;
  userId: number;
  testId: number;
  userName: string;
  userEmail: string;
  assignedAt: string;
  completedAt?: string;
  status: string;
  score?: number;
}

interface TestResult {
  id: number;
  userId: number;
  userName: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  status: string;
}

export default function TestDetails() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [testId, setTestId] = useState<number | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setTestId(parseInt(id));
    }
  }, []);

  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: [`/api/tests/${testId}`],
    enabled: !!testId,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/tests/${testId}/questions`],
    enabled: !!testId,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: [`/api/tests/${testId}/assignments`],
    enabled: !!testId,
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: [`/api/tests/${testId}/results`],
    enabled: !!testId,
  });

  if (!testId) {
    return <div className="p-8">Test not found</div>;
  }

  if (testLoading) {
    return <div className="p-8">Loading test details...</div>;
  }

  if (!test) {
    return <div className="p-8">Test not found</div>;
  }

  const completedAssignments = assignments.filter((a: Assignment) => a.status === 'completed').length;
  const totalAssignments = assignments.length;
  const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  const avgScore = results.length > 0 
    ? results.reduce((sum: number, r: TestResult) => sum + r.percentage, 0) / results.length 
    : 0;

  const questionsByDifficulty = questions.reduce((acc: any, q: Question) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {});

  const questionsByType = questions.reduce((acc: any, q: Question) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  const questionsBySet = questions.reduce((acc: any, q: Question) => {
    const setNum = q.setNumber || 1;
    acc[setNum] = (acc[setNum] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-white hover:text-blue-300 hover:bg-white/10"
            onClick={() => setLocation('/admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test Management
          </Button>

          <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-500/30 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
            <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <h1 className="text-5xl font-bold text-white leading-tight">
                  {test.title}
                </h1>
                <div className="flex gap-3">
                  <Button 
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl px-5 py-2.5 font-medium"
                    onClick={() => setLocation(`/test-management?id=${testId}&action=edit`)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Test
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2.5 font-medium"
                    onClick={() => setLocation(`/take-test/${testId}`)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Preview Test
                  </Button>
                </div>
              </div>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-4xl mb-8">
                {test.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-10">
                <span className="bg-slate-800/80 text-slate-200 px-5 py-2.5 rounded-full text-sm font-medium border border-slate-600/50 backdrop-blur-sm">
                  {test.domain}
                </span>
                <span className="bg-slate-800/80 text-slate-200 px-5 py-2.5 rounded-full text-sm font-medium border border-slate-600/50 backdrop-blur-sm">
                  {test.level}
                </span>
                <span className="bg-slate-800/80 text-slate-200 px-5 py-2.5 rounded-full text-sm font-medium border border-slate-600/50 backdrop-blur-sm">
                  {test.totalQuestions} Questions
                </span>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <div className="text-center bg-slate-800/40 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30">
                      <Clock className="w-6 h-6 text-blue-300" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{test.duration}</div>
                  <div className="text-sm text-slate-400 font-medium">Minutes</div>
                </div>
                <div className="text-center bg-slate-800/40 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-xl bg-green-500/20 border border-green-400/30">
                      <Target className="w-6 h-6 text-green-300" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{test.passingScore}%</div>
                  <div className="text-sm text-slate-400 font-medium">Pass Score</div>
                </div>
                <div className="text-center bg-slate-800/40 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-400/30">
                      <Users className="w-6 h-6 text-purple-300" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{totalAssignments}</div>
                  <div className="text-sm text-slate-400 font-medium">Assigned</div>
                </div>
                <div className="text-center bg-slate-800/40 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                      <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{completedAssignments}</div>
                  <div className="text-sm text-slate-400 font-medium">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-slate-900/60 backdrop-blur-xl border border-slate-500/30 rounded-2xl p-2">
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium transition-all">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium transition-all">
              <FileText className="w-4 h-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="assignments" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium transition-all">
              <Users className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="results" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium transition-all">
              <Eye className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium transition-all">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#251b4a]">
              {/* Completion Progress */}
              <Card className="rounded-lg group backdrop-blur-xl border border-slate-600/30 shadow-2xl hover:shadow-3xl hover:border-slate-500/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden bg-[#251c4a] text-[#ffffff]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative z-10 bg-[#291e4e]">
                  <CardTitle className="flex items-center gap-2 font-semibold bg-[#ffffff] text-[#000000] p-3 rounded-lg">
                    <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm border border-blue-300/30">
                      <Users className="w-4 h-4 text-blue-300" />
                    </div>
                    Completion Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 bg-[#291e4e]">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-white mb-2">
                        <span className="font-medium">Completed</span>
                        <span className="bg-slate-800/90 px-2 py-1 rounded-full text-xs font-bold text-slate-200">{completedAssignments}/{totalAssignments}</span>
                      </div>
                      <Progress 
                        value={completionRate} 
                        className="h-3 bg-slate-800/80 border border-slate-500/50" 
                      />
                    </div>
                    <div className="text-center rounded-xl p-4 border border-slate-500/40 bg-[#401a68]">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {completionRate.toFixed(1)}%
                      </div>
                      <div className="text-white text-sm font-medium mt-1">Overall Completion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Average Score */}
              <Card className="rounded-lg group backdrop-blur-xl border border-slate-600/30 shadow-2xl hover:shadow-3xl hover:border-slate-500/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden bg-[#251c4a] text-[#ffffff]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative z-10 bg-[#291e4e]">
                  <CardTitle className="flex items-center gap-2 font-semibold bg-[#ffffff] text-[#000000] p-3 rounded-lg">
                    <div className="p-2 rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-300/30">
                      <Target className="w-4 h-4 text-green-300" />
                    </div>
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 bg-[#291e4e]">
                  <div className="space-y-6">
                    <div className="text-center rounded-xl p-4 border border-slate-500/40 bg-[#391a5f]">
                      <div className="text-4xl font-bold text-[#ffffff]">
                        {avgScore.toFixed(1)}%
                      </div>
                      <div className="text-sm font-medium mt-1 text-[#ffffff]">Average Score</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-white mb-2">
                        <span className="font-medium">Pass Rate</span>
                        <span className="bg-slate-800/90 px-2 py-1 rounded-full text-xs font-bold text-white">
                          {results.filter((r: TestResult) => r.percentage >= test.passingScore).length}/{results.length}
                        </span>
                      </div>
                      <Progress 
                        value={results.length > 0 ? (results.filter((r: TestResult) => r.percentage >= test.passingScore).length / results.length) * 100 : 0} 
                        className="h-3 bg-slate-800/80 border border-slate-500/50" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Distribution */}
              <Card className="rounded-lg group backdrop-blur-xl border border-slate-600/30 shadow-2xl hover:shadow-3xl hover:border-slate-500/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden bg-[#251c4a] text-[#ffffff]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative z-10 bg-[#291e4e]">
                  <CardTitle className="flex items-center gap-2 font-semibold bg-[#ffffff] text-[#000000] p-3 rounded-lg">
                    <div className="p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm border border-purple-300/30">
                      <FileText className="w-4 h-4 text-purple-300" />
                    </div>
                    Question Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 bg-[#291e4e]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-900/80 rounded-lg border border-slate-500/40">
                      <span className="text-white font-medium">Total Questions:</span>
                      <span className="text-2xl font-bold text-white">
                        {questions.length}
                      </span>
                    </div>
                    <Separator className="bg-slate-600" />
                    <div className="space-y-2">
                      {Object.entries(questionsByDifficulty).map(([difficulty, count]) => (
                        <div key={difficulty} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60 border border-slate-600/40 hover:bg-slate-700/60 transition-colors">
                          <span className="capitalize text-white font-medium">{difficulty}:</span>
                          <span className="text-white bg-slate-900/80 px-2 py-1 rounded-full text-xs font-bold">{count as number}</span>
                        </div>
                      ))}
                    </div>
                    {Object.keys(questionsBySet).length > 1 && (
                      <>
                        <Separator className="bg-slate-600" />
                        <div className="text-white text-sm font-medium p-2 bg-slate-800/60 rounded-lg border border-slate-600/40">Question Sets:</div>
                        <div className="space-y-2">
                          {Object.entries(questionsBySet).map(([setNum, count]) => (
                            <div key={setNum} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60 border border-slate-600/40">
                              <span className="text-white">Set {setNum}:</span>
                              <span className="text-white bg-slate-900/80 px-2 py-1 rounded-full text-xs font-bold">{count as number} questions</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <Card className="rounded-lg border text-card-foreground backdrop-blur-xl border-white/20 shadow-2xl bg-[#261c4c]">
              <CardHeader className="flex flex-col space-y-1.5 p-6 bg-[#291e4e]">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Questions ({questions.length})</CardTitle>
                    <CardDescription className="text-blue-200">
                      Manage and review all test questions
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    onClick={() => setLocation(`/question-bank?testId=${testId}`)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Add Questions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 bg-[#291e4e]">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {questionsLoading ? (
                      <div className="text-blue-200">Loading questions...</div>
                    ) : questions.length === 0 ? (
                      <div className="text-blue-200 text-center py-8">No questions found</div>
                    ) : (
                      questions.map((question: Question, index: number) => (
                        <div
                          key={question.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-medium">Q{index + 1}</span>
                                <Badge variant="outline" className="border-blue-300/30 text-blue-200">
                                  {question.type.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="border-purple-300/30 text-purple-200">
                                  {question.difficulty}
                                </Badge>
                                {question.setNumber && (
                                  <Badge variant="outline" className="border-green-300/30 text-green-200">
                                    Set {question.setNumber}
                                  </Badge>
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={question.status === 'approved' 
                                    ? 'border-green-300/30 text-green-200' 
                                    : 'border-yellow-300/30 text-yellow-200'
                                  }
                                >
                                  {question.status}
                                </Badge>
                              </div>
                              <p className="text-sm line-clamp-2 bg-[#1d213f] text-[#ffffff]">
                                {question.question}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs bg-[#1d213f] text-[#ffffff]">
                                <span>Weight: {question.weightage}</span>
                                {question.codeLanguage && <span>Language: {question.codeLanguage}</span>}
                                {question.tags && question.tags.length > 0 && (
                                  <span>Tags: {question.tags.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card className="rounded-lg backdrop-blur-xl border-white/20 shadow-2xl bg-[#251c4a] text-[#ffffff]">
              <CardHeader className="flex flex-col space-y-1.5 p-6 bg-[#291e4e]">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white bg-[#ffffff] text-[#000000] p-3 rounded-lg">Test Assignments ({totalAssignments})</CardTitle>
                    <CardDescription className="text-blue-200 mt-2">
                      Track who's been assigned and their progress
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => setLocation(`/assign-test?testId=${testId}`)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 bg-[#291e4e]">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {assignmentsLoading ? (
                      <div className="text-blue-200">Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                      <div className="text-blue-200 text-center py-8">No assignments found</div>
                    ) : (
                      assignments.map((assignment: Assignment) => (
                        <div
                          key={assignment.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{assignment.userName}</h4>
                              <p className="text-blue-200 text-sm">{assignment.userEmail}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-blue-300">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                                </div>
                                {assignment.completedAt && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed: {new Date(assignment.completedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant="outline"
                                className={
                                  assignment.status === 'completed' 
                                    ? 'border-green-300/30 text-green-200'
                                    : assignment.status === 'in_progress'
                                    ? 'border-yellow-300/30 text-yellow-200'
                                    : 'border-blue-300/30 text-blue-200'
                                }
                              >
                                {assignment.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {assignment.score !== undefined && (
                                <div className="text-white text-lg font-bold mt-1">
                                  {assignment.score}%
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card className="rounded-lg backdrop-blur-xl border-white/20 shadow-2xl bg-[#251c4a] text-[#ffffff]">
              <CardHeader className="bg-[#291e4e]">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white bg-[#ffffff] text-[#000000] p-3 rounded-lg">Test Results ({results.length})</CardTitle>
                    <CardDescription className="text-blue-200 mt-2">
                      View detailed results and performance data
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {resultsLoading ? (
                      <div className="text-blue-200">Loading results...</div>
                    ) : results.length === 0 ? (
                      <div className="text-blue-200 text-center py-8">No results available</div>
                    ) : (
                      results.map((result: TestResult) => (
                        <div
                          key={result.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => setLocation(`/result-details/${result.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{result.userName}</h4>
                              <div className="flex items-center gap-4 mt-1 text-xs text-blue-300">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(result.completedAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(result.completedAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">
                                {result.percentage.toFixed(1)}%
                              </div>
                              <div className="text-blue-200 text-sm">
                                {result.score}/{result.maxScore}
                              </div>
                              <Badge 
                                variant="outline"
                                className={
                                  result.percentage >= test.passingScore
                                    ? 'border-green-300/30 text-green-200'
                                    : 'border-red-300/30 text-red-200'
                                }
                              >
                                {result.percentage >= test.passingScore ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Question Type Distribution */}
              <Card className="rounded-lg group backdrop-blur-xl border border-slate-600/30 shadow-2xl hover:shadow-3xl hover:border-slate-500/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden bg-[#251c4a] text-[#ffffff]">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 bg-[#291e4e]">
                  <CardTitle className="flex items-center gap-2 font-semibold bg-[#ffffff] p-3 rounded-lg text-[#1d2140]">
                    <div className="p-2 rounded-lg bg-cyan-500/20 backdrop-blur-sm border border-cyan-300/30">
                      <BarChart3 className="w-4 h-4 text-cyan-300" />
                    </div>
                    Question Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 bg-[#291e4e]">
                  <div className="space-y-4">
                    {Object.entries(questionsByType).map(([type, count]) => (
                      <div key={type} className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60 border border-slate-600/40">
                          <span className="text-white capitalize font-medium">{type.replace('_', ' ')}</span>
                          <span className="text-white bg-slate-900/80 px-2 py-1 rounded-full text-xs font-bold">{count as number}</span>
                        </div>
                        <Progress 
                          value={((count as number) / questions.length) * 100} 
                          className="h-3 bg-slate-800/80 border border-slate-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty Distribution */}
              <Card className="rounded-lg group backdrop-blur-xl border border-slate-600/30 shadow-2xl hover:shadow-3xl hover:border-slate-500/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden bg-[#251c4a] text-[#ffffff]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 bg-[#291e4e]">
                  <CardTitle className="flex items-center gap-2 font-semibold bg-[#ffffff] text-[#000000] p-3 rounded-lg">
                    <div className="p-2 rounded-lg bg-orange-500/20 backdrop-blur-sm border border-orange-300/30">
                      <TrendingUp className="w-4 h-4 text-orange-300" />
                    </div>
                    Difficulty Levels
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 bg-[#291e4e]">
                  <div className="space-y-4">
                    {Object.entries(questionsByDifficulty).map(([difficulty, count]) => (
                      <div key={difficulty} className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/60 border border-slate-600/40">
                          <span className="text-white capitalize font-medium">{difficulty}</span>
                          <span className="text-white bg-slate-900/80 px-2 py-1 rounded-full text-xs font-bold">{count as number}</span>
                        </div>
                        <Progress 
                          value={((count as number) / questions.length) * 100} 
                          className="h-3 bg-slate-800/80 border border-slate-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}