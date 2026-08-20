import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  integer,
  boolean,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { assignments } from './assignments.schema';
import { quizzes } from './quizzes.schema';

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assignmentId: uuid('assignment_id')
    .references(() => assignments.id, { onDelete: 'cascade' }),
  quizId: uuid('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  content: text('content'),
  attachments: jsonb('attachments').default([]),
  score: integer('score'),
  feedback: text('feedback'),
  feedbackAttachments: jsonb('feedback_attachments').default([]),
  isGraded: boolean('is_graded').default(false).notNull(),
  isLate: boolean('is_late').default(false).notNull(),
  attemptNumber: integer('attempt_number').default(1).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  gradedAt: timestamp('graded_at'),
});

// Relations with proper imports
export const submissionsRelations = relations(submissions, ({ one }) => ({
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
  }),
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  quiz: one(quizzes, {
    fields: [submissions.quizId],
    references: [quizzes.id],
  }),
}));

// Types
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;