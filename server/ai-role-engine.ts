import OpenAI from "openai";
import { Role, ROLES, PERMISSIONS, hasPermission } from "@shared/roles";
import { storage } from "./storage";
import { User, Test, Question, TestResult, PerformanceReview, LearningPath } from "@shared/schema";

// Primary AI: Grok AI
const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

// Fallback AI: OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// AI Service with automatic fallback
async function callAI(messages: any[], options: any = {}) {
  try {
    // Try Grok AI first
    if (process.env.XAI_API_KEY) {
      console.log("Using Grok AI (primary)");
      return await grok.chat.completions.create({
        model: "grok-2-1212",
        messages,
        ...options
      });
    }
  } catch (error) {
    console.log("Grok AI failed, falling back to OpenAI:", (error as Error).message);
  }

  // Fallback to OpenAI
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log("Using OpenAI (fallback)");
      return await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        ...options
      });
    }
  } catch (error) {
    console.log("OpenAI also failed:", (error as Error).message);
    throw new Error("Both Grok AI and OpenAI are unavailable. Please check API keys.");
  }

  throw new Error("No AI service available. Please configure XAI_API_KEY or OPENAI_API_KEY.");
}

export interface AIRoleContext {
  user: User;
  role: Role;
  teamMembers?: User[];
  historicalData?: any;
}

// AI-Enhanced Role Capabilities
export class AIRoleEngine {
  
  // Super Admin AI Features
  async generateSystemInsights(context: AIRoleContext) {
    const allUsers = await storage.getAllUsers();
    const allResults = await storage.getAllTestResults();
    
    const prompt = `Analyze this assessment platform data and provide strategic insights:
    - Total users: ${allUsers.length}
    - Role distribution: ${JSON.stringify(this.getRoleDistribution(allUsers))}
    - Test completion rate: ${this.calculateCompletionRate(allResults)}
    - Average scores by domain: ${JSON.stringify(await this.getAverageScoresByDomain())}
    
    Provide:
    1. Platform health assessment
    2. Skill gap analysis across the organization
    3. Recommendations for platform optimization
    4. Predictive insights on talent development needs
    
    Format as JSON with sections: health_score, skill_gaps, recommendations, predictions`;

    const response = await callAI([{ role: "user", content: prompt }], {
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Admin AI Features
  async generateTestRecommendations(domain: string, level: string) {
    const prompt = `As an assessment platform admin, recommend optimal test configuration for:
    Domain: ${domain}
    Level: ${level}
    
    Provide recommendations for:
    1. Ideal number of questions per topic
    2. Question difficulty distribution
    3. Time allocation
    4. Passing score threshold
    5. Skills to evaluate
    
    Format as JSON with detailed recommendations`;

    const response = await callAI([{ role: "user", content: prompt }], {
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // HR Manager AI Features
  async generateTalentAnalytics(departmentFilter?: string) {
    const users = await storage.getAllUsers();
    const results = await storage.getAllTestResults();
    
    const prompt = `Analyze talent data for HR insights:
    Department filter: ${departmentFilter || 'All departments'}
    Employee data: ${JSON.stringify(users.slice(0, 10))} // Sample data
    Performance data: ${JSON.stringify(results.slice(0, 10))} // Sample data
    
    Generate HR analytics including:
    1. Talent distribution by skills and levels
    2. Department-wise competency analysis
    3. Succession planning recommendations
    4. Training needs identification
    5. Retention risk analysis
    
    Format as comprehensive JSON report`;

    const response = await callAI([{ role: "user", content: prompt }], {
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async generateHiringRecommendations(role: string, requiredSkills: string[]) {
    const prompt = `Generate hiring recommendations for:
    Role: ${role}
    Required Skills: ${requiredSkills.join(", ")}
    
    Provide:
    1. Ideal candidate profile
    2. Assessment strategy
    3. Interview question suggestions
    4. Red flags to watch for
    5. Onboarding recommendations
    
    Format as actionable JSON guide`;

    const response = await callAI([{ role: "user", content: prompt }], {
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Reviewer AI Features
  async analyzeQuestionQuality(question: Question) {
    const prompt = `Analyze this technical assessment question:
    Type: ${question.type}
    Question: ${question.question}
    Options: ${JSON.stringify(question.options)}
    Difficulty: ${question.difficulty}
    Tags: ${question.tags?.join(", ")}
    
    Evaluate:
    1. Clarity and unambiguity
    2. Technical accuracy
    3. Difficulty appropriateness
    4. Answer option quality (for MCQ)
    5. Real-world relevance
    
    Provide quality score (0-100) and improvement suggestions in JSON`;

    const response = await callAI([{ role: "user", content: prompt }], {
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async suggestQuestionImprovements(question: Question) {
    const prompt = `Suggest improvements for this question:
    ${JSON.stringify(question)}
    
    Provide:
    1. Improved question text
    2. Better answer options (if MCQ)
    3. Enhanced explanation
    4. Additional test cases (if coding)
    5. Accessibility improvements
    
    Format as JSON with before/after comparisons`;

    const response = await callAI([{ role: "user", content: prompt }], {
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Team Lead AI Features
  async generateTeamPerformanceReport(teamLeadId: number) {
    const teamMembers = await this.getTeamMembers(teamLeadId);
    const teamResults = await this.getTeamResults(teamMembers);
    
    const prompt = `Generate team performance analysis:
    Team size: ${teamMembers.length}
    Team composition: ${JSON.stringify(this.getTeamComposition(teamMembers))}
    Recent results: ${JSON.stringify(teamResults.slice(0, 5))}
    
    Provide insights on:
    1. Team skill distribution and gaps
    2. Individual performance trends
    3. Collaboration opportunities
    4. Mentoring recommendations
    5. Team development priorities
    
    Format as actionable JSON report`;

    const response = await callAI([{ role: "user", content: prompt }], {
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async generateMentoringPlan(mentorId: number, menteeId: number) {
    const mentor = await storage.getUser(mentorId);
    const mentee = await storage.getUser(menteeId);
    const menteeResults = await storage.getUserResults(menteeId);
    
    const prompt = `Create personalized mentoring plan:
    Mentor: ${mentor?.name} (${mentor?.position}, ${mentor?.experience} years)
    Mentee: ${mentee?.name} (${mentee?.position}, ${mentee?.experience} years)
    Mentee skills: ${mentee?.skills?.join(", ")}
    Recent performance: ${JSON.stringify(menteeResults.slice(0, 3))}
    
    Generate:
    1. Skill development roadmap
    2. Weekly mentoring topics
    3. Hands-on project suggestions
    4. Progress milestones
    5. Success metrics
    
    Format as structured JSON mentoring plan`;

    const response = await callAI({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Employee AI Features
  async generatePersonalizedLearningPath(userId: number) {
    const user = await storage.getUser(userId);
    const results = await storage.getUserResults(userId);
    const profile = await storage.getEmployeeProfileByUserId(userId);
    
    const prompt = `Create personalized learning path for:
    Employee: ${user?.name}
    Current role: ${user?.position}
    Experience: ${user?.experience} years
    Skills: ${user?.skills?.join(", ")}
    Recent test scores: ${JSON.stringify(results.map(r => ({ domain: r.testId, score: r.score })))}
    Career goal: ${profile?.careerGoals || 'Not specified'}
    
    Generate:
    1. Skill gap analysis
    2. Learning objectives (short/medium/long term)
    3. Recommended courses/certifications
    4. Practice project ideas
    5. Timeline with milestones
    
    Format as comprehensive JSON learning plan`;

    const response = await callAI({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  async generateTestPreparationGuide(testId: number, userId: number) {
    const test = await storage.getTest(testId);
    const userHistory = await storage.getUserResults(userId);
    
    const prompt = `Create test preparation guide:
    Test: ${test?.title}
    Domain: ${test?.domain}
    Level: ${test?.level}
    Duration: ${test?.duration} minutes
    User's previous performance: ${JSON.stringify(userHistory.filter(r => r.testId === testId))}
    
    Provide:
    1. Key topics to review
    2. Estimated preparation time
    3. Practice question types
    4. Common pitfalls to avoid
    5. Test-taking strategies
    
    Format as structured JSON guide`;

    const response = await callAI({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Candidate AI Features
  async generateCandidateInsights(candidateId: number) {
    const candidate = await storage.getUser(candidateId);
    const results = await storage.getUserResults(candidateId);
    
    const prompt = `Generate candidate assessment insights:
    Candidate profile: ${JSON.stringify({
      name: candidate?.name,
      experience: candidate?.experience,
      skills: candidate?.skills
    })}
    Test results: ${JSON.stringify(results)}
    
    Analyze:
    1. Technical competency assessment
    2. Strengths and improvement areas
    3. Role fit analysis
    4. Comparison with role requirements
    5. Development potential
    
    Format as comprehensive JSON assessment`;

    const response = await callAI({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  // Helper methods
  private getRoleDistribution(users: User[]) {
    return users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateCompletionRate(results: TestResult[]) {
    if (results.length === 0) return 0;
    const completed = results.filter(r => r.completedAt).length;
    return Math.round((completed / results.length) * 100);
  }

  private async getAverageScoresByDomain() {
    const results = await storage.getAllTestResults();
    const scoresByDomain: Record<string, { total: number; count: number }> = {};
    
    for (const result of results) {
      const test = await storage.getTest(result.testId);
      if (test) {
        if (!scoresByDomain[test.domain]) {
          scoresByDomain[test.domain] = { total: 0, count: 0 };
        }
        scoresByDomain[test.domain].total += result.score;
        scoresByDomain[test.domain].count += 1;
      }
    }
    
    return Object.entries(scoresByDomain).reduce((acc, [domain, data]) => {
      acc[domain] = Math.round(data.total / data.count);
      return acc;
    }, {} as Record<string, number>);
  }

  private async getTeamMembers(teamLeadId: number): Promise<User[]> {
    const allUsers = await storage.getAllUsers();
    return allUsers.filter(u => u.managerId === teamLeadId);
  }

  private async getTeamResults(teamMembers: User[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    for (const member of teamMembers) {
      const memberResults = await storage.getUserResults(member.id);
      results.push(...memberResults);
    }
    return results;
  }

  private getTeamComposition(teamMembers: User[]) {
    return {
      byLevel: teamMembers.reduce((acc, m) => {
        acc[m.position || 'unspecified'] = (acc[m.position || 'unspecified'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDomain: teamMembers.reduce((acc, m) => {
        acc[m.domain || 'unspecified'] = (acc[m.domain || 'unspecified'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Real-time AI Assistance
  async provideRealTimeAssistance(userId: number, context: string) {
    const user = await storage.getUser(userId);
    const role = user?.role as Role;
    
    const roleContext = {
      [ROLES.SUPER_ADMIN]: "system optimization and strategic decisions",
      [ROLES.ADMIN]: "test management and platform administration",
      [ROLES.HR_MANAGER]: "talent management and employee development",
      [ROLES.REVIEWER]: "question quality and test effectiveness",
      [ROLES.TEAM_LEAD]: "team performance and mentoring",
      [ROLES.EMPLOYEE]: "skill development and career growth",
      [ROLES.CANDIDATE]: "test preparation and performance"
    };
    
    const prompt = `Provide real-time assistance for a ${role} user.
    Context: ${context}
    Focus area: ${roleContext[role]}
    
    Provide immediate, actionable advice in JSON format.`;

    const response = await callAI({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }
}

export const aiRoleEngine = new AIRoleEngine();