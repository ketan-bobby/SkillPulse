import type { Express } from "express";
import { emailService } from "./email-service";
import { storage } from "./storage";
import { requirePermission } from "./middleware/permissions";
import { PERMISSIONS } from "@shared/roles";

export function registerEmailRoutes(app: Express) {
  // Test email functionality
  app.post("/api/email/test", requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS), async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      const success = await emailService.sendTestEmail(email);
      
      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Manually trigger welcome email
  app.post("/api/email/welcome/:userId", requirePermission(PERMISSIONS.UPDATE_USER), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const success = await emailService.sendWelcomeEmail(user);
      
      if (success) {
        res.json({ message: "Welcome email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send welcome email" });
      }
    } catch (error) {
      console.error("Welcome email error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Release test results and send notification emails
  app.post("/api/email/results/release/:resultId", requirePermission(PERMISSIONS.VIEW_ALL_RESULTS), async (req, res) => {
    try {
      const resultId = parseInt(req.params.resultId);
      
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }

      const result = await storage.getResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      const user = await storage.getUser(result.userId!);
      const test = result.testId ? await storage.getTest(result.testId) : null;

      if (!user || !test) {
        return res.status(404).json({ message: "User or test not found" });
      }

      const success = await emailService.sendResultsReleasedEmail(user, test, result);
      
      if (success) {
        res.json({ message: "Results notification email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send results notification email" });
      }
    } catch (error) {
      console.error("Results email error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send admin notification
  app.post("/api/email/admin/notify", requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS), async (req, res) => {
    try {
      const { subject, message, details } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }

      // Get all admin emails
      const users = await storage.getAllUsers();
      const adminEmails = users
        .filter(user => ["admin", "super_admin"].includes(user.role) && user.email)
        .map(user => user.email!);

      if (adminEmails.length === 0) {
        return res.status(400).json({ message: "No admin email addresses found" });
      }

      const success = await emailService.sendAdminNotification(adminEmails, subject, message, details);
      
      if (success) {
        res.json({ 
          message: "Admin notification sent successfully",
          recipients: adminEmails.length 
        });
      } else {
        res.status(500).json({ message: "Failed to send admin notification" });
      }
    } catch (error) {
      console.error("Admin notification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bulk email notifications for test assignments
  app.post("/api/email/assignments/bulk", requirePermission(PERMISSIONS.ASSIGN_TEST), async (req, res) => {
    try {
      const { userIds, testId, message } = req.body;
      
      if (!Array.isArray(userIds) || !testId) {
        return res.status(400).json({ message: "User IDs array and test ID are required" });
      }

      const test = await storage.getTest(testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      const recipients = [];
      
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user && user.email) {
          // Create a mock assignment for email template
          const mockAssignment = {
            id: 0,
            userId: user.id,
            testId: test.id,
            assignedBy: req.user!.id,
            status: "assigned" as const,
            dueDate: null,
            createdAt: new Date(),
          };
          
          recipients.push({
            email: user.email,
            template: emailService.EMAIL_TEMPLATES.TEST_ASSIGNMENT(user, test, mockAssignment)
          });
        }
      }

      const { sent, failed } = await emailService.sendBulkEmails(recipients);
      
      res.json({
        message: `Bulk assignment emails processed`,
        sent,
        failed,
        total: recipients.length
      });
    } catch (error) {
      console.error("Bulk assignment email error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get email statistics
  app.get("/api/email/stats", requirePermission(PERMISSIONS.VIEW_ALL_ANALYTICS), async (req, res) => {
    try {
      // This would normally come from an email tracking database
      // For now, return mock statistics
      const stats = {
        totalSent: 0,
        deliveryRate: 95.5,
        openRate: 68.2,
        clickRate: 12.8,
        lastSent: new Date().toISOString(),
        templates: {
          welcome: { sent: 0, delivered: 0 },
          assignment: { sent: 0, delivered: 0 },
          completed: { sent: 0, delivered: 0 },
          results: { sent: 0, delivered: 0 },
          admin: { sent: 0, delivered: 0 }
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Email stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}