import { Request, Response } from 'express';
import { storage } from './storage';

// Feedback endpoint to handle test completion feedback
export async function handleFeedback(req: Request, res: Response) {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const { testId, resultId, rating, feedback, category } = req.body;
    
    if (!testId || !feedback) {
      return res.status(400).json({ message: "Test ID and feedback are required" });
    }

    // Log feedback in activity logs
    if (req.user) {
      await storage.logActivity({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'Test Feedback Submitted',
        resourceType: 'test',
        resourceId: testId,
        resourceName: `Test ${testId}`,
        details: `Submitted feedback: "${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}"`,
        ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        severity: 'low',
        category: 'user'
      });
    }

    // Store feedback (this could be expanded to store in a dedicated feedback table)
    const feedbackRecord = {
      userId: req.user!.id,
      testId,
      resultId,
      rating: rating || 5,
      feedback: feedback.trim(),
      category: category || 'test_experience',
      submittedAt: new Date()
    };

    // For now, just log the feedback - in a real system, you'd store this in a feedback table
    console.log('Test feedback received:', feedbackRecord);

    res.status(201).json({ 
      message: "Feedback submitted successfully",
      feedbackId: Date.now() // Mock ID
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
}