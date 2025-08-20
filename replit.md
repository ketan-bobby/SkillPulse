# LinxIQ - Engineer-Grade Assessments Platform

## Overview
LinxIQ is an engineer-grade assessment platform designed for evaluating technical skills across a wide range of technology domains including programming, development, DevOps, cloud, mobile, data science, AI/ML, cybersecurity, databases, and networking. It supports multiple question types (MCQ, coding challenges, scenario-based) and features role-based access control with comprehensive anti-cheating measures. The platform aims to provide "Linx-Level Accuracy" in technical skill evaluation. Key capabilities include comprehensive employee login, AI-powered role-specific assistance, and an intelligent AI fallback system for enhanced question generation and analysis.

## Recent Changes (August 2025)
- **Automatic Skill Gap Report Generation**: Implemented automatic generation of comprehensive skill gap analysis when tests are completed. The system now generates detailed reports including industry analysis, salary benchmarking, predictive analytics, training recommendations, and AI insights immediately upon test completion. Reports are stored in the database and can be retrieved via API endpoint `/api/skill-gap-report/:userId`
- **Product Rebranding**: Successfully rebranded entire platform from "LinxAssess" to "LinxIQ" across all components, including HTML titles, component headers, email templates, and documentation. Updated branding throughout frontend and backend while maintaining all existing functionality.
- **NTT Data Client Customization**: Added NTT Data client logo prominently displayed in the center of the header across all pages. This customization specifically serves NTT Data as the primary client
- **Results Manager Data Integration**: Fixed Results Manager to display real database data instead of mock data. Updated /api/results/pending and /api/results/declared endpoints to fetch actual test results from database. Removed all hardcoded test data from frontend
- **AI Analysis Actions**: Implemented three AI-powered analysis features (Generate Report, Predict Performance, Optimize Questions) with context-aware responses. Each action provides different insights based on the action type with structured data including performance metrics, key findings, and recommendations
- **Assessment Workflow Monitoring**: Fixed monitoring logic to correctly calculate active/completed assignments using real database data. Created sample assignments to ensure realistic monitoring displays
- **Question Bank Complete Functionality**: Implemented fully functional Create Question form with dynamic field handling based on question type (MCQ options with correct answer selection, coding language/template fields, scenario answer fields). Added working AI Enhance functionality using backend /api/questions/ai-enhance endpoint that leverages Grok AI with OpenAI fallback. Replaced all toast notifications with inline status messages showing green success or red error states with auto-dismiss timers
- **Activity Log System**: Built comprehensive activity logging system with real-time tracking of all user actions across roles (login, test creation/completion, question approval, system changes). Features include advanced filtering by category/severity/user/date, CSV export functionality, and admin-only access controls
- **Notification System Enhancement**: Fixed notification bell icon to redirect to proper notifications page with live database-driven content and management capabilities (mark as read, delete)
- **Navigation Improvements**: Fixed back button functionality in activity logs page to intelligently navigate users to their appropriate dashboard based on role
- **Beautiful Design System**: Implemented comprehensive unified-design.css with beautiful glassmorphism cards, gradient backgrounds, and modern UI elements
- **Button & Icon Enhancement**: Applied consistent styling to all buttons with proper icon containers, hover effects, and gradient backgrounds across all dashboards
- **Admin Dashboard Redesign**: Enhanced Quick Actions and Super Admin Tools sections with beautiful card layouts and consistent icon styling, added Activity Logs navigation option
- **User Management Polish**: Fixed button display issues in user management table with proper styling and hover effects
- **Question Bank Action Buttons Fix**: Redesigned question action buttons using custom HTML buttons with Tailwind classes, replacing problematic shadcn components that were hiding button content. Now displays colored action buttons (Edit/View/Copy/Delete) with proper icons and hover effects
- **Test Type Selection Feature**: Added 4 specialized test types (Mixed, MCQ Only, Programming Only, General Knowledge) with tailored AI question generation
- **Password Management**: Fixed superadmin password change functionality with consistent hash.salt format
- **Test Management**: Fixed delete test and copy test functionality, resolved JSON parsing errors on 204 responses
- **Question Deletion Bug Fix**: Fixed question deletion functionality by removing JSON parsing on 204 No Content responses
- **UI Icon Improvements**: Upgraded icons throughout system to modern alternatives (Edit3, CheckCircle2, Code2, Settings2, etc.)
- **Enhanced Color Palette**: Updated CSS color scheme with modern HSL values and improved accessibility
- **Database Schema**: Added missing set_number and set_id columns to questions table for multiple question sets support
- **Authentication**: Superadmin credentials updated to: superadmin/Linxadmin123!@#
- **Create Project & Create Group Buttons Fix**: Fixed non-functional Create Project and Create Group buttons by correcting database constraint issue. The employee_groups table had an incorrect NOT NULL constraint on project_id column which was preventing group creation. Updated database to allow nullable project_id as groups can exist independently of projects
- **Logout Redirect Fix**: Fixed logout functionality to redirect users to linxap.com website instead of showing error page. Updated logout route to use proper redirect instead of status response
- **Database Connection Resilience**: Implemented comprehensive connection retry logic with exponential backoff, health monitoring, and connection management. Added DatabaseConnectionManager with automatic reconnection for connection failures, health checks every 60 seconds, and shorter-lived connections for non-critical operations. Created db-wrapper.ts with executeRead/executeWrite functions for operation-specific retry logic. Enhanced database stability for Neon serverless environment with admin command termination handling
- **Employee Dashboard Text Spacing**: Fixed text spacing issues throughout employee dashboard by implementing proper flex column layouts and explicit block display classes. Resolved concatenated text issues in both header ("Employee Dashboard" + "General • ID") and test cards ("Oracle Database Architect" + "Oracle Administration")
- **Test Details Screen**: Created advanced clickable test details page with comprehensive tabs (Overview, Questions, Assignments, Results, Analytics). Made test names clickable throughout the system for detailed views
- **PDF Report Generation**: Completely redesigned PDF skill reports to exactly replicate modal UI structure with card-based layout, visual charts, color-coded sections, and professional formatting. Fixed all text encoding issues by removing problematic characters
- **Skill Domains Catalogue**: Created comprehensive documentation of all 15 technical domains and topics supported by LinxIQ assessment platform, including detailed skill areas, technologies, competency levels, and assessment criteria
- **Password Change Functionality Fixed**: Added dedicated password change section to edit user page with proper form validation, password confirmation, and secure API endpoint integration. Users can now change passwords through a separate collapsible section with clear UI feedback
- **Tech-Focused UI Redesign**: Removed ALL pink/purple colors from skill gap reports per client requirements. Implemented professional tech color scheme using cyan, blue, teal, and slate gray throughout the interface. Changed all card backgrounds from purple gradients to slate/gray gradients for a more professional appearance
- **Industry Analysis Section Added**: Implemented comprehensive Industry Analysis card in skill gap detailed reports with intelligent scaling based on performance levels. Includes salary benchmarking ($45K-130K ranges), industry percentile rankings (Bottom 30%/Middle 40%/Top 30%), market demand analysis, skills match percentage, competition levels, and suitable role recommendations. PDF reports updated to include matching industry analysis section with tech-focused colors
- **Security Monitoring Dynamic State Fix**: Fixed penalty system resetting on modal close by implementing sessionStorage persistence. Security violations now persist throughout test session and display accurate cumulative scores and violation counts
- **Database Health Monitoring**: Added comprehensive health check endpoints (/api/health and /api/admin/database-status) with detailed connection status, retry attempts tracking, and system resource monitoring for administrators
- **ACTIVE ISSUE - Button Functionality**: Manager action buttons in test management and results pages are not responding to clicks (View Results, Declare Results, Generate Analytics buttons need functionality fixes)
- **CRITICAL DATA SYNC ISSUE - Skill Gap Reports**: Frontend displaying hardcoded "Sample Candidate" with 85% score instead of real database data (Ketan, 14% score). Multiple data inconsistencies:
  - Overview tab shows wrong candidate name and score (85% vs actual 14%)
  - Performance tab shows hardcoded 0/7 score despite 14% accuracy
  - Training recommendations showing "No immediate training required" when candidate failed test
  - localStorage caching causing stale data to override fresh API responses
  - Backend contains correct data but frontend not syncing properly
  - Professional UI redesign completed - removed all colorful elements for corporate look

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with CSS variables
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**: Modern design with glassmorphism effects, gradient backgrounds, animated elements, and a focus on responsiveness across all screen sizes. Features include a dark gradient background, animated floating elements, particle effects, and stunning glassmorphism cards.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: PostgreSQL-backed sessions

### System Design Choices
- **Role-Based Access Control (RBAC)**: Comprehensive system with 7 distinct roles (Super Admin, Admin, HR Manager, Reviewer, Team Lead, Employee, Candidate) and over 30 granular permissions. Features include a role hierarchy, permission guards (frontend and backend), and role isolation.
- **AI Integration**: AI-powered role engine with OpenAI GPT-4o, providing intelligent assistance and insights. Includes an intelligent AI fallback system (primary AI model → OpenAI backup) for question generation and analysis.
- **Database Schema**: Designed for universal domain coverage (15 technical domains) and skill levels. Includes schema for users, tests, questions (multiple types, coding language support, technology tags, setNumber and setId for multiple question sets), test assignments, sessions, and results. Domains include: Programming, Frontend, Backend, DevOps, Cloud, Mobile, Data Science, AI/ML, Security, Databases, Networking, VMware Virtualization, Red Hat Administration, Oracle Administration, and Network Routing & Switching.
- **Authentication**: Local strategy with scrypt hashing (hash.salt format) and PostgreSQL-backed sessions. Password change functionality uses consistent hashing format.
- **Question Management**: Supports a variety of question types (MCQ, coding, drag-drop, scenario, fill-blank, matching) with an approval workflow, domain categorization, and AI-powered generation. Features multiple question sets generation (2-10 sets) with unique questions per set.
- **Proctoring System**: Advanced anti-cheating measures without video surveillance, including tab switching detection, developer tool detection, copy/paste prevention, fullscreen enforcement, and real-time security scoring.
- **Candidate Reporting System**: Comprehensive scorecards, journey tracking, security assessment, and downloadable reports with performance analytics.
- **Assessment Workflow**: Clear logical flow: Admin creates tests → Assigns to candidates → Candidates take tests → Results are reviewed → Decisions are made.

## External Dependencies
- **Neon Database**: Serverless PostgreSQL.
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **Embla Carousel**: Carousel component.
- **Replit Integration**: Dev banner and cartographer.
- **ESBuild**: Server bundling.
- **PostCSS**: CSS processing.
- **OpenAI GPT-4o**: For AI question generation and analysis.
```