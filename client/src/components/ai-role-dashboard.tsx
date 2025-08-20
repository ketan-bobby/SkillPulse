import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, TrendingUp, Users, Target, BarChart3, LineChart, 
  Sparkles, AlertCircle, CheckCircle2, Clock, Award
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@shared/roles";

export function AIRoleDashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any>(null);

  // Super Admin: System Insights
  const { data: systemInsights } = useQuery({
    queryKey: ["/api/ai/system-insights"],
    enabled: user?.role === ROLES.SUPER_ADMIN,
  });

  // HR Manager: Talent Analytics
  const { data: talentAnalytics } = useQuery({
    queryKey: ["/api/ai/talent-analytics"],
    enabled: user?.role === ROLES.HR_MANAGER,
  });

  // Employee: Learning Path
  const { data: learningPath } = useQuery({
    queryKey: ["/api/ai/learning-path"],
    enabled: user?.role === ROLES.EMPLOYEE,
  });

  if (!user) return null;

  const renderSuperAdminDashboard = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>AI System Intelligence</span>
            </div>
            <Badge variant="default" className="bg-purple-600">
              Live Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemInsights ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Platform Health</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {typeof systemInsights.health_score === 'object' ? (systemInsights.health_score?.score || 0) : (systemInsights.health_score || 0)}%
                  </div>
                  <Progress value={typeof systemInsights.health_score === 'object' ? (systemInsights.health_score?.score || 0) : (systemInsights.health_score || 0)} className="mt-2" />
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Skill Coverage</span>
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {typeof systemInsights.skill_coverage === 'object' ? (systemInsights.skill_coverage?.score || 0) : (systemInsights.skill_coverage || 0)}%
                  </div>
                  <Progress value={typeof systemInsights.skill_coverage === 'object' ? (systemInsights.skill_coverage?.score || 0) : (systemInsights.skill_coverage || 0)} className="mt-2" />
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AI Accuracy</span>
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {typeof systemInsights.ai_accuracy === 'object' ? (systemInsights.ai_accuracy?.score || 0) : (systemInsights.ai_accuracy || 0)}%
                  </div>
                  <Progress value={typeof systemInsights.ai_accuracy === 'object' ? (systemInsights.ai_accuracy?.score || 0) : (systemInsights.ai_accuracy || 0)} className="mt-2" />
                </div>
              </div>

              {systemInsights.recommendations && Array.isArray(systemInsights.recommendations) && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-600" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {systemInsights.recommendations.map((rec: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        {typeof rec === 'string' ? rec : rec?.text || rec?.recommendation || JSON.stringify(rec)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">AI is analyzing system data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderHRManagerDashboard = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>AI Talent Intelligence</span>
            </div>
            <Badge variant="default" className="bg-blue-600">
              HR Analytics
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {talentAnalytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Talent Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(talentAnalytics.talent_distribution || {}).map(([skill, count]: [string, any]) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-sm">{skill}</span>
                        <Badge variant="outline">{typeof count === 'object' ? (count?.value || count?.count || 'N/A') : count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Training Priorities</h4>
                  <div className="space-y-2">
                    {(talentAnalytics.training_needs || []).slice(0, 5).map((need: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Badge variant={idx === 0 ? "destructive" : "secondary"} className="text-xs">
                          P{idx + 1}
                        </Badge>
                        <span className="text-sm">{typeof need === 'object' ? (need?.skill || need?.area || need?.name || 'Training Priority') : need}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {talentAnalytics.succession_planning && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-blue-600" />
                    Succession Planning Insights
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {typeof talentAnalytics.succession_planning === 'object' 
                      ? (talentAnalytics.succession_planning?.summary || talentAnalytics.succession_planning?.description || 'Succession planning analysis in progress') 
                      : talentAnalytics.succession_planning}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Analyzing talent data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span>AI Career Assistant</span>
            </div>
            <Badge variant="default" className="bg-green-600">
              Personalized
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {learningPath ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Your Learning Journey</h4>
                <div className="space-y-3">
                  {(learningPath.objectives || []).map((objective: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className={`mt-1 w-2 h-2 rounded-full ${
                        objective.completed ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{objective.title}</p>
                        <p className="text-xs text-muted-foreground">{objective.timeline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {learningPath.next_steps && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-green-600" />
                    Recommended Next Steps
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {learningPath.next_steps.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Creating your personalized learning path...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render based on user role
  switch (user.role) {
    case ROLES.SUPER_ADMIN:
      return renderSuperAdminDashboard();
    case ROLES.HR_MANAGER:
      return renderHRManagerDashboard();
    case ROLES.EMPLOYEE:
      return renderEmployeeDashboard();
    default:
      return null;
  }
}