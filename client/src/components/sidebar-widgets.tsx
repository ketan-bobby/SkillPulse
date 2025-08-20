import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Book, BarChart, ArrowRight } from "lucide-react";

export function SidebarWidgets() {
  const { data: results = [] } = useQuery({
    queryKey: ["/api/results"],
  });

  const recentResults = results.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Recent Results Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No test results yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result: any) => (
                <div key={result.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{result.test?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${result.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.percentage}%
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {result.score}/{result.test?.totalQuestions} correct
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary">
                View All Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Progress Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Networking</span>
                <span className="text-sm text-muted-foreground">L2 → L3</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1">78% proficiency</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Cybersecurity</span>
                <span className="text-sm text-muted-foreground">L2</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1">85% proficiency</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Operating Systems</span>
                <span className="text-sm text-muted-foreground">L1 → L2</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1">65% proficiency</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center space-x-3">
                <CalendarPlus className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Schedule Test</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center space-x-3">
                <Book className="h-4 w-4 text-green-500" />
                <span className="font-medium text-foreground">Study Materials</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center space-x-3">
                <BarChart className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-foreground">View Analytics</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
