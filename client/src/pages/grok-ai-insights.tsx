import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { ROLES } from "@shared/roles";
import {
  Brain,
  Code,
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Target,
  MessageSquare,
  FileCode,
  Activity,
  Award
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SmartInsightsLegacy() {
  const [analysisText, setAnalysisText] = useState("");
  const [codeToAnalyze, setCodeToAnalyze] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const { toast } = useToast();

  // AI Analysis Mutations
  const sentimentAnalysisMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/ai/analyze-sentiment", { text });
      return res.json();
    },
    onSuccess: (result) => {
      toast({ 
        title: "AI Analysis Complete",
        description: `Sentiment rating: ${result.rating}/5 stars with ${Math.round(result.confidence * 100)}% confidence`
      });
    }
  });

  const codeAnalysisMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      const res = await apiRequest("POST", "/api/ai/analyze-code", { code, language });
      return res.json();
    },
    onSuccess: (result) => {
      toast({ 
        title: "AI Code Analysis Complete",
        description: `Code quality score: ${result.score}/100`
      });
    }
  });

  const questionQualityMutation = useMutation({
    mutationFn: async (question: any) => {
      const res = await apiRequest("POST", "/api/ai/question-quality", { question });
      return res.json();
    },
    onSuccess: (result) => {
      toast({ 
        title: "AI Question Analysis Complete",
        description: `Quality score: ${result.score}/100`
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.REVIEWER]}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
                <p className="text-muted-foreground">
                  Advanced AI-powered analysis with intelligent processing capabilities
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">AI Model</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Latest AI technology</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Advanced Reasoning</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Superior analysis</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Secure Processing</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Enterprise-grade</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Real-time Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Instant insights</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="sentiment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sentiment" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Sentiment Analysis
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Code Analysis
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Question Quality
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Platform Insights
              </TabsTrigger>
            </TabsList>

            {/* Sentiment Analysis Tab */}
            <TabsContent value="sentiment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Candidate Feedback Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Automatic Feedback Collection</h4>
                        <p className="text-sm text-blue-700">
                          This system automatically captures and analyzes candidate feedback after each test completion:
                        </p>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• <strong>Post-Test Surveys:</strong> 5-star ratings for experience, difficulty, clarity</li>
                          <li>• <strong>Open Feedback:</strong> Text comments about test experience</li>
                          <li>• <strong>Technical Issues:</strong> Problem reports during testing</li>
                          <li>• <strong>Suggestions:</strong> Improvement recommendations</li>
                          <li>• <strong>AI Sentiment Analysis:</strong> Automatic emotion and satisfaction scoring</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Real Candidate Feedback Analytics</h3>
                    <p className="text-muted-foreground mb-4">
                      Instead of manual text input, this system would display analytics from actual feedback collected after each test:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-green-600">--</div>
                        <p className="text-sm text-muted-foreground">Avg Experience</p>
                      </Card>
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-blue-600">--</div>
                        <p className="text-sm text-muted-foreground">Positive Sentiment</p>
                      </Card>
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-purple-600">--</div>
                        <p className="text-sm text-muted-foreground">Total Responses</p>
                      </Card>
                    </div>
                    <Button className="mt-4" onClick={() => window.location.href = '/test/1'}>
                      Take Sample Test to See Feedback Form
                    </Button>
                  </div>

                  {sentimentAnalysisMutation.data && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">
                              Rating: {sentimentAnalysisMutation.data.rating}/5 stars
                            </span>
                            <Badge variant="secondary">
                              {Math.round(sentimentAnalysisMutation.data.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">AI Insights:</h4>
                            <p className="text-sm">{sentimentAnalysisMutation.data.insights}</p>
                          </div>
                          
                          {sentimentAnalysisMutation.data.recommendations && (
                            <div>
                              <h4 className="font-medium mb-2">Recommendations:</h4>
                              <ul className="text-sm space-y-1">
                                {sentimentAnalysisMutation.data.recommendations.map((rec: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-600">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Code Analysis Tab */}
            <TabsContent value="code" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-green-500" />
                    AI Code Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Programming Language</Label>
                      <Input
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        placeholder="javascript"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Code to Analyze</Label>
                    <Textarea
                      value={codeToAnalyze}
                      onChange={(e) => setCodeToAnalyze(e.target.value)}
                      placeholder="Paste code here for comprehensive analysis..."
                      className="min-h-40 font-mono text-sm"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => codeAnalysisMutation.mutate({ code: codeToAnalyze, language: codeLanguage })}
                    disabled={!codeToAnalyze.trim() || codeAnalysisMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    {codeAnalysisMutation.isPending ? "Analyzing..." : "Analyze Code"}
                  </Button>

                  {codeAnalysisMutation.data && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <span className="font-medium">
                              Quality Score: {codeAnalysisMutation.data.score}/100
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Overall Feedback:</h4>
                            <p className="text-sm">{codeAnalysisMutation.data.feedback}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Complexity Analysis:</h4>
                            <p className="text-sm">{codeAnalysisMutation.data.complexity}</p>
                          </div>
                          
                          {codeAnalysisMutation.data.suggestions && (
                            <div>
                              <h4 className="font-medium mb-2">Improvement Suggestions:</h4>
                              <ul className="text-sm space-y-1">
                                {codeAnalysisMutation.data.suggestions.map((suggestion: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {codeAnalysisMutation.data.security && codeAnalysisMutation.data.security.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Security Considerations:</h4>
                              <ul className="text-sm space-y-1">
                                {codeAnalysisMutation.data.security.map((item: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Question Quality Tab */}
            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Question Quality Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 mx-auto text-purple-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">AI Question Analysis</h3>
                    <p className="text-muted-foreground mb-4">
                      Question quality analysis is integrated into the Question Bank.
                      Navigate to Questions → Review Queue to analyze pending questions with AI analysis.
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = '/questions'}>
                      Go to Question Bank
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platform Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Question Generation Accuracy</span>
                        <Badge className="bg-green-100 text-green-700">98.5%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Code Analysis Precision</span>
                        <Badge className="bg-blue-100 text-blue-700">96.2%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Sentiment Analysis Confidence</span>
                        <Badge className="bg-purple-100 text-purple-700">94.8%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      AI Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Questions Generated Today</span>
                        <Badge variant="secondary">24</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Code Analyses Performed</span>
                        <Badge variant="secondary">156</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Learning Paths Created</span>
                        <Badge variant="secondary">8</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </RoleGuard>
      </div>
    </div>
  );
}