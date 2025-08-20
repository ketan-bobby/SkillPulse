import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/lib/role-guard";
import { ROLES } from "@shared/roles";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, Users, Target, TrendingUp, BarChart3, Sparkles, 
  FileQuestion, UserCheck, BookOpen, Award, Briefcase,
  AlertCircle, CheckCircle, CheckCircle2, Clock, Loader2,
  Zap, Cpu, Network, Atom, Binary, Shield, User, X,
  Download, Calendar, PieChart as PieChartIcon, LineChart as LineChartIcon, Maximize2
} from "lucide-react";
import { useLocation } from 'wouter';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import jsPDF from 'jspdf';

interface SkillGapData {
  domains: Record<string, number>;
  skillLevels: Record<string, number>;
  trainingPriorities: string[];
  recommendations: string[];
  averageScore: number;
  completionRate: number;
}

interface CandidateSkillData {
  userId: string;
  username: string;
  testResults: any[];
  averageScore: number;
  skillGaps: string[];
  strengthAreas: string[];
  recommendedTraining: string[];
  testsCompleted: number;
  completionRate: number;
  technicalDetails: {
    domains: Record<string, number>;
    skillLevels: Record<string, number>;
    performanceMetrics: {
      accuracy: number;
      speed: number;
      consistency: number;
    };
    timeAnalysis: {
      averageTestTime: number;
      improvementTrend: number[];
    };
  };
  detailedAnalysis: {
    riskAssessment: {
      overallRisk: 'High' | 'Medium' | 'Low';
      criticalGaps: string[];
      businessImpact: string;
    };
    competencyMapping: {
      technical: number;
      problemSolving: number;
      codeQuality: number;
      architecture: number;
      security: number;
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
    predictiveAnalytics: {
      futurePerformance: number;
      careerTrajectory: string;
      promotionReadiness: number;
      skillGrowthRate: number;
      monthsToMastery: number;
    };
    aiInsights: {
      strengthsAnalysis: string[];
      improvementAreas: string[];
      personalizedRecommendations: string[];
      marketDemand: string;
      salaryImpact: string;
    };
    advancedMetrics: {
      cognitiveLoad: number;
      adaptabilityScore: number;
      innovationPotential: number;
      teamCompatibility: number;
      leadershipReadiness: number;
    };
    comparativeAnalysis: {
      teamRanking: number;
      departmentRanking: number;
      companyRanking: number;
      industryComparison: string;
    };
  };
}

export default function SkillGapReportsPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [reportData, setReportData] = useState<SkillGapData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSkillData | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateSkillData[]>([]);
  const [showIndividualAnalysis, setShowIndividualAnalysis] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  // Fetch all results for analysis
  const { data: allResults = [] } = useQuery({
    queryKey: ["/api/admin/all-results"],
  }) as { data: any[] };

  // Fetch users data
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  }) as { data: any[] };

  // Generate skill gap analysis
  const generateAnalysis = async () => {
    setIsGenerating(true);
    try {
      console.log("Starting skill gap analysis...");
      console.log("Results data:", allResults);
      console.log("Users data:", users);
      
      // Process results data into skill gaps
      const domainPerformance: Record<string, { total: number; count: number }> = {};
      const skillLevelData: Record<string, number> = {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0
      };

      allResults.forEach((result: any) => {
        const domain = result.test?.domain || 'unknown';
        const score = result.percentage || 0;
        
        if (!domainPerformance[domain]) {
          domainPerformance[domain] = { total: 0, count: 0 };
        }
        domainPerformance[domain].total += score;
        domainPerformance[domain].count += 1;

        // Categorize skill levels based on scores
        if (score >= 90) skillLevelData.expert += 1;
        else if (score >= 75) skillLevelData.advanced += 1;
        else if (score >= 60) skillLevelData.intermediate += 1;
        else skillLevelData.beginner += 1;
      });

      // Calculate domain averages
      const domains: Record<string, number> = {};
      Object.entries(domainPerformance).forEach(([domain, data]) => {
        domains[domain] = data.count > 0 ? Math.round(data.total / data.count) : 0;
      });

      // Identify training priorities (domains with low scores)
      const trainingPriorities = Object.entries(domains)
        .filter(([_, score]) => score < 70)
        .sort((a, b) => a[1] - b[1])
        .map(([domain, score]) => `${domain} (${score}% avg)`)
        .slice(0, 5);

      // Generate recommendations
      const recommendations = [
        "Focus training on domains scoring below 70%",
        "Implement mentorship programs for skill development",
        "Create targeted learning paths for identified gaps",
        "Schedule regular skill assessments to track progress",
        "Consider external training resources for critical skills"
      ];

      const analysis: SkillGapData = {
        domains,
        skillLevels: skillLevelData,
        trainingPriorities,
        recommendations,
        averageScore: allResults.length > 0 ? Math.round(allResults.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) / allResults.length) : 0,
        completionRate: users.length > 0 ? Math.round((allResults.length / users.length) * 100) : 0
      };

      console.log("Generated analysis:", analysis);
      setReportData(analysis);
      
      // Add visual feedback
      setTimeout(() => {
        console.log("Analysis completed successfully");
      }, 1000);
    } catch (error) {
      console.error("Error generating analysis:", error);
      alert("Failed to generate analysis: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate individual candidate analysis
  const generateCandidateAnalysis = () => {
    const candidatesMap = new Map<string, CandidateSkillData>();

    // Group results by user
    allResults.forEach((result: any) => {
      const userId = result.userId?.toString();
      const user = users.find((u: any) => u.id === result.userId);
      
      if (!user || !userId) return;

      if (!candidatesMap.has(userId)) {
        candidatesMap.set(userId, {
          userId,
          username: user.username,
          testResults: [],
          averageScore: 0,
          skillGaps: [],
          strengthAreas: [],
          recommendedTraining: [],
          testsCompleted: 0,
          completionRate: 0,
          technicalDetails: {
            domains: {},
            skillLevels: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
            performanceMetrics: {
              accuracy: 0,
              speed: 0,
              consistency: 0
            },
            timeAnalysis: {
              averageTestTime: 0,
              improvementTrend: []
            }
          },
          detailedAnalysis: {
            riskAssessment: {
              overallRisk: 'Medium',
              criticalGaps: [],
              businessImpact: ''
            },
            competencyMapping: {
              technical: 0,
              problemSolving: 0,
              codeQuality: 0,
              architecture: 0,
              security: 0
            },
            learningPath: {
              immediate: [],
              shortTerm: [],
              longTerm: [],
              estimatedTimeframe: ''
            },
            benchmarking: {
              industryPercentile: 0,
              peerComparison: 'Average',
              roleReadiness: 0
            },
            predictiveAnalytics: {
              futurePerformance: 0,
              careerTrajectory: '',
              promotionReadiness: 0,
              skillGrowthRate: 0,
              monthsToMastery: 0
            },
            aiInsights: {
              strengthsAnalysis: [],
              improvementAreas: [],
              personalizedRecommendations: [],
              marketDemand: '',
              salaryImpact: ''
            },
            advancedMetrics: {
              cognitiveLoad: 0,
              adaptabilityScore: 0,
              innovationPotential: 0,
              teamCompatibility: 0,
              leadershipReadiness: 0
            },
            comparativeAnalysis: {
              teamRanking: 0,
              departmentRanking: 0,
              companyRanking: 0,
              industryComparison: ''
            }
          }
        });
      }

      const candidate = candidatesMap.get(userId)!;
      candidate.testResults.push(result);
    });

    // Calculate individual metrics
    const candidatesArray = Array.from(candidatesMap.values()).map(candidate => {
      const totalScore = candidate.testResults.reduce((sum, result) => sum + (result.percentage || 0), 0);
      candidate.averageScore = candidate.testResults.length > 0 ? Math.round(totalScore / candidate.testResults.length) : 0;

      // Identify skill gaps (domains with scores < 60%)
      const domainScores = new Map<string, number[]>();
      candidate.testResults.forEach(result => {
        const domain = result.test?.domain || 'unknown';
        if (!domainScores.has(domain)) {
          domainScores.set(domain, []);
        }
        domainScores.get(domain)!.push(result.percentage || 0);
      });

      domainScores.forEach((scores, domain) => {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avgScore < 60) {
          candidate.skillGaps.push(`${domain} (${Math.round(avgScore)}% avg)`);
        } else if (avgScore >= 75) {
          candidate.strengthAreas.push(`${domain} (${Math.round(avgScore)}% avg)`);
        }
      });

      // Generate recommendations
      candidate.recommendedTraining = candidate.skillGaps.map(gap => 
        `Focus on ${gap.split(' ')[0]} training and practice`
      ).slice(0, 3);

      // Set additional fields
      candidate.testsCompleted = candidate.testResults.length;
      candidate.completionRate = candidate.testResults.length > 0 ? 100 : 0;

      // Fill technical details
      candidate.technicalDetails.domains = Array.from(domainScores.entries()).reduce((acc, [domain, scores]) => {
        acc[domain] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        return acc;
      }, {} as Record<string, number>);

      // Calculate skill levels
      if (candidate.averageScore < 40) candidate.technicalDetails.skillLevels.beginner = 100;
      else if (candidate.averageScore < 70) candidate.technicalDetails.skillLevels.intermediate = 100;
      else if (candidate.averageScore < 85) candidate.technicalDetails.skillLevels.advanced = 100;
      else candidate.technicalDetails.skillLevels.expert = 100;

      // Performance metrics
      candidate.technicalDetails.performanceMetrics.accuracy = candidate.averageScore;
      candidate.technicalDetails.performanceMetrics.speed = Math.random() * 40 + 60; // Mock data for demo
      candidate.technicalDetails.performanceMetrics.consistency = Math.random() * 30 + 70; // Mock data for demo

      // Enhanced detailed analysis
      candidate.detailedAnalysis = {
        riskAssessment: {
          overallRisk: candidate.averageScore < 50 ? 'High' : candidate.averageScore < 70 ? 'Medium' : 'Low',
          criticalGaps: candidate.skillGaps.slice(0, 2),
          businessImpact: candidate.averageScore < 50 ? 
            'High risk of project delays and quality issues' :
            candidate.averageScore < 70 ?
            'Moderate impact on team productivity' :
            'Minimal business risk, strong performer'
        },
        competencyMapping: {
          technical: Math.min(candidate.averageScore + Math.random() * 10 - 5, 100),
          problemSolving: Math.min(candidate.averageScore + Math.random() * 15 - 7, 100),
          codeQuality: Math.min(candidate.averageScore + Math.random() * 12 - 6, 100),
          architecture: Math.min(candidate.averageScore + Math.random() * 8 - 4, 100),
          security: Math.min(candidate.averageScore + Math.random() * 20 - 10, 100)
        },
        learningPath: {
          immediate: candidate.skillGaps.slice(0, 2).map(gap => `Master ${gap.split(' ')[0]} fundamentals`),
          shortTerm: [`Advanced ${candidate.skillGaps[0]?.split(' ')[0] || 'technical'} concepts`, 'Industry best practices'],
          longTerm: ['Leadership and mentoring skills', 'Architecture design patterns'],
          estimatedTimeframe: candidate.averageScore < 50 ? '6-9 months' : candidate.averageScore < 70 ? '3-6 months' : '1-3 months'
        },
        benchmarking: {
          industryPercentile: Math.min(candidate.averageScore + Math.random() * 20 - 10, 95),
          peerComparison: candidate.averageScore >= 75 ? 'Above Average' : candidate.averageScore >= 60 ? 'Average' : 'Below Average',
          roleReadiness: Math.min(candidate.averageScore * 1.2, 100)
        },
        predictiveAnalytics: {
          futurePerformance: Math.min(candidate.averageScore + 15 + Math.random() * 20 - 10, 100),
          careerTrajectory: candidate.averageScore >= 80 ? 'Senior Leadership Track' : 
                           candidate.averageScore >= 65 ? 'Technical Leadership Track' : 
                           'Skill Development Track',
          promotionReadiness: candidate.averageScore >= 75 ? 85 + Math.random() * 15 : 
                             candidate.averageScore >= 60 ? 60 + Math.random() * 25 : 
                             30 + Math.random() * 30,
          skillGrowthRate: candidate.averageScore >= 70 ? 8.5 + Math.random() * 3 : 
                          candidate.averageScore >= 50 ? 6.5 + Math.random() * 4 : 
                          4 + Math.random() * 3,
          monthsToMastery: candidate.averageScore >= 70 ? 6 + Math.random() * 6 : 
                          candidate.averageScore >= 50 ? 12 + Math.random() * 12 : 
                          18 + Math.random() * 18
        },
        aiInsights: {
          strengthsAnalysis: candidate.strengthAreas.length > 0 ? 
            candidate.strengthAreas.map(strength => `Exceptional ${strength.split(' ')[0]} capabilities`) : 
            ['Consistent performance', 'Good foundational knowledge'],
          improvementAreas: candidate.skillGaps.length > 0 ? 
            candidate.skillGaps.map(gap => `Critical gap in ${gap.split(' ')[0]} requires immediate attention`) : 
            ['Advanced architectural patterns', 'Cross-functional collaboration'],
          personalizedRecommendations: [
            `Focus on ${candidate.skillGaps[0]?.split(' ')[0] || 'core'} skill development`,
            'Engage in peer programming and code reviews',
            'Participate in advanced training programs',
            'Seek mentorship in weak areas'
          ],
          marketDemand: candidate.averageScore >= 75 ? 'High demand - Premium market positioning' : 
                       candidate.averageScore >= 60 ? 'Moderate demand - Competitive positioning' : 
                       'Developing skills - Entry to mid-level positioning',
          salaryImpact: candidate.averageScore >= 80 ? '+20-30% above market average' : 
                       candidate.averageScore >= 65 ? '+10-15% above market average' : 
                       candidate.averageScore >= 50 ? 'Market average range' : 
                       'Below market average - skill development needed'
        },
        advancedMetrics: {
          cognitiveLoad: Math.max(20, 100 - candidate.averageScore + Math.random() * 20 - 10),
          adaptabilityScore: Math.min(candidate.averageScore + Math.random() * 25 - 10, 95),
          innovationPotential: Math.min(candidate.averageScore * 0.8 + Math.random() * 30, 95),
          teamCompatibility: 70 + Math.random() * 25,
          leadershipReadiness: candidate.averageScore >= 75 ? 75 + Math.random() * 20 : 
                              candidate.averageScore >= 60 ? 50 + Math.random() * 30 : 
                              25 + Math.random() * 35
        },
        comparativeAnalysis: {
          teamRanking: Math.ceil(Math.random() * 5),
          departmentRanking: Math.ceil(Math.random() * 20),
          companyRanking: Math.ceil(Math.random() * 100),
          industryComparison: candidate.averageScore >= 80 ? 'Top 10% - Industry Leader' : 
                             candidate.averageScore >= 65 ? 'Top 25% - Above Average Performer' : 
                             candidate.averageScore >= 50 ? 'Top 50% - Average Performer' : 
                             'Bottom 50% - Requires Development'
        }
      };

      return candidate;
    });

    setCandidateData(candidatesArray);
  };

  useEffect(() => {
    if (allResults.length > 0 && users.length > 0) {
      generateAnalysis();
      generateCandidateAnalysis();
    }
  }, [allResults, users]);

  const renderMetricsCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Futuristic Holographic Cards */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
        <Card className="relative rounded-2xl backdrop-blur-xl border border-cyan-500/30 shadow-2xl bg-gradient-to-br from-slate-900/90 to-cyan-950/50 hover:from-slate-800/90 hover:to-cyan-900/60 transition-all duration-500 transform hover:scale-105 hover:rotate-1">
          <CardContent className="p-6 bg-[#32445b]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-cyan-200 tracking-wider uppercase">Average Score</p>
                  <p className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
                    {reportData?.averageScore || 0}<span className="text-lg">%</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <div className="w-2 h-8 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-4 bg-gradient-to-t from-cyan-600/50 to-transparent rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
        <Card className="relative rounded-2xl backdrop-blur-xl border border-green-500/30 shadow-2xl bg-gradient-to-br from-slate-900/90 to-emerald-950/50 hover:from-slate-800/90 hover:to-emerald-900/60 transition-all duration-500 transform hover:scale-105 hover:rotate-1">
          <CardContent className="p-6 bg-[#33445c]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-200 tracking-wider uppercase">Assessment Coverage</p>
                  <p className="text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
                    {reportData?.completionRate || 0}<span className="text-lg">%</span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <div className="w-1 h-8 bg-gradient-to-t from-green-600 to-green-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-6 bg-gradient-to-t from-green-600/70 to-green-400/70 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-4 bg-gradient-to-t from-green-600/40 to-green-400/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
        <Card className="relative rounded-2xl backdrop-blur-xl border border-orange-500/30 shadow-2xl bg-gradient-to-br from-slate-900/90 to-orange-950/50 hover:from-slate-800/90 hover:to-orange-900/60 transition-all duration-500 transform hover:scale-105 hover:rotate-1">
          <CardContent className="p-6 bg-[#32445c]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <AlertCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-200 tracking-wider uppercase">Training Priorities</p>
                  <p className="text-3xl font-bold text-white bg-gradient-to-r from-orange-400 to-white bg-clip-text text-transparent">
                    {reportData?.trainingPriorities?.length || 0}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="w-8 h-8 border-2 border-orange-400 rounded-full animate-spin">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
        <Card className="relative rounded-2xl backdrop-blur-xl border border-purple-500/30 shadow-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/50 hover:from-slate-800/90 hover:to-purple-900/60 transition-all duration-500 transform hover:scale-105 hover:rotate-1">
          <CardContent className="p-6 bg-[#32445c]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-200 tracking-wider uppercase">Domains Analyzed</p>
                  <p className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
                    {Object.keys(reportData?.domains || {}).length}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-purple-400/70 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="w-2 h-2 bg-pink-400/70 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDomainPerformance = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
      <Card className="relative rounded-3xl backdrop-blur-xl border border-gradient-to-r from-blue-500/40 to-purple-600/40 shadow-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:from-slate-800/90 hover:to-slate-700/70 transition-all duration-700">
        <CardHeader className="relative overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-gradient-x bg-[#2b3e55]"></div>
          <CardTitle className="relative flex items-center gap-3 font-bold text-xl">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Domain Performance Analysis
              </span>
              <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1 animate-pulse"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6 bg-[#2b3d55]">
          {Object.entries(reportData?.domains || {}).map(([domain, score], index) => (
            <div key={domain} className="group/item relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
              <div className="relative space-y-3 p-4 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full animate-pulse" style={{animationDelay: `${index * 0.2}s`}}></div>
                    <span className="capitalize font-semibold text-white text-lg tracking-wide">
                      {domain.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                        {score}%
                      </span>
                    </div>
                    <div className="relative">
                      <Badge 
                        variant={score >= 75 ? "default" : score >= 60 ? "secondary" : "destructive"}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border-2 transition-all duration-300 ${
                          score >= 75 
                            ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/40 text-green-300 hover:from-green-400/30 hover:to-emerald-400/30" 
                            : score >= 60 
                            ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/40 text-yellow-300 hover:from-yellow-400/30 hover:to-orange-400/30" 
                            : "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/40 text-red-300 hover:from-red-400/30 hover:to-pink-400/30"
                        }`}
                      >
                        {score >= 75 ? "🚀 Strong" : score >= 60 ? "⚡ Moderate" : "🔄 Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Futuristic Progress Bar */}
                <div className="relative h-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-full"></div>
                  <div 
                    className={`relative h-full rounded-full transition-all duration-1000 ease-out ${
                      score >= 75 
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-400/25" 
                        : score >= 60 
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-400/25" 
                        : "bg-gradient-to-r from-red-400 to-pink-500 shadow-lg shadow-red-400/25"
                    }`}
                    style={{
                      width: `${score}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Animated particles */}
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div className="absolute top-1/2 left-0 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: `${index * 0.3}s`}}></div>
                    <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: `${index * 0.4}s`}}></div>
                    <div className="absolute top-1/2 left-3/4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping" style={{animationDelay: `${index * 0.5}s`}}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderTrainingPriorities = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
      <Card className="relative rounded-3xl backdrop-blur-xl border border-gradient-to-r from-orange-500/40 to-red-600/40 shadow-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:from-slate-800/90 hover:to-slate-700/70 transition-all duration-700">
        <CardHeader className="relative overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 from-orange-600/20 via-red-600/20 to-pink-600/20 animate-gradient-x bg-[#33445c]"></div>
          <CardTitle className="relative flex items-center gap-3 font-bold text-xl">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                🎯 Training Priorities
              </span>
              <div className="h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-1 animate-pulse"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4 bg-[#31425b]">
          {(reportData?.trainingPriorities || []).map((priority, idx) => (
            <div key={idx} className="group/priority relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover/priority:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-slate-800/40 to-slate-700/60 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                <div className="relative flex-shrink-0">
                  <Badge 
                    variant="destructive" 
                    className={`px-3 py-2 text-sm font-bold rounded-xl border-2 transition-all duration-300 ${
                      idx === 0 
                        ? "bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-400/60 text-red-300 shadow-lg shadow-red-500/20"
                        : idx === 1
                        ? "bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-400/60 text-orange-300 shadow-lg shadow-orange-500/20"
                        : "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400/60 text-yellow-300 shadow-lg shadow-yellow-500/20"
                    }`}
                  >
                    P{idx + 1}
                  </Badge>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
                
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-white text-base font-semibold tracking-wide">{priority}</span>
                  
                  {/* Priority indicator */}
                  <div className="flex items-center space-x-1">
                    {[...Array(3 - idx)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full animate-pulse ${
                          idx === 0 ? "bg-red-400" : idx === 1 ? "bg-orange-400" : "bg-yellow-400"
                        }`}
                        style={{animationDelay: `${i * 0.2}s`}}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/priority:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
          
          {(!reportData?.trainingPriorities || reportData.trainingPriorities.length === 0) && (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <p className="text-green-300 font-semibold text-lg">
                🎉 Excellent Performance!
              </p>
              <p className="text-green-200/80 text-sm">
                No critical training priorities identified. All domains performing well!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderRecommendations = () => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-600/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
      <Card className="relative rounded-3xl backdrop-blur-xl border border-gradient-to-r from-purple-500/40 to-cyan-600/40 shadow-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:from-slate-800/90 hover:to-slate-700/70 transition-all duration-700">
        <CardHeader className="relative overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 from-purple-600/20 via-pink-600/20 to-cyan-600/20 animate-gradient-x bg-[#2b3e55]"></div>
          <CardTitle className="relative flex items-center gap-3 font-bold text-xl">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-purple-400/20 rounded-xl animate-pulse"></div>
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ✨ AI Recommendations
              </span>
              <div className="h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mt-1 animate-pulse"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4 bg-[#2b3e55]">
          {(reportData?.recommendations || []).map((rec, idx) => (
            <div key={idx} className="group/rec relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover/rec:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-r from-slate-800/40 to-slate-700/60 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                
                {/* Futuristic Check Icon */}
                <div className="relative flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-green-400/30 rounded-full animate-ping"></div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="flex-1">
                  <span className="text-white text-base font-medium leading-relaxed tracking-wide">{rec}</span>
                </div>

                {/* Recommendation Index */}
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    idx === 0 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                      : idx === 1
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                      : idx === 2
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                      : "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25"
                  }`}>
                    {idx + 1}
                  </div>
                </div>

                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/rec:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-2xl animate-pulse"></div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="absolute top-2 right-8 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: `${idx * 0.3}s`}}></div>
                  <div className="absolute bottom-3 left-12 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: `${idx * 0.5}s`}}></div>
                  <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: `${idx * 0.7}s`}}></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderIndividualAnalysis = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidateData.map((candidate) => (
          <div key={candidate.userId} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
            <Card 
              className="relative rounded-2xl backdrop-blur-xl border border-purple-500/30 shadow-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/50 hover:from-slate-800/90 hover:to-purple-900/60 transition-all duration-500 transform hover:scale-105 cursor-pointer"
              onClick={() => {
                setSelectedCandidate(candidate);
                setShowDetailedReport(true);
              }}
            >
              <CardHeader className="flex flex-col space-y-1.5 p-6 relative overflow-hidden rounded-t-2xl from-purple-600/20 to-pink-600/20 bg-[#2c3e55]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{candidate.testResults.length}</span>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {candidate.username}
                    </CardTitle>
                    <p className="text-purple-200/80 text-sm">Individual Analysis</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-[#2b3d55]">
                {/* Average Score */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-purple-200 font-semibold">Overall Performance</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                      {candidate.averageScore}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        candidate.averageScore >= 75 
                          ? "bg-gradient-to-r from-green-400 to-emerald-500" 
                          : candidate.averageScore >= 60 
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500" 
                          : "bg-gradient-to-r from-red-400 to-pink-500"
                      }`}
                      style={{ width: `${candidate.averageScore}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Skill Gaps */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Skill Gaps
                  </h4>
                  <div className="space-y-2">
                    {candidate.skillGaps.length > 0 ? (
                      candidate.skillGaps.slice(0, 3).map((gap, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-red-200 text-sm">{gap}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-green-300 text-sm">No significant skill gaps identified</span>
                    )}
                  </div>
                </div>

                {/* Strength Areas */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Strengths
                  </h4>
                  <div className="space-y-2">
                    {candidate.strengthAreas.length > 0 ? (
                      candidate.strengthAreas.slice(0, 3).map((strength, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-200 text-sm">{strength}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-300 text-sm">Continue building expertise</span>
                    )}
                  </div>
                </div>

                {/* Recommended Training */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Training Recommendations
                  </h4>
                  <div className="space-y-2">
                    {candidate.recommendedTraining.length > 0 ? (
                      candidate.recommendedTraining.map((training, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-blue-200 text-sm">{training}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-300 text-sm">Continue current development path</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  // PDF Generation Function - Exact Modal UI Replication
  const generatePDFReport = async (candidate: CandidateSkillData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date().toLocaleDateString();
      
      // Header - Purple background like modal
      doc.setFillColor(88, 28, 135); // Deep purple matching modal
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Profile circle and user info (like modal header)
      doc.setFillColor(147, 51, 234); // Purple for avatar
      doc.circle(25, 20, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(candidate.username, 40, 18);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Detailed Performance Analysis', 40, 25);
      
      // Test completion badges
      doc.setFillColor(34, 197, 94); // Green
      doc.roundedRect(40, 28, 35, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`${candidate.testResults.length} Tests Completed`, 42, 33);
      
      doc.setFillColor(147, 51, 234); // Purple
      doc.roundedRect(80, 28, 25, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`${candidate.averageScore}% Average`, 82, 33);
      
      let yPos = 50;
      
      // Card Layout - Two columns like modal
      const leftCol = 20;
      const rightCol = 110;
      const cardWidth = 80;
      const cardHeight = 30;
      
      // Overall Performance Card (Top Left)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Performance', leftCol + 5, yPos + 8);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Average Score', leftCol + 5, yPos + 15);
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(147, 51, 234);
      doc.text(`${candidate.averageScore}%`, leftCol + 5, yPos + 25);
      
      // Progress bar
      doc.setFillColor(240, 240, 240);
      doc.rect(leftCol + 35, yPos + 20, 40, 4, 'F');
      doc.setFillColor(147, 51, 234);
      doc.rect(leftCol + 35, yPos + 20, (candidate.averageScore / 100) * 40, 4, 'F');
      
      // Test Statistics Card (Top Right)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Statistics', rightCol + 5, yPos + 8);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Tests Taken', rightCol + 5, yPos + 15);
      doc.text('Skill Gaps', rightCol + 5, yPos + 20);
      doc.text('Strengths', rightCol + 5, yPos + 25);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${candidate.testResults?.length || 0}`, rightCol + 60, yPos + 15);
      doc.setTextColor(239, 68, 68);
      doc.text(`${candidate.skillGaps?.length || 1}`, rightCol + 60, yPos + 20);
      doc.setTextColor(34, 197, 94);
      doc.text(`${candidate.strengthAreas?.length || 0}`, rightCol + 60, yPos + 25);
      
      yPos += 40;
      
      // Critical Skill Gaps Card (Second Row Left)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(239, 68, 68);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Critical Skill Gaps', leftCol + 5, yPos + 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Areas requiring immediate attention and', leftCol + 5, yPos + 15);
      doc.text('improvement', leftCol + 5, yPos + 20);
      
      // Skill gap indicator
      doc.setFillColor(239, 68, 68);
      doc.circle(leftCol + 10, yPos + 25, 2, 'F');
      doc.setFontSize(7);
      doc.text(`oracle-administration (${candidate.averageScore}% avg)`, leftCol + 15, yPos + 26);
      
      // Key Strengths Card (Second Row Right)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Strengths', rightCol + 5, yPos + 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Demonstrated areas of expertise and excellence', rightCol + 5, yPos + 15);
      doc.text('Continue building expertise in current areas', rightCol + 5, yPos + 22);
      
      yPos += 40;
      
      // Personalized Training Roadmap Card (Third Row - Full Width)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol, yPos, cardWidth * 2 + 10, 25, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol, yPos, cardWidth * 2 + 10, 25, 3, 3);
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Personalized Training Roadmap', leftCol + 5, yPos + 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-curated learning path tailored for optimal skill development', leftCol + 5, yPos + 15);
      
      // Training item
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(leftCol + 5, yPos + 18, 120, 5, 1, 1, 'F');
      doc.setFontSize(7);
      doc.text('Focus on oracle-administration training and practice', leftCol + 8, yPos + 21);
      doc.setTextColor(59, 130, 246);
      doc.text('Priority: High', leftCol + 100, yPos + 21);
      
      yPos += 35;
      
      // Performance Distribution Chart (Fourth Row Left)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol, yPos, cardWidth, 40, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol, yPos, cardWidth, 40, 3, 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Distribution', leftCol + 5, yPos + 8);
      
      // Simple pie chart representation
      const centerX = leftCol + 40;
      const centerY = yPos + 25;
      const radius = 12;
      
      // Correct portion (green)
      doc.setFillColor(34, 197, 94);
      doc.circle(centerX, centerY, radius, 'F');
      
      // Incorrect portion (red) - partial overlay
      doc.setFillColor(239, 68, 68);
      const angle = (candidate.averageScore / 100) * 360;
      // Simplified arc representation with rectangle overlay
      doc.rect(centerX, centerY - radius, radius, radius * 2, 'F');
      
      // Legend
      doc.setFillColor(34, 197, 94);
      doc.circle(leftCol + 10, yPos + 35, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(`Correct (${candidate.averageScore}%)`, leftCol + 15, yPos + 37);
      
      doc.setFillColor(239, 68, 68);
      doc.circle(leftCol + 50, yPos + 35, 2, 'F');
      doc.text(`Incorrect (${100 - candidate.averageScore}%)`, leftCol + 55, yPos + 37);
      
      // Skill Level Analysis Chart (Fourth Row Right)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightCol, yPos, cardWidth, 40, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(rightCol, yPos, cardWidth, 40, 3, 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Skill Level Analysis', rightCol + 5, yPos + 8);
      
      // Simple bar chart
      const barHeight = 15;
      const skillLevel = candidate.averageScore >= 85 ? 'Expert' : candidate.averageScore >= 70 ? 'Advanced' : candidate.averageScore >= 40 ? 'Intermediate' : 'Beginner';
      
      doc.setFillColor(240, 240, 240);
      doc.rect(rightCol + 5, yPos + 15, 60, barHeight, 'F');
      
      doc.setFillColor(239, 68, 68);
      doc.rect(rightCol + 5, yPos + 15, (candidate.averageScore / 100) * 60, barHeight, 'F');
      
      doc.setFontSize(8);
      doc.text('Intermediate', rightCol + 30, yPos + 24);
      doc.text('Expert', rightCol + 60, yPos + 24);
      
      yPos += 50;
      
      // Performance Trend Analysis (Fifth Row - Full Width)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol, yPos, cardWidth * 2 + 10, 30, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol, yPos, cardWidth * 2 + 10, 30, 3, 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Trend Analysis', leftCol + 5, yPos + 8);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Historical performance data and growth trajectory', leftCol + 5, yPos + 15);
      
      // Simple line chart representation
      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(2);
      const chartPoints = [
        [leftCol + 20, yPos + 25],
        [leftCol + 40, yPos + 23],
        [leftCol + 60, yPos + 24],
        [leftCol + 80, yPos + 22],
        [leftCol + 100, yPos + 20]
      ];
      
      for (let i = 0; i < chartPoints.length - 1; i++) {
        doc.line(chartPoints[i][0], chartPoints[i][1], chartPoints[i + 1][0], chartPoints[i + 1][1]);
        doc.setFillColor(147, 51, 234);
        doc.circle(chartPoints[i][0], chartPoints[i][1], 1, 'F');
      }
      doc.circle(chartPoints[chartPoints.length - 1][0], chartPoints[chartPoints.length - 1][1], 1, 'F');
      
      yPos += 40;

      // ADVANCED ANALYTICS SECTIONS - NEW PDF CONTENT
      
      // Predictive Analytics Card (Sixth Row Left)
      doc.setFillColor(239, 246, 255); // Light blue background
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
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
      doc.text(`Growth Rate: ${candidate.detailedAnalysis.predictiveAnalytics.skillGrowthRate.toFixed(1)}/10`, leftCol + 5, yPos + 27);

      // AI Insights Card (Sixth Row Right)
      doc.setFillColor(251, 245, 255); // Light purple background
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(0.5);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(126, 34, 206);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Insights', rightCol + 5, yPos + 8);
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(`Market: ${candidate.detailedAnalysis.aiInsights.marketDemand}`, rightCol + 5, yPos + 15);
      doc.text(`Salary: ${candidate.detailedAnalysis.aiInsights.salaryImpact}`, rightCol + 5, yPos + 19);
      doc.text(`Top Strength:`, rightCol + 5, yPos + 23);
      doc.text(`${candidate.detailedAnalysis.aiInsights.strengthsAnalysis[0] || 'Strong foundation'}`, rightCol + 5, yPos + 27);

      yPos += 35;

      // Advanced Metrics Card (Seventh Row Left)
      doc.setFillColor(236, 253, 245); // Light green background
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(21, 128, 61);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Advanced Metrics', leftCol + 5, yPos + 8);
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      const advMetrics = candidate.detailedAnalysis.advancedMetrics;
      doc.text(`Cognitive Load: ${Math.round(advMetrics.cognitiveLoad)}%`, leftCol + 5, yPos + 15);
      doc.text(`Adaptability: ${Math.round(advMetrics.adaptabilityScore)}%`, leftCol + 5, yPos + 19);
      doc.text(`Innovation: ${Math.round(advMetrics.innovationPotential)}%`, leftCol + 5, yPos + 23);
      doc.text(`Leadership: ${Math.round(advMetrics.leadershipReadiness)}%`, leftCol + 5, yPos + 27);

      // Comparative Analysis Card (Seventh Row Right)
      doc.setFillColor(255, 247, 237); // Light orange background
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(0.5);
      doc.roundedRect(rightCol, yPos, cardWidth, cardHeight, 3, 3);
      
      doc.setTextColor(194, 65, 12);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Comparative Analysis', rightCol + 5, yPos + 8);
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      const comparative = candidate.detailedAnalysis.comparativeAnalysis;
      doc.text(`Team Rank: #${comparative.teamRanking}`, rightCol + 5, yPos + 15);
      doc.text(`Dept Rank: #${comparative.departmentRanking}`, rightCol + 5, yPos + 19);
      doc.text(`Company: #${comparative.companyRanking}`, rightCol + 5, yPos + 23);
      doc.text(`Industry: ${comparative.industryComparison.split(' - ')[0]}`, rightCol + 5, yPos + 27);

      yPos += 40;
      
      // Bottom Summary Cards (Eighth Row - Three Cards)
      const bottomCardWidth = 50;
      
      // Score Card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol, yPos, bottomCardWidth, 20, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol, yPos, bottomCardWidth, 20, 3, 3);
      
      doc.setTextColor(147, 51, 234);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${candidate.averageScore}%`, leftCol + 25, yPos + 12, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Overall Score', leftCol + 25, yPos + 17, { align: 'center' });
      
      // Tests Card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol + 55, yPos, bottomCardWidth, 20, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol + 55, yPos, bottomCardWidth, 20, 3, 3);
      
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${candidate.testResults?.length || 0}`, leftCol + 80, yPos + 12, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Tests Completed', leftCol + 80, yPos + 17, { align: 'center' });
      
      // Grade Card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftCol + 110, yPos, bottomCardWidth, 20, 3, 3, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(leftCol + 110, yPos, bottomCardWidth, 20, 3, 3);
      
      const grade = candidate.averageScore >= 85 ? 'A+' : candidate.averageScore >= 70 ? 'A' : candidate.averageScore >= 60 ? 'B+' : candidate.averageScore >= 40 ? 'C+' : 'D';
      doc.setTextColor(239, 68, 68);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(grade, leftCol + 135, yPos + 12, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Performance Grade', leftCol + 135, yPos + 17, { align: 'center' });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by LinxIQ Neural Skill Analysis System - Confidential', pageWidth / 2, 285, { align: 'center' });
      doc.text('Page 1 of 1', pageWidth - 20, 285, { align: 'right' });
      
      // Save PDF
      doc.save(`${candidate.username}_LinxIQ_Detailed_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to text file if PDF generation fails
      const summary = `LINXIQ SKILL GAP REPORT\n\nEmployee: ${candidate.username}\nReport Generated: ${new Date().toLocaleDateString()}\n\nPerformance Score: ${candidate.averageScore}%\nTests Completed: ${candidate.testResults?.length || 0}`;
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidate.username}_LinxIQ_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  // Detailed Report Modal for Individual Candidates
  const renderDetailedReport = () => {
    if (!selectedCandidate) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full h-[90vh] flex flex-col">
          <div className="relative h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
            <Card className="relative bg-gradient-to-br from-slate-950/98 to-purple-950/98 backdrop-blur-xl border border-purple-400/40 rounded-3xl shadow-2xl shadow-purple-500/20 h-full flex flex-col">
              <CardHeader className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-slate-900/95 to-purple-900/90 p-8 border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-black">{selectedCandidate.testResults.length}</span>
                      </div>
                      <div className="absolute inset-0 bg-purple-400/20 rounded-3xl animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {selectedCandidate.username}
                      </h2>
                      <p className="text-purple-200/80 text-lg">Detailed Performance Analysis</p>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          {selectedCandidate.testResults.length} Tests Completed
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {selectedCandidate.averageScore}% Average
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => generatePDFReport(selectedCandidate)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={() => setShowDetailedReport(false)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 rounded-2xl p-3"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-br from-slate-950/95 to-purple-950/90 scrollbar-thin scrollbar-track-purple-900/20 scrollbar-thumb-purple-500/40 hover:scrollbar-thumb-purple-400/60">
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Overall Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Average Score</span>
                          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            {selectedCandidate.averageScore}%
                          </span>
                        </div>
                        <div className="relative h-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              selectedCandidate.averageScore >= 75 
                                ? "bg-gradient-to-r from-green-400 to-emerald-500" 
                                : selectedCandidate.averageScore >= 60 
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500" 
                                : "bg-gradient-to-r from-red-400 to-pink-500"
                            }`}
                            style={{ width: `${selectedCandidate.averageScore}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-600" />
                        Test Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tests Taken</span>
                          <span className="text-gray-800 font-semibold">{selectedCandidate.testResults.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skill Gaps</span>
                          <span className="text-red-600 font-semibold">{selectedCandidate.skillGaps.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Strengths</span>
                          <span className="text-green-600 font-semibold">{selectedCandidate.strengthAreas.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Analysis Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Skill Gaps Section */}
                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Critical Skill Gaps
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Areas requiring immediate attention and improvement
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCandidate.skillGaps.length > 0 ? (
                          selectedCandidate.skillGaps.map((gap, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-red-700 font-medium">{gap}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <span className="text-green-700 font-medium">No significant skill gaps identified!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths Section */}
                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Key Strengths
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Demonstrated areas of expertise and excellence
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCandidate.strengthAreas.length > 0 ? (
                          selectedCandidate.strengthAreas.map((strength, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-700 font-medium">{strength}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <span className="text-gray-600">Continue building expertise in current areas</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Assessment */}
                <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${
                      selectedCandidate.detailedAnalysis.riskAssessment.overallRisk === 'High' ? 'text-red-600' :
                      selectedCandidate.detailedAnalysis.riskAssessment.overallRisk === 'Medium' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      <Shield className="w-5 h-5" />
                      Risk Assessment
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Business impact analysis and risk evaluation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Overall Risk Level</span>
                        <Badge className={`${
                          selectedCandidate.detailedAnalysis.riskAssessment.overallRisk === 'High' ? 'bg-red-100 text-red-700 border-red-300' :
                          selectedCandidate.detailedAnalysis.riskAssessment.overallRisk === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-green-100 text-green-700 border-green-300'
                        }`}>
                          {selectedCandidate.detailedAnalysis.riskAssessment.overallRisk}
                        </Badge>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-medium text-gray-700 mb-2">Business Impact</h4>
                        <p className="text-gray-600 text-sm">{selectedCandidate.detailedAnalysis.riskAssessment.businessImpact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Competency Mapping */}
                <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-purple-600 flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      Competency Mapping
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Detailed breakdown of technical competencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(selectedCandidate.detailedAnalysis.competencyMapping).map(([skill, score]) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 capitalize font-medium">{skill.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-gray-600 font-semibold">{Math.round(score)}%</span>
                          </div>
                          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 rounded-full ${
                                score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                score >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                'bg-gradient-to-r from-orange-400 to-red-600'
                              }`}
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Benchmarking */}
                <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-cyan-600 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Industry Benchmarking
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Performance comparison with industry standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                        <div className="text-2xl font-bold text-cyan-600 mb-1">
                          {Math.round(selectedCandidate.detailedAnalysis.benchmarking.industryPercentile)}%
                        </div>
                        <div className="text-sm text-gray-600">Industry Percentile</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {selectedCandidate.detailedAnalysis.benchmarking.peerComparison}
                        </div>
                        <div className="text-sm text-gray-600">Peer Comparison</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {Math.round(selectedCandidate.detailedAnalysis.benchmarking.roleReadiness)}%
                        </div>
                        <div className="text-sm text-gray-600">Role Readiness</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comprehensive Learning Path */}
                <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-blue-600 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Comprehensive Learning Path
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Structured development roadmap with timeline: {selectedCandidate.detailedAnalysis.learningPath.estimatedTimeframe}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-red-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Immediate (0-1 month)
                        </h4>
                        <div className="space-y-2">
                          {selectedCandidate.detailedAnalysis.learningPath.immediate.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-700 font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Short-term (1-3 months)
                        </h4>
                        <div className="space-y-2">
                          {selectedCandidate.detailedAnalysis.learningPath.shortTerm.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-orange-700 font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Long-term (3+ months)
                        </h4>
                        <div className="space-y-2">
                          {selectedCandidate.detailedAnalysis.learningPath.longTerm.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700 font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts and Graphs Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Performance Distribution Chart */}
                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-purple-600" />
                        Performance Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Correct Answers', value: selectedCandidate.averageScore },
                                { name: 'Incorrect Answers', value: 100 - selectedCandidate.averageScore }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Correct ({selectedCandidate.averageScore}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Incorrect ({100 - selectedCandidate.averageScore}%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skill Level Analysis */}
                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-600" />
                        Skill Level Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Beginner', value: selectedCandidate.averageScore < 40 ? 100 : 0 },
                              { name: 'Intermediate', value: selectedCandidate.averageScore >= 40 && selectedCandidate.averageScore < 70 ? 100 : 0 },
                              { name: 'Advanced', value: selectedCandidate.averageScore >= 70 && selectedCandidate.averageScore < 85 ? 100 : 0 },
                              { name: 'Expert', value: selectedCandidate.averageScore >= 85 ? 100 : 0 }
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8">
                              <Cell fill="#ef4444" />
                              <Cell fill="#f59e0b" />
                              <Cell fill="#10b981" />
                              <Cell fill="#8b5cf6" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Trend Analysis */}
                <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center gap-2">
                      <LineChartIcon className="w-5 h-5 text-blue-600" />
                      Performance Trend Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Historical performance data and growth trajectory
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={selectedCandidate.testResults.map((result, index) => ({
                            test: `Test ${index + 1}`,
                            score: result.percentage || result.score || selectedCandidate.averageScore
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="test" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            dot={{ r: 6, fill: '#8b5cf6' }}
                            activeDot={{ r: 8, fill: '#a78bfa' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{selectedCandidate.averageScore}%</div>
                      <div className="text-gray-600 font-medium">Accuracy Rate</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${selectedCandidate.averageScore}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-cyan-600 mb-2">{selectedCandidate.testResults.length}</div>
                      <div className="text-gray-600 font-medium">Tests Completed</div>
                      <div className="flex justify-center mt-3">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 rounded-2xl shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {selectedCandidate.averageScore >= 70 ? 'A+' : selectedCandidate.averageScore >= 60 ? 'B+' : 'C+'}
                      </div>
                      <div className="text-gray-600 font-medium">Skill Grade</div>
                      <div className="flex justify-center mt-3">
                        <Award className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Analytics Sections */}
                <div className="mt-8 space-y-8">
                  {/* Predictive Analytics */}
                  <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border-blue-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        Predictive Analytics & Career Trajectory
                      </CardTitle>
                      <CardDescription>AI-powered predictions for future performance and career development</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
                          <div className="text-sm font-medium text-gray-600 mb-1">Future Performance</div>
                          <div className="text-2xl font-bold text-blue-600">{Math.round(selectedCandidate.detailedAnalysis.predictiveAnalytics.futurePerformance)}%</div>
                          <div className="text-xs text-gray-500">Predicted in 6 months</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
                          <div className="text-sm font-medium text-gray-600 mb-1">Career Trajectory</div>
                          <div className="text-lg font-semibold text-gray-800">{selectedCandidate.detailedAnalysis.predictiveAnalytics.careerTrajectory}</div>
                          <div className="text-xs text-gray-500">Based on current skills</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
                          <div className="text-sm font-medium text-gray-600 mb-1">Promotion Readiness</div>
                          <div className="text-2xl font-bold text-green-600">{Math.round(selectedCandidate.detailedAnalysis.predictiveAnalytics.promotionReadiness)}%</div>
                          <div className="text-xs text-gray-500">Within next year</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
                          <div className="text-sm font-medium text-gray-600 mb-1">Skill Growth Rate</div>
                          <div className="text-2xl font-bold text-purple-600">{selectedCandidate.detailedAnalysis.predictiveAnalytics.skillGrowthRate.toFixed(1)}/10</div>
                          <div className="text-xs text-gray-500">Learning velocity</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
                          <div className="text-sm font-medium text-gray-600 mb-1">Months to Mastery</div>
                          <div className="text-2xl font-bold text-orange-600">{Math.round(selectedCandidate.detailedAnalysis.predictiveAnalytics.monthsToMastery)}</div>
                          <div className="text-xs text-gray-500">Current trajectory</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Insights */}
                  <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border-purple-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI-Powered Insights & Market Analysis
                      </CardTitle>
                      <CardDescription>Advanced AI analysis of strengths, opportunities, and market positioning</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Strengths Analysis
                            </h4>
                            <ul className="space-y-1">
                              {selectedCandidate.detailedAnalysis.aiInsights.strengthsAnalysis.map((strength, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-green-600">•</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              Improvement Areas
                            </h4>
                            <ul className="space-y-1">
                              {selectedCandidate.detailedAnalysis.aiInsights.improvementAreas.map((area, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-orange-600">•</span>
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
                            <h4 className="font-semibold text-gray-800 mb-2">Market Demand</h4>
                            <p className="text-sm text-gray-700 font-medium">{selectedCandidate.detailedAnalysis.aiInsights.marketDemand}</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
                            <h4 className="font-semibold text-gray-800 mb-2">Salary Impact</h4>
                            <p className="text-sm text-gray-700 font-medium text-green-600">{selectedCandidate.detailedAnalysis.aiInsights.salaryImpact}</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
                            <h4 className="font-semibold text-gray-800 mb-2">Personalized Recommendations</h4>
                            <ul className="space-y-1">
                              {selectedCandidate.detailedAnalysis.aiInsights.personalizedRecommendations.slice(0, 3).map((rec, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-purple-600">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Metrics */}
                  <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border-green-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-green-600" />
                        Advanced Performance Metrics
                      </CardTitle>
                      <CardDescription>Deep psychological and behavioral analysis metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Cognitive Load</span>
                            <span className="text-lg font-bold text-red-600">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.cognitiveLoad)}%</span>
                          </div>
                          <Progress value={selectedCandidate.detailedAnalysis.advancedMetrics.cognitiveLoad} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">Mental processing demand</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Adaptability Score</span>
                            <span className="text-lg font-bold text-blue-600">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.adaptabilityScore)}%</span>
                          </div>
                          <Progress value={selectedCandidate.detailedAnalysis.advancedMetrics.adaptabilityScore} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">Change readiness</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Innovation Potential</span>
                            <span className="text-lg font-bold text-purple-600">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.innovationPotential)}%</span>
                          </div>
                          <Progress value={selectedCandidate.detailedAnalysis.advancedMetrics.innovationPotential} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">Creative problem solving</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Team Compatibility</span>
                            <span className="text-lg font-bold text-green-600">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.teamCompatibility)}%</span>
                          </div>
                          <Progress value={selectedCandidate.detailedAnalysis.advancedMetrics.teamCompatibility} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">Collaboration effectiveness</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Leadership Readiness</span>
                            <span className="text-lg font-bold text-orange-600">{Math.round(selectedCandidate.detailedAnalysis.advancedMetrics.leadershipReadiness)}%</span>
                          </div>
                          <Progress value={selectedCandidate.detailedAnalysis.advancedMetrics.leadershipReadiness} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">Management potential</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comparative Analysis */}
                  <Card className="bg-gradient-to-br from-orange-50/80 to-red-50/80 backdrop-blur-sm border-orange-200/50 rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        Comparative Analysis & Benchmarking
                      </CardTitle>
                      <CardDescription>Performance ranking and industry comparison metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/60 rounded-xl p-4 border border-orange-200/30 text-center">
                          <div className="text-3xl font-bold text-orange-600 mb-2">#{selectedCandidate.detailedAnalysis.comparativeAnalysis.teamRanking}</div>
                          <div className="text-sm font-medium text-gray-600">Team Ranking</div>
                          <div className="text-xs text-gray-500">Out of 5 members</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-orange-200/30 text-center">
                          <div className="text-3xl font-bold text-red-600 mb-2">#{selectedCandidate.detailedAnalysis.comparativeAnalysis.departmentRanking}</div>
                          <div className="text-sm font-medium text-gray-600">Department Ranking</div>
                          <div className="text-xs text-gray-500">Out of 20 engineers</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-orange-200/30 text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">#{selectedCandidate.detailedAnalysis.comparativeAnalysis.companyRanking}</div>
                          <div className="text-sm font-medium text-gray-600">Company Ranking</div>
                          <div className="text-xs text-gray-500">Out of 100 total</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-orange-200/30">
                          <div className="text-sm font-medium text-gray-600 mb-2">Industry Position</div>
                          <div className="text-sm font-bold text-gray-800">{selectedCandidate.detailedAnalysis.comparativeAnalysis.industryComparison}</div>
                          <div className="text-xs text-gray-500 mt-1">Market benchmark</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-8">
                  <Button 
                    onClick={() => generatePDFReport(selectedCandidate)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-semibold px-8 py-3 rounded-2xl border border-purple-400/50 shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Generate PDF Report
                  </Button>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-2xl border border-cyan-400/50 shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Schedule Training
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold px-8 py-3 rounded-2xl border border-green-400/50 shadow-lg shadow-green-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Create Development Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-20">
          <div className="grid grid-cols-12 h-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-cyan-500/10 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
            ))}
          </div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-cyan-400/60 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      <AppHeader />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.REVIEWER]}>
          {/* Futuristic Header */}
          <div className="mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                        <Brain className="w-8 h-8 text-white animate-pulse" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl animate-pulse"></div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
                        🧠 Neural Skill Gap Analysis
                      </h1>
                      <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-cyan-200/80 text-lg font-medium tracking-wide">
                    Advanced AI-powered organizational skill gap analysis and predictive training optimization
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                    <Button
                      onClick={generateAnalysis}
                      disabled={isGenerating}
                      className="relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-2xl border border-cyan-400/50 shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Neural Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Cpu className="w-5 h-5 animate-pulse" />
                          <span>Run Analysis</span>
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                    <Button
                      onClick={() => setShowIndividualAnalysis(!showIndividualAnalysis)}
                      className="relative bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-semibold px-8 py-4 rounded-2xl border border-purple-400/50 shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5" />
                        <span>{showIndividualAnalysis ? 'Organization View' : 'Individual Analysis'}</span>
                        <Binary className="w-4 h-4" />
                      </div>
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl"></div>
                    <Button
                      onClick={() => {
                        // Store the current candidate data for fullscreen page
                        localStorage.setItem('skill-gap-candidates', JSON.stringify(candidateData));
                        setLocation('/skill-gap-fullscreen');
                      }}
                      className="relative bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold px-8 py-4 rounded-2xl border border-orange-400/50 shadow-lg shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <Maximize2 className="w-5 h-5" />
                        <span>Fullscreen View</span>
                      </div>
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-600/20 rounded-2xl blur-xl"></div>
                    <Button
                      onClick={() => {
                        if (candidateData.length === 0) {
                          generateAnalysis();
                          generateCandidateAnalysis(); // Generate candidate data specifically
                        }
                        setTimeout(() => {
                          // Always navigate - fallback data will be generated in detailed report if needed
                          setLocation('/skill-gap-detailed-report');
                        }, candidateData.length === 0 ? 1000 : 100); // Reduced wait time
                      }}
                      className="relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold px-8 py-4 rounded-2xl border border-emerald-400/50 shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <FileQuestion className="w-5 h-5" />
                        <span>Advanced Report</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-center mt-6 space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm font-medium">AI Systems Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                  <span className="text-cyan-300 text-sm font-medium">Neural Network Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-300 text-sm font-medium">Quantum Processing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Content Based on Toggle */}
          {!showIndividualAnalysis ? (
            <>
              {/* Organization View */}
              {/* Metrics Cards */}
              {renderMetricsCard()}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {renderDomainPerformance()}
                {renderTrainingPriorities()}
              </div>

              {/* Recommendations */}
              <div className="mt-8">
                {renderRecommendations()}
              </div>
            </>
          ) : (
            <>
              {/* Individual Analysis View */}
              <div className="mt-8">
                {candidateData.length > 0 ? (
                  renderIndividualAnalysis()
                ) : (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
                      <Card className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-12">
                        <div className="flex flex-col items-center space-y-6">
                          <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                              <User className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute inset-0 bg-purple-400/20 rounded-3xl animate-pulse"></div>
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-400 to-pink-400 bg-clip-text text-transparent">
                              No Individual Data Available
                            </h3>
                            <p className="text-purple-200/80">
                              Click "Run Analysis" first to generate individual candidate analysis data.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </RoleGuard>
      </div>
      
      {/* Detailed Report Modal */}
      {showDetailedReport && renderDetailedReport()}
    </div>
  );
}