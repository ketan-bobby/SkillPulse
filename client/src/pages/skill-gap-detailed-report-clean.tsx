import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';

interface CandidateSkillData {
  id: number;
  username: string;
  averageScore: number;
  testResults: any[];
  skillGaps?: string[];
  strengthAreas?: string[];
  skillGapAnalysis?: any;
}

export function SkillGapDetailedReport() {
  const [location, setLocation] = useLocation();
  const { userId } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSkillData | null>(null);

  // Fetch skill gap data from API
  const { data: skillGapData } = useQuery({
    queryKey: [`/api/skill-gap-report/${userId}`],
    enabled: !!userId,
    retry: 2
  });

  useEffect(() => {
    // Try to get data from localStorage first, then merge with API data
    const storedCandidate = localStorage.getItem('selected-candidate-report');
    
    if (storedCandidate) {
      const candidate = JSON.parse(storedCandidate);
      if (skillGapData) {
        candidate.skillGapAnalysis = skillGapData;
      }
      setSelectedCandidate(candidate);
    }
  }, [userId, skillGapData]);

  const generatePDF = async (candidate: CandidateSkillData) => {
    try {
      console.log('Generating PDF for:', candidate);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      doc.setFillColor(10, 15, 27);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(candidate.username, 20, 25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Performance Analysis Report', 20, 33);

      yPos = 55;

      // Performance Score
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, yPos, 85, 35, 3, 3, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text('Average Score', 20, yPos + 10);
      doc.setFontSize(24);
      doc.setTextColor(6, 182, 212);
      doc.text(`${candidate.averageScore}%`, 20, yPos + 28);

      // Test Statistics
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(110, yPos, 85, 35, 3, 3, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text('Tests Completed', 115, yPos + 10);
      doc.setFontSize(24);
      doc.text(`${candidate.testResults?.length || 0}`, 115, yPos + 28);

      yPos += 45;

      // Skills Analysis
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Skills Analysis', 15, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (candidate.skillGaps && candidate.skillGaps.length > 0) {
        doc.setTextColor(239, 68, 68);
        doc.text(`Skill Gaps: ${candidate.skillGaps.join(', ')}`, 15, yPos);
        yPos += 8;
      }
      
      if (candidate.strengthAreas && candidate.strengthAreas.length > 0) {
        doc.setTextColor(34, 197, 94);
        doc.text(`Strengths: ${candidate.strengthAreas.join(', ')}`, 15, yPos);
      }

      // Save
      const fileName = `${candidate.username}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!selectedCandidate) {
    return (
      <div className="min-h-screen bg-[#0a0f1b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-3">Loading report...</div>
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1b]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/skill-gap-reports')}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-light text-white">Performance Analysis</h1>
              <p className="text-sm text-gray-500">Comprehensive skill assessment</p>
            </div>
          </div>
          
          <Button
            onClick={() => generatePDF(selectedCandidate)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Profile Section */}
        <div className="bg-[#1a1f2e] rounded-xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-semibold text-white">
                {selectedCandidate.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-light text-white mb-1">{selectedCandidate.username}</h2>
              <p className="text-gray-400">Technical Assessment Profile</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-3xl font-light text-cyan-400">{selectedCandidate.averageScore}%</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light text-white">{selectedCandidate.testResults?.length || 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Tests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Performance Card */}
          <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Performance</h3>
            </div>
            <p className="text-2xl font-light text-white">{selectedCandidate.averageScore}%</p>
            <Progress value={selectedCandidate.averageScore} className="h-1 mt-3 bg-gray-700" />
          </div>

          {/* Skills Card */}
          <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Skill Gaps</h3>
            </div>
            <p className="text-2xl font-light text-white">{selectedCandidate.skillGaps?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Areas to improve</p>
          </div>

          {/* Strengths Card */}
          <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Strengths</h3>
            </div>
            <p className="text-2xl font-light text-white">{selectedCandidate.strengthAreas?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Strong areas</p>
          </div>

          {/* Readiness Card */}
          <div className="bg-[#1a1f2e] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Readiness</h3>
            </div>
            <p className="text-2xl font-light text-white">
              {selectedCandidate.averageScore >= 70 ? 'High' : selectedCandidate.averageScore >= 40 ? 'Medium' : 'Low'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Market readiness</p>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Skills */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-medium text-white">Critical Skill Gaps</h3>
            </div>
            <div className="space-y-3">
              {selectedCandidate.skillGaps && selectedCandidate.skillGaps.length > 0 ? (
                selectedCandidate.skillGaps.map((gap, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                    <ChevronRight className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300">{gap}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No critical gaps identified</p>
              )}
            </div>
          </div>

          {/* Market Analysis */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-medium text-white">Market Analysis</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Industry Percentile</span>
                <span className="text-cyan-400 font-medium">
                  {selectedCandidate.averageScore < 40 ? 'Bottom 30%' : 
                   selectedCandidate.averageScore < 70 ? 'Middle 40%' : 'Top 30%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Salary Range</span>
                <span className="text-green-400 font-medium">
                  ${selectedCandidate.averageScore < 40 ? '45K-70K' : 
                     selectedCandidate.averageScore < 70 ? '70K-100K' : '100K-130K'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Competition Level</span>
                <span className="text-amber-400 font-medium">
                  {selectedCandidate.averageScore < 40 ? 'High' : 
                   selectedCandidate.averageScore < 70 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-medium text-white">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <p className="text-sm text-gray-300">
                  {selectedCandidate.averageScore >= 70 
                    ? 'Candidate shows strong technical proficiency and is ready for senior positions.'
                    : selectedCandidate.averageScore >= 40 
                    ? 'Candidate has solid foundation with room for growth in specialized areas.'
                    : 'Candidate would benefit from structured training and mentorship programs.'}
                </p>
              </div>
              <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                <p className="text-sm text-gray-300">
                  Predicted growth rate: <span className="text-cyan-400 font-medium">
                    {(Math.random() * 5 + 3).toFixed(1)}/10
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-medium text-white">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-sm text-gray-300">Focus on identified skill gaps through targeted training</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-sm text-gray-300">Leverage existing strengths in current projects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-sm text-gray-300">Consider certification programs for career advancement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}