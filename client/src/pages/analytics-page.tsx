import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, TrendingUp, Clock, Target, Users, TestTube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ROLES } from "@shared/roles";

export default function AnalyticsPage() {
  const { data: results = [] } = useQuery({
    queryKey: ["/api/results"],
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  // Calculate analytics
  const averageScore = results.length > 0 
    ? results.reduce((sum: number, r: any) => sum + r.score, 0) / results.length 
    : 0;

  const completionRate = assignments.length > 0 
    ? (results.length / assignments.length) * 100 
    : 0;

  const averageTime = results.length > 0 
    ? results.reduce((sum: number, r: any) => sum + (r.timeSpent || 0), 0) / results.length / 60
    : 0;

  // Domain performance
  const domainStats = results.reduce((acc: any, result: any) => {
    const domain = result.test?.domain || 'unknown';
    if (!acc[domain]) {
      acc[domain] = { count: 0, totalScore: 0, averageScore: 0 };
    }
    acc[domain].count++;
    acc[domain].totalScore += result.score;
    acc[domain].averageScore = acc[domain].totalScore / acc[domain].count;
    return acc;
  }, {});

  const topDomains = Object.entries(domainStats)
    .sort(([,a]: any, [,b]: any) => b.averageScore - a.averageScore)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.REVIEWER, ROLES.EMPLOYEE]}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Performance Analytics</h1>
            <p className="text-muted-foreground">
              Detailed insights into your assessment performance and learning progress
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{Math.round(averageScore)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                    <p className="text-2xl font-bold">{Math.round(averageTime)}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TestTube className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tests Taken</p>
                    <p className="text-2xl font-bold">{results.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Domain Performance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance by Domain</CardTitle>
            </CardHeader>
            <CardContent>
              {topDomains.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart className="h-12 w-12 mx-auto mb-4" />
                  <p>No domain performance data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topDomains.map(([domain, stats]: any) => (
                    <div key={domain} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium capitalize">{domain.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          {stats.count} test{stats.count !== 1 ? 's' : ''}
                        </span>
                        <Badge variant="outline">
                          {Math.round(stats.averageScore)}% avg
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>No performance data available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.slice(-5).reverse().map((result: any, index: number) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{result.test?.title || 'Test Assessment'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.score}%
                        </Badge>
                        <div className={`w-2 h-8 rounded-full ${
                          result.score >= 80 ? 'bg-green-500' :
                          result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </div>
  );
}