import { 
  users, tests, questions, testAssignments, testSessions, testResults, candidateFeedback, notifications, activityLogs,
  hrIntegrations, employeeProfiles, performanceReviews, learningPaths,
  companies, departments, subCompanies, projects, employeeGroups, groupMembers, groupTestAssignments,
  type User, type InsertUser, type Test, type InsertTest,
  type Question, type InsertQuestion, type TestAssignment, type InsertTestAssignment,
  type TestSession, type InsertTestSession, type TestResult, type InsertTestResult,
  type HrIntegration, type InsertHrIntegration, type EmployeeProfile, type InsertEmployeeProfile,
  type PerformanceReview, type InsertPerformanceReview, type LearningPath, type InsertLearningPath,
  type Company, type InsertCompany, type Department, type InsertDepartment, 
  type SubCompany, type InsertSubCompany, type Project, type InsertProject,
  type EmployeeGroup, type InsertEmployeeGroup, type GroupMember, type InsertGroupMember,
  type GroupTestAssignment, type InsertGroupTestAssignment, type ActivityLog, type InsertActivityLog
} from "@shared/schema";
import { db } from "./db";
import { executeRead, executeWrite } from "./db-wrapper";
import { eq, and, desc, asc, inArray, sql, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company>;
  toggleCompanyStatus(id: number, isActive: boolean): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
  
  // Department operations  
  getDepartments(companyId?: number): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, updates: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;
  
  // Sub-company operations
  getSubCompanies(parentCompanyId?: number): Promise<SubCompany[]>;
  getSubCompany(id: number): Promise<SubCompany | undefined>;
  createSubCompany(subCompany: InsertSubCompany): Promise<SubCompany>;
  
  // Project operations
  getProjects(companyId?: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateUserPhoto(id: number, photoUrl: string): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllQuestions(): Promise<Question[]>;
  deleteQuestion(id: number): Promise<void>;
  
  // Test operations
  getTests(): Promise<Test[]>;
  getTest(id: number): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  getTestsByDomainAndLevel(domain: string, level: string): Promise<Test[]>;
  deleteTest(id: number): Promise<void>;
  
  // Question operations
  getQuestions(testId: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getPendingQuestions(): Promise<Question[]>;
  updateQuestionStatus(id: number, status: string, reviewedBy: number): Promise<Question>;
  updateQuestion(id: number, questionData: Partial<InsertQuestion>): Promise<Question>;
  addQuestionsToTest(testId: number, questions: any[]): Promise<any>;
  assignQuestionsToTest(testId: number, questionIds: number[]): Promise<any>;
  copyTest(testId: number): Promise<any>;
  
  // Employee Group operations
  getEmployeeGroups(projectId?: number): Promise<EmployeeGroup[]>;
  createEmployeeGroup(group: InsertEmployeeGroup): Promise<EmployeeGroup>;
  getEmployeeGroup(id: number): Promise<EmployeeGroup | undefined>;
  updateEmployeeGroup(id: number, updates: Partial<InsertEmployeeGroup>): Promise<EmployeeGroup>;
  deleteEmployeeGroup(id: number): Promise<void>;
  
  // Group member operations
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: number): Promise<void>;
  addGroupMembers(groupId: number, userIds: number[], addedBy: number): Promise<GroupMember[]>;
  
  // Group test assignment operations
  createGroupTestAssignment(assignment: InsertGroupTestAssignment): Promise<GroupTestAssignment>;
  getGroupTestAssignments(groupId?: number): Promise<GroupTestAssignment[]>;
  updateGroupTestAssignmentStatus(id: number, status: string): Promise<GroupTestAssignment>;
  
  // Test assignment operations
  getUserAssignments(userId: number): Promise<TestAssignment[]>;
  getAllAssignments(): Promise<TestAssignment[]>;
  createAssignment(assignment: InsertTestAssignment): Promise<TestAssignment>;
  getAssignment(id: number): Promise<TestAssignment | undefined>;
  updateAssignmentStatus(id: number, status: string): Promise<TestAssignment>;
  
  // Test session operations
  createSession(session: InsertTestSession): Promise<TestSession>;
  getSession(id: number): Promise<TestSession | undefined>;
  updateSession(id: number, updates: Partial<TestSession>): Promise<TestSession>;
  getActiveSession(userId: number, testId: number): Promise<TestSession | undefined>;
  
  // Test result operations
  createResult(result: InsertTestResult): Promise<TestResult>;
  getUserResults(userId: number): Promise<TestResult[]>;
  getResult(id: number): Promise<TestResult | undefined>;
  getAllTestResults(): Promise<TestResult[]>;
  updateTestResult(id: number, updates: Partial<TestResult>): Promise<TestResult>;
  
  // HR Integration operations
  createHrIntegration(integration: InsertHrIntegration): Promise<HrIntegration>;
  getHrIntegration(id: number): Promise<HrIntegration | undefined>;
  updateHrIntegration(id: number, updates: Partial<HrIntegration>): Promise<HrIntegration>;
  
  // Employee Profile operations
  createEmployeeProfile(profile: InsertEmployeeProfile): Promise<EmployeeProfile>;
  getEmployeeProfileByUserId(userId: number): Promise<EmployeeProfile | undefined>;
  getEmployeeProfileByEmployeeId(employeeId: string): Promise<EmployeeProfile | undefined>;
  updateEmployeeProfile(id: number, updates: Partial<EmployeeProfile>): Promise<EmployeeProfile>;
  
  // Performance Review operations
  createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview>;
  getPerformanceReviews(employeeId: number): Promise<PerformanceReview[]>;
  updatePerformanceReview(id: number, updates: Partial<PerformanceReview>): Promise<PerformanceReview>;
  
  // Learning Path operations
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  getLearningPaths(employeeId: number): Promise<LearningPath[]>;
  updateLearningPath(id: number, updates: Partial<LearningPath>): Promise<LearningPath>;
  
  // Feedback operations
  createFeedback(feedback: any): Promise<any>;
  getFeedback(filters: any): Promise<any[]>;
  getFeedbackAnalytics(): Promise<any>;
  
  // Notification operations
  getNotificationsForUser(userId: number): Promise<any[]>;
  markNotificationAsRead(notificationId: number, userId: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(notificationId: number, userId: number): Promise<void>;
  
  // Activity Log operations
  logActivity(activityData: any): Promise<ActivityLog>;
  getActivityLogs(filters?: any): Promise<ActivityLog[]>;
  clearActivityLogs(): Promise<void>;
  isActivityLogsCleared(): Promise<boolean>;
  exportActivityLogs(): Promise<ActivityLog[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return await executeWrite(async () => {
      const result = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return result[0];
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await executeRead(async () => {
      return await db.select().from(users).orderBy(users.username);
    });
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPhoto(id: number, photoUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ profilePhoto: photoUrl })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(companies.name);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async toggleCompanyStatus(id: number, isActive: boolean): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ isActive })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async deleteCompany(id: number): Promise<void> {
    // First, remove company reference from all users in this company
    await db.update(users)
      .set({ companyId: null })
      .where(eq(users.companyId, id));
    
    // Delete all sub-companies associated with this parent company
    await db.delete(subCompanies).where(eq(subCompanies.parentCompanyId, id));
    
    // Delete all projects associated with this company
    await db.delete(projects).where(eq(projects.companyId, id));
    
    // Delete all employee groups associated with this company
    await db.delete(employeeGroups).where(eq(employeeGroups.companyId, id));
    
    // Delete all departments associated with this company
    await db.delete(departments).where(eq(departments.companyId, id));
    
    // Finally delete the company itself
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Department operations
  async getDepartments(companyId?: number): Promise<Department[]> {
    if (companyId) {
      return await db.select().from(departments)
        .where(eq(departments.companyId, companyId))
        .orderBy(departments.name);
    }
    return await db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const result = await db
      .insert(departments)
      .values(insertDepartment)
      .returning();
    return result[0];
  }

  async updateDepartment(id: number, updates: Partial<InsertDepartment>): Promise<Department> {
    const [department] = await db
      .update(departments)
      .set(updates)
      .where(eq(departments.id, id))
      .returning();
    return department;
  }

  async deleteDepartment(id: number): Promise<void> {
    // Hard delete the department from database
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Department employee operations
  async getDepartmentEmployees(departmentId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.departmentId, departmentId))
      .orderBy(users.name);
  }

  async getUnassignedEmployees(companyId?: number): Promise<User[]> {
    if (companyId) {
      return await db
        .select()
        .from(users)
        .where(and(eq(users.companyId, companyId), isNull(users.departmentId)))
        .orderBy(users.name);
    }
    return await db
      .select()
      .from(users)
      .where(isNull(users.departmentId))
      .orderBy(users.name);
  }

  async assignEmployeesToDepartment(employeeIds: number[], departmentId: number): Promise<User[]> {
    await db
      .update(users)
      .set({ departmentId })
      .where(inArray(users.id, employeeIds));
    
    return await db
      .select()
      .from(users)
      .where(inArray(users.id, employeeIds));
  }

  async removeEmployeeFromDepartment(employeeId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ departmentId: null })
      .where(eq(users.id, employeeId))
      .returning();
    return user;
  }

  // Sub-company operations
  async getSubCompanies(parentCompanyId?: number): Promise<SubCompany[]> {
    if (parentCompanyId) {
      return await db.select().from(subCompanies)
        .where(and(eq(subCompanies.parentCompanyId, parentCompanyId), eq(subCompanies.isActive, true)))
        .orderBy(subCompanies.name);
    }
    return await db.select().from(subCompanies).where(eq(subCompanies.isActive, true)).orderBy(subCompanies.name);
  }

  async getSubCompany(id: number): Promise<SubCompany | undefined> {
    const [subCompany] = await db.select().from(subCompanies).where(eq(subCompanies.id, id));
    return subCompany || undefined;
  }

  async createSubCompany(insertSubCompany: InsertSubCompany): Promise<SubCompany> {
    const [subCompany] = await db
      .insert(subCompanies)
      .values(insertSubCompany)
      .returning();
    return subCompany;
  }

  async getAllQuestions(): Promise<Question[]> {
    const result = await db
      .select({
        id: questions.id,
        testId: questions.testId,
        type: questions.type,
        question: questions.question,
        options: questions.options,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
        weightage: questions.weightage,
        status: questions.status,
        reviewedBy: questions.reviewedBy,
        reviewedAt: questions.reviewedAt,
        tags: questions.tags,
        codeLanguage: questions.codeLanguage,
        timeLimit: questions.timeLimit,
        createdBy: questions.createdBy,
        createdAt: questions.createdAt,
        creatorName: users.name,
        creatorUsername: users.username,
        creatorRole: users.role,
      })
      .from(questions)
      .leftJoin(users, eq(questions.createdBy, users.id))
      .orderBy(desc(questions.createdAt));
    
    return result as Question[];
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Test operations
  async getTests(): Promise<Test[]> {
    return await executeRead(async () => {
      return await db.select().from(tests).where(eq(tests.isActive, true)).orderBy(asc(tests.title));
    });
  }

  async getTest(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test || undefined;
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const [test] = await db
      .insert(tests)
      .values(insertTest)
      .returning();
    return test;
  }

  async updateTest(id: number, updates: Partial<InsertTest>): Promise<Test> {
    const [test] = await db
      .update(tests)
      .set(updates)
      .where(eq(tests.id, id))
      .returning();
    return test;
  }

  async getTestsByDomainAndLevel(domain: string, level: string): Promise<Test[]> {
    return await db
      .select()
      .from(tests)
      .where(and(
        eq(tests.domain, domain),
        eq(tests.level, level),
        eq(tests.isActive, true)
      ));
  }

  async deleteTest(id: number): Promise<void> {
    // Delete all related records in the correct order due to foreign key constraints
    
    // 1. First delete test results (they reference test sessions)
    await db.delete(testResults)
      .where(
        sql`session_id IN (SELECT id FROM ${testSessions} WHERE test_id = ${id})`
      );
    
    // 2. Then delete test sessions
    await db.delete(testSessions).where(eq(testSessions.testId, id));
    
    // 3. Delete test assignments
    await db.delete(testAssignments).where(eq(testAssignments.testId, id));
    
    // 4. Delete group test assignments
    await db.delete(groupTestAssignments).where(eq(groupTestAssignments.testId, id));
    
    // 5. Delete all questions associated with this test
    await db.delete(questions).where(eq(questions.testId, id));
    
    // 6. Finally delete the test itself
    await db.delete(tests).where(eq(tests.id, id));
  }

  // Question operations
  async getQuestions(testId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.testId, testId))
      .orderBy(questions.createdAt);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async getPendingQuestions(): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.status, "pending"))
      .orderBy(desc(questions.createdAt));
  }

  async updateQuestionStatus(id: number, status: string, reviewedBy: number): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set({ 
        status, 
        reviewedBy, 
        reviewedAt: new Date() 
      })
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async updateQuestion(id: number, questionData: Partial<InsertQuestion>): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set(questionData)
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async addQuestionsToTest(testId: number, questionsList: any[]): Promise<any> {
    // Insert multiple questions for the test
    const questionData = questionsList.map(q => ({
      ...q,
      testId,
      status: "approved", // Auto-approve AI-generated questions
      createdAt: new Date(),
    }));

    await db.insert(questions).values(questionData);

    // Return updated test with question count
    const test = await this.getTest(testId);
    const testQuestions = await this.getQuestions(testId);
    
    return {
      ...test,
      questions: testQuestions,
    };
  }

  async assignQuestionsToTest(testId: number, questionIds: number[]): Promise<any> {
    // Update existing questions to assign them to the test
    await db
      .update(questions)
      .set({ testId })
      .where(inArray(questions.id, questionIds));

    // Return updated test with question count
    const test = await this.getTest(testId);
    const testQuestions = await this.getQuestions(testId);
    
    return {
      ...test,
      questions: testQuestions,
      assignedCount: questionIds.length,
    };
  }

  async copyTest(testId: number): Promise<any> {
    // Get the original test
    const originalTest = await this.getTest(testId);
    if (!originalTest) {
      console.error(`Test with ID ${testId} not found`);
      throw new Error("Test not found");
    }

    console.log("Original test found:", originalTest);

    // Get the original questions
    const originalQuestions = await this.getQuestions(testId);
    console.log(`Found ${originalQuestions.length} questions to copy`);

    // Create a copy of the test with proper field mapping
    const testData = {
      title: `${originalTest.title} (Copy)`,
      description: originalTest.description,
      domain: originalTest.domain,
      level: originalTest.level, // Use 'level' instead of 'skillLevel'
      duration: originalTest.duration,
      totalQuestions: originalTest.totalQuestions,
      passingScore: originalTest.passingScore,
      status: "draft",
      createdBy: originalTest.createdBy,
    };

    console.log("Creating test copy with data:", testData);

    const result = await db
      .insert(tests)
      .values(testData)
      .returning();
    const copiedTest = result[0];

    console.log("Test copied successfully:", copiedTest);

    // Copy all questions to the new test
    if (originalQuestions.length > 0) {
      const questionData = originalQuestions.map(q => {
        const { id, createdAt, updatedAt, ...questionFields } = q;
        return {
          ...questionFields,
          testId: copiedTest.id,
          status: "approved",
          createdAt: new Date(),
        };
      });

      console.log("Copying questions:", questionData.length);
      await db.insert(questions).values(questionData);
      console.log("Questions copied successfully");
    }

    return copiedTest;
  }

  // Test assignment operations
  async getUserAssignments(userId: number): Promise<TestAssignment[]> {
    return await db
      .select({
        id: testAssignments.id,
        testId: testAssignments.testId,
        status: testAssignments.status,
        scheduledAt: testAssignments.scheduledAt,
        dueDate: testAssignments.dueDate,
        timeLimit: testAssignments.timeLimit,
        maxAttempts: testAssignments.maxAttempts,
        assignedBy: testAssignments.assignedBy,
        createdAt: testAssignments.createdAt,
        test: {
          id: tests.id,
          title: tests.title,
          domain: tests.domain,
          level: tests.level,
          duration: tests.duration,
          totalQuestions: tests.totalQuestions,
        }
      })
      .from(testAssignments)
      .leftJoin(tests, eq(testAssignments.testId, tests.id))
      .where(eq(testAssignments.userId, userId))
      .orderBy(desc(testAssignments.scheduledAt));
  }

  async getAllAssignments(): Promise<TestAssignment[]> {
    return await db
      .select()
      .from(testAssignments)
      .orderBy(desc(testAssignments.createdAt));
  }

  async createAssignment(insertAssignment: InsertTestAssignment): Promise<TestAssignment> {
    const [assignment] = await db
      .insert(testAssignments)
      .values(insertAssignment)
      .returning();
    return assignment;
  }

  async getAssignment(id: number): Promise<TestAssignment | undefined> {
    const [assignment] = await db.select().from(testAssignments).where(eq(testAssignments.id, id));
    return assignment || undefined;
  }

  async updateAssignmentStatus(id: number, status: string): Promise<TestAssignment> {
    const [assignment] = await db
      .update(testAssignments)
      .set({ status })
      .where(eq(testAssignments.id, id))
      .returning();
    return assignment;
  }

  async updateAssignmentResultVisibility(id: number, resultsVisible: boolean): Promise<TestAssignment> {
    const [assignment] = await db
      .update(testAssignments)
      .set({ resultsVisible })
      .where(eq(testAssignments.id, id))
      .returning();
    return assignment;
  }

  async getCompletedAssignments(): Promise<any[]> {
    return await db
      .select({
        id: testAssignments.id,
        userId: testAssignments.userId,
        testId: testAssignments.testId,
        status: testAssignments.status,
        resultsVisible: testAssignments.resultsVisible,
        completedAt: testAssignments.createdAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        test: {
          id: tests.id,
          title: tests.title,
          domain: tests.domain,
          level: tests.level,
        },
        result: {
          id: testResults.id,
          score: testResults.score,
          percentage: testResults.percentage,
          passed: testResults.passed,
          completedAt: testResults.completedAt,
        }
      })
      .from(testAssignments)
      .leftJoin(users, eq(testAssignments.userId, users.id))
      .leftJoin(tests, eq(testAssignments.testId, tests.id))
      .leftJoin(testResults, and(
        eq(testResults.userId, testAssignments.userId),
        eq(testResults.testId, testAssignments.testId)
      ))
      .where(eq(testAssignments.status, "completed"))
      .orderBy(desc(testAssignments.createdAt));
  }

  // Test session operations
  async createSession(insertSession: InsertTestSession): Promise<TestSession> {
    const [session] = await db
      .insert(testSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSession(id: number): Promise<TestSession | undefined> {
    const [session] = await db.select().from(testSessions).where(eq(testSessions.id, id));
    return session || undefined;
  }

  async updateSession(id: number, updates: Partial<TestSession>): Promise<TestSession> {
    // Handle timestamp updates specifically
    const updateData: any = { ...updates };
    if (updateData.completedAt) {
      updateData.completedAt = sql`NOW()`;
    }
    
    const [session] = await db
      .update(testSessions)
      .set(updateData)
      .where(eq(testSessions.id, id))
      .returning();
    return session;
  }

  async getActiveSession(userId: number, testId: number): Promise<TestSession | undefined> {
    const [session] = await db
      .select()
      .from(testSessions)
      .where(and(
        eq(testSessions.userId, userId),
        eq(testSessions.testId, testId),
        eq(testSessions.status, "in_progress")
      ));
    return session || undefined;
  }

  // Test result operations
  async createResult(insertResult: InsertTestResult): Promise<TestResult> {
    const [result] = await db
      .insert(testResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getUserResults(userId: number): Promise<TestResult[]> {
    return await db
      .select({
        id: testResults.id,
        testId: testResults.testId,
        testTitle: tests.title,
        score: testResults.score,
        percentage: testResults.percentage,
        passed: testResults.passed,
        completedAt: testResults.completedAt,
        timeSpent: testResults.timeSpent,
      })
      .from(testResults)
      .leftJoin(tests, eq(testResults.testId, tests.id))
      .where(eq(testResults.userId, userId))
      .orderBy(desc(testResults.completedAt));
  }

  // Get only results that admin has made visible to the candidate
  async getUserVisibleResults(userId: number): Promise<TestResult[]> {
    return await db
      .select({
        id: testResults.id,
        testId: testResults.testId,
        testTitle: tests.title,
        score: testResults.score,
        percentage: testResults.percentage,
        passed: testResults.passed,
        completedAt: testResults.completedAt,
        timeSpent: testResults.timeSpent,
      })
      .from(testResults)
      .leftJoin(tests, eq(testResults.testId, tests.id))
      .leftJoin(testAssignments, and(
        eq(testAssignments.userId, testResults.userId),
        eq(testAssignments.testId, testResults.testId)
      ))
      .where(and(
        eq(testResults.userId, userId),
        eq(testAssignments.resultsVisible, true)
      ))
      .orderBy(desc(testResults.completedAt));
  }

  async getResult(id: number): Promise<TestResult | undefined> {
    const [result] = await db.select().from(testResults).where(eq(testResults.id, id));
    return result || undefined;
  }

  async getAllTestResults(): Promise<TestResult[]> {
    return await db.select().from(testResults);
  }

  async updateTestResult(id: number, updates: Partial<TestResult>): Promise<TestResult> {
    const [result] = await db
      .update(testResults)
      .set(updates)
      .where(eq(testResults.id, id))
      .returning();
    return result;
  }

  // HR Integration operations
  async createHrIntegration(insertIntegration: InsertHrIntegration): Promise<HrIntegration> {
    const [integration] = await db
      .insert(hrIntegrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async getHrIntegration(id: number): Promise<HrIntegration | undefined> {
    const [integration] = await db.select().from(hrIntegrations).where(eq(hrIntegrations.id, id));
    return integration || undefined;
  }

  async updateHrIntegration(id: number, updates: Partial<HrIntegration>): Promise<HrIntegration> {
    const [integration] = await db
      .update(hrIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hrIntegrations.id, id))
      .returning();
    return integration;
  }

  // Employee Profile operations
  async createEmployeeProfile(insertProfile: InsertEmployeeProfile): Promise<EmployeeProfile> {
    const [profile] = await db
      .insert(employeeProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async getEmployeeProfileByUserId(userId: number): Promise<EmployeeProfile | undefined> {
    const [profile] = await db.select().from(employeeProfiles).where(eq(employeeProfiles.userId, userId));
    return profile || undefined;
  }

  async getEmployeeProfileByEmployeeId(employeeId: string): Promise<EmployeeProfile | undefined> {
    const [profile] = await db.select().from(employeeProfiles).where(eq(employeeProfiles.employeeId, employeeId));
    return profile || undefined;
  }

  async updateEmployeeProfile(id: number, updates: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
    const [profile] = await db
      .update(employeeProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(employeeProfiles.id, id))
      .returning();
    return profile;
  }

  // Performance Review operations
  async createPerformanceReview(insertReview: InsertPerformanceReview): Promise<PerformanceReview> {
    const [review] = await db
      .insert(performanceReviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getPerformanceReviews(employeeId: number): Promise<PerformanceReview[]> {
    const reviews = await db.select().from(performanceReviews).where(eq(performanceReviews.employeeId, employeeId));
    return reviews || [];
  }

  async updatePerformanceReview(id: number, updates: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const [review] = await db
      .update(performanceReviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(performanceReviews.id, id))
      .returning();
    return review;
  }

  // Learning Path operations
  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const [path] = await db
      .insert(learningPaths)
      .values(insertPath)
      .returning();
    return path;
  }

  async getLearningPaths(employeeId: number): Promise<LearningPath[]> {
    const paths = await db.select().from(learningPaths).where(eq(learningPaths.employeeId, employeeId));
    return paths || [];
  }

  async updateLearningPath(id: number, updates: Partial<LearningPath>): Promise<LearningPath> {
    const [path] = await db
      .update(learningPaths)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(learningPaths.id, id))
      .returning();
    return path;
  }

  // Feedback operations
  async createFeedback(feedbackData: any): Promise<any> {
    const [feedback] = await db
      .insert(candidateFeedback)
      .values(feedbackData)
      .returning();
    return feedback;
  }

  async getFeedback(filters: any): Promise<any[]> {
    let query = db.select().from(candidateFeedback);
    
    if (filters.testId) {
      query = query.where(eq(candidateFeedback.testId, filters.testId));
    }
    if (filters.userId) {
      query = query.where(eq(candidateFeedback.userId, filters.userId));
    }
    if (filters.feedbackType) {
      query = query.where(eq(candidateFeedback.feedbackType, filters.feedbackType));
    }
    
    return await query;
  }

  async getFeedbackAnalytics(): Promise<any> {
    // Get aggregated feedback analytics
    const allFeedback = await db.select().from(candidateFeedback);
    
    const totalResponses = allFeedback.length;
    const avgOverallExperience = totalResponses > 0 
      ? allFeedback.reduce((sum, f) => sum + (f.overallExperience || 0), 0) / totalResponses 
      : 0;
    
    const positiveFeedback = allFeedback.filter(f => (f.overallExperience || 0) >= 4).length;
    const positivePercentage = totalResponses > 0 ? (positiveFeedback / totalResponses) * 100 : 0;
    
    return {
      totalResponses,
      averageExperience: Math.round(avgOverallExperience * 10) / 10,
      positivePercentage: Math.round(positivePercentage),
      recentFeedback: allFeedback.slice(-10) // Last 10 feedback entries
    };
  }

  // Employee Group operations
  async getEmployeeGroups(projectId?: number): Promise<EmployeeGroup[]> {
    let query = db.select().from(employeeGroups);
    if (projectId) {
      query = query.where(eq(employeeGroups.projectId, projectId));
    }
    const groups = await query.orderBy(desc(employeeGroups.createdAt));
    return groups || [];
  }

  async createEmployeeGroup(group: InsertEmployeeGroup): Promise<EmployeeGroup> {
    const [newGroup] = await db
      .insert(employeeGroups)
      .values(group)
      .returning();
    return newGroup;
  }

  async getEmployeeGroup(id: number): Promise<EmployeeGroup | undefined> {
    const [group] = await db.select().from(employeeGroups).where(eq(employeeGroups.id, id));
    return group || undefined;
  }

  async updateEmployeeGroup(id: number, updates: Partial<InsertEmployeeGroup>): Promise<EmployeeGroup> {
    const [group] = await db
      .update(employeeGroups)
      .set(updates)
      .where(eq(employeeGroups.id, id))
      .returning();
    return group;
  }

  async deleteEmployeeGroup(id: number): Promise<void> {
    // First delete all members
    await db.delete(groupMembers).where(eq(groupMembers.groupId, id));
    // Then delete the group
    await db.delete(employeeGroups).where(eq(employeeGroups.id, id));
  }

  // Group member operations
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const members = await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
    return members || [];
  }

  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db
      .insert(groupMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    await db
      .delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ));
  }

  async addGroupMembers(groupId: number, userIds: number[], addedBy: number): Promise<GroupMember[]> {
    const memberData = userIds.map(userId => ({
      groupId,
      userId,
      addedBy,
    }));
    
    const members = await db
      .insert(groupMembers)
      .values(memberData)
      .returning();
    return members;
  }

  // Group test assignment operations
  async createGroupTestAssignment(assignment: InsertGroupTestAssignment): Promise<GroupTestAssignment> {
    const [newAssignment] = await db
      .insert(groupTestAssignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async getGroupTestAssignments(groupId?: number): Promise<GroupTestAssignment[]> {
    let query = db.select().from(groupTestAssignments);
    if (groupId) {
      query = query.where(eq(groupTestAssignments.groupId, groupId));
    }
    const assignments = await query.orderBy(desc(groupTestAssignments.createdAt));
    return assignments || [];
  }

  async updateGroupTestAssignmentStatus(id: number, status: string): Promise<GroupTestAssignment> {
    const [assignment] = await db
      .update(groupTestAssignments)
      .set({ status })
      .where(eq(groupTestAssignments.id, id))
      .returning();
    return assignment;
  }

  // Project operations
  async getProjects(companyId?: number): Promise<Project[]> {
    let query = db.select().from(projects);
    if (companyId) {
      query = query.where(eq(projects.companyId, companyId));
    }
    const projectList = await query.orderBy(desc(projects.createdAt));
    return projectList || [];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<void> {
    // First delete all tests in the project
    await db.delete(tests).where(eq(tests.projectId, id));
    // Delete all employee groups in the project
    const groupsInProject = await db.select().from(employeeGroups).where(eq(employeeGroups.projectId, id));
    for (const group of groupsInProject) {
      await this.deleteEmployeeGroup(group.id);
    }
    // Finally delete the project
    await db.delete(projects).where(eq(projects.id, id));
  }
  // Employee-specific convenience methods
  async getUserSkillProgress(userId: number): Promise<any[]> {
    // Get skill progress based on test results grouped by domain
    const results = await db
      .select({
        domain: tests.domain,
        level: tests.level,
        score: testResults.score,
        percentage: testResults.percentage,
        completedAt: testResults.completedAt,
      })
      .from(testResults)
      .leftJoin(tests, eq(testResults.testId, tests.id))
      .where(eq(testResults.userId, userId))
      .orderBy(desc(testResults.completedAt));

    // Group by domain and calculate progress
    const skillMap = new Map();
    results.forEach(result => {
      if (!result.domain) return;
      
      if (!skillMap.has(result.domain)) {
        skillMap.set(result.domain, {
          domain: result.domain,
          level: result.level || 'junior',
          scores: [],
          lastAssessment: result.completedAt,
          totalAssessments: 0
        });
      }
      
      const skill = skillMap.get(result.domain);
      skill.scores.push(result.percentage || 0);
      skill.totalAssessments++;
      if (result.completedAt > skill.lastAssessment) {
        skill.lastAssessment = result.completedAt;
      }
    });

    // Calculate progress percentage for each domain
    return Array.from(skillMap.values()).map(skill => ({
      ...skill,
      progress: skill.scores.length > 0 
        ? Math.round(skill.scores.reduce((a: number, b: number) => a + b, 0) / skill.scores.length)
        : 0,
      scores: undefined // Remove raw scores from output
    }));
  }

  async getUserRecentResults(userId: number): Promise<any[]> {
    // Get only the latest attempt per test using a subquery to filter visible results
    const results = await db.execute(sql`
      WITH latest_results AS (
        SELECT 
          tr.id,
          tr.test_id,
          t.title as test_title,
          tr.score,
          tr.percentage,
          tr.passed,
          tr.completed_at,
          tr.time_spent,
          t.domain,
          ROW_NUMBER() OVER (PARTITION BY tr.test_id ORDER BY tr.completed_at DESC) as rn
        FROM test_results tr
        JOIN tests t ON tr.test_id = t.id
        JOIN test_assignments ta ON tr.test_id = ta.test_id AND tr.user_id = ta.user_id
        WHERE tr.user_id = ${userId} AND ta.results_visible = true
      )
      SELECT 
        id,
        test_id as "testId",
        test_title as "testTitle",
        score,
        percentage,
        passed,
        completed_at as "completedAt",
        time_spent as "timeSpent",
        domain
      FROM latest_results 
      WHERE rn = 1
      ORDER BY completed_at DESC
      LIMIT 10
    `);
    
    return (results as any).rows || results as any[];
  }

  async getTestAssignment(userId: number, testId: number): Promise<any> {
    const [assignment] = await db
      .select()
      .from(testAssignments)
      .where(and(
        eq(testAssignments.userId, userId),
        eq(testAssignments.testId, testId)
      ));
    return assignment || null;
  }

  async createOrResumeTestSession(userId: number, testId: number): Promise<any> {
    // Check for existing active session
    const existingSession = await this.getActiveSession(userId, testId);
    if (existingSession) {
      return existingSession;
    }

    // Create new session
    return await this.createSession({
      userId,
      testId,
      status: 'in_progress',
      answers: [],
      proctoringEvents: []
    });
  }

  async getTestSession(sessionId: number): Promise<any> {
    return await this.getSession(sessionId);
  }

  async submitTest(sessionId: number, answers: any, timeSpent: number, proctoringEvents: any[]): Promise<any> {
    // Get session details
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update session as completed
    await this.updateSession(sessionId, {
      status: 'completed',
      answers,
      proctoringEvents,
      completedAt: new Date()
    });

    // Calculate score (simplified scoring)
    const questions = await this.getQuestions(session.testId);
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[question.id];
      if (userAnswer && question.correctAnswer && userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    const passed = score >= 70; // 70% passing threshold

    // Create test result
    const result = await this.createResult({
      userId: session.userId,
      testId: session.testId,
      sessionId: sessionId,
      score,
      percentage: score,
      passed,
      timeSpent,
      answers,
      proctoringEvents,
      totalQuestions: questions.length,
      correctAnswers
    });

    return result;
  }

  async getUserTestHistory(userId: number): Promise<any[]> {
    return await this.getUserResults(userId);
  }

  async getUserLearningPaths(userId: number): Promise<any[]> {
    return await this.getLearningPaths(userId);
  }

  async getLiveTestSessions(): Promise<any[]> {
    const sessions = await db
      .select({
        id: testSessions.id,
        userId: testSessions.userId,
        testId: testSessions.testId,
        startedAt: testSessions.startedAt,
        timeSpent: testSessions.timeSpent,
        totalQuestions: testSessions.totalQuestions,
        status: testSessions.status,
        userName: users.name,
        username: users.username,
        testTitle: tests.title,
        testDomain: tests.domain,
        testDuration: tests.duration
      })
      .from(testSessions)
      .leftJoin(users, eq(testSessions.userId, users.id))
      .leftJoin(tests, eq(testSessions.testId, tests.id))
      .where(eq(testSessions.status, 'in_progress'))
      .orderBy(testSessions.startedAt);

    return sessions.map(session => {
      // Calculate time remaining and progress
      const startTime = new Date(session.startedAt).getTime();
      const now = Date.now();
      const elapsedMinutes = Math.floor((now - startTime) / (1000 * 60));
      const remainingMinutes = Math.max(0, (session.testDuration || 60) - elapsedMinutes);
      
      // Calculate progress (rough estimate based on time)
      const progressPercent = Math.min(100, Math.floor((elapsedMinutes / (session.testDuration || 60)) * 100));
      
      // Estimate current question (rough calculation)
      const currentQuestion = Math.max(1, Math.floor((progressPercent / 100) * (session.totalQuestions || 20)));
      
      return {
        id: session.id,
        userId: session.userId,
        testId: session.testId,
        userName: session.userName || session.username || `User ${session.userId}`,
        testTitle: session.testTitle || 'Unknown Test',
        testDomain: session.testDomain || 'general',
        currentQuestion,
        totalQuestions: session.totalQuestions || 20,
        progressPercent,
        timeRemainingMinutes: remainingMinutes,
        status: session.status
      };
    });
  }

  async updateUser(userId: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Notification operations
  async getNotificationsForUser(userId: number): Promise<any[]> {
    try {
      // Generate real-time notifications based on actual database data
      const notificationList = [];

      // Get pending test assignments for the user
      const assignments = await db
        .select({
          assignment: testAssignments,
          test: tests
        })
        .from(testAssignments)
        .leftJoin(tests, eq(testAssignments.testId, tests.id))
        .where(and(
          eq(testAssignments.userId, userId),
          eq(testAssignments.status, "pending")
        ))
        .limit(5);

      assignments.forEach((item, index) => {
        if (item.test) {
          notificationList.push({
            id: 1000 + index,
            title: "New Test Assignment",
            message: `You have been assigned "${item.test.title}". Complete it by the due date.`,
            type: "info",
            category: "test",
            isRead: false,
            createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            actionUrl: `/employee/assignments`,
            relatedId: item.assignment.id
          });
        }
      });

      // Get pending questions for reviewers/admins
      const user = await this.getUser(userId);
      if (user && ["reviewer", "admin", "super_admin"].includes(user.role)) {
        const pendingQuestions = await db
          .select()
          .from(questions)
          .where(eq(questions.status, "pending"))
          .limit(3);

        pendingQuestions.forEach((question, index) => {
          notificationList.push({
            id: 2000 + index,
            title: "Question Approval Required",
            message: `Question for ${question.domain} domain requires your review and approval.`,
            type: "warning",
            category: "approval",
            isRead: false,
            createdAt: new Date(Date.now() - Math.random() * 43200000).toISOString(),
            actionUrl: `/reviewer/questions`,
            relatedId: question.id
          });
        });
      }

      // Get recent test results for admins
      if (user && ["admin", "super_admin"].includes(user.role)) {
        const recentResults = await db
          .select({
            result: testResults,
            test: tests,
            user: users
          })
          .from(testResults)
          .leftJoin(tests, eq(testResults.testId, tests.id))
          .leftJoin(users, eq(testResults.userId, users.id))
          .orderBy(desc(testResults.completedAt))
          .limit(3);

        recentResults.forEach((item, index) => {
          if (item.test && item.user) {
            notificationList.push({
              id: 3000 + index,
              title: "Test Results Available",
              message: `${item.user.name} completed "${item.test.title}" with score ${item.result.percentage}%.`,
              type: item.result.percentage >= 70 ? "success" : "warning",
              category: "report",
              isRead: false,
              createdAt: new Date(item.result.completedAt || Date.now()).toISOString(),
              actionUrl: `/admin/results`,
              relatedId: item.result.id
            });
          }
        });
      }

      // Add system maintenance notification
      notificationList.push({
        id: 4000,
        title: "System Maintenance Scheduled",
        message: "Scheduled maintenance will occur this Sunday from 2:00 AM to 4:00 AM EST.",
        type: "info",
        category: "system",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        actionUrl: null,
        relatedId: null
      });

      // Add weekly reports notification for admins
      if (user && ["admin", "super_admin", "hr_manager"].includes(user.role)) {
        notificationList.push({
          id: 4001,
          title: "Weekly Analytics Report Ready",
          message: "Your weekly performance analytics report is now available for review.",
          type: "success",
          category: "report",
          isRead: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          actionUrl: `/admin/analytics`,
          relatedId: null
        });
      }

      // Sort by creation date, newest first
      return notificationList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    // For the demo implementation, we'll just log this action
    // In a real implementation, this would update the notifications table
    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    // For the demo implementation, we'll just log this action
    // In a real implementation, this would update all notifications for the user
    console.log(`Marking all notifications as read for user ${userId}`);
  }

  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    // For the demo implementation, we'll just log this action
    // In a real implementation, this would delete the notification from the database
    console.log(`Deleting notification ${notificationId} for user ${userId}`);
  }

  // Activity Log operations
  async logActivity(activityData: any): Promise<ActivityLog> {
    const logEntry = {
      userId: activityData.userId,
      userName: activityData.userName || 'Unknown User',
      userRole: activityData.userRole || 'unknown',
      action: activityData.action,
      resourceType: activityData.resourceType || 'unknown',
      resourceId: activityData.resourceId,
      resourceName: activityData.resourceName,
      details: activityData.details,
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent,
      severity: activityData.severity || 'medium',
      category: activityData.category || 'system'
    };
    
    const [result] = await db
      .insert(activityLogs)
      .values(logEntry)
      .returning();
    
    console.log('Activity logged to database:', result);
    return result;
  }

  async getActivityLogs(filters?: any): Promise<ActivityLog[]> {
    try {
      // Fetch real activity logs from database
      let query = db.select().from(activityLogs);
      
      // Apply filters if provided
      if (filters) {
        if (filters.category && filters.category !== 'All Categories') {
          query = query.where(eq(activityLogs.category, filters.category.toLowerCase()));
        }
        if (filters.severity && filters.severity !== 'All Severities') {
          query = query.where(eq(activityLogs.severity, filters.severity.toLowerCase()));
        }
        if (filters.userId && filters.userId !== 'All Users') {
          query = query.where(eq(activityLogs.userId, parseInt(filters.userId)));
        }
      }
      
      const logs = await query
        .orderBy(desc(activityLogs.createdAt))
        .limit(100); // Limit to latest 100 logs
      
      return logs;
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      return [];
    }
  }

  async clearActivityLogs(): Promise<void> {
    // Delete all activity logs from database
    await db.delete(activityLogs);
    console.log('All activity logs cleared from database');
  }

  async isActivityLogsCleared(): Promise<boolean> {
    const count = await db.select({ count: sql`count(*)` }).from(activityLogs);
    return count[0]?.count === 0;
  }

  async exportActivityLogs(): Promise<ActivityLog[]> {
    // Return all activity logs for export (no filters, no limit)
    const logs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt));
    return logs;
  }
}

export const storage = new DatabaseStorage();
