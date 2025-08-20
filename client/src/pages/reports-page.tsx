import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, BarChart, Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ReportsPage() {
  const { data: allResults = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
    enabled: true, // Will be controlled by RoleGuard
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={["admin", "reviewer"]}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Assessment Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and candidate evaluation reports
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                    <p className="text-2xl font-bold">{new Set(allResults.map((r: any) => r.userId)).size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assessments Completed</p>
                    <p className="text-2xl font-bold">{allResults.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">
                      {allResults.length > 0 
                        ? Math.round(allResults.reduce((sum: number, r: any) => sum + r.score, 0) / allResults.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                    <p className="text-2xl font-bold">
                      {allResults.length > 0 
                        ? Math.round((allResults.filter((r: any) => r.passed).length / allResults.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-3">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter Reports
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Recent Assessment Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessment Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {allResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No assessment reports available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allResults.slice(0, 10).map((result: any) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div>
                        <h3 className="font-medium">Test Assessment Report</h3>
                        <p className="text-sm text-muted-foreground">
                          User ID: {result.userId} • Score: {result.score}% • 
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? "Passed" : "Failed"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Report
                        </Button>
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