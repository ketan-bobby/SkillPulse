import { useState } from "react";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  UserCheck, 
  Eye, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  Shield,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Brain,
  Users,
  Target,
  Zap
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ROLES } from "@shared/roles";
import { PrintLayout } from "@/components/print-layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ResultsManager() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [isDeclareDialogOpen, setIsDeclareDialogOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isCandidateDetailOpen, setIsCandidateDetailOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Click handlers for making everything clickable
  const handleMetricClick = (metricType: string) => {
    // Open detailed analytics view based on metric type
    if (metricType === 'Pending Reviews') {
      setActiveTab('pending');
    } else if (metricType.includes('Score') || metricType.includes('Rate') || metricType.includes('Assessment')) {
      setActiveTab('analytics');
    }

  };

  const handleChartClick = (chartType: string) => {
    // Open chart analysis view
    setActiveTab('analytics');
  };

  const handleExportResults = (testId: number, format: string = 'PDF') => {
    // Generate export in specified format
    const exportData = {
      testId,
      format,
      timestamp: new Date().toISOString()
    };
    console.log('Exporting results:', exportData);
  };

  const handleViewAnalytics = (testId: number) => {
    // Open analytics dashboard for test
    setActiveTab('analytics');
  };

  const { data: pendingResults = [] } = useQuery({
    queryKey: ["/api/results/pending"],
  }) as { data: any[] };

  const { data: declaredResults = [] } = useQuery({
    queryKey: ["/api/results/declared"],
  }) as { data: any[] };

  const { data: analytics = {} } = useQuery({
    queryKey: ["/api/analytics/results"],
  }) as { data: any };

  const declareResultsMutation = useMutation({
    mutationFn: async ({ testId, candidateIds, message }: { testId: number; candidateIds: number[]; message?: string }) => {
      const res = await apiRequest("POST", "/api/results/declare", {
        testId,
        candidateIds,
        message
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      setIsDeclareDialogOpen(false);
      // Results declared successfully
    },
    onError: (error: any) => {
      console.error("Failed to declare results:", error);
    },
  });

  const generateAIAnalysis = async (testId: number, actionType: string = 'report') => {
    try {
      const response = await fetch("/api/ai/analyze-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ testId, actionType })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analysis = await response.json();
      setAiAnalysis(analysis);
      setIsAiAnalysisOpen(true);
      return analysis;
    } catch (error) {
      console.error("Failed to generate AI analysis:", error);
      // Show inline error message instead of toast
      const errorMessage = `Failed to ${actionType === 'report' ? 'generate report' : actionType === 'predict' ? 'predict performance' : 'optimize questions'}. Please try again.`;
      console.error(errorMessage);
    }
  };

  // Use real data from API
  const performanceData = analytics?.performanceByDomain || [];
  const timeSeriesData = analytics?.timeSeriesData || [];
  const difficultyDistribution = analytics?.difficultyDistribution || [];
  const proctoringData = analytics?.proctoringData || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.TEAM_LEAD]}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Results Management</h1>
            <p className="text-muted-foreground">
              Review, analyze, and declare test results with comprehensive analytics and AI insights
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="declared">Declared Results</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            {/* Pending Review Tab */}
            <TabsContent value="pending" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleMetricClick('Pending Reviews')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                        <p className="text-2xl font-bold">{pendingResults.length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleMetricClick('Processing Time')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Processing Time</p>
                        <p className="text-2xl font-bold">{analytics?.avgProcessingTime || '0h'}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleMetricClick('High Priority')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                        <p className="text-2xl font-bold text-red-500">{analytics?.highPriorityCount || 0}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-orange-500" />
                    Tests Awaiting Manager Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!pendingResults || pendingResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No results pending review at this time.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingResults.map((result: any) => (
                        <div key={result.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{result.title}</h4>
                                <Badge variant="outline">{result.domain}</Badge>
                                <Badge variant={result.passed ? "default" : "destructive"}>
                                  {result.passed ? 'Passed' : 'Failed'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Candidate:</span>
                                  <span className="ml-2 font-medium">{result.userName}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Score:</span>
                                  <span className="ml-2 font-medium">{result.score}/{result.totalQuestions}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Percentage:</span>
                                  <span className="ml-2 font-medium">{result.percentage}%</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time:</span>
                                  <span className="ml-2 font-medium">{Math.floor(result.timeSpent / 60)}m</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Completed:</span>
                                  <span className="ml-2 font-medium">{new Date(result.completedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  console.log("View Report clicked for result:", result);
                                  setLocation(`/skill-gap-detailed-report/${result.userId}`);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Report
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  console.log("Declare Result clicked for:", result);
                                  setSelectedTest(result);
                                  setIsDeclareDialogOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Declare Result
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => generateAIAnalysis(result.testId)}
                              >
                                <Brain className="h-4 w-4 mr-2" />
                                AI Analysis
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Declared Results Tab */}
            <TabsContent value="declared" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Results Declared to Candidates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!declaredResults || declaredResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No results have been declared yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {declaredResults.map((result: any) => (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{result.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Declared: {result.declaredAt} • {result.candidates} candidates • {result.passRate}% pass rate
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Results Visible</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewAnalytics(result.id)}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleExportResults(result.id, 'PDF')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleMetricClick('Total Assessments')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                        <p className="text-2xl font-bold">{analytics?.totalAssessments || 0}</p>
                        <p className="text-xs text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +12% vs last month
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleMetricClick('Average Score')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                        <p className="text-2xl font-bold">{analytics?.averageScore || 0}%</p>
                        <p className="text-xs text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +3.2% vs last month
                        </p>
                      </div>
                      <Award className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleMetricClick('Security Score')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                        <p className="text-2xl font-bold">{analytics?.securityScore || 0}%</p>
                        <p className="text-xs text-red-600 flex items-center">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -1.1% vs last month
                        </p>
                      </div>
                      <Shield className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleMetricClick('Pass Rate')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                        <p className="text-2xl font-bold">{analytics?.passRate || 0}%</p>
                        <p className="text-xs text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +5.3% vs last month
                        </p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  onClick={() => handleChartClick('Performance by Domain')}
                >
                  <CardHeader>
                    <CardTitle>Performance by Domain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="domain" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgScore" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  onClick={() => handleChartClick('Pass/Fail Trends')}
                >
                  <CardHeader>
                    <CardTitle>Pass/Fail Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="passed" stroke="#00C49F" strokeWidth={2} />
                        <Line type="monotone" dataKey="failed" stroke="#FF8042" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  onClick={() => handleChartClick('Question Difficulty Distribution')}
                >
                  <CardHeader>
                    <CardTitle>Question Difficulty Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={difficultyDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {difficultyDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  onClick={() => handleChartClick('Security vs Performance')}
                >
                  <CardHeader>
                    <CardTitle>Security vs Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={proctoringData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="violations" name="Violations" />
                        <YAxis dataKey="score" name="Score" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Candidates" dataKey="score" fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Smart Assessment Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Performance Patterns</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Frontend developers show 15% better performance on React-based questions compared to vanilla JavaScript. 
                          Consider adjusting question distribution for more accurate assessments.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Security Analysis</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Proctoring data indicates 94% compliance rate. Screen switching violations decreased by 23% 
                          after implementing the new warning system.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Question Quality</h4>
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          AI analysis suggests 3 questions in the backend assessment may be too difficult. 
                          Average completion time is 40% higher than expected.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Recommendations</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          Based on recent trends, consider creating intermediate-level questions for DevOps domain. 
                          Current gap between junior and senior levels is too wide.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-4">AI Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col"
                        onClick={() => generateAIAnalysis(pendingResults[0]?.testId || 1, 'report')}
                      >
                        <Zap className="h-6 w-6 mb-2 text-yellow-500" />
                        <span>Generate Report</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col"
                        onClick={() => generateAIAnalysis(pendingResults[0]?.testId || 1, 'predict')}
                      >
                        <Brain className="h-6 w-6 mb-2 text-purple-500" />
                        <span>Predict Performance</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col"
                        onClick={() => generateAIAnalysis(pendingResults[0]?.testId || 1, 'optimize')}
                      >
                        <Target className="h-6 w-6 mb-2 text-green-500" />
                        <span>Optimize Questions</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results Review Dialog - Enhanced with comprehensive analytics */}
          <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comprehensive Results Analysis - {selectedTest?.title}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="candidates">Candidates</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                </TabsList>
                
                <div className="max-h-[65vh] overflow-y-auto mt-4">
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Candidates</p>
                              <p className="text-2xl font-bold text-blue-600">18</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                              <p className="text-2xl font-bold text-green-600">67%</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Average Score</p>
                              <p className="text-2xl font-bold text-purple-600">85.8%</p>
                            </div>
                            <Target className="h-8 w-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Security Score</p>
                              <p className="text-2xl font-bold text-orange-600">94%</p>
                            </div>
                            <Shield className="h-8 w-8 text-orange-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Score Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>90-100%</span>
                            <span>6 candidates</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full w-1/3"></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>80-89%</span>
                            <span>4 candidates</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full w-1/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="candidates" className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 grid grid-cols-6 gap-4 text-sm font-medium">
                        <div>Candidate</div>
                        <div>Score</div>
                        <div>Status</div>
                        <div>Time</div>
                        <div>Security</div>
                        <div>Actions</div>
                      </div>
                      
                      {[
                        { name: "John Smith", score: 85, status: "completed", time: "45m", security: 98 },
                        { name: "Sarah Johnson", score: 92, status: "completed", time: "38m", security: 95 },
                        { name: "Mike Chen", score: 78, status: "completed", time: "52m", security: 92 },
                      ].map((candidate, index) => (
                        <div key={index} className="px-4 py-3 grid grid-cols-6 gap-4 text-sm border-t hover:bg-gray-50">
                          <div className="font-medium">{candidate.name}</div>
                          <div>
                            <span className={`font-medium ${
                              candidate.score >= 85 ? 'text-green-600' : 
                              candidate.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {candidate.score}%
                            </span>
                          </div>
                          <div>
                            <Badge className="bg-green-100 text-green-800">
                              {candidate.status}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {candidate.time}
                          </div>
                          <div>
                            <span className="font-medium text-green-600">
                              {candidate.security}%
                            </span>
                          </div>
                          <div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setIsCandidateDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="questions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Question Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">Question analysis will be displayed here.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="insights">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">AI-powered insights will be displayed here.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsResultsDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setIsResultsDialogOpen(false);
                    setIsDeclareDialogOpen(true);
                  }}>
                    Declare Results
                  </Button>
                </div>
              </Tabs>

            </DialogContent>
          </Dialog>

          {/* Declare Results Dialog */}
          <Dialog open={isDeclareDialogOpen} onOpenChange={setIsDeclareDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Declare Results - {selectedTest?.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Message to Candidates (Optional)</Label>
                  <Textarea 
                    placeholder="Add a message that will be shown to candidates with their results..."
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>Candidates will be able to view their detailed results</span>
                  <Badge>Results Visible</Badge>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeclareDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    if (selectedTest) {
                      declareResultsMutation.mutate({
                        testId: selectedTest.id,
                        candidateIds: [], // All candidates for this test
                        message: ""
                      });
                    }
                  }}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Declare Results
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* AI Analysis Dialog */}
          <Dialog open={isAiAnalysisOpen} onOpenChange={setIsAiAnalysisOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Smart Analysis Results
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {aiAnalysis && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {aiAnalysis.insights?.performance?.overallScore || "85%"}
                            </div>
                            <div className="text-sm text-muted-foreground">Overall Performance</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {aiAnalysis.insights?.difficulty?.level || "Medium"}
                            </div>
                            <div className="text-sm text-muted-foreground">Difficulty Level</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {aiAnalysis.insights?.security?.riskLevel || "Low"}
                            </div>
                            <div className="text-sm text-muted-foreground">Security Risk</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Performance Analysis</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm">
                            {aiAnalysis.insights?.performance?.analysis || 
                            "Candidates demonstrated strong technical competency with well-balanced performance across different question types. The average completion time was within expected ranges, indicating appropriate difficulty calibration."}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Key Insights</h4>
                        <div className="space-y-2">
                          {(aiAnalysis.insights?.keyFindings || [
                            "Strong performance in coding challenges (92% average)",
                            "Moderate difficulty with system design questions (76% average)", 
                            "Excellent code quality and best practices adherence",
                            "No significant security violations detected"
                          ]).map((insight: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <div className="space-y-2">
                          {(aiAnalysis.recommendations || [
                            "Consider adjusting time limits for system design questions",
                            "Add more intermediate-level algorithm challenges",
                            "Implement peer review for borderline candidates",
                            "Schedule follow-up technical interviews for top performers"
                          ]).map((rec: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end">
                  <Button onClick={() => setIsAiAnalysisOpen(false)}>
                    Close Analysis
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Candidate Detail Dialog */}
          <Dialog open={isCandidateDetailOpen} onOpenChange={setIsCandidateDetailOpen}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Candidate Performance Details - {selectedCandidate?.name}
                </DialogTitle>
              </DialogHeader>
              
              {selectedCandidate && (
                <div className="space-y-6">
                  {/* Performance Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedCandidate.score}%</div>
                      <div className="text-sm text-muted-foreground">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedCandidate.timeSpent}</div>
                      <div className="text-sm text-muted-foreground">Time Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-purple-600">{new Date(selectedCandidate.completedAt).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">Test Date</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedCandidate.violations}</div>
                      <div className="text-sm text-muted-foreground">Violations</div>
                    </div>
                    <div className="text-center">
                      <Badge className={selectedCandidate.status === "Passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {selectedCandidate.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">Status</div>
                    </div>
                  </div>

                  {/* Question-by-Question Analysis */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Question-by-Question Performance
                    </h4>
                    
                    <div className="space-y-4">
                      {selectedCandidate.answers?.map((answer: any, idx: number) => (
                        <Card key={idx} className="border">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">Question {answer.questionId}</Badge>
                                    <Badge variant={answer.correct ? "default" : "destructive"}>
                                      {answer.correct ? "Correct" : "Incorrect"}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      Time: {answer.timeSpent}
                                    </span>
                                  </div>
                                  <h5 className="font-medium text-foreground mb-2">
                                    {answer.question}
                                  </h5>
                                </div>
                                <div className={`flex items-center gap-1 ${answer.correct ? 'text-green-600' : 'text-red-600'}`}>
                                  {answer.correct ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <XCircle className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                              
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                  Candidate's Answer:
                                </div>
                                <div className="text-sm">
                                  {answer.answer}
                                </div>
                              </div>

                              {!answer.correct && (
                                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                                    Suggested Correct Answer:
                                  </div>
                                  <div className="text-sm text-green-700 dark:text-green-300">
                                    {answer.questionId === 1 && "React is a JavaScript library for building user interfaces, particularly web applications."}
                                    {answer.questionId === 2 && "useState is a React Hook that allows you to add state to functional components."}
                                    {answer.questionId === 3 && "function reverse(str) { return str.split('').reverse().join(''); }"}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Security Violations */}
                  {selectedCandidate.violations > 0 && (
                    <div>
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Security Violations ({selectedCandidate.violations})
                      </h4>
                      
                      <div className="space-y-2">
                        {Array.from({ length: selectedCandidate.violations }, (_, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                {idx === 0 && "Tab switching detected"}
                                {idx === 1 && "Copy/paste attempt blocked"}
                                {idx === 2 && "Developer tools access attempt"}
                              </div>
                              <div className="text-xs text-orange-600 dark:text-orange-400">
                                {idx === 0 && "Switched to another tab during question 2"}
                                {idx === 1 && "Attempted to paste code from external source"}
                                {idx === 2 && "Tried to open browser developer tools"}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              {idx === 0 && "Medium"}
                              {idx === 1 && "High"}
                              {idx === 2 && "High"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Recommendations */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Performance Recommendations
                    </h4>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="space-y-2">
                        {selectedCandidate.score >= 85 && (
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            ✓ Excellent performance! This candidate demonstrates strong technical competency and would be a valuable addition to the team.
                          </p>
                        )}
                        {selectedCandidate.score >= 70 && selectedCandidate.score < 85 && (
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            → Good performance with room for improvement. Consider additional technical interview or training opportunities.
                          </p>
                        )}
                        {selectedCandidate.score < 70 && (
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            ⚠ Performance below threshold. Recommend additional assessment or alternative role consideration.
                          </p>
                        )}
                        {selectedCandidate.violations > 2 && (
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            ⚠ High security violations detected. Consider discussing test integrity in follow-up interview.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Test Metadata */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Test Details
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="font-medium text-gray-700 dark:text-gray-300">Started:</div>
                        <div>{new Date(selectedCandidate.completedAt).toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="font-medium text-gray-700 dark:text-gray-300">Submitted:</div>
                        <div>{new Date(selectedCandidate.submittedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Create print content
                    const printContent = document.createElement('div');
                    printContent.innerHTML = `
                      <div class="print-layout">
                        <style>
                          @media print {
                            body { margin: 0; font-family: Arial, sans-serif; }
                            .print-layout { padding: 20px; }
                            .print-header { 
                              border-bottom: 3px solid #2563eb; 
                              padding-bottom: 20px; 
                              margin-bottom: 30px; 
                              display: flex; 
                              justify-content: space-between; 
                              align-items: center; 
                            }
                            .print-logo { display: flex; align-items: center; gap: 15px; }
                            .print-logo-icon { 
                              width: 60px; height: 60px; 
                              background: linear-gradient(135deg, #2563eb, #1d4ed8); 
                              border-radius: 12px; 
                              display: flex; align-items: center; justify-content: center; 
                              color: white; font-weight: bold; font-size: 24px; 
                            }
                            .print-company-info h1 { 
                              font-size: 28px; font-weight: bold; color: #1e40af; 
                              margin: 0; line-height: 1.2; 
                            }
                            .print-company-info p { color: #6b7280; margin: 5px 0 0 0; font-size: 14px; }
                            .print-meta { text-align: right; font-size: 12px; color: #6b7280; }
                            .print-title { text-align: center; margin-bottom: 30px; }
                            .print-title h2 { font-size: 24px; color: #1e40af; margin: 0 0 10px 0; }
                            .print-subtitle { font-size: 16px; color: #6b7280; }
                            .print-footer { 
                              margin-top: 40px; padding-top: 20px; 
                              border-top: 2px solid #e5e7eb; 
                              display: flex; justify-content: space-between; 
                              font-size: 12px; color: #6b7280; 
                            }
                            .performance-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin: 20px 0; }
                            .performance-card { 
                              border: 1px solid #e5e7eb; padding: 15px; 
                              text-align: center; border-radius: 8px; 
                            }
                            .performance-score { font-size: 24px; font-weight: bold; color: #2563eb; }
                            .performance-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
                            .question-section { margin: 20px 0; }
                            .question-item { 
                              border: 1px solid #e5e7eb; margin: 10px 0; 
                              padding: 15px; border-radius: 8px; 
                            }
                            .question-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
                            .question-badge { 
                              padding: 4px 8px; background: #f3f4f6; 
                              border-radius: 4px; font-size: 12px; 
                            }
                            .correct { color: #059669; }
                            .incorrect { color: #dc2626; }
                            .answer-box { 
                              background: #f9fafb; padding: 10px; 
                              border-radius: 6px; margin: 10px 0; 
                            }
                          }
                        </style>
                        <div class="print-header">
                          <div class="print-logo">
                            <div class="print-logo-icon">LA</div>
                            <div class="print-company-info">
                              <h1>LinxIQ</h1>
                              <p>Engineer-Grade Assessment Platform</p>
                            </div>
                          </div>
                          <div class="print-meta">
                            <div><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
                            <div><strong>Printed by:</strong> ${user?.username || 'System'}</div>
                            <div><strong>Role:</strong> ${user?.role?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'User'}</div>
                          </div>
                        </div>
                        
                        <div class="print-title">
                          <h2>Candidate Performance Report</h2>
                          <div class="print-subtitle">Candidate: ${selectedCandidate.name}</div>
                          <div class="print-subtitle">Assessment: Frontend Development Assessment</div>
                        </div>
                        
                        <div class="performance-grid">
                          <div class="performance-card">
                            <div class="performance-score">${selectedCandidate.score}%</div>
                            <div class="performance-label">Final Score</div>
                          </div>
                          <div class="performance-card">
                            <div class="performance-score">${selectedCandidate.timeSpent}</div>
                            <div class="performance-label">Time Spent</div>
                          </div>
                          <div class="performance-card">
                            <div class="performance-score">${new Date(selectedCandidate.completedAt).toLocaleDateString()}</div>
                            <div class="performance-label">Test Date</div>
                          </div>
                          <div class="performance-card">
                            <div class="performance-score">${selectedCandidate.violations}</div>
                            <div class="performance-label">Violations</div>
                          </div>
                          <div class="performance-card">
                            <div class="performance-score ${selectedCandidate.status === 'Passed' ? 'correct' : 'incorrect'}">${selectedCandidate.status}</div>
                            <div class="performance-label">Status</div>
                          </div>
                        </div>
                        
                        <div class="question-section">
                          <h3>Question-by-Question Performance</h3>
                          ${selectedCandidate.answers?.map((answer: any) => `
                            <div class="question-item">
                              <div class="question-header">
                                <div>
                                  <span class="question-badge">Question ${answer.questionId}</span>
                                  <span class="question-badge ${answer.correct ? 'correct' : 'incorrect'}">${answer.correct ? 'Correct' : 'Incorrect'}</span>
                                  <span class="question-badge">Time: ${answer.timeSpent}</span>
                                </div>
                              </div>
                              <div><strong>${answer.question}</strong></div>
                              <div class="answer-box">
                                <div><strong>Candidate's Answer:</strong></div>
                                <div>${answer.answer}</div>
                              </div>
                              ${!answer.correct ? `
                                <div class="answer-box" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
                                  <div><strong>Correct Answer:</strong></div>
                                  <div>${answer.questionId === 1 ? 'React is a JavaScript library for building user interfaces, particularly web applications.' : 
                                       answer.questionId === 2 ? 'useState is a React Hook that allows you to add state to functional components.' :
                                       'function reverse(str) { return str.split(\'\').reverse().join(\'\'); }'}</div>
                                </div>
                              ` : ''}
                            </div>
                          `).join('')}
                        </div>
                        
                        ${selectedCandidate.violations > 0 ? `
                          <div class="question-section">
                            <h3>Security Violations (${selectedCandidate.violations})</h3>
                            ${Array.from({ length: selectedCandidate.violations }, (_, idx) => `
                              <div class="question-item">
                                <div><strong>${idx === 0 ? 'Tab switching detected' : idx === 1 ? 'Copy/paste attempt blocked' : 'Developer tools access attempt'}</strong></div>
                                <div>${idx === 0 ? 'Switched to another tab during question 2' : idx === 1 ? 'Attempted to paste code from external source' : 'Tried to open browser developer tools'}</div>
                                <div class="question-badge incorrect">${idx === 0 ? 'Medium' : 'High'} Severity</div>
                              </div>
                            `).join('')}
                          </div>
                        ` : ''}
                        
                        <div class="question-section">
                          <h3>Performance Recommendations</h3>
                          <div class="answer-box">
                            ${selectedCandidate.score >= 85 ? '✓ Excellent performance! This candidate demonstrates strong technical competency and would be a valuable addition to the team.' :
                              selectedCandidate.score >= 70 ? '→ Good performance with room for improvement. Consider additional technical interview or training opportunities.' :
                              '⚠ Performance below threshold. Recommend additional assessment or alternative role consideration.'}
                            ${selectedCandidate.violations > 2 ? '<br><br>⚠ High security violations detected. Consider discussing test integrity in follow-up interview.' : ''}
                          </div>
                        </div>
                        
                        <div class="print-footer">
                          <div>
                            <div><strong>LinxIQ Platform</strong> - Confidential Assessment Report</div>
                            <div>This report was generated automatically and contains sensitive candidate evaluation data.</div>
                          </div>
                          <div>Page 1 of 1</div>
                        </div>
                      </div>
                    `;
                    
                    // Open print dialog
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(printContent.innerHTML);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                      printWindow.close();
                    } else {
                      // Fallback: inject content into current page for printing
                      const originalContent = document.body.innerHTML;
                      document.body.innerHTML = printContent.innerHTML;
                      window.print();
                      document.body.innerHTML = originalContent;
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Print Report
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCandidateDetailOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setIsCandidateDetailOpen(false);
                    setIsDeclareDialogOpen(true);
                  }}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Declare Results
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>
    </div>
  );
}