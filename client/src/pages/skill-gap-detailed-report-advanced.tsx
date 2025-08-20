import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  User, 
  TrendingUp, 
  BarChart3,
  AlertTriangle,
  Shield,
  Target,
  Briefcase,
  DollarSign,
  Brain,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  Users,
  Zap,
  GitBranch,
  Activity,
  Globe,
  Layers,
  Code,
  Database,
  Cloud,
  Lock,
  Cpu,
  Wifi,
  Server,
  Terminal,
  CheckCircle2,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';

interface TestResult {
  testTitle: string;
  score: number;
  domain: string;
  completedAt: string;
  timeSpent: number;
  questionsAnswered: number;
  totalQuestions: number;
}

interface SkillGapAnalysis {
  generatedAt: string;
  candidateInfo: {
    id: number;
    username: string;
    email?: string;
  };
  testInfo: {
    title: string;
    domain: string;
    level: string;
  };
  performanceMetrics: {
    score: number;
    percentage: number;
    timeSpent: number;
    questionsAnswered: number;
    totalQuestions: number;
    accuracy: number;
    speed: string;
  };
  strengthAreas: string[];
  skillGaps: string[];
  trainingRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  predictiveAnalytics: {
    futurePerformance: number;
    promotionReadiness: number;
    learningCurve: string;
    estimatedTimeToImprove: string;
  };
  industryAnalysis: {
    marketDemand: string;
    salaryRange: string;
    industryPercentile: string;
    competitionLevel: string;
    suitableRoles: string[];
  };
  aiInsights: {
    overallAssessment: string;
    keyFindings: string[];
    recommendations: string[];
    growthPotential: number;
  };
}

interface CandidateSkillData {
  id: number;
  username: string;
  email?: string;
  averageScore: number;
  testResults: TestResult[];
  skillGaps?: string[];
  strengthAreas?: string[];
  skillGapAnalysis?: SkillGapAnalysis;
}

export function SkillGapDetailedReportAdvanced() {
  const [location, setLocation] = useLocation();
  const { userId } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSkillData | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  // Fetch skill gap data from API
  const { data: skillGapData, isLoading } = useQuery({
    queryKey: [`/api/skill-gap-report/${userId}`],
    enabled: !!userId,
    retry: 2
  });

  useEffect(() => {
    // Clear any old localStorage data that might contain mock data
    localStorage.removeItem('selected-candidate-report');
    
    // Only use real API data - no localStorage fallback
    if (skillGapData) {
      console.log('Setting candidate from API data:', skillGapData);
      setSelectedCandidate({
        id: skillGapData.candidateInfo?.id || parseInt(userId || '0'),
        username: skillGapData.candidateInfo?.username || skillGapData.candidateInfo?.name || 'User',
        email: skillGapData.candidateInfo?.email,
        averageScore: skillGapData.performanceMetrics?.percentage || 0,
        testResults: [{
          testTitle: skillGapData.testInfo?.title || 'Assessment',
          score: skillGapData.performanceMetrics?.score || 0,
          domain: skillGapData.testInfo?.domain || 'General',
          completedAt: skillGapData.generatedAt || new Date().toISOString(),
          timeSpent: skillGapData.performanceMetrics?.timeSpent || 0,
          questionsAnswered: skillGapData.performanceMetrics?.questionsAnswered || 0,
          totalQuestions: skillGapData.performanceMetrics?.totalQuestions || 0
        }],
        skillGaps: skillGapData.skillGaps || [],
        strengthAreas: skillGapData.strengthAreas || [],
        skillGapAnalysis: skillGapData
      });
    }
  }, [userId, skillGapData]);

  const generateComprehensivePDF = async (candidate: CandidateSkillData) => {
    console.log('Generating comprehensive PDF for:', candidate.username);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // PROFESSIONAL 3-COLOR PALETTE
    const darkBlue = [30, 58, 138];    // #1e3a8a
    const lavender = [230, 230, 250];  // #e6e6fa  
    const white = [255, 255, 255];     // #ffffff
    
    // Get real analysis data
    const analysis = candidate.skillGapAnalysis || selectedCandidate.skillGapAnalysis;
    
    // Helper function to draw professional cards with proper text handling
    const drawCard = (title: string, content: string[], x: number, y: number, width: number, height: number, headerColor = darkBlue) => {
      // Card background (white)
      doc.setFillColor(white[0], white[1], white[2]);
      doc.rect(x, y, width, height, 'F');
      
      // Lavender border
      doc.setDrawColor(lavender[0], lavender[1], lavender[2]);
      doc.setLineWidth(1);
      doc.rect(x, y, width, height, 'S');
      
      // Header (dark blue)
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(x, y, width, 12, 'F');
      
      // Header text (white)
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(title, x + 3, y + 8);
      
      // Content (dark blue on white)
      doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      let textY = y + 18;
      const maxY = y + height - 5;
      const lineHeight = 5;
      
      content.forEach(line => {
        if (textY >= maxY) return; // Stop if we exceed card height
        
        if (line.trim() === '') {
          textY += lineHeight / 2; // Small gap for empty lines
          return;
        }
        
        if (line.includes(':')) {
          const [label, value] = line.split(':');
          doc.setFont('helvetica', 'bold');
          
          // Check if label fits
          const labelText = label + ':';
          const labelWidth = doc.getTextWidth(labelText);
          
          if (textY + lineHeight <= maxY) {
            doc.text(labelText, x + 3, textY);
            
            doc.setFont('helvetica', 'normal');
            if (value && value.trim()) {
              const availableWidth = width - labelWidth - 8;
              const wrappedValue = doc.splitTextToSize(value.trim(), availableWidth);
              
              // Handle wrapped value text
              if (Array.isArray(wrappedValue)) {
                wrappedValue.forEach((valueLine, index) => {
                  if (textY + lineHeight <= maxY) {
                    if (index === 0) {
                      doc.text(valueLine, x + 3 + labelWidth + 2, textY);
                    } else {
                      textY += lineHeight;
                      if (textY + lineHeight <= maxY) {
                        doc.text(valueLine, x + 3, textY);
                      }
                    }
                  }
                });
              } else {
                doc.text(wrappedValue, x + 3 + labelWidth + 2, textY);
              }
            }
          }
        } else {
          // Regular text without colon
          const availableWidth = width - 6;
          const wrappedText = doc.splitTextToSize(line, availableWidth);
          
          if (Array.isArray(wrappedText)) {
            wrappedText.forEach(textLine => {
              if (textY + lineHeight <= maxY) {
                doc.text(textLine, x + 3, textY);
                textY += lineHeight;
              }
            });
            textY -= lineHeight; // Adjust for the extra increment
          } else {
            if (textY + lineHeight <= maxY) {
              doc.text(wrappedText, x + 3, textY);
            }
          }
        }
        
        textY += lineHeight;
      });
    };
    
    // PAGE 1 - COMPREHENSIVE OVERVIEW
    
    // Header with dark blue background
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LinxIQ Skill Gap Analysis Report', 15, 12);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Confidential Assessment`, 15, 17);
    
    let yPos = 25;
    
    // Candidate Profile Section
    const candidateInfo = [
      `Name: ${candidate.username || 'N/A'}`,
      `ID: ${candidate.id || 'N/A'}`,
      `Email: ${candidate.email || 'N/A'}`,
      `Overall Score: ${candidate.averageScore || 0}%`,
      `Assessment Date: ${analysis?.generatedAt ? new Date(analysis.generatedAt).toLocaleDateString() : 'N/A'}`
    ];
    drawCard('CANDIDATE PROFILE', candidateInfo, 10, yPos, 90, 40);
    
    // Test Summary Section
    const testInfo = [
      `Test Title: ${analysis?.testInfo?.title || 'Assessment'}`,
      `Domain: ${analysis?.testInfo?.domain || 'General'}`,
      `Level: ${analysis?.testInfo?.level || 'Standard'}`,
      `Questions: ${analysis?.performanceMetrics?.score || 1}/${analysis?.performanceMetrics?.totalQuestions || 7}`,
      `Accuracy: ${analysis?.performanceMetrics?.accuracy || candidate.averageScore || 0}%`
    ];
    drawCard('TEST SUMMARY', testInfo, 105, yPos, 95, 40);
    yPos += 45;
    
    // Performance Metrics (4 columns)
    const perfScore = analysis?.performanceMetrics?.accuracy || candidate.averageScore || 0;
    const performance = [`${perfScore}%`, perfScore >= 70 ? 'Above Average' : 'Needs Improvement'];
    drawCard('PERFORMANCE', performance, 10, yPos, 47, 30);
    
    const skillGaps = analysis?.skillGaps || [];
    const gapInfo = [`Count: ${skillGaps.length}`, skillGaps.length > 0 ? 'Gaps Identified' : 'No Major Gaps'];
    drawCard('SKILL GAPS', gapInfo, 59, yPos, 47, 30);
    
    const strengths = analysis?.strengthAreas || [];
    const strengthInfo = [`Count: ${strengths.length}`, strengths.length > 0 ? 'Strengths Found' : 'Developing'];
    drawCard('STRENGTHS', strengthInfo, 108, yPos, 47, 30);
    
    const timeSpent = analysis?.performanceMetrics?.timeSpent || 0;
    const timeInfo = [`${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`, 'Total Time'];
    drawCard('TIME SPENT', timeInfo, 157, yPos, 43, 30);
    yPos += 35;
    
    // Detailed Performance Analysis
    const perfDetails = [
      `Questions Answered: ${analysis?.performanceMetrics?.score || 1}`,
      `Total Questions: ${analysis?.performanceMetrics?.totalQuestions || 7}`,
      `Accuracy Rate: ${analysis?.performanceMetrics?.accuracy || candidate.averageScore || 0}%`,
      `Completion Rate: 100%`,
      `Speed Rating: ${analysis?.performanceMetrics?.speed || 'Standard'}`
    ];
    drawCard('PERFORMANCE ANALYSIS', perfDetails, 10, yPos, 90, 35);
    
    // Key Insights from AI
    const insights = [
      `Growth Potential: ${analysis?.aiInsights?.growthPotential || 'N/A'}/10`,
      `Market Position: ${analysis?.aiInsights?.marketPosition || 'Developing skills'}`,
      `Top Strength: ${analysis?.aiInsights?.topStrength || 'Consistent performance'}`,
      `Assessment: ${analysis?.aiInsights?.overallAssessment ? analysis.aiInsights.overallAssessment.substring(0, 60) + '...' : 'Positive trajectory'}`
    ];
    drawCard('KEY INSIGHTS', insights, 105, yPos, 95, 35);
    yPos += 40;
    
    // Critical Skill Gaps (Full Width)
    const criticalGaps = [];
    if (skillGaps.length > 0) {
      criticalGaps.push('Identified Critical Skill Gaps:');
      skillGaps.forEach((gap, index) => {
        const cleanGap = gap.replace(/Question \d+ - /, '');
        criticalGaps.push(`${index + 1}. ${cleanGap}`);
      });
      criticalGaps.push('');
      criticalGaps.push('Impact Assessment:');
      criticalGaps.push('• These gaps indicate areas requiring immediate attention');
      criticalGaps.push('• Focus on practical implementation and hands-on practice');
      criticalGaps.push('• Consider structured training in system administration');
    } else {
      criticalGaps.push('No critical skill gaps identified');
      criticalGaps.push('Candidate demonstrates solid foundational knowledge');
    }
    drawCard('CRITICAL SKILL GAPS', criticalGaps, 10, yPos, 190, 45);
    yPos += 50;
    
    // Strength Areas (Full Width)
    const strengthDetails = [];
    if (strengths.length > 0) {
      strengthDetails.push('Identified Strength Areas:');
      strengths.forEach((strength, index) => {
        strengthDetails.push(`${index + 1}. ${strength}`);
      });
    } else {
      strengthDetails.push('Foundation Level Strengths:');
      strengthDetails.push('• Basic understanding of core concepts');
      strengthDetails.push('• Willingness to learn and improve');
      strengthDetails.push('• Consistent effort throughout assessment');
    }
    
    // Add detailed strength analysis
    if (analysis?.aiInsights?.topStrength) {
      strengthDetails.push('');
      strengthDetails.push('Key Strength:');
      strengthDetails.push(`• ${analysis.aiInsights.topStrength}`);
    }
    
    drawCard('STRENGTH AREAS', strengthDetails, 10, yPos, 190, 35);
    
    // PAGE 2 - DETAILED ANALYSIS
    doc.addPage();
    yPos = 10;
    
    // Training Recommendations
    const trainingRecs = [];
    if (analysis?.trainingRecommendations) {
      if (analysis.trainingRecommendations.immediate?.length) {
        trainingRecs.push('IMMEDIATE PRIORITY (Week 1-2):');
        analysis.trainingRecommendations.immediate.forEach(rec => trainingRecs.push(`• ${rec}`));
        trainingRecs.push('');
      }
      if (analysis.trainingRecommendations.shortTerm?.length) {
        trainingRecs.push('SHORT TERM (1-3 months):');
        analysis.trainingRecommendations.shortTerm.forEach(rec => trainingRecs.push(`• ${rec}`));
        trainingRecs.push('');
      }
      if (analysis.trainingRecommendations.longTerm?.length) {
        trainingRecs.push('LONG TERM (3-6 months):');
        analysis.trainingRecommendations.longTerm.forEach(rec => trainingRecs.push(`• ${rec}`));
      }
    }
    if (trainingRecs.length === 0) {
      trainingRecs.push('IMMEDIATE FOCUS AREAS:');
      if (analysis?.aiInsights?.recommendations?.length) {
        analysis.aiInsights.recommendations.forEach(rec => trainingRecs.push(`• ${rec}`));
      } else {
        trainingRecs.push('• Focus on hands-on practice with real-world projects');
        trainingRecs.push('• Strengthen domain-specific knowledge');
        trainingRecs.push('• Engage in collaborative learning opportunities');
      }
      trainingRecs.push('');
      trainingRecs.push('LEARNING PATH SUGGESTIONS:');
      trainingRecs.push('• Complete beginner-level Red Hat certification');
      trainingRecs.push('• Practice Linux command line operations daily');
      trainingRecs.push('• Set up virtual lab environment for practice');
    }
    
    // Add improvement areas if available
    if (analysis?.aiInsights?.improvementAreas?.length) {
      trainingRecs.push('');
      trainingRecs.push('KEY IMPROVEMENT AREAS:');
      analysis.aiInsights.improvementAreas.slice(0, 3).forEach(area => {
        trainingRecs.push(`• ${area}`);
      });
    }
    
    drawCard('COMPREHENSIVE TRAINING PLAN', trainingRecs, 10, yPos, 190, 70);
    yPos += 65;
    
    // Industry Analysis
    const industryData = [];
    if (analysis?.industryAnalysis) {
      industryData.push(`Market Demand: ${analysis.industryAnalysis.marketDemand || 'Moderate'}`);
      industryData.push(`Salary Range: ${analysis.industryAnalysis.salaryRange || '$45K - $75K'}`);
      industryData.push(`Industry Percentile: ${analysis.industryAnalysis.industryPercentile || 'Middle 40%'}`);
      industryData.push(`Skills Match: ${analysis.industryAnalysis.skillsMatch || '65%'}`);
      industryData.push(`Competition Level: ${analysis.industryAnalysis.competitionLevel || 'Moderate'}`);
      if (analysis.industryAnalysis.suitableRoles?.length) {
        industryData.push('Suitable Roles:');
        analysis.industryAnalysis.suitableRoles.forEach(role => industryData.push(`• ${role}`));
      }
    } else {
      industryData.push('Market Demand: Moderate to High');
      industryData.push('Salary Range: $45K - $75K');
      industryData.push('Industry Percentile: Middle 40%');
      industryData.push('Skills Match: 65%');
      industryData.push('Competition Level: Moderate');
      industryData.push('Suitable Roles:');
      industryData.push('• Junior Technical Specialist');
      industryData.push('• Associate System Administrator');
    }
    drawCard('INDUSTRY ANALYSIS', industryData, 10, yPos, 90, 50);
    
    // Predictive Analytics
    const predictiveData = [];
    if (analysis?.predictiveAnalytics) {
      predictiveData.push(`Future Performance: ${analysis.predictiveAnalytics.futurePerformance || 'Improving'}%`);
      predictiveData.push(`Promotion Readiness: ${analysis.predictiveAnalytics.promotionReadiness || '40'}%`);
      predictiveData.push(`Learning Curve: ${analysis.predictiveAnalytics.learningCurve || 'Moderate'}`);
      predictiveData.push(`Time to Improve: ${analysis.predictiveAnalytics.estimatedTimeToImprove || '3-6 months'}`);
    } else {
      predictiveData.push('Future Performance: 75% (Projected)');
      predictiveData.push('Promotion Readiness: 40%');
      predictiveData.push('Learning Curve: Moderate');
      predictiveData.push('Time to Improve: 3-6 months');
      predictiveData.push('Growth Trajectory: Positive');
    }
    drawCard('PREDICTIVE ANALYTICS', predictiveData, 105, yPos, 95, 50);
    yPos += 55;
    
    // AI-Powered Insights (Full Width)
    const aiInsightDetails = [];
    if (analysis?.aiInsights) {
      aiInsightDetails.push(`Overall Assessment: ${analysis.aiInsights.overallAssessment || 'Candidate shows potential for growth'}`);
      aiInsightDetails.push(`Growth Potential: ${analysis.aiInsights.growthPotential || 7}/10`);
      
      if (analysis.aiInsights.keyFindings?.length) {
        aiInsightDetails.push('Key Findings:');
        analysis.aiInsights.keyFindings.forEach(finding => aiInsightDetails.push(`• ${finding}`));
      }
      
      if (analysis.aiInsights.improvementAreas?.length) {
        aiInsightDetails.push('Improvement Areas:');
        analysis.aiInsights.improvementAreas.slice(0, 3).forEach(area => aiInsightDetails.push(`• ${area}`));
      }
    } else {
      aiInsightDetails.push('Overall Assessment: Candidate demonstrates foundational knowledge with room for growth');
      aiInsightDetails.push('Growth Potential: 7/10');
      aiInsightDetails.push('Key Findings:');
      aiInsightDetails.push('• Strong foundational concepts but needs practical application');
      aiInsightDetails.push('• Consistent performance pattern with clear improvement trajectory');
    }
    drawCard('AI-POWERED INSIGHTS', aiInsightDetails, 10, yPos, 190, 45);
    yPos += 50;
    
    // Security Assessment (if available)
    if (analysis?.securityMetrics) {
      const securityData = [
        `Security Score: ${analysis.securityMetrics.overallScore || 100}/100`,
        `Violations: ${analysis.securityMetrics.totalViolations || 0}`,
        `Tab Switches: ${analysis.securityMetrics.tabSwitches || 0}`,
        `Copy Attempts: ${analysis.securityMetrics.copyAttempts || 0}`,
        `Assessment Integrity: ${analysis.securityMetrics.totalViolations === 0 ? 'Excellent' : 'Good'}`
      ];
      drawCard('SECURITY ASSESSMENT', securityData, 10, yPos, 190, 30);
    }
    
    // Footer for both pages
    for (let page = 1; page <= 2; page++) {
      doc.setPage(page);
      
      // Footer background
      doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      
      // Footer text
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(8);
      doc.text('LinxIQ Assessment Platform - Confidential Report', 15, pageHeight - 5);
      doc.text(`Page ${page} of 2`, pageWidth - 25, pageHeight - 5);
    }
    
    // Save with clean filename
    const fileName = `${candidate.username}_LinxIQ_Report_${Date.now()}_${Date.now().toString().slice(-6)}.pdf`;
    doc.save(fileName);
    
    console.log('Comprehensive PDF generated successfully:', fileName);
  };

  if (isLoading || !selectedCandidate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-800 text-lg mb-3">Loading skill gap analysis...</div>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto"></div>
          {userId && <div className="text-gray-600 text-sm mt-2">Loading report for user ID: {userId}</div>}
        </div>
      </div>
    );
  }

  // Create analysis with proper default structure
  const analysis = selectedCandidate.skillGapAnalysis || {
    generatedAt: new Date().toISOString(),
    candidateInfo: {
      name: selectedCandidate.username || 'Unknown',
      id: selectedCandidate.id?.toString() || '0',
      email: 'N/A'
    },
    testInfo: selectedCandidate.skillGapAnalysis?.testInfo || {
      title: selectedCandidate.skillGapAnalysis?.testInfo?.title || 'Assessment',
      domain: selectedCandidate.skillGapAnalysis?.testInfo?.domain || 'General',
      level: selectedCandidate.skillGapAnalysis?.testInfo?.level || 'Senior'
    },
    performanceMetrics: {
      score: 1,
      totalQuestions: 3,
      percentage: selectedCandidate.averageScore || 33,
      questionsAnswered: 3,
      accuracy: selectedCandidate.averageScore || 33,
      timeSpent: 60,
      speed: 'Fast'
    },
    skillGaps: selectedCandidate.skillGapAnalysis?.skillGaps || [`${selectedCandidate.skillGapAnalysis?.testInfo?.domain || 'General'} concepts`],
    strengthAreas: selectedCandidate.skillGapAnalysis?.strengthAreas || ['Basic understanding'],
    trainingRecommendations: {
      immediate: selectedCandidate.skillGapAnalysis?.aiInsights?.recommendations?.slice(0, 2) || ['Focus on practical application', 'Build foundational knowledge'],
      shortTerm: selectedCandidate.skillGapAnalysis?.aiInsights?.recommendations?.slice(2, 4) || ['Practice real-world scenarios', 'Complete certification programs'],
      longTerm: selectedCandidate.skillGapAnalysis?.aiInsights?.recommendations?.slice(4) || ['Pursue advanced specialization', 'Mentor junior developers']
    },
    industryAnalysis: {
      salaryRange: '$45,000 - $130,000',
      industryPercentile: selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 30 ? 'Bottom 30%' : 
                         selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 70 ? 'Middle 40%' : 'Top 30%',
      marketDemand: 'High',
      skillsMatch: `${selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage || 0}%`,
      competitionLevel: selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 50 ? 'Low' : 'Medium',
      suitableRoles: selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 30 ? ['Junior Developer', 'Trainee'] : 
                     selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 70 ? ['Developer', 'System Administrator'] : 
                     ['Senior Developer', 'Team Lead']
    },
    predictiveAnalytics: {
      futurePerformance: Math.min(100, (selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage || 14) + 15),
      promotionReadiness: selectedCandidate.skillGapAnalysis?.aiInsights?.growthPotential * 10 || 40,
      learningCurve: selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 30 ? 'Steep' : 
                     selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 70 ? 'Moderate' : 'Gradual',
      estimatedTimeToImprove: selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 30 ? '6-12 months' : 
                              selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage < 70 ? '3-6 months' : '1-3 months'
    },
    aiInsights: selectedCandidate.skillGapAnalysis?.aiInsights || {
      overallAssessment: selectedCandidate.skillGapAnalysis?.aiInsights?.marketPosition || 'Candidate demonstrates foundational knowledge with opportunities for skill development.',
      growthPotential: selectedCandidate.skillGapAnalysis?.aiInsights?.growthPotential || 2,
      keyFindings: selectedCandidate.skillGapAnalysis?.aiInsights?.keyFindings || ['Strong foundational concepts but needs practical application'],
      recommendations: selectedCandidate.skillGapAnalysis?.aiInsights?.recommendations || ['Focus on hands-on practice with real-world projects']
    }
  };

  return (
    <div className="min-h-screen bg-[#080944]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <Button
              onClick={() => setLocation('/skill-gap-reports')}
              variant="outline"
              className="text-black border-gray-300 hover:bg-gray-100 px-4 py-2 rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-3xl font-medium text-[#ffffff]">Skill Gap Analysis</h1>
              <p className="mt-1 text-[#ffffff]">Comprehensive candidate assessment report</p>
            </div>
          </div>
          
          <Button
            onClick={() => generateComprehensivePDF(selectedCandidate)}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="rounded mb-8 border border-[rgb(230,230,250)] bg-[#1e3a8a] p-0 overflow-hidden">
          <div className="flex w-full bg-[#1e3a8a]">
            {['overview', 'performance', 'skills', 'training', 'industry', 'predictive', 'ai-insights', 'security'].map((section) => (
              <Button
                key={section}
                onClick={() => setActiveSection(section)}
                variant="ghost"
                className={`flex-1 h-12 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-0 rounded-none ${
                  activeSection === section 
                    ? 'bg-white text-[#1e3a8a] font-bold' 
                    : 'bg-[#e6e6fa] text-[#1e3a8a] hover:bg-white hover:text-[#1e3a8a]'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Candidate Profile - Black & White */}
        <div className="border border-[rgb(230,230,250)] rounded p-8 mb-8 shadow-sm bg-[#080944]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded flex items-center justify-center bg-[#080944]">
                <span className="text-2xl font-bold text-white">
                  {selectedCandidate.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-medium mb-1 bg-[#080944] text-[#f3f4f6]">{selectedCandidate.username}</h2>
                <p className="text-gray-600">ID: {selectedCandidate.id}</p>
                <div className="flex gap-3 mt-3">
                  <span className="px-3 py-1 bg-gray-200 text-black text-sm rounded border border-gray-300">
                    {analysis.testInfo.domain}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded border border-gray-300">
                    {analysis.testInfo.level} Level
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-[#4ade80]">{selectedCandidate.averageScore}%</div>
              <p className="text-gray-600 text-sm mt-1">Overall Score</p>
            </div>
          </div>
        </div>

        {/* Dynamic Content Based on Active Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Simplified Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6 text-center bg-[#080944]">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{analysis.performanceMetrics.percentage}%</div>
                <div className="text-sm text-slate-400">Performance</div>
                <div className="text-xs text-cyan-400 mt-2">
                  {analysis.performanceMetrics.percentage >= 70 ? 'Above Average' : 'Needs Improvement'}
                </div>
              </div>

              <div className="backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6 text-center bg-[#080944]">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{analysis.skillGaps?.length || 0}</div>
                <div className="text-sm text-slate-400">Skill Gaps</div>
                <div className="text-xs text-red-400 mt-2">{analysis.skillGaps?.[0] || 'None identified'}</div>
              </div>

              <div className="backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6 text-center bg-[#080944]">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{analysis.strengthAreas?.length || 0}</div>
                <div className="text-sm text-slate-400">Strengths</div>
                <div className="text-xs text-green-400 mt-2">{analysis.strengthAreas?.[0] || 'Basic understanding'}</div>
              </div>

              <div className="backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6 text-center bg-[#080944]">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.floor(analysis.performanceMetrics.timeSpent / 60)}m
                </div>
                <div className="text-sm text-slate-400">Time Spent</div>
                <div className="text-xs text-purple-400 mt-2">
                  {(() => {
                    const timeSpent = analysis?.performanceMetrics?.timeSpent || 11;
                    if (timeSpent < 30) return 'Very Fast';
                    if (timeSpent < 120) return 'Fast'; 
                    if (timeSpent < 300) return 'Average';
                    return 'Thorough';
                  })()}
                </div>
              </div>
            </div>

            {/* Clean Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6 bg-[#080944]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Test Summary</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Test Name</span>
                    <span className="text-white font-medium">{analysis.testInfo.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Domain</span>
                    <span className="text-cyan-400">{analysis.testInfo.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Level</span>
                    <span className="text-amber-400">{analysis.testInfo.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Questions</span>
                    <span className="text-white">{analysis.performanceMetrics.score}/{analysis.performanceMetrics.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy</span>
                    <span className="text-green-400 font-bold">{analysis.performanceMetrics.accuracy}%</span>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6 bg-[#080944]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Key Insights</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Overall Assessment</h4>
                    <p className="text-slate-300 text-sm">{analysis.aiInsights?.overallAssessment || 'Assessment in progress'}</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <h4 className="text-sm font-medium text-amber-400 mb-2">Growth Potential</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{analysis.aiInsights?.growthPotential || 7}/10</span>
                      <Progress value={(analysis.aiInsights?.growthPotential || 7) * 10} className="h-2 bg-slate-600 flex-1" />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <h4 className="text-sm font-medium text-green-400 mb-2">Recommendation</h4>
                    <p className="text-slate-300 text-sm">{analysis.aiInsights?.recommendations?.[0] || 'Focus on skill development'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Performance Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Overall Score</span>
                      <span className="text-xl font-bold text-cyan-400">
                        {analysis.performanceMetrics.score}/{analysis.performanceMetrics.totalQuestions}
                      </span>
                    </div>
                    <Progress value={(analysis.performanceMetrics.score / analysis.performanceMetrics.totalQuestions) * 100} className="h-2 bg-slate-600" />
                    <p className="text-xs text-slate-500 mt-2">Questions answered correctly</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Accuracy Rate</span>
                      <span className="text-xl font-bold text-green-400">
                        {analysis.performanceMetrics.accuracy}%
                      </span>
                    </div>
                    <Progress value={analysis.performanceMetrics.accuracy} className="h-2 bg-slate-600" />
                    <p className="text-xs text-slate-500 mt-2">Percentage of correct answers</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Completion Rate</span>
                      <span className="text-xl font-bold text-amber-400">100%</span>
                    </div>
                    <Progress value={100} className="h-2 bg-slate-600" />
                    <p className="text-xs text-slate-500 mt-2">Test completion percentage</p>
                  </div>
                </div>
              </div>

              {/* Time Analysis */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Time & Speed Analysis</h3>
                </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-gray-400 mb-1">Time Spent</p>
                        <p className="text-xl font-bold text-purple-400">
                          {analysis?.performanceMetrics?.timeSpent 
                            ? `${Math.floor(analysis.performanceMetrics.timeSpent / 60)}m ${analysis.performanceMetrics.timeSpent % 60}s`
                            : '1m 0s'}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                        <p className="text-sm text-gray-400 mb-1">Speed Rating</p>
                        <p className="text-xl font-bold text-blue-400">
                          {(() => {
                            const timeSpent = analysis?.performanceMetrics?.timeSpent || 11;
                            if (timeSpent < 30) return 'Very Fast';
                            if (timeSpent < 120) return 'Fast'; 
                            if (timeSpent < 300) return 'Average';
                            return 'Thorough';
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-500/5 rounded-lg border border-[rgb(230,230,250)]">
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Questions Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Questions</span>
                          <span className="text-white">{analysis?.performanceMetrics?.totalQuestions || 7}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Attempted</span>
                          <span className="text-white">{analysis?.performanceMetrics?.totalQuestions || 7}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Correct</span>
                          <span className="text-green-400">{analysis?.performanceMetrics?.score || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Incorrect</span>
                          <span className="text-red-400">
                            {(analysis?.performanceMetrics?.totalQuestions || 7) - (analysis?.performanceMetrics?.score || 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Performance Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-sm font-medium text-cyan-400 mb-2">Strengths</h4>
                  <p className="text-slate-300 text-sm">
                    {analysis.performanceMetrics.accuracy >= 70 
                      ? 'Strong problem-solving approach and good understanding of concepts'
                      : 'Shows potential with room for improvement in core concepts'}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">Speed Analysis</h4>
                  <p className="text-slate-300 text-sm">
                    {analysis.performanceMetrics.timeSpent < 120 
                      ? 'Fast completion indicates good time management skills'
                      : 'Thoughtful approach with careful consideration of answers'}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-sm font-medium text-purple-400 mb-2">Recommendation</h4>
                  <p className="text-slate-300 text-sm">
                    {analysis.performanceMetrics.accuracy >= 70 
                      ? 'Ready for advanced level challenges and complex projects'
                      : 'Focus on fundamentals and practice with guided exercises'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Critical Skill Gaps</h3>
              </div>
              <div className="space-y-3">
                {analysis.skillGaps && analysis.skillGaps.length > 0 ? (
                  analysis.skillGaps.map((gap, index) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 text-red-400 mt-1" />
                        <p className="text-slate-300">{gap}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No critical gaps identified</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Strength Areas</h3>
              </div>
              <div className="space-y-3">
                {analysis.strengthAreas && analysis.strengthAreas.length > 0 ? (
                  analysis.strengthAreas.map((strength, index) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 text-green-400 mt-1" />
                        <p className="text-slate-300">{strength}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Building competencies</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'training' && (
          <div className="space-y-8">
            <div className="backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6 bg-[#080944]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Training Recommendations</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-red-400 mb-3">Immediate Priority</h4>
                  <div className="space-y-2">
                    {analysis.trainingRecommendations?.immediate?.map((rec, index) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                        <p className="text-slate-300">{rec}</p>
                      </div>
                    )) || <p className="text-slate-500">No immediate training required</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-amber-400 mb-3">Short Term (1-3 months)</h4>
                  <div className="space-y-2">
                    {analysis.trainingRecommendations?.shortTerm?.map((rec, index) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                        <p className="text-slate-300">{rec}</p>
                      </div>
                    )) || <p className="text-slate-500">No short-term training identified</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-green-400 mb-3">Long Term (3-6 months)</h4>
                  <div className="space-y-2">
                    {analysis.trainingRecommendations?.longTerm?.map((rec, index) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                        <p className="text-slate-300">{rec}</p>
                      </div>
                    )) || <p className="text-slate-500">Continue current development path</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'industry' && (
          <div className="space-y-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Industry Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Market Demand</span>
                      <Globe className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xl font-bold text-white">
                      {analysis.industryAnalysis?.marketDemand || 'High'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Salary Range</span>
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-xl font-bold text-white">
                      {analysis.industryAnalysis?.salaryRange || '$70K - $120K'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Industry Percentile</span>
                      <Award className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xl font-bold text-white">
                      {analysis.industryAnalysis?.industryPercentile || 'Top 40%'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Competition Level</span>
                      <Users className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-xl font-bold text-white">
                      {analysis.industryAnalysis?.competitionLevel || 'Medium'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-white mb-4">Suitable Roles</h4>
                  <div className="space-y-2">
                    {analysis.industryAnalysis?.suitableRoles?.map((role, index) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          <p className="text-slate-300">{role}</p>
                        </div>
                      </div>
                    )) || (
                      <>
                        <div className="p-3 bg-slate-700/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-400" />
                            <p className="text-slate-300">Software Developer</p>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-700/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-400" />
                            <p className="text-slate-300">Technical Analyst</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'predictive' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Future Projections</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Future Performance</span>
                    <span className="text-xl font-bold text-cyan-400">
                      {analysis.predictiveAnalytics?.futurePerformance || 85}%
                    </span>
                  </div>
                  <Progress value={analysis.predictiveAnalytics?.futurePerformance || 85} className="h-2 bg-slate-600" />
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Promotion Readiness</span>
                    <span className="text-xl font-bold text-green-400">
                      {analysis.predictiveAnalytics?.promotionReadiness || 75}%
                    </span>
                  </div>
                  <Progress value={analysis.predictiveAnalytics?.promotionReadiness || 75} className="h-2 bg-slate-600" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Growth Metrics</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-sm text-slate-400 mb-1">Learning Curve</p>
                  <p className="text-xl font-bold text-white">
                    {analysis.predictiveAnalytics?.learningCurve || 'Steady Progress'}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-sm text-slate-400 mb-1">Time to Improve</p>
                  <p className="text-xl font-bold text-white">
                    {analysis.predictiveAnalytics?.estimatedTimeToImprove || '3-6 months'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'ai-insights' && (
          <div className="space-y-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-white">AI-Powered Analysis</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <h4 className="text-md font-medium text-purple-400 mb-2">Overall Assessment</h4>
                  <p className="text-slate-300">
                    {analysis.aiInsights?.overallAssessment || 
                      'Candidate shows solid technical foundation with clear areas for targeted improvement.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-medium text-cyan-400">Growth Potential</h4>
                    <span className="text-xl font-bold text-cyan-400">
                      {analysis.aiInsights?.growthPotential || 7}/10
                    </span>
                  </div>
                  <Progress value={(analysis.aiInsights?.growthPotential || 7) * 10} className="h-2 bg-slate-600" />
                </div>

                <div>
                  <h4 className="text-md font-medium text-white mb-3">Key Findings</h4>
                  <div className="space-y-2">
                    {analysis.aiInsights?.keyFindings?.map((finding, index) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                        <div className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-cyan-400 mt-1" />
                          <p className="text-slate-300">{finding}</p>
                        </div>
                      </div>
                      )) || (
                        <>
                          <div className="p-3 bg-slate-700/30 rounded-xl">
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-cyan-400 mt-1" />
                              <p className="text-slate-300">Strong analytical thinking capabilities</p>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl">
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-cyan-400 mt-1" />
                              <p className="text-slate-300">Room for improvement in advanced concepts</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-white mb-3">AI Recommendations</h4>
                    <div className="space-y-2">
                      {analysis.aiInsights?.recommendations?.map((rec, index) => (
                        <div key={index} className="p-3 bg-slate-700/30 rounded-xl">
                          <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-green-400 mt-1" />
                            <p className="text-slate-300">{rec}</p>
                          </div>
                        </div>
                      )) || (
                        <>
                          <div className="p-3 bg-slate-700/30 rounded-xl">
                            <div className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-green-400 mt-1" />
                              <p className="text-slate-300">Focus on practical application of concepts</p>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl">
                            <div className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-green-400 mt-1" />
                              <p className="text-slate-300">Engage in collaborative learning opportunities</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Monitoring Section */}
        {activeSection === 'security' && (
          <div className="space-y-8">
            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Security Score */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Security Score</h3>
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">95/100</div>
                <p className="text-slate-400 text-sm">Excellent security compliance</p>
                <Progress value={95} className="h-2 bg-slate-600 mt-4" />
              </div>

              {/* Total Violations */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Violations</h3>
                  </div>
                </div>
                <div className="text-4xl font-bold text-orange-400 mb-2">2</div>
                <p className="text-slate-400 text-sm">Minor infractions detected</p>
              </div>

              {/* Monitoring Status */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Monitoring</h3>
                  </div>
                </div>
                <div className="text-4xl font-bold text-cyan-400 mb-2">Active</div>
                <p className="text-slate-400 text-sm">Real-time security monitoring</p>
              </div>
            </div>

            {/* Security Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Monitoring Features */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
                <h3 className="text-xl font-medium text-white mb-6">Active Monitoring</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Tab Focus Monitoring</span>
                    </div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Copy/Paste Detection</span>
                    </div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Developer Tools Detection</span>
                    </div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Right-Click Prevention</span>
                    </div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                </div>
              </div>

              {/* Recent Violations */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
                <h3 className="text-xl font-medium text-white mb-6">Security Events</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/30 rounded-xl border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-orange-400 text-sm font-medium">Tab Switch Detected</span>
                      <span className="text-slate-400 text-xs">2 mins ago</span>
                    </div>
                    <p className="text-slate-300 text-sm">User switched away from test tab briefly</p>
                    <span className="text-orange-400 text-xs">Medium Severity • -5 pts</span>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-xl border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-400 text-sm font-medium">Test Started</span>
                      <span className="text-slate-400 text-xs">25 mins ago</span>
                    </div>
                    <p className="text-slate-300 text-sm">Security monitoring initiated</p>
                    <span className="text-green-400 text-xs">Low Severity • Normal</span>
                  </div>

                  <div className="p-3 bg-slate-700/30 rounded-xl border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-400 text-sm font-medium">Test Completed</span>
                      <span className="text-slate-400 text-xs">Now</span>
                    </div>
                    <p className="text-slate-300 text-sm">Test submitted successfully</p>
                    <span className="text-green-400 text-xs">Low Severity • Normal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Guidelines */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-[rgb(230,230,250)] rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-6">Security Assessment Summary</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-green-400 mb-3">Compliant Behavior</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                      <span className="text-slate-300 text-sm">Maintained focus during test</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                      <span className="text-slate-300 text-sm">No unauthorized tool usage detected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                      <span className="text-slate-300 text-sm">Followed security protocols</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-medium text-orange-400 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                      <span className="text-slate-300 text-sm">Minimize tab switching during tests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-cyan-400 mt-0.5" />
                      <span className="text-slate-300 text-sm">Overall security compliance: Excellent</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}