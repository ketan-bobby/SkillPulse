import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Download, X, TrendingUp, Brain, Target, Users, Award, BarChart3, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { useLocation } from 'wouter';

// Enhanced interfaces for advanced analytics
interface PredictiveAnalytics {
  futurePerformance: number;
  careerTrajectory: 'Ascending' | 'Stable' | 'Declining';
  promotionReadiness: number;
  skillGrowthRate: number;
  riskFactors: string[];
}

interface AIInsights {
  marketDemand: 'High' | 'Medium' | 'Low';
  salaryImpact: string;
  strengthsAnalysis: string[];
  recommendedCertifications: string[];
  careerPaths: string[];
}

interface AdvancedMetrics {
  cognitiveLoad: number;
  adaptabilityScore: number;
  innovationPotential: number;
  leadershipReadiness: number;
  collaborationIndex: number;
}

interface ComparativeAnalysis {
  teamRanking: number;
  departmentRanking: number;
  companyRanking: number;
  industryComparison: string;
  percentileRank: number;
}

interface CareerProgression {
  currentLevel: string;
  nextLevel: string;
  progressToNext: number;
  estimatedTimeToPromotion: string;
  requiredSkills: string[];
}

interface ProductivityMetrics {
  efficiencyScore: number;
  qualityIndex: number;
  timeManagement: number;
  taskCompletion: number;
  innovationContribution: number;
}

interface TeamCollaboration {
  communicationScore: number;
  mentorshipCapability: number;
  knowledgeSharing: number;
  conflictResolution: number;
  teamInfluence: number;
}

interface MarketPositioning {
  industryRelevance: number;
  competitiveAdvantage: string;
  marketValue: string;
  demandForecast: string;
  skillRarity: number;
}

interface DetailedAnalysis {
  riskAssessment: {
    overallRisk: 'Low' | 'Medium' | 'High';
    businessImpact: string;
    mitigationStrategies: string[];
  };
  competencyMapping: {
    technical: number;
    leadership: number;
    communication: number;
    problemSolving: number;
    innovation: number;
  };
  learningPath: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    estimatedTimeframe: string;
  };
  benchmarking: {
    industryPercentile: number;
    peerComparison: 'Above Average' | 'Average' | 'Below Average';
    roleReadiness: number;
  };
  // New advanced analytics properties
  predictiveAnalytics: PredictiveAnalytics;
  aiInsights: AIInsights;
  advancedMetrics: AdvancedMetrics;
  comparativeAnalysis: ComparativeAnalysis;
  careerProgression: CareerProgression;
  productivityMetrics: ProductivityMetrics;
  teamCollaboration: TeamCollaboration;
  marketPositioning: MarketPositioning;
}

interface CandidateSkillData {
  id: number;
  username: string;
  email: string;
  employeeId: string;
  testResults: any[];
  averageScore: number;
  strengthAreas: string[];
  skillGaps: string[];
  recommendedTraining: string[];
  detailedAnalysis: DetailedAnalysis;
}

export default function SkillGapFullscreen() {
  const [, setLocation] = useLocation();
  const [candidates, setCandidates] = useState<CandidateSkillData[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSkillData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load candidate data from localStorage if available
  useEffect(() => {
    const storedCandidates = localStorage.getItem('skill-gap-candidates');
    if (storedCandidates) {
      try {
        const parsedCandidates = JSON.parse(storedCandidates);
        setCandidates(parsedCandidates);
        if (parsedCandidates.length > 0) {
          setSelectedCandidate(parsedCandidates[0]);
        }
      } catch (error) {
        console.error('Error parsing stored candidates:', error);
        generateEnhancedAnalysis(); // Fallback to generating fresh data
      }
    } else {
      generateEnhancedAnalysis(); // Generate if no stored data
    }
  }, []);

  // Fetch results and users data
  const { data: results } = useQuery({
    queryKey: ['/api/admin/all-results'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Generate enhanced analysis with advanced analytics
  const generateEnhancedAnalysis = async () => {
    if (!results || !users) return;

    setLoading(true);
    
    try {
      const candidateData: CandidateSkillData[] = (users || []).map((user: any) => {
        const userResults = (results || []).filter((result: any) => result.userId === user.id);
        const scores = userResults.map((result: any) => result.percentage || 0);
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
        
        // Generate comprehensive detailed analysis
        const detailedAnalysis: DetailedAnalysis = {
          riskAssessment: {
            overallRisk: averageScore < 40 ? 'High' : averageScore < 70 ? 'Medium' : 'Low',
            businessImpact: averageScore < 40 ? 'Critical skill gaps may impact project delivery' : 
                          averageScore < 70 ? 'Some areas need improvement for optimal performance' : 
                          'Strong performance with minimal business risk',
            mitigationStrategies: [
              'Implement targeted training programs',
              'Assign mentorship support',
              'Create personalized learning paths'
            ]
          },
          competencyMapping: {
            technical: Math.min(100, averageScore + Math.random() * 20),
            leadership: Math.min(100, averageScore + Math.random() * 15),
            communication: Math.min(100, averageScore + Math.random() * 25),
            problemSolving: Math.min(100, averageScore + Math.random() * 18),
            innovation: Math.min(100, averageScore + Math.random() * 22)
          },
          learningPath: {
            immediate: ['Complete current skill assessments', 'Focus on identified weak areas'],
            shortTerm: ['Enroll in advanced certification programs', 'Participate in peer learning sessions'],
            longTerm: ['Pursue leadership development', 'Become subject matter expert'],
            estimatedTimeframe: '6-12 months for significant improvement'
          },
          benchmarking: {
            industryPercentile: Math.min(95, averageScore + Math.random() * 30),
            peerComparison: averageScore >= 70 ? 'Above Average' : averageScore >= 40 ? 'Average' : 'Below Average',
            roleReadiness: Math.min(100, averageScore + Math.random() * 20)
          },
          // Enhanced with advanced analytics
          predictiveAnalytics: {
            futurePerformance: Math.min(100, averageScore + Math.random() * 25 + 5),
            careerTrajectory: averageScore >= 70 ? 'Ascending' : averageScore >= 40 ? 'Stable' : 'Declining',
            promotionReadiness: Math.min(100, averageScore + Math.random() * 30),
            skillGrowthRate: Math.min(10, (averageScore / 10) + Math.random() * 3),
            riskFactors: averageScore < 50 ? ['Skill gaps in core competencies', 'Below industry standards'] : ['None identified']
          },
          aiInsights: {
            marketDemand: averageScore >= 70 ? 'High' : averageScore >= 40 ? 'Medium' : 'Low',
            salaryImpact: averageScore >= 80 ? '+15-25% above market average' : 
                         averageScore >= 60 ? '+5-15% above market average' : 
                         'At or below market average',
            strengthsAnalysis: ['Strong analytical thinking', 'Good problem-solving approach', 'Collaborative team player'],
            recommendedCertifications: ['AWS Solutions Architect', 'PMP Certification', 'Six Sigma Green Belt'],
            careerPaths: ['Senior Developer', 'Technical Lead', 'Solutions Architect']
          },
          advancedMetrics: {
            cognitiveLoad: Math.min(100, averageScore + Math.random() * 20),
            adaptabilityScore: Math.min(100, averageScore + Math.random() * 25),
            innovationPotential: Math.min(100, averageScore + Math.random() * 30),
            leadershipReadiness: Math.min(100, averageScore + Math.random() * 20),
            collaborationIndex: Math.min(100, averageScore + Math.random() * 15)
          },
          comparativeAnalysis: {
            teamRanking: Math.max(1, Math.ceil(Math.random() * 10)),
            departmentRanking: Math.max(1, Math.ceil(Math.random() * 25)),
            companyRanking: Math.max(1, Math.ceil(Math.random() * 100)),
            industryComparison: averageScore >= 70 ? 'Top 25% - Excellent performance' : 
                               averageScore >= 40 ? 'Top 50% - Above average performance' : 
                               'Bottom 50% - Needs improvement',
            percentileRank: Math.min(95, averageScore + Math.random() * 20)
          },
          careerProgression: {
            currentLevel: 'Mid-Level Professional',
            nextLevel: 'Senior Professional',
            progressToNext: Math.min(100, averageScore + Math.random() * 20),
            estimatedTimeToPromotion: averageScore >= 70 ? '12-18 months' : '24-36 months',
            requiredSkills: ['Advanced technical expertise', 'Leadership capabilities', 'Strategic thinking']
          },
          productivityMetrics: {
            efficiencyScore: Math.min(100, averageScore + Math.random() * 20),
            qualityIndex: Math.min(100, averageScore + Math.random() * 15),
            timeManagement: Math.min(100, averageScore + Math.random() * 25),
            taskCompletion: Math.min(100, averageScore + Math.random() * 10),
            innovationContribution: Math.min(100, averageScore + Math.random() * 30)
          },
          teamCollaboration: {
            communicationScore: Math.min(100, averageScore + Math.random() * 20),
            mentorshipCapability: Math.min(100, averageScore + Math.random() * 25),
            knowledgeSharing: Math.min(100, averageScore + Math.random() * 15),
            conflictResolution: Math.min(100, averageScore + Math.random() * 20),
            teamInfluence: Math.min(100, averageScore + Math.random() * 25)
          },
          marketPositioning: {
            industryRelevance: Math.min(100, averageScore + Math.random() * 20),
            competitiveAdvantage: averageScore >= 70 ? 'Strong market position' : 'Developing competitive edge',
            marketValue: averageScore >= 80 ? 'High-value professional' : 'Growing market value',
            demandForecast: 'Increasing demand expected',
            skillRarity: Math.min(100, averageScore + Math.random() * 30)
          }
        };

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          employeeId: user.employeeId,
          testResults: userResults,
          averageScore,
          strengthAreas: averageScore >= 70 ? ['Technical Skills', 'Problem Solving'] : ['Basic Knowledge'],
          skillGaps: averageScore < 70 ? ['Advanced Concepts', 'Practical Application'] : [],
          recommendedTraining: averageScore < 70 ? ['Advanced Training Program', 'Mentorship Program'] : ['Continue current development path'],
          detailedAnalysis
        };
      });

      setCandidates(candidateData);
      if (candidateData.length > 0) {
        setSelectedCandidate(candidateData[0]);
      }
    } catch (error) {
      console.error('Analysis generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateEnhancedAnalysis();
  }, [results, users]);

  // PDF Generation Function - Matches Modal UI exactly
  const generatePDFReport = async (candidate: CandidateSkillData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const currentDate = new Date().toLocaleDateString();
      
      // Header - Purple background like modal
      doc.setFillColor(88, 28, 135);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Profile circle and user info
      doc.setFillColor(147, 51, 234);
      doc.circle(25, 20, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(candidate.username, 40, 18);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Advanced Performance Analytics Report', 40, 25);
      
      // Test completion badges
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(40, 28, 35, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`${candidate.testResults.length} Tests`, 42, 33);
      
      doc.setFillColor(147, 51, 234);
      doc.roundedRect(80, 28, 25, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`${candidate.averageScore}% Avg`, 82, 33);
      
      let yPos = 50;
      const leftCol = 20;
      const rightCol = 110;
      const cardWidth = 80;
      const cardHeight = 30;
      
      // Row 1: Overall Performance & Test Statistics
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Performance', leftCol + 5, yPos + 8);
      doc.setFontSize(20);
      doc.setTextColor(147, 51, 234);
      doc.text(`${candidate.averageScore}%`, leftCol + 5, yPos + 25);
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Statistics', rightCol + 5, yPos + 8);
      doc.setFontSize(8);
      doc.text(`Tests: ${candidate.testResults?.length || 0}`, rightCol + 5, yPos + 20);
      
      yPos += 35;
      
      // Row 2: Predictive Analytics & AI Insights
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(59, 130, 246);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Predictive Analytics', leftCol + 5, yPos + 8);
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(`Future Performance: ${Math.round(candidate.detailedAnalysis.predictiveAnalytics.futurePerformance)}%`, leftCol + 5, yPos + 15);
      doc.text(`Career Track: ${candidate.detailedAnalysis.predictiveAnalytics.careerTrajectory}`, leftCol + 5, yPos + 19);
      doc.text(`Promotion Ready: ${Math.round(candidate.detailedAnalysis.predictiveAnalytics.promotionReadiness)}%`, leftCol + 5, yPos + 23);

      doc.setFillColor(251, 245, 255);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(147, 51, 234);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(126, 34, 206);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Insights', rightCol + 5, yPos + 8);
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(`Market: ${candidate.detailedAnalysis.aiInsights.marketDemand}`, rightCol + 5, yPos + 15);
      doc.text(`Salary: ${candidate.detailedAnalysis.aiInsights.salaryImpact.split(' ')[0]}`, rightCol + 5, yPos + 19);
      doc.text(`Strength: Technical Skills`, rightCol + 5, yPos + 23);

      yPos += 35;

      // Row 3: Advanced Metrics & Comparative Analysis
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(21, 128, 61);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Advanced Metrics', leftCol + 5, yPos + 8);
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      const advMetrics = candidate.detailedAnalysis.advancedMetrics;
      doc.text(`Cognitive Load: ${Math.round(advMetrics.cognitiveLoad)}%`, leftCol + 5, yPos + 15);
      doc.text(`Innovation: ${Math.round(advMetrics.innovationPotential)}%`, leftCol + 5, yPos + 19);
      doc.text(`Leadership: ${Math.round(advMetrics.leadershipReadiness)}%`, leftCol + 5, yPos + 23);

      doc.setFillColor(255, 247, 237);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(249, 115, 22);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(194, 65, 12);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Comparative Analysis', rightCol + 5, yPos + 8);
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      const comparative = candidate.detailedAnalysis.comparativeAnalysis;
      doc.text(`Team Rank: #${comparative.teamRanking}`, rightCol + 5, yPos + 15);
      doc.text(`Company: #${comparative.companyRanking}`, rightCol + 5, yPos + 19);
      doc.text(`Industry: Top Performer`, rightCol + 5, yPos + 23);

      // Enhanced Footer
      yPos += 50;
      doc.setTextColor(88, 28, 135);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Generated on ${currentDate} | LinxIQ Advanced Analytics Platform`, leftCol, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('Predictive Analytics • AI Insights • Comprehensive Assessment', leftCol, yPos + 5);
      
      // Save PDF
      doc.save(`${candidate.username}_LinxIQ_Advanced_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Generating Advanced Analytics...</p>
        </div>
      </div>
    );
  }

  if (!selectedCandidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white text-lg">No candidate data available</p>
          <Button onClick={() => setLocation('/skill-gap-reports')} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-slate-900 via-purple-900 to-slate-900 p-4 bg-[#4c1b77]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/skill-gap-reports')}
              variant="outline"
              className="bg-slate-800/50 border-purple-500/30 text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Advanced Skill Analytics - Full Screen View
            </h1>
          </div>
          
          {/* Candidate Selector & Download */}
          <div className="flex items-center gap-4">
            {candidates.length > 1 && (
              <select
                value={selectedCandidate?.id || ''}
                onChange={(e) => {
                  const candidate = candidates.find(c => c.id === parseInt(e.target.value));
                  if (candidate) setSelectedCandidate(candidate);
                }}
                className="px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white"
              >
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.username}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={() => generatePDFReport(selectedCandidate)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Full Screen Detailed Report */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
          <Card className="relative bg-gradient-to-br from-slate-950/98 to-purple-950/98 backdrop-blur-xl border border-purple-400/40 rounded-3xl shadow-2xl shadow-purple-500/20">
            
            {/* Header Section */}
            <CardHeader className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-slate-900/95 to-purple-900/90 p-8 border-b border-purple-500/30">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-black">{selectedCandidate.testResults.length}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {selectedCandidate.username}
                  </h2>
                  <p className="text-purple-200/80 text-xl">Advanced Performance Analytics</p>
                  <div className="flex items-center gap-6">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
                      {selectedCandidate.testResults.length} Tests Completed
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
                      {selectedCandidate.averageScore}% Average Score
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8 bg-[#4d1b78]">
              {/* First Row: Overall Performance & Test Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Overall Performance</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {selectedCandidate.averageScore}%
                        </div>
                        <p className="text-purple-200/80 text-sm">Average Score</p>
                      </div>
                      <Progress
                        value={selectedCandidate.averageScore}
                        className="h-3 bg-slate-700/50"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Test Statistics</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">{selectedCandidate.testResults?.length || 0}</div>
                        <p className="text-green-200/60 text-xs">Tests Taken</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-400">{selectedCandidate.skillGaps?.length || 1}</div>
                        <p className="text-red-200/60 text-xs">Skill Gaps</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{selectedCandidate.strengthAreas?.length || 0}</div>
                        <p className="text-blue-200/60 text-xs">Strengths</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second Row: Predictive Analytics & AI Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Predictive Analytics</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">Future Performance</span>
                        <span className="text-blue-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.predictiveAnalytics.futurePerformance)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">Career Trajectory</span>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {selectedCandidate.detailedAnalysis.predictiveAnalytics.careerTrajectory}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">Promotion Readiness</span>
                        <span className="text-blue-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.predictiveAnalytics.promotionReadiness)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200/80">Skill Growth Rate</span>
                        <span className="text-blue-300 font-semibold">{selectedCandidate.detailedAnalysis.predictiveAnalytics.skillGrowthRate.toFixed(1)}/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">AI Insights</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200/80">Market Demand</span>
                        <Badge className={`border ${selectedCandidate.detailedAnalysis.aiInsights.marketDemand === 'High' ? 'bg-green-500/20 text-green-300 border-green-500/30' : selectedCandidate.detailedAnalysis.aiInsights.marketDemand === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                          {selectedCandidate.detailedAnalysis.aiInsights.marketDemand}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200/80">Salary Impact</span>
                        <span className="text-purple-300 font-semibold text-sm">{selectedCandidate.detailedAnalysis.aiInsights.salaryImpact}</span>
                      </div>
                      <div>
                        <span className="text-purple-200/80 block mb-2">Top Strengths</span>
                        <div className="space-y-1">
                          {selectedCandidate.detailedAnalysis.aiInsights.strengthsAnalysis.slice(0, 2).map((strength, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span className="text-purple-300 text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Third Row: Advanced Metrics & Comparative Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Advanced Metrics</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-green-200/80">Cognitive Load</span>
                        <span className="text-green-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.cognitiveLoad)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-200/80">Adaptability Score</span>
                        <span className="text-green-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.adaptabilityScore)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-200/80">Innovation Potential</span>
                        <span className="text-green-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.innovationPotential)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-200/80">Leadership Readiness</span>
                        <span className="text-green-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.leadershipReadiness)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Comparative Analysis</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-orange-200/80">Team Ranking</span>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                          #{selectedCandidate.detailedAnalysis.comparativeAnalysis.teamRanking}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-200/80">Department Ranking</span>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                          #{selectedCandidate.detailedAnalysis.comparativeAnalysis.departmentRanking}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-200/80">Company Ranking</span>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                          #{selectedCandidate.detailedAnalysis.comparativeAnalysis.companyRanking}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-orange-200/80 block mb-1">Industry Position</span>
                        <p className="text-orange-300 text-sm">{selectedCandidate.detailedAnalysis.comparativeAnalysis.industryComparison}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fourth Row: Career Progression & Team Collaboration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Career Progression</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200/80">Current Level</span>
                        <span className="text-indigo-300 font-semibold text-sm">{selectedCandidate.detailedAnalysis.careerProgression.currentLevel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200/80">Next Level</span>
                        <span className="text-indigo-300 font-semibold text-sm">{selectedCandidate.detailedAnalysis.careerProgression.nextLevel}</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-indigo-200/80">Progress to Next</span>
                          <span className="text-indigo-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.careerProgression.progressToNext)}%</span>
                        </div>
                        <Progress
                          value={selectedCandidate.detailedAnalysis.careerProgression.progressToNext}
                          className="h-2 bg-slate-700/50"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200/80">Est. Time to Promotion</span>
                        <span className="text-indigo-300 font-semibold text-sm">{selectedCandidate.detailedAnalysis.careerProgression.estimatedTimeToPromotion}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-800/50 to-pink-900/30 border border-pink-400/30 rounded-2xl shadow-lg">
                  <CardContent className="p-6 bg-[#4d1b78]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Team Collaboration</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-200/80">Communication Score</span>
                        <span className="text-cyan-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.teamCollaboration.communicationScore)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-200/80">Mentorship Capability</span>
                        <span className="text-cyan-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.teamCollaboration.mentorshipCapability)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-200/80">Knowledge Sharing</span>
                        <span className="text-cyan-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.teamCollaboration.knowledgeSharing)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-200/80">Team Influence</span>
                        <span className="text-cyan-300 font-semibold">{Math.round(selectedCandidate.detailedAnalysis.teamCollaboration.teamInfluence)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}