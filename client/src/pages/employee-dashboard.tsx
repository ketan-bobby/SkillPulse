import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  PlayCircle, 
  CheckCircle, 
  CheckCircle2,
  XCircle,
  Target,
  BarChart3,
  Users,
  ArrowRight,
  LogOut,
  Eye,
  FileText
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface TestAssignment {
  id: number;
  test: {
    id: number;
    title: string;
    domain: string;
    skillLevel: string;
    duration: number;
    totalQuestions: number;
  };
  status: 'assigned' | 'in_progress' | 'completed';
  assignedAt: string;
  dueDate?: string;
  completedAt?: string;
  score?: number;
}

interface SkillProgress {
  domain: string;
  level: string;
  progress: number;
  lastAssessment: string;
  totalAssessments: number;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: assignments = [] } = useQuery<TestAssignment[]>({
    queryKey: ["/api/my-assignments"],
  });

  const { data: skillProgress = [] } = useQuery<SkillProgress[]>({
    queryKey: ["/api/my-skills"],
  });

  const { data: recentResults = [] } = useQuery<any[]>({
    queryKey: ["/api/my-results", Date.now()],
  });

  // Filter assignments by status
  const pendingAssignments = assignments.filter(a => a.status === 'assigned');
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800 border-0">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-800 border-0">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-0">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDomainIcon = (domain: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'programming': <Target className="h-4 w-4 text-white" />,
      'frontend': <Target className="h-4 w-4 text-white" />,
      'backend': <Target className="h-4 w-4 text-white" />,
      'devops': <Target className="h-4 w-4 text-white" />,
      'cloud': <Target className="h-4 w-4 text-white" />,
      'mobile': <Target className="h-4 w-4 text-white" />,
      'data-science': <BarChart3 className="h-4 w-4 text-white" />,
      'ai-ml': <BarChart3 className="h-4 w-4 text-white" />,
      'security': <Target className="h-4 w-4 text-white" />,
      'databases': <Target className="h-4 w-4 text-white" />,
      'networking': <Target className="h-4 w-4 text-white" />,
      'vmware-virtualization': <Target className="h-4 w-4 text-white" />,
      'redhat-administration': <Target className="h-4 w-4 text-white" />,
      'oracle-administration': <Target className="h-4 w-4 text-white" />,
      'network-routing-switching': <Target className="h-4 w-4 text-white" />
    };
    return icons[domain] || <Target className="h-4 w-4 text-white" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen beautiful-background">
      {/* Animated Background Elements */}
      <div className="floating-elements">
        <div className="floating-circle"></div>
        <div className="floating-circle delay-1"></div>
        <div className="floating-circle delay-2"></div>
        <div className="floating-circle delay-3"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header with Employee Profile Card */}
          <div className="beautiful-card animate-fade-in p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Profile Card */}
                <div className="profile-card-enhanced">
                  <div className="flex items-center space-x-4">
                    <div className="profile-avatar-enhanced">
                      {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-1">
                        {user?.name || user?.username}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-sm font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Info */}
                <div className="flex flex-col space-y-2">
                  <h1 className="text-2xl font-bold text-gray-800 block">Employee Dashboard</h1>
                  <p className="text-gray-600 text-base block">
                    {user?.domain || 'General'} • ID: {user?.employeeId || user?.username}
                  </p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <form action="/api/logout" method="get" style={{ display: 'inline' }}>
                  <Button 
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="beautiful-card hover:scale-[1.02] transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <div className="icon-container">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress').length}</div>
                  <div className="text-sm text-gray-600">Tests to Take</div>
                </div>
              </CardContent>
            </Card>

            <Card className="beautiful-card hover:scale-[1.02] transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <div className="icon-container">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{completedAssignments.length}</div>
                  <div className="text-sm text-gray-600">Tests Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card className="beautiful-card hover:scale-[1.02] transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <div className="icon-container">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{recentResults.length}</div>
                  <div className="text-sm text-gray-600">Results Available</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            
            {/* Assigned Tests - Full Width */}
            <Card className="beautiful-card">
              <CardHeader className="border-b border-gray-100 p-6">
                <CardTitle className="text-xl text-gray-800">Assigned Tests - List View</CardTitle>
                <CardDescription className="text-gray-600 text-sm">Tests assigned by your manager</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="icon-wrapper mx-auto mb-4" style={{ width: '64px', height: '64px' }}>
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No tests assigned yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Rendering as simple list items - no cards */}
                    {assignments.map((assignment, index) => (
                      <div key={`list-item-${assignment.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200">
                        {/* Compact left section */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600">
                              {getDomainIcon(assignment.test?.domain || 'programming')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{assignment.test?.title || 'Assessment'}</div>
                            <div className="text-xs text-gray-500">
                              {assignment.test?.domain} • {assignment.test?.duration} min • {assignment.test?.totalQuestions} questions
                            </div>
                          </div>
                        </div>
                        
                        {/* Compact right section */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            assignment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {assignment.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                          {assignment.status === 'completed' ? (
                            <Button 
                              size="sm"
                              variant="outline"
                              disabled
                              className="cursor-not-allowed opacity-50"
                            >
                              Test Completed
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              variant="default"
                              onClick={() => setLocation(`/employee/test/${assignment.test.id}`)}
                            >
                              Start Test
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Results - Full Width */}
            <Card className="beautiful-card">
              <CardHeader className="border-b border-gray-100 p-6">
                <CardTitle className="text-xl text-gray-800">Test Results</CardTitle>
                <CardDescription className="text-gray-600 text-sm">Your completed test results and skill gap reports</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {recentResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="icon-wrapper mx-auto mb-4 flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base mb-2">No results available yet</p>
                    <p className="text-gray-400 text-sm">Complete tests to see your results and skill gap analysis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentResults.map((result) => (
                      <div 
                        key={result.id} 
                        className="beautiful-card p-4 hover:scale-[1.01] transition-all cursor-pointer"
                        onClick={() => setLocation(`/reports/test-result/${result.id}`)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="icon-wrapper bg-gradient-to-br from-blue-400 to-cyan-500 flex-shrink-0">
                              {getDomainIcon(result.domain || 'programming')}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-base mb-1">{result.testTitle}</h3>
                              <p className="text-gray-600 text-sm">{result.domain} • Completed {new Date(result.completedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                                {result.percentage}%
                              </p>
                              <Badge variant={result.passed ? "default" : "destructive"} className="text-xs">
                                {result.passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/reports/skill-gap/${user?.id}`);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              View Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      
      {/* Footer with NTT Data branding */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <p className="text-gray-500 text-sm">
              Powered by LinxIQ • Customized for NTT Data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}