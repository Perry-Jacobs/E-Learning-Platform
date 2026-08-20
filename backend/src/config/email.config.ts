import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || 'noreply@e-learning-platform.com',
};

export const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email connection successful');
    return true;
  } catch (error) {
    const err = error as Error;
    console.error('Email connection failed:', err.message);
    return false;
  }
}

/**
 * Email template definitions
 */
export const emailTemplates = {
  welcome: (name: string, email: string) => ({
    subject: 'Welcome to E-Learning Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
          h1 { color: #2c3e50; }
          .content { margin: 30px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to E-Learning Platform</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining our E-Learning Platform! We're excited to have you on board.</p>
            <p><strong>Your email:</strong> ${email}</p>
            <p>Get started by exploring our courses and starting your learning journey.</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} E-Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
  
  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; }
          .button { display: inline-block; padding: 12px 30px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Reset Request</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p class="warning">If you didn't request this, please ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  }),

  courseEnrollment: (courseName: string, studentName: string) => ({
    subject: `You're enrolled in ${courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Congratulations ${studentName}!</h1>
          <p>You've successfully enrolled in <strong>${courseName}</strong>.</p>
          <p>Start learning now and track your progress.</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses/${courseName}" class="button">Start Learning</a>
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  assignmentGraded: (assignmentName: string, score: number, feedback?: string) => ({
    subject: `Your assignment "${assignmentName}" has been graded`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .score { font-size: 48px; color: #2c3e50; text-align: center; }
          .feedback { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Assignment Graded</h1>
          <p>Your assignment <strong>${assignmentName}</strong> has been graded.</p>
          <div class="score">${score}%</div>
          ${feedback ? `<div class="feedback"><strong>Feedback:</strong> ${feedback}</div>` : ''}
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/assignments">View Details</a></p>
        </div>
      </body>
      </html>
    `,
  }),

  quizCompleted: (quizName: string, score: number) => ({
    subject: `Quiz Results: ${quizName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .score { font-size: 48px; color: #2c3e50; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Quiz Completed!</h1>
          <p>You've completed the quiz <strong>${quizName}</strong>.</p>
          <div class="score">${score}%</div>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/quizzes">View Quiz History</a></p>
        </div>
      </body>
      </html>
    `,
  }),
};

/**
 * Send email function
 */
export async function sendEmail(
  to: string, 
  subject: string, 
  html: string
): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    const err = error as Error;
    console.error('Email send failed:', err.message);
    throw error;
  }
}

export default emailConfig;