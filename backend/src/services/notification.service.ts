import { sendEmail, emailTemplates } from '../config/email.config';

export const NotificationService = {
  sendWelcomeEmail: async (email: string, name: string) => {
    const template = emailTemplates.welcome(name, email);
    await sendEmail(email, template.subject, template.html);
  },

  sendPasswordResetEmail: async (email: string, name: string, resetLink: string) => {
    const template = emailTemplates.passwordReset(name, resetLink);
    await sendEmail(email, template.subject, template.html);
  },

  sendCourseEnrollmentEmail: async (email: string, name: string, courseName: string) => {
    const template = emailTemplates.courseEnrollment(courseName, name);
    await sendEmail(email, template.subject, template.html);
  },

  sendAssignmentGradedEmail: async (
    email: string,
    assignmentName: string,
    score: number,
    feedback?: string
  ) => {
    const template = emailTemplates.assignmentGraded(assignmentName, score, feedback);
    await sendEmail(email, template.subject, template.html);
  },

  sendQuizCompletedEmail: async (email: string, quizName: string, score: number) => {
    const template = emailTemplates.quizCompleted(quizName, score);
    await sendEmail(email, template.subject, template.html);
  },
};