import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Company and Organization Tables
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  
  // Basic Company Information
  name: text("name").notNull(),
  legalName: text("legal_name"), // Full legal name if different from trading name
  code: text("code").notNull().unique(), // Company code like "TECH001"
  tradingAs: text("trading_as"), // Trading name if different
  
  // Business Details
  industry: text("industry"), // Technology, Finance, Healthcare, etc.
  businessType: text("business_type"), // Corporation, LLC, Partnership, etc.
  size: text("size"), // startup, small, medium, large, enterprise
  yearEstablished: integer("year_established"),
  description: text("description"),
  
  // Contact Information
  primaryPhone: text("primary_phone"),
  secondaryPhone: text("secondary_phone"),
  primaryEmail: text("primary_email"),
  secondaryEmail: text("secondary_email"),
  website: text("website"),
  
  // Address Information
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  timeZone: text("time_zone"),
  
  // Legal and Tax Information
  taxId: text("tax_id"), // Tax ID/EIN number
  vatNumber: text("vat_number"), // VAT registration number
  registrationNumber: text("registration_number"), // Company registration number
  incorporationDate: date("incorporation_date"),
  incorporationCountry: text("incorporation_country"),
  incorporationState: text("incorporation_state"),
  
  // Banking Information
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  routingNumber: text("routing_number"),
  swiftCode: text("swift_code"),
  iban: text("iban"),
  
  // Key Personnel
  ceoName: text("ceo_name"),
  ceoEmail: text("ceo_email"),
  ctoName: text("cto_name"),
  ctoEmail: text("cto_email"),
  hrContactName: text("hr_contact_name"),
  hrContactEmail: text("hr_contact_email"),
  primaryContactName: text("primary_contact_name"),
  primaryContactEmail: text("primary_contact_email"),
  primaryContactPhone: text("primary_contact_phone"),
  
  // Contract and Service Details
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  serviceLevel: text("service_level"), // Basic, Professional, Enterprise
  billingCycle: text("billing_cycle"), // Monthly, Quarterly, Annual
  paymentTerms: text("payment_terms"), // Net 30, Net 15, etc.
  currency: text("currency").default("USD"),
  
  // Document Management
  companyLogo: text("company_logo"), // URL to company logo
  incorporationCertificate: text("incorporation_certificate"), // Document URL
  taxCertificate: text("tax_certificate"), // Document URL
  bankStatements: text("bank_statements").array(), // Array of document URLs
  contracts: text("contracts").array(), // Array of contract document URLs
  complianceDocs: text("compliance_docs").array(), // Array of compliance document URLs
  
  // System Fields
  isActive: boolean("is_active").notNull().default(true),
  onboardingStatus: text("onboarding_status").notNull().default("pending"), // pending, in_progress, completed, on_hold
  createdBy: integer("created_by").references(() => users.id),
  lastUpdatedBy: integer("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departments: any = pgTable("departments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  code: text("code").notNull(), // Department code like "ENG", "HR", "SALES"
  description: text("description"),
  headId: integer("head_id").references(() => users.id), // Department head
  parentDepartmentId: integer("parent_department_id"), // For sub-departments - remove self-reference for now
  budget: decimal("budget"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subCompanies = pgTable("sub_companies", {
  id: serial("id").primaryKey(),
  parentCompanyId: integer("parent_company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  location: text("location"),
  description: text("description"),
  managerId: integer("manager_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users: any = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("employee"), // super_admin, admin, hr_manager, reviewer, team_lead, employee, candidate
  name: text("name").notNull(),
  email: text("email").unique(),
  employeeId: text("employee_id").unique(),
  
  // Company and Department Assignment
  companyId: integer("company_id").references(() => companies.id),
  
  // Reporting Structure
  reportingManagerId: integer("reporting_manager_id").references(() => users.id),
  departmentId: integer("department_id").references(() => departments.id),
  subCompanyId: integer("sub_company_id").references(() => subCompanies.id),
  
  // Job Information
  position: text("position"), // junior, mid, senior, lead, principal
  domain: text("domain"), // programming, devops, security, networking, databases, cloud, mobile, frontend, backend, data-science, ai-ml
  managerId: integer("manager_id"),
  location: text("location"),
  hireDate: date("hire_date"),
  workType: text("work_type").default("full_time"), // full_time, part_time, contract, intern
  
  // Skills and Experience
  skills: text("skills").array(),
  certifications: text("certifications").array(),
  experience: integer("experience"), // years of experience
  
  // Profile
  profilePhoto: text("profile_photo"), // URL to profile photo
  department: text("department"),
  jobTitle: text("job_title"),
  
  // System
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Management System
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  companyId: integer("company_id").references(() => companies.id),
  departmentId: integer("department_id").references(() => departments.id),
  managerId: integer("manager_id").references(() => users.id), // Project manager
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"), // active, completed, on_hold, cancelled
  priority: text("priority").default("medium"), // low, medium, high, critical
  budget: decimal("budget"),
  tags: text("tags").array(), // project tags for categorization
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").references(() => projects.id), // Tests belong to projects
  domain: text("domain").notNull(), // programming, devops, security, networking, databases, cloud, mobile, frontend, backend, data-science, ai-ml, vmware-virtualization, redhat-administration, oracle-administration, network-routing-switching
  level: text("level").notNull(), // junior, mid, senior, lead, principal
  duration: integer("duration").notNull(), // minutes
  totalQuestions: integer("total_questions").notNull(),
  passingScore: integer("passing_score").notNull().default(70),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => tests.id),
  type: text("type").notNull().default("mcq"), // mcq, coding, drag_drop, scenario, fill_blank, matching
  question: text("question").notNull(),
  options: jsonb("options"), // array of options for MCQ questions, null for coding questions
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  weightage: integer("weightage").notNull().default(1),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  tags: text("tags").array(), // technology tags like ["javascript", "react", "frontend"]
  codeLanguage: text("code_language"), // for coding questions: javascript, python, java, etc.
  timeLimit: integer("time_limit"), // specific time limit for coding questions in minutes
  setNumber: integer("set_number").default(1), // question set number for multiple sets
  setId: text("set_id"), // unique identifier for question sets
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee Group Management System - Groups belong to projects
export const employeeGroups = pgTable("employee_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  projectId: integer("project_id").references(() => projects.id), // Optional - Groups can be general or project-specific
  companyId: integer("company_id").references(() => companies.id),
  departmentId: integer("department_id").references(() => departments.id),
  domain: text("domain"), // programming, devops, security, etc. - for filtering relevant employees
  level: text("level"), // junior, mid, senior, lead, principal - for skill-based batching
  createdBy: integer("created_by").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => employeeGroups.id),
  userId: integer("user_id").references(() => users.id),
  addedBy: integer("added_by").references(() => users.id),
  addedAt: timestamp("added_at").defaultNow(),
});

export const groupTestAssignments = pgTable("group_test_assignments", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => employeeGroups.id),
  testId: integer("test_id").references(() => tests.id),
  scheduledAt: timestamp("scheduled_at"),
  dueDate: timestamp("due_date"),
  timeLimit: integer("time_limit"), // minutes - can override test default
  maxAttempts: integer("max_attempts").default(1),
  assignedBy: integer("assigned_by").references(() => users.id),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const testAssignments = pgTable("test_assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  testId: integer("test_id").references(() => tests.id),
  groupAssignmentId: integer("group_assignment_id").references(() => groupTestAssignments.id), // Links to group assignment if applicable
  scheduledAt: timestamp("scheduled_at"),
  dueDate: timestamp("due_date"),
  timeLimit: integer("time_limit"), // minutes - inherited from batch or individual
  maxAttempts: integer("max_attempts").default(1),
  status: text("status").notNull().default("assigned"), // assigned, started, completed, overdue
  resultsVisible: boolean("results_visible").default(false), // Admin controls if results are visible to candidates
  assignedBy: integer("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testSessions = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => testAssignments.id),
  userId: integer("user_id").references(() => users.id),
  testId: integer("test_id").references(() => tests.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // minutes
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  answers: jsonb("answers"), // array of user answers
  proctoringEvents: jsonb("proctoring_events"), // array of events
  status: text("status").notNull().default("in_progress"), // in_progress, completed, timed_out
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => testSessions.id),
  userId: integer("user_id").references(() => users.id),
  testId: integer("test_id").references(() => tests.id),
  score: integer("score").notNull(),
  percentage: integer("percentage").notNull(),
  passed: boolean("passed").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  timeSpent: integer("time_spent").notNull(), // minutes
  detailedResults: jsonb("detailed_results"), // question-wise breakdown
  skillGapAnalysis: jsonb("skill_gap_analysis"), // automated skill gap report
});

// HR Integration Tables
export const hrIntegrations = pgTable("hr_integrations", {
  id: serial("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  platform: text("platform").notNull(), // 'workday', 'bamboohr', 'adp', 'successfactors', 'custom'
  apiEndpoint: text("api_endpoint").notNull(),
  apiKey: text("api_key"), // encrypted
  webhookUrl: text("webhook_url"),
  syncEnabled: boolean("sync_enabled").default(true),
  lastSync: timestamp("last_sync"),
  syncFrequency: text("sync_frequency").default("daily"), // 'realtime', 'hourly', 'daily', 'weekly'
  fieldMappings: jsonb("field_mappings").notNull(), // maps HR fields to our schema
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employeeProfiles = pgTable("employee_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  employeeId: text("employee_id").notNull(), // HR system employee ID
  department: text("department"),
  jobTitle: text("job_title"),
  managerId: integer("manager_id").references(() => users.id),
  hireDate: date("hire_date"),
  skillMatrix: jsonb("skill_matrix"), // current skill levels across domains
  careerTrack: text("career_track"), // 'ic', 'management', 'specialist'
  level: text("level"), // 'junior', 'mid', 'senior', 'lead', 'principal'
  location: text("location"),
  timezone: text("timezone"),
  hrSystemId: text("hr_system_id"), // external HR system reference
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  reviewPeriod: text("review_period").notNull(), // 'Q1-2025', 'H1-2025', etc.
  skillAssessments: jsonb("skill_assessments").notNull(), // domain -> assessment results
  goals: jsonb("goals").notNull(), // learning and performance goals
  competencyScores: jsonb("competency_scores").notNull(), // technical competencies
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }),
  comments: text("comments"),
  developmentPlan: text("development_plan"),
  hrSystemId: text("hr_system_id"), // external HR system reference
  status: text("status").default("draft"), // 'draft', 'in_review', 'completed', 'approved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id),
  pathName: text("path_name").notNull(),
  targetRole: text("target_role"),
  requiredSkills: jsonb("required_skills").notNull(), // skills needed for target role
  currentProgress: jsonb("current_progress").notNull(), // progress tracking
  milestones: jsonb("milestones").notNull(), // key checkpoints
  estimatedCompletion: date("estimated_completion"),
  assignedBy: integer("assigned_by").references(() => users.id),
  status: text("status").default("active"), // 'active', 'completed', 'paused'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const candidateFeedback = pgTable("candidate_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  testId: integer("test_id").references(() => tests.id),
  resultId: integer("result_id").references(() => testResults.id),
  feedbackType: text("feedback_type").notNull().default("post_test"), // post_test, exit_survey, technical_issue
  overallExperience: integer("overall_experience"), // 1-5 stars
  testDifficulty: integer("test_difficulty"), // 1-5 stars (1=too easy, 5=too hard)
  questionClarity: integer("question_clarity"), // 1-5 stars
  platformUsability: integer("platform_usability"), // 1-5 stars
  feedbackText: text("feedback_text"),
  suggestions: text("suggestions"),
  technicalIssues: text("technical_issues"),
  wouldRecommend: boolean("would_recommend"),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }), // AI-analyzed sentiment (-1 to 1)
  sentimentConfidence: decimal("sentiment_confidence", { precision: 3, scale: 2 }), // AI confidence (0 to 1)
  sentimentCategory: text("sentiment_category"), // positive, neutral, negative
  aiInsights: text("ai_insights"), // AI-generated insights
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  category: text("category").notNull().default("system"), // test, user, system, approval, report
  isRead: boolean("is_read").notNull().default(false),
  relatedId: integer("related_id"), // ID of related entity (test, user, etc.)
  actionUrl: text("action_url"), // URL to navigate to for action
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity Logs system for real-time tracking
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(), // auth, user, test, question, system, data
  resourceId: integer("resource_id"),
  resourceName: text("resource_name"),
  details: text("details").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  category: text("category").notNull().default("system"), // auth, user, test, question, system, data
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  departments: many(departments),
  subCompanies: many(subCompanies),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  company: one(companies, {
    fields: [departments.companyId],
    references: [companies.id],
  }),
  head: one(users, {
    fields: [departments.headId],
    references: [users.id],
  }),
  parentDepartment: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
  }),
  subDepartments: many(departments),
  users: many(users),
}));

export const subCompaniesRelations = relations(subCompanies, ({ one, many }) => ({
  parentCompany: one(companies, {
    fields: [subCompanies.parentCompanyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [subCompanies.managerId],
    references: [users.id],
  }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  testAssignments: many(testAssignments),
  testSessions: many(testSessions),
  testResults: many(testResults),
  reviewedQuestions: many(questions),
  candidateFeedback: many(candidateFeedback),
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  subCompany: one(subCompanies, {
    fields: [users.subCompanyId],
    references: [subCompanies.id],
  }),
  employeeProfile: one(employeeProfiles, {
    fields: [users.id],
    references: [employeeProfiles.userId],
  }),
  performanceReviews: many(performanceReviews),
  learningPaths: many(learningPaths),
  managedEmployees: many(employeeProfiles),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
  }),
  reviewer: one(users, {
    fields: [questions.reviewedBy],
    references: [users.id],
  }),
}));

// Project Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  department: one(departments, {
    fields: [projects.departmentId],
    references: [departments.id],
  }),
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  tests: many(tests),
  employeeGroups: many(employeeGroups),
}));

export const testsRelations = relations(tests, ({ one, many }) => ({
  project: one(projects, {
    fields: [tests.projectId],
    references: [projects.id],
  }),
  questions: many(questions),
  assignments: many(testAssignments),
  groupAssignments: many(groupTestAssignments),
  sessions: many(testSessions),
  results: many(testResults),
}));

// Employee Group Relations
export const employeeGroupsRelations = relations(employeeGroups, ({ one, many }) => ({
  project: one(projects, {
    fields: [employeeGroups.projectId],
    references: [projects.id],
  }),
  company: one(companies, {
    fields: [employeeGroups.companyId],
    references: [companies.id],
  }),
  department: one(departments, {
    fields: [employeeGroups.departmentId],
    references: [departments.id],
  }),
  createdByUser: one(users, {
    fields: [employeeGroups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  testAssignments: many(groupTestAssignments),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(employeeGroups, {
    fields: [groupMembers.groupId],
    references: [employeeGroups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  addedByUser: one(users, {
    fields: [groupMembers.addedBy],
    references: [users.id],
  }),
}));

export const groupTestAssignmentsRelations = relations(groupTestAssignments, ({ one, many }) => ({
  group: one(employeeGroups, {
    fields: [groupTestAssignments.groupId],
    references: [employeeGroups.id],
  }),
  test: one(tests, {
    fields: [groupTestAssignments.testId],
    references: [tests.id],
  }),
  assignedByUser: one(users, {
    fields: [groupTestAssignments.assignedBy],
    references: [users.id],
  }),
  individualAssignments: many(testAssignments),
}));

export const testAssignmentsRelations = relations(testAssignments, ({ one, many }) => ({
  user: one(users, {
    fields: [testAssignments.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [testAssignments.testId],
    references: [tests.id],
  }),
  assignedByUser: one(users, {
    fields: [testAssignments.assignedBy],
    references: [users.id],
  }),
  groupAssignment: one(groupTestAssignments, {
    fields: [testAssignments.groupAssignmentId],
    references: [groupTestAssignments.id],
  }),
  sessions: many(testSessions),
}));

export const testSessionsRelations = relations(testSessions, ({ one }) => ({
  assignment: one(testAssignments, {
    fields: [testSessions.assignmentId],
    references: [testAssignments.id],
  }),
  user: one(users, {
    fields: [testSessions.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [testSessions.testId],
    references: [tests.id],
  }),
  result: one(testResults, {
    fields: [testSessions.id],
    references: [testResults.sessionId],
  }),
}));

export const testResultsRelations = relations(testResults, ({ one, many }) => ({
  session: one(testSessions, {
    fields: [testResults.sessionId],
    references: [testSessions.id],
  }),
  user: one(users, {
    fields: [testResults.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [testResults.testId],
    references: [tests.id],
  }),
  feedback: many(candidateFeedback),
}));

export const candidateFeedbackRelations = relations(candidateFeedback, ({ one }) => ({
  user: one(users, {
    fields: [candidateFeedback.userId],
    references: [users.id],
  }),
  test: one(tests, {
    fields: [candidateFeedback.testId],
    references: [tests.id],
  }),
  result: one(testResults, {
    fields: [candidateFeedback.resultId],
    references: [testResults.id],
  }),
}));

// HR Relations
export const employeeProfilesRelations = relations(employeeProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [employeeProfiles.userId],
    references: [users.id],
  }),
  manager: one(users, {
    fields: [employeeProfiles.managerId],
    references: [users.id],
  }),
  performanceReviews: many(performanceReviews),
  learningPaths: many(learningPaths),
}));

export const performanceReviewsRelations = relations(performanceReviews, ({ one }) => ({
  employee: one(users, {
    fields: [performanceReviews.employeeId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [performanceReviews.reviewerId],
    references: [users.id],
  }),
}));

export const learningPathsRelations = relations(learningPaths, ({ one }) => ({
  employee: one(users, {
    fields: [learningPaths.employeeId],
    references: [users.id],
  }),
  assignedByUser: one(users, {
    fields: [learningPaths.assignedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export const insertSubCompanySchema = createInsertSchema(subCompanies).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

// Employee Group schemas
export const insertEmployeeGroupSchema = createInsertSchema(employeeGroups).omit({
  id: true,
  createdAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  addedAt: true,
});

export const insertGroupTestAssignmentSchema = createInsertSchema(groupTestAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertTestAssignmentSchema = createInsertSchema(testAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  startedAt: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  completedAt: true,
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type SubCompany = typeof subCompanies.$inferSelect;
export type InsertSubCompany = z.infer<typeof insertSubCompanySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
// Employee Group Types
export type EmployeeGroup = typeof employeeGroups.$inferSelect;
export type InsertEmployeeGroup = z.infer<typeof insertEmployeeGroupSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupTestAssignment = typeof groupTestAssignments.$inferSelect;
export type InsertGroupTestAssignment = z.infer<typeof insertGroupTestAssignmentSchema>;

export type TestAssignment = typeof testAssignments.$inferSelect;
export type InsertTestAssignment = z.infer<typeof insertTestAssignmentSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;

// HR Types
export const insertHrIntegrationSchema = createInsertSchema(hrIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeProfileSchema = createInsertSchema(employeeProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncAt: true,
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCandidateFeedbackSchema = createInsertSchema(candidateFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type HrIntegration = typeof hrIntegrations.$inferSelect;
export type InsertHrIntegration = z.infer<typeof insertHrIntegrationSchema>;
export type EmployeeProfile = typeof employeeProfiles.$inferSelect;
export type InsertEmployeeProfile = z.infer<typeof insertEmployeeProfileSchema>;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type CandidateFeedback = typeof candidateFeedback.$inferSelect;
export type InsertCandidateFeedback = z.infer<typeof insertCandidateFeedbackSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
