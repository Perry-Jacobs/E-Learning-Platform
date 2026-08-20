import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  uuid, 
  integer,
  boolean,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.schema';
import { submissions } from './submissions.schema';

/**
 * Assignments table schema
 * Stores course assignments with submission settings
 */
export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  maxScore: integer('max_score').default(100).notNull(),
  dueDate: timestamp('due_date'),
  attachments: jsonb('attachments').default([]),
  submissionType: varchar('submission_type', { length: 50 }).default('file'),
  allowLateSubmission: boolean('allow_late_submission').default(false).notNull(),
  lateSubmissionPenalty: integer('late_submission_penalty').default(0),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  submissions: many(submissions),
}));

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;