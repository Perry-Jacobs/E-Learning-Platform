import { 
  pgTable, 
  timestamp, 
  uuid, 
  integer, 
  boolean,
  jsonb,
  decimal,
  text
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { courses } from './courses.schema';
import { chapters } from './chapters.schema';

export const progress = pgTable('progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  completedChapters: jsonb('completed_chapters').default([]),
  currentChapterId: uuid('current_chapter_id')
    .references(() => chapters.id, { onDelete: 'set null' }),
  progressPercentage: integer('progress_percentage').default(0),
  quizScores: jsonb('quiz_scores').default({}),
  assignmentScores: jsonb('assignment_scores').default({}),
  overallGrade: decimal('overall_grade', { precision: 5, scale: 2 }),
  isCompleted: boolean('is_completed').default(false).notNull(),
  isCertified: boolean('is_certified').default(false).notNull(),
  certificateUrl: text('certificate_url'),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Relations with proper imports
export const progressRelations = relations(progress, ({ one }) => ({
  student: one(users, {
    fields: [progress.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [progress.courseId],
    references: [courses.id],
  }),
  currentChapter: one(chapters, {
    fields: [progress.currentChapterId],
    references: [chapters.id],
  }),
}));

// Types
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;