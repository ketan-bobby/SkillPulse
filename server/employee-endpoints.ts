import { Express } from "express";
import { requirePermission } from "./middleware/permissions";
import { storage } from "./storage";
import { PERMISSIONS, ADDITIONAL_PERMISSIONS } from "@shared/roles";
import { z } from "zod";

export function registerEmployeeEndpoints(app: Express) {
  // Get employee's assigned tests
  app.get("/api/my-assignments", requirePermission([PERMISSIONS.VIEW_OWN_ASSIGNMENTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const assignments = await storage.getUserAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  // Get employee's skill progress
  app.get("/api/my-skills", requirePermission([PERMISSIONS.VIEW_OWN_RESULTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skillProgress = await storage.getUserSkillProgress(userId);
      res.json(skillProgress);
    } catch (error) {
      console.error("Error fetching skill progress:", error);
      res.status(500).json({ error: "Failed to fetch skill progress" });
    }
  });

  // Get employee's recent test results (only if admin has made them visible)
  app.get("/api/my-results", requirePermission([PERMISSIONS.VIEW_OWN_RESULTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const results = await storage.getUserVisibleResults(userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Start a test session for employee
  app.post("/api/start-test/:testId", requirePermission([ADDITIONAL_PERMISSIONS.TAKE_TESTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const testId = parseInt(req.params.testId);
      
      // Check if user has an assignment for this test
      const assignment = await storage.getTestAssignment(userId, testId);
      if (!assignment) {
        return res.status(403).json({ error: "Test not assigned to user" });
      }

      // Create or resume test session
      const session = await storage.createOrResumeTestSession(userId, testId);
      res.json(session);
    } catch (error) {
      console.error("Error starting test:", error);
      res.status(500).json({ error: "Failed to start test" });
    }
  });

  // Submit test answers
  app.post("/api/submit-test/:sessionId", requirePermission([ADDITIONAL_PERMISSIONS.TAKE_TESTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionId = parseInt(req.params.sessionId);
      const { answers, timeSpent, proctoringEvents } = req.body;

      // Validate session belongs to user
      const session = await storage.getTestSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ error: "Invalid session" });
      }

      // Submit test and calculate results
      const result = await storage.submitTest(sessionId, answers, timeSpent, proctoringEvents);
      res.json(result);
    } catch (error) {
      console.error("Error submitting test:", error);
      res.status(500).json({ error: "Failed to submit test" });
    }
  });

  // Get employee's test history
  app.get("/api/my-test-history", requirePermission([PERMISSIONS.VIEW_OWN_RESULTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const history = await storage.getUserTestHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching test history:", error);
      res.status(500).json({ error: "Failed to fetch test history" });
    }
  });

  // Get employee's learning paths
  app.get("/api/my-learning-paths", requirePermission([PERMISSIONS.VIEW_OWN_ASSIGNMENTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const learningPaths = await storage.getUserLearningPaths(userId);
      res.json(learningPaths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  // Update employee profile
  app.patch("/api/my-profile", requirePermission([ADDITIONAL_PERMISSIONS.EDIT_OWN_PROFILE]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Validate update data
      const allowedFields = ['name', 'email', 'skills', 'certifications', 'position', 'domain'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});

      const updatedUser = await storage.updateUser(userId, filteredData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get employee's performance dashboard data
  app.get("/api/my-dashboard", requirePermission([PERMISSIONS.VIEW_OWN_RESULTS]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const [assignments, skillProgress, recentResults] = await Promise.all([
        storage.getUserAssignments(userId),
        storage.getUserSkillProgress(userId),
        storage.getUserRecentResults(userId)
      ]);

      const dashboardData = {
        assignments,
        skillProgress,
        recentResults,
        stats: {
          pendingTests: assignments.filter((a: any) => a.status === 'assigned').length,
          inProgressTests: assignments.filter((a: any) => a.status === 'in_progress').length,
          completedTests: assignments.filter((a: any) => a.status === 'completed').length,
          avgScore: recentResults.length > 0 
            ? Math.round(recentResults.reduce((acc: number, r: any) => acc + r.score, 0) / recentResults.length)
            : 0
        }
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });
}