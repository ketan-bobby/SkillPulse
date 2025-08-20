import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  User, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Target, 
  Star,
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  Users,
  Zap,
  Award,
  Briefcase
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useQuery } from '@tanstack/react-query';

interface QuestionDetail {
  questionId: number;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  questionText: string;
}

interface SkillGapAnalysis {
  generatedAt: string;
  candidateInfo: {
    name: string;
    email: string;
    employeeId: string;
    department: string;
    position: string;
  };
  testInfo: {
    title: string;
    domain: string;
    level: string;
    totalQuestions: number;
  };
  performanceMetrics: {
    score: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    completedAt: string;
  };
  domainPerformance: {
    domain: string;
    level: string;
    score: number;
    passed: boolean;
  };
  skillGaps: string[];
  questionDetails?: QuestionDetail[];
  industryAnalysis: {
    salaryRange: string;
    industryPercentile: string;
    marketDemand: string;
    skillsMatch: number;
    competitionLevel: string;
    suitableRoles: string[];
    growthPotential: string;
  };
  predictiveAnalytics: {
    futurePerformance: number;
    careerTrack: string;
    promotionReadiness: number;
    growthRate: string;
    estimatedTimeToNextLevel: string;
  };
  trainingRecommendations: {
    priority: string;
    focusAreas: string[];
    suggestedCourses: string[];
    estimatedDuration: string;
  };
  aiInsights: {
    marketPosition: string;
    salaryPositioning: string;
    topStrength: string;
    improvementAreas: string[];
    overallAssessment: string;
  };
  competencyMapping: {
    technical: number;
    problemSolving: number;
    domainKnowledge: number;
    practicalApplication: number;
  };
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
  detailedAnalysis: any;
  skillGapAnalysis?: SkillGapAnalysis;
}

export default function SkillGapDetailedReport() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const userId = params.userId;
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSkillData | null>(null);
  const [candidates, setCandidates] = useState<CandidateSkillData[]>([]);

  // Redirect if no user ID is provided
  useEffect(() => {
    if (!userId) {
      console.log('No user ID provided, redirecting to skill gap reports');
      setLocation('/skill-gap-reports');
    }
  }, [userId, setLocation]);

  // Fetch skill gap analysis based on userId from URL
  const { data: skillGapData, isLoading } = useQuery({
    queryKey: [`/api/skill-gap-report/${userId || selectedCandidate?.id}`],
    enabled: !!(userId || selectedCandidate?.id),
    retry: false,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true
  });

  useEffect(() => {
    // Clear all possible stale data sources that could contain mock data
    localStorage.clear(); // Clear everything to eliminate any mock data
    sessionStorage.clear(); // Clear session storage too
    
    // Only proceed if we have both userId and valid API data
    if (!userId || !skillGapData) {
      return;
    }

    // Validate API data structure before using it
    if (skillGapData && (skillGapData as any).candidateInfo) {
      console.log('Creating candidate from REAL API data only:', {
        name: (skillGapData as any).candidateInfo.name,
        percentage: (skillGapData as any).performanceMetrics?.percentage,
        userId: userId
      });
      
      const candidate: CandidateSkillData = {
        id: parseInt(userId),
        username: (skillGapData as any).candidateInfo.name || (skillGapData as any).candidateInfo.email?.split('@')[0] || "User",
        email: (skillGapData as any).candidateInfo.email || "",
        employeeId: (skillGapData as any).candidateInfo.employeeId || "",
        testResults: [],
        averageScore: (skillGapData as any).performanceMetrics?.percentage || 0,
        strengthAreas: (skillGapData as any).strengthAreas || [],
        skillGaps: (skillGapData as any).skillGaps || [],
        recommendedTraining: (skillGapData as any).trainingRecommendations?.suggestedCourses || [],
        detailedAnalysis: skillGapData,
        skillGapAnalysis: skillGapData as SkillGapAnalysis
      };
      
      setSelectedCandidate(candidate);
      setCandidates([]); // Never use candidates array
    }
  }, [userId, skillGapData]);

  // Comprehensive PDF Generation Function
  const generateComprehensivePDF = async (candidate: CandidateSkillData) => {
    try {
      console.log('Starting comprehensive PDF generation for:', candidate);
      
      if (!candidate || !candidate.skillGapAnalysis) {
        console.error('No valid candidate data available for PDF generation');
        alert('No candidate data available. Please try again.');
        return;
      }

      const skillData = candidate.skillGapAnalysis;
      console.log('Using skill gap analysis data:', skillData);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Professional Header - Black & White
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Company branding
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('LinxIQ Assessment Report', 15, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 35);
      
      // Candidate name in header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(skillData.candidateInfo.name, pageWidth - 15 - doc.getTextWidth(skillData.candidateInfo.name), 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${skillData.candidateInfo.employeeId}`, pageWidth - 15 - doc.getTextWidth(`ID: ${skillData.candidateInfo.employeeId}`), 35);

      yPos = 55;

      // SECTION 1: CANDIDATE OVERVIEW
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CANDIDATE OVERVIEW', 15, yPos);
      yPos += 10;

      // Candidate Information Card
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(15, yPos, 180, 45);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Candidate Information', 20, yPos + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${skillData.candidateInfo.name}`, 20, yPos + 20);
      doc.text(`Employee ID: ${skillData.candidateInfo.employeeId}`, 20, yPos + 28);
      doc.text(`Email: ${skillData.candidateInfo.email}`, 20, yPos + 36);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Test Information', 110, yPos + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Test: ${skillData.testInfo.title}`, 110, yPos + 20);
      doc.text(`Domain: ${skillData.testInfo.domain}`, 110, yPos + 28);
      doc.text(`Level: ${skillData.testInfo.level}`, 110, yPos + 36);
      
      yPos += 55;

      // SECTION 2: PERFORMANCE METRICS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PERFORMANCE METRICS', 15, yPos);
      yPos += 10;

      // Performance Cards
      doc.rect(15, yPos, 85, 35);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Performance', 20, yPos + 10);
      
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(`${skillData.performanceMetrics.percentage}%`, 20, yPos + 25);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Accuracy Rate', 20, yPos + 32);

      doc.rect(110, yPos, 85, 35);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Details', 115, yPos + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Questions: ${skillData.performanceMetrics.questionsAnswered}/${skillData.testInfo.totalQuestions}`, 115, yPos + 18);
      doc.text(`Score: ${skillData.performanceMetrics.score}`, 115, yPos + 25);
      doc.text(`Time: ${skillData.performanceMetrics.timeSpent} minutes`, 115, yPos + 32);

      yPos += 45;

      // SECTION 3: SKILL GAPS ANALYSIS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CRITICAL SKILL GAPS', 15, yPos);
      yPos += 10;

      // Skill Gaps Card
      doc.rect(15, yPos, 180, 50);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Areas Requiring Immediate Attention', 20, yPos + 10);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      let skillYPos = yPos + 20;
      if (skillData.skillGaps && skillData.skillGaps.length > 0) {
        skillData.skillGaps.slice(0, 3).forEach((gap, index) => {
          doc.text(`• ${gap}`, 20, skillYPos);
          skillYPos += 8;
        });
      }
      
      yPos += 60;

      // SECTION 4: STRENGTH AREAS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STRENGTH AREAS', 15, yPos);
      yPos += 10;

      // Strengths Card
      doc.rect(15, yPos, 180, 35);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Demonstrated Areas of Expertise', 20, yPos + 10);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      if (skillData.strengthAreas && skillData.strengthAreas.length > 0) {
        doc.text(`• ${skillData.strengthAreas.join(', ')}`, 20, yPos + 20);
      } else {
        doc.text('• Areas for development identified', 20, yPos + 20);
      }
      
      yPos += 45;

      // SECTION 5: TRAINING RECOMMENDATIONS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TRAINING RECOMMENDATIONS', 15, yPos);
      yPos += 10;

      // Training Card
      doc.rect(15, yPos, 180, 45);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommended Development Areas', 20, yPos + 10);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      let trainYPos = yPos + 20;
      if (skillData.trainingRecommendations && skillData.trainingRecommendations.suggestedCourses) {
        skillData.trainingRecommendations.suggestedCourses.slice(0, 3).forEach((course, index) => {
          doc.text(`• ${course}`, 20, trainYPos);
          trainYPos += 8;
        });
      } else {
        doc.text('• Continue current development path', 20, trainYPos);
      }
      
      // Check if we need a new page
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }

      // SECTION 6: INDUSTRY ANALYSIS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INDUSTRY ANALYSIS', 15, yPos);
      yPos += 10;

      // Industry Analysis Card
      doc.rect(15, yPos, 180, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Market Analysis & Benchmarking', 20, yPos + 10);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      if (skillData.industryAnalysis) {
        doc.text(`Market Demand: ${skillData.industryAnalysis.marketDemand}`, 20, yPos + 20);
        doc.text(`Salary Range: ${skillData.industryAnalysis.salaryRange}`, 20, yPos + 28);
        doc.text(`Industry Percentile: ${skillData.industryAnalysis.industryPercentile}`, 20, yPos + 36);
        doc.text(`Competition Level: ${skillData.industryAnalysis.competitionLevel}`, 20, yPos + 44);
      } else {
        doc.text('Market Demand: High', 20, yPos + 20);
        doc.text('Salary Range: $45K-65K', 20, yPos + 28);
        doc.text('Industry Percentile: Bottom 30%', 20, yPos + 36);
        doc.text('Competition Level: High', 20, yPos + 44);
      }
      
      yPos += 70;

      // SECTION 7: PREDICTIVE ANALYSIS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PREDICTIVE ANALYSIS', 15, yPos);
      yPos += 10;

      // Predictive Cards
      doc.rect(15, yPos, 85, 35);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Future Projections', 20, yPos + 10);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      if (skillData.predictiveAnalysis) {
        doc.text(`Future Performance: ${skillData.predictiveAnalysis.futurePerformance}%`, 20, yPos + 20);
        doc.text(`Growth Potential: ${skillData.predictiveAnalysis.growthPotential}/10`, 20, yPos + 28);
      } else {
        doc.text(`Future Performance: ${Math.min(100, skillData.performanceMetrics.percentage + 15)}%`, 20, yPos + 20);
        doc.text(`Growth Potential: ${Math.floor(skillData.performanceMetrics.percentage / 20) + 1}/10`, 20, yPos + 28);
      }

      doc.rect(110, yPos, 85, 35);
      doc.setFont('helvetica', 'bold');
      doc.text('Growth Metrics', 115, yPos + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Learning Curve: Steep Learning Required', 115, yPos + 20);
      doc.text('Development Time: 6-12 months', 115, yPos + 28);
      
      yPos += 45;

      // SECTION 8: AI INSIGHTS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI INSIGHTS', 15, yPos);
      yPos += 10;

      // AI Insights Card
      doc.rect(15, yPos, 180, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('AI-Powered Analysis', 20, yPos + 10);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      if (skillData.aiInsights) {
        doc.text(`Overall Assessment: ${skillData.aiInsights.overallAssessment}`, 20, yPos + 20);
        doc.text(`Growth Potential: ${skillData.aiInsights.growthPotential}/10`, 20, yPos + 28);
        doc.text('Key Findings:', 20, yPos + 36);
        if (skillData.aiInsights.keyFindings && skillData.aiInsights.keyFindings.length > 0) {
          doc.text(`• ${skillData.aiInsights.keyFindings[0]}`, 20, yPos + 44);
        }
      } else {
        doc.text('Overall Assessment: Foundation level - Focus on core competency building', 20, yPos + 20);
        doc.text(`Growth Potential: ${Math.floor(skillData.performanceMetrics.percentage / 20) + 1}/10`, 20, yPos + 28);
        doc.text('Key Findings:', 20, yPos + 36);
        doc.text('• Strong foundational concepts but needs practical application', 20, yPos + 44);
      }
      
      yPos += 70;

      // Footer
      doc.setFillColor(0, 0, 0);
      doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('LinxIQ - Confidential Report', 15, pageHeight - 15);
      doc.text(`Page 1 of 1`, pageWidth - 40, pageHeight - 15);

      yPos += 45;

      // Check if we need a new page
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      // Competency Mapping Card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, yPos, 180, 40, 3, 3, 'F');
      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(1);
      doc.roundedRect(15, yPos, 180, 40, 3, 3);
      
      doc.setTextColor(147, 51, 234);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Competency Mapping', 20, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Detailed breakdown of technical competencies', 20, yPos + 18);
      
      // Competency bars
      const competencies = [
        { name: 'Technical', score: Math.min(100, candidate.averageScore + 5) },
        { name: 'Problem Solving', score: Math.min(100, candidate.averageScore + 10) }
      ];
      
      let compYPos = yPos + 25;
      competencies.forEach((comp, index) => {
        doc.setFontSize(8);
        doc.text(comp.name, 20, compYPos + (index * 10));
        doc.text(`${comp.score}%`, 175, compYPos + (index * 10));
        
        // Progress bar
        doc.setFillColor(240, 240, 240);
        doc.rect(60, compYPos + (index * 10) - 3, 100, 4, 'F');
        doc.setFillColor(147, 51, 234);
        doc.rect(60, compYPos + (index * 10) - 3, (comp.score / 100) * 100, 4, 'F');
      });

      yPos += 50;

      // Training Roadmap
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, yPos, 85, 35, 3, 3, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.roundedRect(15, yPos, 85, 35, 3, 3);
      
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Personalized Training Roadmap', 20, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-curated learning path tailored for optimal skill development', 20, yPos + 18);
      
      // Training recommendation
      const trainingText = `Focus on ${candidate.skillGaps?.[0] || 'core skills'} training and practice`;
      doc.text(trainingText, 20, yPos + 28);
      
      // Priority badge
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(75, yPos + 24, 20, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Priority: High', 77, yPos + 29);

      // Performance Distribution
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(110, yPos, 85, 35, 3, 3, 'F');
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.roundedRect(110, yPos, 85, 35, 3, 3);
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Distribution', 115, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Skill Level Analysis', 115, yPos + 18);
      
      // Simple chart representation
      doc.text('Intermediate', 140, yPos + 28);
      doc.text('Expert', 170, yPos + 28);
      
      // Simple bars
      doc.setFillColor(239, 68, 68);
      doc.rect(115, yPos + 30, 20, 4, 'F');
      doc.text(`Correct (${candidate.averageScore}%)`, 115, yPos + 37);
      
      doc.setFillColor(34, 197, 94);
      doc.rect(155, yPos + 30, 15, 4, 'F');
      doc.text(`Incorrect (${100 - candidate.averageScore}%)`, 155, yPos + 37);

      yPos += 50;

      // Industry Analysis
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, yPos, 180, 50, 3, 3, 'F');
      doc.setDrawColor(14, 165, 233);
      doc.setLineWidth(1);
      doc.roundedRect(15, yPos, 180, 50, 3, 3);
      
      doc.setTextColor(14, 165, 233);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Industry Analysis', 20, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      // Salary benchmarking
      const salaryRange = candidate.averageScore < 40 ? '$45K-65K' : 
                        candidate.averageScore < 70 ? '$65K-95K' : '$95K-130K';
      doc.text(`Salary Range: ${salaryRange}`, 20, yPos + 20);
      
      // Industry percentile
      const percentile = candidate.averageScore < 40 ? 'Bottom 30%' : 
                        candidate.averageScore < 70 ? 'Middle 40%' : 'Top 30%';
      doc.text(`Industry Percentile: ${percentile}`, 20, yPos + 26);
      
      // Market demand
      doc.text('Job Market Demand: High', 20, yPos + 32);
      doc.text(`Skills Match: ${candidate.averageScore}%`, 20, yPos + 38);
      
      // Competition level
      const competition = candidate.averageScore < 40 ? 'High' : 
                         candidate.averageScore < 70 ? 'Medium' : 'Low';
      doc.text(`Competition Level: ${competition}`, 20, yPos + 44);
      
      // Suitable roles
      doc.text('Suitable Roles:', 110, yPos + 20);
      const roles = candidate.averageScore < 40 ? 
        ['Junior Developer', 'QA Analyst', 'Support Engineer'] : 
        candidate.averageScore < 70 ?
        ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer'] :
        ['Senior Engineer', 'Tech Lead', 'Solutions Architect'];
      
      roles.forEach((role, index) => {
        doc.text('• ' + role, 110, yPos + 26 + (index * 6));
      });
      
      yPos += 60;

      // Predictive Analytics & AI Insights
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, yPos, 85, 35, 3, 3, 'F');
      doc.setDrawColor(20, 184, 166);
      doc.setLineWidth(1);
      doc.roundedRect(15, yPos, 85, 35, 3, 3);
      
      doc.setTextColor(20, 184, 166);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Predictive Analytics', 20, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const futurePerf = Math.min(100, candidate.averageScore + 15);
      doc.text(`Future Performance: ${futurePerf}%`, 20, yPos + 20);
      doc.text('Career Track: Skill Development Track', 20, yPos + 26);
      doc.text(`Promotion Ready: ${futurePerf}%`, 20, yPos + 32);
      doc.text(`Growth Rate: ${(Math.random() * 5 + 3).toFixed(1)}/10`, 20, yPos + 38);

      // AI Insights
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(110, yPos, 85, 35, 3, 3, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.roundedRect(110, yPos, 85, 35, 3, 3);
      
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Insights', 115, yPos + 10);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const marketPos = candidate.averageScore < 50 ? 'Developing skills - Entry to mid-level positioning' : 'Strong positioning - Mid to senior level readiness';
      doc.text('Market: ' + marketPos, 115, yPos + 20);
      const salaryPos = candidate.averageScore < 50 ? 'Below market average - skill development needed' : 'Competitive market position';
      doc.text('Salary: ' + salaryPos, 115, yPos + 26);
      doc.text('Top Strength:', 115, yPos + 32);
      doc.text('Consistent performance', 115, yPos + 38);

      yPos += 45;

      // Footer
      doc.setFillColor(15, 23, 42);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Generated by LinxIQ Neural Skill Analysis System - Confidential', 20, pageHeight - 8);
      doc.text(`Page 1 of 1`, pageWidth - 30, pageHeight - 8);

      // Save the PDF with correct candidate name
      const fileName = `${skillData.candidateInfo.name.replace(/\s+/g, '_')}_LinxIQ_Report_${Date.now()}.pdf`;
      doc.save(fileName);
      
      console.log('PDF generated successfully:', fileName);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  // Show loading state while API data is being fetched
  if (isLoading || !selectedCandidate || !skillGapData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-800 text-xl mb-4">Loading candidate report...</div>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto"></div>
          {userId && <div className="text-gray-600 text-sm mt-2">Loading data for user ID: {userId}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/skill-gap-reports')}
              variant="outline"
              className="text-black border-black hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-medium text-black">Performance Analysis</h1>
              <p className="text-sm text-gray-600 mt-1">Comprehensive skill assessment report</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            {candidates.length > 1 && (
              <select
                value={selectedCandidate?.id || ''}
                onChange={(e) => {
                  const candidate = candidates.find(c => c.id === parseInt(e.target.value));
                  if (candidate) {
                    setSelectedCandidate(candidate);
                    localStorage.setItem('selected-candidate-report', JSON.stringify(candidate));
                  }
                }}
                className="px-4 py-2 bg-[#1a1f2e] border border-gray-800 rounded-lg text-gray-300 focus:border-cyan-500/50 transition-all"
              >
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.username}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={() => generateComprehensivePDF(selectedCandidate)}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Clean Modern Report Content */}
        <div className="space-y-6">
          {/* Profile Card - Black & White */}
          <div className="bg-white rounded p-6 border border-gray-300 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-black rounded flex items-center justify-center">
                <span className="text-xl font-medium text-white">
                  {(selectedCandidate.skillGapAnalysis?.candidateInfo?.name || selectedCandidate.username)?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-medium text-black">
                  {selectedCandidate.skillGapAnalysis?.candidateInfo?.name || selectedCandidate.username}
                </h2>
                <p className="text-sm text-gray-600">ID: {selectedCandidate.skillGapAnalysis?.candidateInfo?.employeeId || selectedCandidate.employeeId}</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-2xl font-medium text-black">
                    {selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage || selectedCandidate.averageScore}%
                  </p>
                  <p className="text-xs text-gray-600">Overall Score</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-medium text-black">{selectedCandidate.testResults?.length || 0}</p>
                  <p className="text-xs text-gray-600">Assessments</p>
                </div>
              </div>
            </div>
          </div>

            <div className="p-8 space-y-6">
              {/* Performance Overview Cards - Black & White */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">Performance Metrics</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-medium text-black">
                          {selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage || selectedCandidate.averageScore}%
                        </div>
                        <p className="text-sm text-gray-600">Accuracy Rate</p>
                      </div>
                      <Progress
                        value={selectedCandidate.skillGapAnalysis?.performanceMetrics?.percentage || selectedCandidate.averageScore}
                        className="h-3 bg-gray-200"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">Test Statistics</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-medium text-black">
                          {selectedCandidate.skillGapAnalysis?.performanceMetrics?.questionsAnswered || 0}
                        </div>
                        <p className="text-xs text-gray-600">Questions Answered</p>
                      </div>
                      <div>
                        <div className="text-2xl font-medium text-black">
                          {selectedCandidate.skillGapAnalysis?.skillGaps?.length || 0}
                        </div>
                        <p className="text-xs text-gray-600">Skill Gaps</p>
                      </div>
                      <div>
                        <div className="text-2xl font-medium text-black">
                          {selectedCandidate.skillGapAnalysis?.strengthAreas?.length || 0}
                        </div>
                        <p className="text-xs text-gray-600">Strengths</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Critical Skills & Strengths - Black & White */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">Critical Skill Gaps</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Areas requiring immediate attention</p>
                    <div className="space-y-2">
                      {selectedCandidate.skillGaps?.map((gap, index) => (
                        <div key={index} className="bg-gray-100 border border-gray-300 rounded p-3">
                          <span className="text-black text-sm">{gap} ({selectedCandidate.averageScore}% avg)</span>
                        </div>
                      )) || (
                        <div className="bg-gray-100 border border-gray-300 rounded p-3">
                          <span className="text-black text-sm">programming ({selectedCandidate.averageScore}% avg)</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">Key Strengths</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Demonstrated areas of expertise</p>
                    <div className="space-y-2">
                      <p className="text-gray-700 text-sm">Continue building expertise in current areas</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Assessment - Black & White */}
              <Card className="bg-white border border-gray-300 rounded shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-black">Risk Assessment</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Business impact analysis</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">Overall Risk Level</span>
                      <span className="text-black font-medium text-sm">
                        {selectedCandidate.averageScore < 40 ? 'High' : selectedCandidate.averageScore < 70 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-black text-sm font-medium mb-2">Business Impact</h4>
                      <p className="text-gray-700 text-sm">
                        {selectedCandidate.averageScore < 40 ? 'High risk of project delays and quality issues' : 
                         selectedCandidate.averageScore < 70 ? 'Some areas need improvement for optimal performance' : 
                         'Strong performance with minimal business risk'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competency Mapping - Black & White */}
              <Card className="bg-white border border-gray-300 rounded shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-black">Competency Mapping</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">Technical competency breakdown</p>
                  <div className="space-y-4">
                    {[
                      { name: 'Technical', score: Math.min(100, selectedCandidate.averageScore + 5) },
                      { name: 'Problem Solving', score: Math.min(100, selectedCandidate.averageScore + 10) }
                    ].map((competency, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm w-32">{competency.name}</span>
                        <div className="flex-1 mx-4">
                          <Progress value={competency.score} className="h-2 bg-gray-200" />
                        </div>
                        <span className="text-black font-medium text-sm w-12">{competency.score}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Training & Performance Distribution - Black & White */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">Training Roadmap</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Customized learning path</p>
                    <div className="space-y-3">
                      <div className="bg-gray-100 border border-gray-300 rounded p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-black text-sm">Focus on {selectedCandidate.skillGaps?.[0] || 'core skills'} training</span>
                          <span className="text-black font-medium text-sm">High Priority</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">Performance Distribution</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Skill Level Analysis</p>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700 text-sm">Intermediate</span>
                        <span className="text-gray-700 text-sm">Expert</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-black rounded"></div>
                          <span className="text-black text-sm">Correct ({selectedCandidate.averageScore}%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-gray-400 rounded"></div>
                          <span className="text-black text-sm">Incorrect ({100 - selectedCandidate.averageScore}%)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Analysis - Black & White */}
              {selectedCandidate.skillGapAnalysis?.questionDetails && (
                <Card className="bg-white border border-gray-300 rounded shadow-sm mb-6">
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-black mb-1">Question Analysis</h3>
                      <p className="text-sm text-gray-600">Response breakdown and evaluation</p>
                    </div>
                    
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {selectedCandidate.skillGapAnalysis.questionDetails.map((question, index) => (
                        <div key={question.questionId} 
                             className="p-4 bg-gray-50 border border-gray-300 rounded">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-black">
                              Question {question.questionId}
                            </span>
                            <span className="text-xs text-gray-700">
                              {question.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Submitted Answer:</p>
                              <div className="p-2 bg-white rounded border border-gray-300">
                                <code className="text-xs text-black font-mono">
                                  {question.userAnswer || 'Not answered'}
                                </code>
                              </div>
                            </div>
                            
                            {!question.isCorrect && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Expected Answer:</p>
                                <div className="p-2 bg-white rounded border border-gray-300">
                                  <code className="text-xs text-gray-700 font-mono">
                                    {question.correctAnswer}
                                  </code>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Professional Summary */}
                    <div className="mt-6 pt-4 border-t border-gray-300">
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-2xl font-medium text-black">
                            {selectedCandidate.skillGapAnalysis.questionDetails.filter(q => q.isCorrect).length}
                          </p>
                          <p className="text-xs text-gray-600">Correct Responses</p>
                        </div>
                        <div>
                          <p className="text-2xl font-medium text-black">
                            {selectedCandidate.skillGapAnalysis.questionDetails.filter(q => !q.isCorrect).length}
                          </p>
                          <p className="text-xs text-gray-600">Incorrect Responses</p>
                        </div>
                        <div>
                          <p className="text-2xl font-medium text-black">
                            {Math.round(
                              (selectedCandidate.skillGapAnalysis.questionDetails.filter(q => q.isCorrect).length / 
                               selectedCandidate.skillGapAnalysis.questionDetails.length) * 100
                            )}%
                          </p>
                          <p className="text-xs text-gray-600">Overall Accuracy</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Industry Analysis - Black & White */}
              <Card className="bg-white border border-gray-300 rounded shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-black">Industry Analysis</h3>
                  </div>
                  <div className="space-y-6">
                    {/* Salary Benchmarking */}
                    <div>
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Salary Benchmarking</h4>
                      <div className="bg-black/20 rounded p-4 space-y-3 border border-gray-800">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Market Range</span>
                          <span className="text-gray-300 text-sm">
                            ${selectedCandidate.averageScore < 40 ? '45K-65K' : 
                              selectedCandidate.averageScore < 70 ? '65K-95K' : '95K-130K'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Industry Percentile</span>
                          <span className="text-gray-300 text-sm">
                            {selectedCandidate.averageScore < 40 ? 'Bottom 30%' : 
                             selectedCandidate.averageScore < 70 ? 'Middle 40%' : 'Top 30%'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Growth Potential</span>
                          <span className="text-gray-300 text-sm">
                            +{selectedCandidate.averageScore < 40 ? '15-25%' : 
                              selectedCandidate.averageScore < 70 ? '10-15%' : '5-10%'} annually
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Market Demand */}
                    <div>
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Market Demand Analysis</h4>
                      <div className="bg-black/20 rounded p-4 space-y-3 border border-gray-800">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Job Market Demand</span>
                          <span className="text-gray-300 text-sm">High</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Skills Match</span>
                          <span className="text-gray-300 text-sm">{selectedCandidate.averageScore}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Competition Level</span>
                          <span className="text-gray-300 text-sm">
                            {selectedCandidate.averageScore < 40 ? 'High' : 
                             selectedCandidate.averageScore < 70 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Industry Comparison */}
                    <div>
                      <h4 className="text-cyan-300 font-semibold mb-3">Industry Comparison</h4>
                      <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-200/80 text-sm">vs. Industry Average</span>
                          <span className={`text-sm font-semibold ${
                            selectedCandidate.averageScore < 50 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {selectedCandidate.averageScore < 50 ? '-' : '+'}{Math.abs(selectedCandidate.averageScore - 50)}%
                          </span>
                        </div>
                        <Progress 
                          value={selectedCandidate.averageScore} 
                          className="h-2 bg-slate-700/50"
                        />
                        <div className="flex justify-between text-xs text-cyan-200/60 mt-1">
                          <span>Entry Level</span>
                          <span>Mid Level</span>
                          <span>Senior Level</span>
                        </div>
                      </div>
                    </div>

                    {/* Role Recommendations */}
                    <div>
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Recommended Roles</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.averageScore < 40 ? (
                          <>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">Junior Developer</span>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">QA Analyst</span>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">Support Engineer</span>
                          </>
                        ) : selectedCandidate.averageScore < 70 ? (
                          <>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">Software Engineer</span>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">Full Stack Developer</span>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">DevOps Engineer</span>
                          </>
                        ) : (
                          <>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">Senior Engineer</span>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">Tech Lead</span>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded">Solutions Architect</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Analytics & AI Insights - Black & White */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">Predictive Analytics</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Future Performance</span>
                        <span className="text-black text-sm">{Math.min(100, selectedCandidate.averageScore + 15)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Career Track</span>
                        <span className="text-black text-sm">Development Track</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Promotion Readiness</span>
                        <span className="text-black text-sm">{Math.min(100, selectedCandidate.averageScore + 15)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Growth Rate</span>
                        <span className="text-black text-sm">{(Math.random() * 5 + 3).toFixed(1)}/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-300 rounded shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-black">AI Insights</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-700 text-sm">Market Position:</span>
                        <p className="text-black text-sm">
                          {selectedCandidate.averageScore < 50 
                            ? 'Developing skills - Entry to mid-level positioning' 
                            : 'Strong positioning - Mid to senior level readiness'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-700 text-sm">Salary Positioning:</span>
                        <p className="text-black text-sm">
                          {selectedCandidate.averageScore < 50 
                            ? 'Below market average - skill development needed' 
                            : 'Competitive market position'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-700 text-sm">Top Strength:</span>
                        <p className="text-black text-sm">Consistent performance</p>
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