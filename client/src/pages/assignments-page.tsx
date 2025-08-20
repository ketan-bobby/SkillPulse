import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, AlertCircle, Play } from "lucide-react";
import { Link } from "wouter";

export default function AssignmentsPage() {
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const getStatusColor = (assignment: any) => {
    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    
    if (assignment.status === "completed") return "bg-green-100 text-green-800";
    if (dueDate && dueDate < now) return "bg-red-100 text-red-800";
    if (assignment.status === "in_progress") return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (assignment: any) => {
    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    
    if (assignment.status === "completed") return "Completed";
    if (dueDate && dueDate < now) return "Overdue";
    if (assignment.status === "in_progress") return "In Progress";
    return "Assigned";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">Test Assignments</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Test Assignments</h1>
          <p className="text-muted-foreground">
            Complete your assigned technical assessments to demonstrate your skills
          </p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
              <p className="text-muted-foreground">
                You don't have any test assignments at the moment. Check back later for new assessments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment: any) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{assignment.test?.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {assignment.test?.description}
                      </p>
                    </div>
                    <Badge className={getStatusColor(assignment)}>
                      {getStatusText(assignment)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{assignment.test?.duration || 60} minutes</span>
                      </div>
                      {assignment.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{assignment.test?.domain} • {assignment.test?.level}</span>
                      </div>
                    </div>
                    
                    {assignment.status !== "completed" && (
                      <Button asChild>
                        <Link href={`/test/${assignment.test?.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          {assignment.status === "in_progress" ? "Continue" : "Start Test"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}