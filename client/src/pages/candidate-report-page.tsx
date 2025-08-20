import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { CandidateReport } from "@/components/candidate-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, TrendingUp } from "lucide-react";

export default function CandidateReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  // Fetch real data from the backend
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });
  
  const { data: results = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
  });

  // Create candidate data from real results and users
  const candidates = (users as any[]).map((user: any) => {
    const userResults = (results as any[]).filter((result: any) => result.userId === user.id);
    const latestResult = userResults.sort((a: any, b: any) => 
      new Date(b.completedAt || b.createdAt || '').getTime() - new Date(a.completedAt || a.createdAt || '').getTime()
    )[0];

    return {
      id: user.id,
      name: user.name || `${user.firstName} ${user.lastName}`.trim() || user.username,
      email: user.email,
      position: user.jobTitle || user.position || "Employee",
      domain: user.domain || "General",
      level: user.level || "Mid",
      testResult: latestResult ? {
        id: latestResult.id,
        testTitle: latestResult.test?.title || "Assessment",
        score: latestResult.percentage || 0,
        totalQuestions: latestResult.totalQuestions || 0,
        correctAnswers: latestResult.correctAnswers || 0,
        timeSpent: latestResult.timeSpent || 0,
        totalTime: latestResult.totalTime || 0,
        completedAt: latestResult.completedAt || latestResult.createdAt,
        status: latestResult.status || "completed"
      } : null,
      questionAnalysis: [],
      proctoringEvents: [],
      securityScore: latestResult?.securityScore || 0
    };
  }).filter((candidate: any) => candidate.testResult); // Only show candidates who have taken tests

  const filteredCandidates = candidates.filter((candidate: any) =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCandidateData = selectedCandidate 
    ? candidates.find((c: any) => c.id === selectedCandidate)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!selectedCandidate ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Candidate Reports</h1>
                <p className="text-muted-foreground">
                  Detailed assessment reports and analytics
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-primary/10">
                  {filteredCandidates.length} Candidates
                </Badge>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Candidates List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{candidate.name}</CardTitle>
                      <Badge className={candidate.testResult.score >= 80 ? "bg-green-100 text-green-800" : 
                                     candidate.testResult.score >= 60 ? "bg-yellow-100 text-yellow-800" : 
                                     "bg-red-100 text-red-800"}>
                        {candidate.testResult.score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{candidate.domain}</Badge>
                        <Badge variant="outline">{candidate.level}</Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          {candidate.testResult.testTitle}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCandidate(candidate.id)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  No candidates found matching your search criteria.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedCandidate(null)}
              >
                ← Back to Candidates
              </Button>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Detailed Assessment Report
                </span>
              </div>
            </div>

            {selectedCandidateData && (
              <CandidateReport
                candidate={selectedCandidateData}
                testResult={selectedCandidateData.testResult}
                questionAnalysis={selectedCandidateData.questionAnalysis}
                proctoringEvents={selectedCandidateData.proctoringEvents}
                securityScore={selectedCandidateData.securityScore}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}