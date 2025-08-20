import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RoleGuard } from "@/lib/role-guard";
import { CanAccess } from "@/lib/permission-guard";
import { ROLES, PERMISSIONS, ROLE_INFO } from "@shared/roles";
import { 
  Brain, Users, Target, TrendingUp, BarChart3, Sparkles, 
  FileQuestion, UserCheck, BookOpen, Award, Briefcase,
  AlertCircle, CheckCircle, CheckCircle2, Clock, Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AIRoleDashboard } from "@/components/ai-role-dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SmartInsightsPage() {
  const { user } = useAuth();
  const [selectedDomain, setSelectedDomain] = useState("programming");
  const [selectedLevel, setSelectedLevel] = useState("mid");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  if (!user) return null;

  const roleInfo = ROLE_INFO[user.role as keyof typeof ROLE_INFO];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            AI Intelligence Center
          </h1>
          <p className="text-muted-foreground">
            Powered by advanced AI to enhance your {roleInfo?.name} capabilities
          </p>
        </div>

        <AIRoleDashboard />

        <div className="mt-8">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4">
              <CanAccess permissions={[PERMISSIONS.VIEW_ALL_ANALYTICS]}>
                <SystemInsights />
              </CanAccess>
              
              <CanAccess permissions={[PERMISSIONS.CREATE_TEST]}>
                <TestRecommendations 
                  domain={selectedDomain} 
                  level={selectedLevel}
                  onDomainChange={setSelectedDomain}
                  onLevelChange={setSelectedLevel}
                />
              </CanAccess>

              <CanAccess permissions={[PERMISSIONS.MANAGE_HR_INTEGRATION]}>
                <TalentInsights department={selectedDepartment} onDepartmentChange={setSelectedDepartment} />
              </CanAccess>

              <PersonalInsights />
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <AutomationFeatures />
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              <PredictiveAnalytics />
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <OptimizationSuggestions />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SystemInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/ai/system-insights"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Analyzing system data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          System-Wide Insights
        </CardTitle>
        <CardDescription>AI-powered analysis of platform performance and health</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">System Health</div>
            <div className="text-2xl font-bold">{(insights as any)?.health_score?.status || "Excellent"}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {(insights as any)?.health_score?.reason || "System performing optimally"}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">Skill Gaps</div>
            <div className="text-2xl font-bold">
              {(insights as any)?.skill_gaps ? Object.keys((insights as any).skill_gaps).length : 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Areas identified</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">Recommendations</div>
            <div className="text-2xl font-bold">
              {(insights as any)?.recommendations?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">AI suggestions</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">Predictions</div>
            <div className="text-2xl font-bold">
              {(insights as any)?.predictions?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Future insights</div>
          </div>
        </div>

        {(insights as any)?.recommendations && Array.isArray((insights as any).recommendations) && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">AI Recommendations</h4>
            <ul className="space-y-2 text-sm">
              {(insights as any).recommendations.map((rec: any, idx: number) => (
                <li key={idx} className="flex items-start space-x-3">
                  <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">{rec?.area || 'Recommendation'}</div>
                    <div className="text-muted-foreground">
                      {rec?.suggestion || rec?.text || rec?.recommendation || String(rec)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TestRecommendations({ domain, level, onDomainChange, onLevelChange }: any) {
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/test-recommendations", { domain, level });
      return res.json();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileQuestion className="h-5 w-5 mr-2 text-blue-600" />
          Test Configuration AI
        </CardTitle>
        <CardDescription>Get AI recommendations for optimal test setup</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Domain</Label>
            <Select value={domain} onValueChange={onDomainChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
                <SelectItem value="ai-ml">AI/ML</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Level</Label>
            <Select value={level} onValueChange={onLevelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>&nbsp;</Label>
            <Button 
              onClick={() => mutation.mutate()} 
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </div>
        </div>

        {mutation.data && !mutation.data.error && !mutation.data.status && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Recommended Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span className="font-medium">{mutation.data.total_questions || 25}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{mutation.data.duration || 60} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="font-medium">{mutation.data.passing_score || 70}%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Question Distribution</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(mutation.data.distribution || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <span className="font-medium">{count as any}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {mutation.data.skills_to_evaluate && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Skills to Evaluate</h4>
                <div className="flex flex-wrap gap-2">
                  {mutation.data.skills_to_evaluate.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {mutation.error && (
          <div className="mt-4 p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800 dark:text-red-200">
                Failed to generate AI recommendations. Please try again.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TalentInsights({ department, onDepartmentChange }: any) {
  const { data: analytics } = useQuery({
    queryKey: ["/api/ai/talent-analytics", department],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Talent Analytics
        </CardTitle>
        <CardDescription>AI-driven insights into your talent pool</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>Filter by Department</Label>
          <Input 
            placeholder="e.g., Engineering, Product" 
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
          />
        </div>

        {analytics && !(analytics as any)?.error && !(analytics as any)?.status && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Talent Score</div>
                <div className="text-2xl font-bold text-indigo-600">{(analytics as any).talent_score || 85}/100</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Skill Diversity</div>
                <div className="text-2xl font-bold text-green-600">{(analytics as any).diversity_score || 78}%</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Growth Potential</div>
                <div className="text-2xl font-bold text-purple-600">{(analytics as any).growth_potential || 92}%</div>
              </div>
            </div>

            {(analytics as any).training_needs && Array.isArray((analytics as any).training_needs) && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-orange-600" />
                  Priority Training Areas
                </h4>
                <ul className="space-y-1 text-sm">
                  {(analytics as any).training_needs.slice(0, 5).map((need: any, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <Badge variant="outline" className="mr-2 text-xs">P{idx + 1}</Badge>
                      {typeof need === 'string' ? need : String(need)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PersonalInsights() {
  const { data: learningPath } = useQuery({
    queryKey: ["/api/ai/learning-path"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-green-600" />
          Your Personal AI Coach
        </CardTitle>
        <CardDescription>Personalized recommendations for your growth</CardDescription>
      </CardHeader>
      <CardContent>
        {learningPath && !(learningPath as any)?.error && !(learningPath as any)?.status ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
              <h4 className="font-medium mb-2">Your Next Learning Goals</h4>
              <div className="space-y-2">
                {Array.isArray((learningPath as any).objectives) && (learningPath as any).objectives.slice(0, 3).map((obj: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">{obj.title || String(obj)}</p>
                      <p className="text-xs text-muted-foreground">{obj.description || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(learningPath as any).recommended_resources && Array.isArray((learningPath as any).recommended_resources) && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Recommended Resources</h4>
                <div className="space-y-2">
                  {(learningPath as any).recommended_resources.map((resource: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{resource.title || String(resource)}</span>
                      <Badge variant="secondary">{resource.type || 'Resource'}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Generating your personalized learning path...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AutomationFeatures() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Smart Automation</CardTitle>
          <CardDescription>Streamline your workflow with intelligent automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <FileQuestion className="h-4 w-4 mr-2 text-blue-600" />
                Automatic Question Generation
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                AI generates high-quality questions based on domain and difficulty
              </p>
              <Badge variant="secondary">Active</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                Smart Candidate Matching
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically match candidates to appropriate tests
              </p>
              <Badge variant="secondary">Active</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-600" />
                Adaptive Testing
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Questions adapt based on candidate performance
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-indigo-600" />
                Intelligent Proctoring
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                AI monitors test-taking behavior without video
              </p>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PredictiveAnalytics() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Predictive Intelligence</CardTitle>
          <CardDescription>AI predictions to help you make informed decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Performance Predictions
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Success Rate Prediction</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Skill Gap Closure</span>
                    <span className="text-sm font-medium">3 months</span>
                  </div>
                  <Progress value={70} />
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Talent Predictions
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>High Performers Identified</span>
                  <Badge variant="default">12 candidates</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Risk of Attrition</span>
                  <Badge variant="destructive">3 employees</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ready for Promotion</span>
                  <Badge variant="secondary">8 employees</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OptimizationSuggestions() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Optimization Engine</CardTitle>
          <CardDescription>Continuous improvement suggestions powered by AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                Platform Optimizations
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Optimize test duration</p>
                    <p className="text-muted-foreground">Reduce Python tests by 15 minutes without affecting quality</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Update question bank</p>
                    <p className="text-muted-foreground">23 questions need review due to technology updates</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Schedule optimization</p>
                    <p className="text-muted-foreground">Best test times: Tuesday 10 AM, Thursday 2 PM</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Resource Optimization</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Server Load Optimization</span>
                    <Badge variant="secondary">15% savings</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Question Reuse Rate</span>
                    <Badge variant="secondary">Increase 23%</Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Process Optimization</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Review Time Reduction</span>
                    <Badge variant="secondary">30% faster</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Candidate Experience</span>
                    <Badge variant="secondary">+12 NPS</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}