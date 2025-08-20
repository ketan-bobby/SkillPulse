import { MailService } from '@sendgrid/mail';
import { User, Test, TestResult, TestAssignment } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

// Default sender email - update this to your verified SendGrid sender
const DEFAULT_SENDER = 'noreply@linxassess.com';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: (user: User): EmailTemplate => ({
    subject: 'Welcome to LinxIQ - Your Account is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to LinxIQ</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Engineer-Grade Assessments Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your LinxIQ account has been successfully created. You now have access to our comprehensive 
            technical assessment platform with AI-powered features.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Account Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Username:</strong> ${user.username}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Role:</strong> ${user.role.replace('_', ' ').toUpperCase()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Department:</strong> ${user.department || 'Not specified'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/auth" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Access LinxIQ Platform
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you have any questions, please contact your administrator or reply to this email.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} LinxIQ. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Welcome to LinxIQ!

Hello ${user.name},

Your LinxIQ account has been successfully created. 

Account Details:
- Username: ${user.username}
- Role: ${user.role.replace('_', ' ').toUpperCase()}
- Department: ${user.department || 'Not specified'}

Access the platform at: ${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/auth

If you have any questions, please contact your administrator.

© ${new Date().getFullYear()} LinxIQ. All rights reserved.`
  }),

  TEST_ASSIGNMENT: (user: User, test: Test, assignment: TestAssignment): EmailTemplate => ({
    subject: `New Test Assignment: ${test.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Test Assignment</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have been assigned a new technical assessment that requires your attention.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe;">
            <h3 style="color: #333; margin: 0 0 15px 0;">${test.title}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Domain:</strong> ${test.domain}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Level:</strong> ${test.level}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Duration:</strong> ${test.duration} minutes</p>
            <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Not specified'}</p>
          </div>
          
          ${test.description ? `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">Test Description</h4>
            <p style="color: #666; margin: 0; line-height: 1.5;">${test.description}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}" 
               style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Take Test Now
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Please complete this assessment by the due date. Contact your administrator if you have any questions.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} LinxIQ. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `New Test Assignment

Hello ${user.name},

You have been assigned a new technical assessment: ${test.title}

Test Details:
- Domain: ${test.domain}
- Level: ${test.level}
- Duration: ${test.duration} minutes
- Due Date: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Not specified'}

${test.description ? `Description: ${test.description}` : ''}

Access the platform to take your test: ${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}

Please complete this assessment by the due date.

© ${new Date().getFullYear()} LinxIQ. All rights reserved.`
  }),

  TEST_COMPLETED: (user: User, test: Test, result: TestResult): EmailTemplate => ({
    subject: `Test Completed: ${test.title} - Results Available`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">Test Completed Successfully</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have successfully completed your technical assessment. Your results have been recorded and are being reviewed.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #333; margin: 0 0 15px 0;">${test.title}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Completed:</strong> ${result.completedAt ? new Date(result.completedAt).toLocaleString() : 'Just now'}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Time Spent:</strong> ${result.timeSpent ? `${Math.round(result.timeSpent / 60)} minutes` : 'N/A'}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> Submitted for Review</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <h4 style="color: #856404; margin: 0 0 10px 0;">📊 Results Under Review</h4>
            <p style="color: #856404; margin: 0; line-height: 1.5;">
              Your results are currently being reviewed by our assessment team. You'll receive detailed feedback and scores once the review is complete.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/results" 
               style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Test History
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Thank you for taking the assessment. We'll notify you when your detailed results are available.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} LinxIQ. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Test Completed Successfully

Hello ${user.name},

You have successfully completed your technical assessment: ${test.title}

Test Details:
- Completed: ${result.completedAt ? new Date(result.completedAt).toLocaleString() : 'Just now'}
- Time Spent: ${result.timeSpent ? `${Math.round(result.timeSpent / 60)} minutes` : 'N/A'}
- Status: Submitted for Review

Your results are currently being reviewed. You'll receive detailed feedback once the review is complete.

View your test history: ${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/results

© ${new Date().getFullYear()} LinxIQ. All rights reserved.`
  }),

  RESULTS_RELEASED: (user: User, test: Test, result: TestResult): EmailTemplate => ({
    subject: `Test Results Available: ${test.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Test Results Available</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your test results have been reviewed and are now available for viewing.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin: 0 0 15px 0;">${test.title}</h3>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
              <h2 style="color: #667eea; margin: 0; font-size: 36px;">${result.score}%</h2>
              <p style="color: #666; margin: 5px 0 0 0;">Final Score</p>
            </div>
            <p style="margin: 10px 0; color: #666;"><strong>Domain:</strong> ${test.domain}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Level:</strong> ${test.level}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Completed:</strong> ${result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'Recently'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/results" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Detailed Results
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Log in to view your detailed performance analysis, including domain-specific breakdowns and recommendations.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} LinxIQ. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Test Results Available

Hello ${user.name},

Your test results for "${test.title}" have been reviewed and are now available.

Final Score: ${result.score}%
Domain: ${test.domain}
Level: ${test.level}
Completed: ${result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'Recently'}

View your detailed results: ${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/results

© ${new Date().getFullYear()} LinxIQ. All rights reserved.`
  }),

  ADMIN_NOTIFICATION: (subject: string, message: string, details?: any): EmailTemplate => ({
    subject: `LinxIQ Admin Alert: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Admin Notification</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p style="color: #666; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          
          ${details ? `
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #333; margin: 0 0 10px 0;">Additional Details</h4>
            <pre style="color: #666; margin: 0; font-size: 12px; white-space: pre-wrap;">${JSON.stringify(details, null, 2)}</pre>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/admin" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Admin Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} LinxIQ Admin System. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `LinxIQ Admin Alert: ${subject}

${message}

${details ? `Additional Details:\n${JSON.stringify(details, null, 2)}` : ''}

View admin dashboard: ${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000'}/admin

© ${new Date().getFullYear()} LinxIQ Admin System. All rights reserved.`
  })
};

export class EmailService {
  private async sendEmail(to: string, template: EmailTemplate, from: string = DEFAULT_SENDER): Promise<boolean> {
    try {
      await mailService.send({
        to,
        from,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      console.log(`Email sent successfully to ${to}: ${template.subject}`);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  // User lifecycle emails
  async sendWelcomeEmail(user: User): Promise<boolean> {
    if (!user.email) {
      console.warn(`Cannot send welcome email to user ${user.username}: no email address`);
      return false;
    }
    const template = EMAIL_TEMPLATES.WELCOME(user);
    return this.sendEmail(user.email, template);
  }

  // Test-related emails
  async sendTestAssignmentEmail(user: User, test: Test, assignment: TestAssignment): Promise<boolean> {
    if (!user.email) {
      console.warn(`Cannot send test assignment email to user ${user.username}: no email address`);
      return false;
    }
    const template = EMAIL_TEMPLATES.TEST_ASSIGNMENT(user, test, assignment);
    return this.sendEmail(user.email, template);
  }

  async sendTestCompletedEmail(user: User, test: Test, result: TestResult): Promise<boolean> {
    if (!user.email) {
      console.warn(`Cannot send test completed email to user ${user.username}: no email address`);
      return false;
    }
    const template = EMAIL_TEMPLATES.TEST_COMPLETED(user, test, result);
    return this.sendEmail(user.email, template);
  }

  async sendResultsReleasedEmail(user: User, test: Test, result: TestResult): Promise<boolean> {
    if (!user.email) {
      console.warn(`Cannot send results email to user ${user.username}: no email address`);
      return false;
    }
    const template = EMAIL_TEMPLATES.RESULTS_RELEASED(user, test, result);
    return this.sendEmail(user.email, template);
  }

  // Admin notifications
  async sendAdminNotification(adminEmails: string[], subject: string, message: string, details?: any): Promise<boolean> {
    const template = EMAIL_TEMPLATES.ADMIN_NOTIFICATION(subject, message, details);
    
    const promises = adminEmails.map(email => this.sendEmail(email, template));
    const results = await Promise.all(promises);
    
    return results.every(result => result);
  }

  // Bulk operations
  async sendBulkEmails(recipients: Array<{ email: string; template: EmailTemplate }>): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const success = await this.sendEmail(recipient.email, recipient.template);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  }

  // Test email functionality
  async sendTestEmail(to: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'LinxIQ Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">✅ Email Service Working!</h1>
          <p>This is a test email from LinxIQ to verify SendGrid integration.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
      text: `LinxIQ Email Service Test\n\nThis is a test email to verify SendGrid integration.\nTimestamp: ${new Date().toISOString()}`
    };

    return this.sendEmail(to, template);
  }
}

export const emailService = new EmailService();