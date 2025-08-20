import { AppHeader } from "@/components/app-header";
import { DashboardStats } from "@/components/dashboard-stats";
import { ActiveTests } from "@/components/active-tests";
import { RecentResults } from "@/components/recent-results";
import { SidebarWidgets } from "@/components/sidebar-widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, CheckCircle, Clock, Users, TrendingUp, PlayCircle, BookOpen, Target } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AIAssistant } from "@/components/ai-assistant";
import { useEffect } from "react";
import { ROLES } from "@shared/roles";

function CandidateAssessmentJourney({ user }: { user: any }) {
  const [, setLocation] = useLocation();
  
  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const { data: results = [] } = useQuery({
    queryKey: ["/api/results"],
  });

  const pendingAssignments = assignments.filter((a: any) => a.status === 'assigned');
  const inProgressAssignments = assignments.filter((a: any) => a.status === 'started');
  const completedResults = results.filter((r: any) => r.userId === user.id);

  const getNextAction = () => {
    if (inProgressAssignments.length > 0) {
      return {
        title: "Resume Your Assessment",
        description: "You have an assessment in progress. Continue where you left off.",
        action: "Resume Test",
        variant: "destructive" as const,
        onClick: () => setLocation(`/test/${inProgressAssignments[0].testId}`),
      };
    } else if (pendingAssignments.length > 0) {
      return {
        title: "Start Your Assessment",
        description: "You have new assessments assigned to you. Ready to begin?",
        action: "Start Assessment",
        variant: "default" as const,
        onClick: () => setLocation(`/test/${pendingAssignments[0].testId}`),
      };
    } else if (completedResults.length > 0) {
      return {
        title: "View Your Results",
        description: "Check your assessment results and performance feedback.",
        action: "View Results",
        variant: "secondary" as const,
        onClick: () => setLocation("/results"),
      };
    } else {
      return {
        title: "No Assessments Yet",
        description: "No assessments have been assigned to you at this time.",
        action: "Contact Admin",
        variant: "outline" as const,
        onClick: () => {},
      };
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.username}!</h1>
          <p className="text-muted-foreground">
            Ready to showcase your technical skills? Let's continue your assessment journey.
          </p>
        </div>

        {/* Primary Action Card */}
        <Card className="mb-8 border-2 border-primary">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{nextAction.title}</h2>
                <p className="text-muted-foreground mb-6">{nextAction.description}</p>
                <Button 
                  variant={nextAction.variant}
                  size="lg"
                  onClick={nextAction.onClick}
                  className="text-lg px-8 py-3"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  {nextAction.action}
                </Button>
              </div>
              <div className="text-6xl opacity-10">
                <Target />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Journey Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={pendingAssignments.length > 0 ? "border-orange-200 bg-orange-50" : ""}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Pending Assessments</h3>
              <p className="text-3xl font-bold text-orange-600">{pendingAssignments.length}</p>
              <p className="text-sm text-muted-foreground mt-2">Ready to start</p>
            </CardContent>
          </Card>

          <Card className={inProgressAssignments.length > 0 ? "border-blue-200 bg-blue-50" : ""}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">In Progress</h3>
              <p className="text-3xl font-bold text-blue-600">{inProgressAssignments.length}</p>
              <p className="text-sm text-muted-foreground mt-2">Continue assessment</p>
            </CardContent>
          </Card>

          <Card className={completedResults.length > 0 ? "border-green-200 bg-green-50" : ""}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{completedResults.length}</p>
              <p className="text-sm text-muted-foreground mt-2">View results</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assessment Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assessments assigned yet</p>
                  <p className="text-sm">Your assigned assessments will appear here</p>
                </div>
              ) : (
                assignments.map((assignment: any) => {
                  const result = results.find((r: any) => r.testId === assignment.testId && r.userId === assignment.userId);
                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          result ? 'bg-green-500' : 
                          assignment.status === 'started' ? 'bg-blue-500' : 
                          'bg-orange-500'
                        }`} />
                        <div>
                          <h4 className="font-medium">Test ID: {assignment.testId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          result ? 'default' : 
                          assignment.status === 'started' ? 'secondary' : 
                          'outline'
                        }>
                          {result ? 'Completed' : assignment.status}
                        </Badge>
                        {result ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/results`)}
                          >
                            View Results
                          </Button>
                        ) : assignment.status === 'started' ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => setLocation(`/test/${assignment.testId}`)}
                          >
                            Resume
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/test/${assignment.testId}`)}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) return;
    
    // Redirect based on role
    switch (user.role) {
      case ROLES.SUPER_ADMIN:
      case ROLES.ADMIN:
        setLocation("/admin");
        break;
      case ROLES.HR_MANAGER:
        setLocation("/hr-integration");
        break;
      case ROLES.REVIEWER:
        setLocation("/reviewer");
        break;
      case ROLES.TEAM_LEAD:
        setLocation("/analytics");
        break;
      case ROLES.EMPLOYEE:
      case ROLES.CANDIDATE:
        // Stay on home page for candidates/employees
        break;
    }
  }, [user, setLocation]);

  if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.username}!</h1>
            <p className="text-muted-foreground">
              Ready to create and manage technical assessments? Let's get started with the logical workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CheckCircle2 className="h-6 w-6 mr-2 text-primary" />
                  Complete Assessment Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Follow the logical step-by-step process: Create tests → Assign to candidates → Monitor progress → Review results
                </p>
                <Button 
                  onClick={() => setLocation("/workflow")}
                  className="w-full"
                >
                  Start Assessment Workflow
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                  Quick Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Health</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="text-sm font-medium">3 Engineers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tests Available</span>
                    <span className="text-sm font-medium">10 Domains</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <AIAssistant context="admin-dashboard" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How LinxIQ Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Create Tests</h3>
                  <p className="text-sm text-muted-foreground">Design technical assessments for specific roles and skill levels</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Assign Candidates</h3>
                  <p className="text-sm text-muted-foreground">Select and assign tests to engineering candidates</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-orange-600">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Monitor Progress</h3>
                  <p className="text-sm text-muted-foreground">Track candidate progress and real-time performance</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-purple-600">4</span>
                  </div>
                  <h3 className="font-medium mb-2">Review Results</h3>
                  <p className="text-sm text-muted-foreground">Analyze comprehensive results and make informed decisions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <CandidateAssessmentJourney user={user} />;
}
