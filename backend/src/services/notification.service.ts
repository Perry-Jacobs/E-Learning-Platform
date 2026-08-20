import { sendEmail, emailTemplates } from '../config/email.config';

/** Notification service for sending various types of emails */
export const NotificationService = {
  /**
   * Sends a welcome email to a new user
   * @param {string} email - Recipient email address
   * @param {string} name - Recipient's full name
   * @returns {Promise<void>}
   */
  sendWelcomeEmail: async (email: string, name: string) => {
    const template = emailTemplates.welcome(name, email);
    await sendEmail(email, template.subject, template.html);
  },

  /**
   * Sends a password reset email with reset link
   * @param {string} email - Recipient email address
   * @param {string} name - Recipient's full name
   * @param {string} resetLink - Password reset URL
   * @returns {Promise<void>}
   */
  sendPasswordResetEmail: async (email: string, name: string, resetLink: string) => {
    const template = emailTemplates.passwordReset(name, resetLink);
    await sendEmail(email, template.subject, template.html);
  },

  /**
   * Sends a course enrollment confirmation email
   * @param {string} email - Recipient email address
   * @param {string} name - Recipient's full name
   * @param {string} courseName - Name of the enrolled course
   * @returns {Promise<void>}
   */
  sendCourseEnrollmentEmail: async (email: string, name: string, courseName: string) => {
    const template = emailTemplates.courseEnrollment(courseName, name);
    await sendEmail(email, template.subject, template.html);
  },

  /**
   * Sends a notification when an assignment has been graded
   * @param {string} email - Recipient email address
   * @param {string} assignmentName - Name of the assignment
   * @param {number} score - Score received
   * @param {string} [feedback] - Optional feedback from instructor
   * @returns {Promise<void>}
   */
  sendAssignmentGradedEmail: async (
    email: string,
    assignmentName: string,
    score: number,
    feedback?: string
  ) => {
    const template = emailTemplates.assignmentGraded(assignmentName, score, feedback);
    await sendEmail(email, template.subject, template.html);
  },

  /**
   * Sends a quiz completion confirmation with score
   * @param {string} email - Recipient email address
   * @param {string} quizName - Name of the quiz
   * @param {number} score - Score achieved
   * @returns {Promise<void>}
   */
  sendQuizCompletedEmail: async (email: string, quizName: string, score: number) => {
    const template = emailTemplates.quizCompleted(quizName, score);
    await sendEmail(email, template.subject, template.html);
  },
};