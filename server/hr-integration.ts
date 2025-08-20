import { storage } from "./storage";
import { InsertEmployeeProfile, InsertPerformanceReview, InsertLearningPath } from "@shared/schema";

// HR Platform Integration Interface
export interface HRPlatformIntegration {
  platform: string;
  authenticate(apiKey: string, endpoint: string): Promise<boolean>;
  syncEmployees(mapping: FieldMapping): Promise<EmployeeData[]>;
  createWebhook(webhookUrl: string): Promise<string>;
  syncPerformanceData(employeeId: string): Promise<PerformanceData>;
}

export interface FieldMapping {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  managerId: string;
  hireDate: string;
  location: string;
}

export interface EmployeeData {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  managerId?: string;
  hireDate: string;
  location: string;
  skills?: string[];
  level?: string;
}

export interface PerformanceData {
  employeeId: string;
  reviewPeriod: string;
  goals: any[];
  competencies: Record<string, number>;
  overallRating: number;
  developmentPlan: string;
}

// Workday Integration
export class WorkdayIntegration implements HRPlatformIntegration {
  platform = "workday";

  async authenticate(apiKey: string, endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(`${endpoint}/auth/validate`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async syncEmployees(mapping: FieldMapping): Promise<EmployeeData[]> {
    // Mock implementation - replace with actual Workday API calls
    return [
      {
        employeeId: "WD001",
        name: "John Doe",
        email: "john.doe@company.com",
        department: "Engineering",
        jobTitle: "Senior Software Engineer",
        managerId: "WD002",
        hireDate: "2023-01-15",
        location: "San Francisco",
        skills: ["JavaScript", "React", "Node.js"],
        level: "senior"
      }
    ];
  }

  async createWebhook(webhookUrl: string): Promise<string> {
    return "webhook-id-123";
  }

  async syncPerformanceData(employeeId: string): Promise<PerformanceData> {
    return {
      employeeId,
      reviewPeriod: "Q4-2024",
      goals: [
        { goal: "Improve React skills", progress: 85, target: 100 },
        { goal: "Lead team project", progress: 70, target: 100 }
      ],
      competencies: {
        "technical": 4.2,
        "leadership": 3.8,
        "communication": 4.0
      },
      overallRating: 4.0,
      developmentPlan: "Focus on advanced system design and team leadership"
    };
  }
}

// BambooHR Integration
export class BambooHRIntegration implements HRPlatformIntegration {
  platform = "bamboohr";

  async authenticate(apiKey: string, endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(`${endpoint}/v1/employees/directory`, {
        headers: { 'Authorization': `Basic ${Buffer.from(apiKey + ':x').toString('base64')}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async syncEmployees(mapping: FieldMapping): Promise<EmployeeData[]> {
    // Mock implementation for BambooHR
    return [];
  }

  async createWebhook(webhookUrl: string): Promise<string> {
    return "bamboo-webhook-456";
  }

  async syncPerformanceData(employeeId: string): Promise<PerformanceData> {
    return {
      employeeId,
      reviewPeriod: "2024-Annual",
      goals: [],
      competencies: {},
      overallRating: 0,
      developmentPlan: ""
    };
  }
}

// HR Integration Service
export class HRIntegrationService {
  private integrations: Map<string, HRPlatformIntegration> = new Map();

  constructor() {
    this.integrations.set("workday", new WorkdayIntegration());
    this.integrations.set("bamboohr", new BambooHRIntegration());
  }

  async setupIntegration(
    organizationId: string,
    platform: string,
    apiEndpoint: string,
    apiKey: string,
    fieldMappings: FieldMapping,
    webhookUrl?: string
  ) {
    const integration = this.integrations.get(platform);
    if (!integration) {
      throw new Error(`Unsupported HR platform: ${platform}`);
    }

    // Test authentication
    const isAuthenticated = await integration.authenticate(apiKey, apiEndpoint);
    if (!isAuthenticated) {
      throw new Error("Authentication failed with HR platform");
    }

    // Create webhook if provided
    let webhookId: string | undefined;
    if (webhookUrl) {
      webhookId = await integration.createWebhook(webhookUrl);
    }

    // Store integration configuration
    const hrIntegration = await storage.createHrIntegration({
      organizationId,
      platform,
      apiEndpoint,
      apiKey, // In production, encrypt this
      webhookUrl: webhookId ? webhookUrl : undefined,
      fieldMappings: fieldMappings as any,
      syncEnabled: true,
      syncFrequency: "daily",
      isActive: true
    });

    return hrIntegration;
  }

  async syncEmployeeData(hrIntegrationId: number) {
    const hrIntegration = await storage.getHrIntegration(hrIntegrationId);
    if (!hrIntegration || !hrIntegration.isActive) {
      throw new Error("HR integration not found or inactive");
    }

    const integration = this.integrations.get(hrIntegration.platform);
    if (!integration) {
      throw new Error(`Unsupported HR platform: ${hrIntegration.platform}`);
    }

    const employees = await integration.syncEmployees(hrIntegration.fieldMappings as FieldMapping);
    
    // Sync employees to our system
    for (const empData of employees) {
      // Check if user exists
      let user = await storage.getUserByUsername(empData.email);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: empData.email,
          password: "temp-password", // Should be changed on first login
          name: empData.name,
          role: "employee",
          position: empData.level || "junior",
          domain: "programming" // Default, can be updated
        });
      }

      // Create or update employee profile
      const existingProfile = await storage.getEmployeeProfileByUserId(user.id);
      if (existingProfile) {
        await storage.updateEmployeeProfile(existingProfile.id, {
          employeeId: empData.employeeId,
          department: empData.department,
          jobTitle: empData.jobTitle,
          location: empData.location,
          hrSystemId: empData.employeeId,
          lastSyncAt: new Date()
        });
      } else {
        await storage.createEmployeeProfile({
          userId: user.id,
          employeeId: empData.employeeId,
          department: empData.department,
          jobTitle: empData.jobTitle,
          hireDate: empData.hireDate,
          skillMatrix: empData.skills ? { skills: empData.skills } : {},
          careerTrack: "ic",
          level: empData.level || "junior",
          location: empData.location,
          hrSystemId: empData.employeeId
        });
      }
    }

    // Update last sync time
    await storage.updateHrIntegration(hrIntegrationId, {
      lastSync: new Date()
    });

    return employees.length;
  }

  async syncPerformanceReviews(hrIntegrationId: number, employeeIds: string[]) {
    const hrIntegration = await storage.getHrIntegration(hrIntegrationId);
    if (!hrIntegration) {
      throw new Error("HR integration not found");
    }

    const integration = this.integrations.get(hrIntegration.platform);
    if (!integration) {
      throw new Error(`Unsupported HR platform: ${hrIntegration.platform}`);
    }

    for (const employeeId of employeeIds) {
      const perfData = await integration.syncPerformanceData(employeeId);
      
      // Find user by employee ID
      const employeeProfile = await storage.getEmployeeProfileByEmployeeId(employeeId);
      if (!employeeProfile) continue;

      // Create performance review
      await storage.createPerformanceReview({
        employeeId: employeeProfile.userId,
        reviewerId: 1, // Default reviewer, should be mapped from HR data
        reviewPeriod: perfData.reviewPeriod,
        skillAssessments: {},
        goals: perfData.goals,
        competencyScores: perfData.competencies,
        overallRating: perfData.overallRating.toString(),
        developmentPlan: perfData.developmentPlan,
        hrSystemId: employeeId,
        status: "completed"
      });
    }
  }

  async createLearningPath(employeeId: number, targetRole: string, requiredSkills: string[]) {
    const skillsData = requiredSkills.map(skill => ({
      skill,
      currentLevel: 0,
      targetLevel: 5,
      progress: 0
    }));

    const milestones = [
      { name: "Complete foundational assessments", completed: false, dueDate: "2025-03-01" },
      { name: "Mid-level skill validation", completed: false, dueDate: "2025-06-01" },
      { name: "Advanced capabilities demonstration", completed: false, dueDate: "2025-09-01" }
    ];

    return await storage.createLearningPath({
      employeeId,
      pathName: `Path to ${targetRole}`,
      targetRole,
      requiredSkills: skillsData,
      currentProgress: { completedSkills: 0, totalSkills: requiredSkills.length },
      milestones,
      estimatedCompletion: "2025-12-31",
      assignedBy: 1, // Should be the manager or admin
      status: "active"
    });
  }
}

export const hrService = new HRIntegrationService();