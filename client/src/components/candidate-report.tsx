import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  User, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Shield,
  Award,
  Brain
} from "lucide-react";

interface CandidateReportProps {
  candidate: {
    id: number;
    name: string;
    email: string;
    position: string;
    domain: string;
    level: string;
  };
  testResult: {
    id: number;
    testTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    totalTime: number;
    completedAt: string;
    status: string;
  };
  questionAnalysis: Array<{
    id: number;
    question: string;
    type: string;
    domain: string;
    difficulty: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    weightage: number;
    tags: string[];
  }>;
  proctoringEvents: Array<{
    eventType: string;
    timestamp: number;
    severity: string;
    description: string;
  }>;
  securityScore: number;
}

export function CandidateReport({ candidate, testResult, questionAnalysis, proctoringEvents, securityScore }: CandidateReportProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate analytics
  const domainPerformance = questionAnalysis.reduce((acc, q) => {
    if (!acc[q.domain]) acc[q.domain] = { correct: 0, total: 0 };
    acc[q.domain].total++;
    if (q.isCorrect) acc[q.domain].correct++;
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const difficultyBreakdown = questionAnalysis.reduce((acc, q) => {
    if (!acc[q.difficulty]) acc[q.difficulty] = { correct: 0, total: 0 };
    acc[q.difficulty].total++;
    if (q.isCorrect) acc[q.difficulty].correct++;
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const averageTimePerQuestion = testResult.timeSpent / testResult.totalQuestions;
  const timeEfficiency = ((testResult.totalTime - testResult.timeSpent) / testResult.totalTime) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "bg-green-100 text-green-800" };
    if (score >= 80) return { grade: "A", color: "bg-green-100 text-green-800" };
    if (score >= 70) return { grade: "B", color: "bg-blue-100 text-blue-800" };
    if (score >= 60) return { grade: "C", color: "bg-yellow-100 text-yellow-800" };
    if (score >= 50) return { grade: "D", color: "bg-orange-100 text-orange-800" };
    return { grade: "F", color: "bg-red-100 text-red-800" };
  };

  const downloadReport = () => {
    const reportData = {
      candidate,
      testResult,
      questionAnalysis,
      proctoringEvents,
      securityScore,
      domainPerformance,
      difficultyBreakdown,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name}_Assessment_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // In a real application, you would generate a PDF here
    // For demo purposes, we'll create a detailed text report
    const reportText = `
LINXASSESS - CANDIDATE ASSESSMENT REPORT
Engineer-Grade Assessments. Linx-Level Accuracy
========================================

CANDIDATE INFORMATION
Name: ${candidate.name}
Email: ${candidate.email}
Position: ${candidate.position}
Domain: ${candidate.domain}
Level: ${candidate.level}

TEST RESULTS
Test: ${testResult.testTitle}
Overall Score: ${testResult.score}%
Grade: ${getGradeFromScore(testResult.score).grade}
Correct Answers: ${testResult.correctAnswers}/${testResult.totalQuestions}
Time Spent: ${Math.floor(testResult.timeSpent / 60)}:${(testResult.timeSpent % 60).toString().padStart(2, '0')}
Completed: ${new Date(testResult.completedAt).toLocaleString()}

SECURITY ASSESSMENT
Security Score: ${securityScore}/100
Proctoring Events: ${proctoringEvents.length}
High-Risk Violations: ${proctoringEvents.filter(e => e.severity === 'high').length}

DOMAIN PERFORMANCE
${Object.entries(domainPerformance).map(([domain, perf]) => 
  `${domain}: ${perf.correct}/${perf.total} (${Math.round((perf.correct / perf.total) * 100)}%)`
).join('\n')}

DIFFICULTY BREAKDOWN
${Object.entries(difficultyBreakdown).map(([difficulty, perf]) => 
  `${difficulty}: ${perf.correct}/${perf.total} (${Math.round((perf.correct / perf.total) * 100)}%)`
).join('\n')}

Generated: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name}_Assessment_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const grade = getGradeFromScore(testResult.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{candidate.name}</h2>
            <p className="text-muted-foreground">
              {candidate.position} • {candidate.domain} • {candidate.level}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={downloadReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            JSON Report
          </Button>
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Text Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(testResult.score)}`}>
                  {testResult.score}%
                </p>
              </div>
              <Badge className={grade.color}>{grade.grade}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">
                  {testResult.correctAnswers}/{testResult.totalQuestions}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">
                  {Math.floor(testResult.timeSpent / 60)}:{(testResult.timeSpent % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                  {securityScore}/100
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Domain Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(domainPerformance).map(([domain, perf]) => (
                    <div key={domain} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{domain}</span>
                        <span>{perf.correct}/{perf.total} ({Math.round((perf.correct / perf.total) * 100)}%)</span>
                      </div>
                      <Progress value={(perf.correct / perf.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Difficulty Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(difficultyBreakdown).map(([difficulty, perf]) => (
                    <div key={difficulty} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{difficulty}</span>
                        <span>{perf.correct}/{perf.total} ({Math.round((perf.correct / perf.total) * 100)}%)</span>
                      </div>
                      <Progress value={(perf.correct / perf.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Time Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {timeEfficiency.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Completed {Math.floor(testResult.timeSpent / 60)} min early
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg. Time/Question</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {averageTimePerQuestion.toFixed(1)}s
                </div>
                <p className="text-sm text-muted-foreground">
                  Per question average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">100%</div>
                <p className="text-sm text-muted-foreground">
                  All questions answered
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="space-y-3">
            {questionAnalysis.map((question, index) => (
              <Card key={question.id} className={`border-l-4 ${question.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge variant="outline">{question.difficulty}</Badge>
                        <Badge variant="outline">{question.domain}</Badge>
                      </div>
                      <h4 className="font-medium mb-2">{question.question}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>User Answer:</strong> {question.userAnswer}</p>
                        <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                        <p><strong>Time Spent:</strong> {question.timeSpent}s</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      {question.isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Security Score</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={securityScore} className="w-24" />
                    <span className={`font-bold ${getScoreColor(securityScore)}`}>
                      {securityScore}/100
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Security Events</h4>
                  {proctoringEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No security violations detected</p>
                  ) : (
                    <div className="space-y-1">
                      {proctoringEvents.map((event, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 rounded border">
                          <div className="flex items-center space-x-2">
                            <Badge variant={event.severity === 'high' ? 'destructive' : 'secondary'}>
                              {event.severity}
                            </Badge>
                            <span>{event.description}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Test Journey Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Strengths</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {Object.entries(domainPerformance)
                        .filter(([, perf]) => (perf.correct / perf.total) >= 0.8)
                        .map(([domain]) => (
                          <li key={domain}>• Strong performance in {domain}</li>
                        ))}
                      {timeEfficiency > 20 && <li>• Efficient time management</li>}
                      {securityScore > 90 && <li>• Excellent test integrity</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Areas for Improvement</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {Object.entries(domainPerformance)
                        .filter(([, perf]) => (perf.correct / perf.total) < 0.6)
                        .map(([domain]) => (
                          <li key={domain}>• Focus on {domain} concepts</li>
                        ))}
                      {averageTimePerQuestion > 120 && <li>• Work on response speed</li>}
                      {securityScore < 80 && <li>• Follow test protocols more carefully</li>}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {testResult.score >= 80 ? (
                      <p>• Excellent performance! Ready for advanced responsibilities.</p>
                    ) : testResult.score >= 60 ? (
                      <p>• Good foundation. Consider additional training in weaker areas.</p>
                    ) : (
                      <p>• Significant improvement needed. Recommend comprehensive training program.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}