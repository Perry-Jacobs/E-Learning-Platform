import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  uuid, 
  integer, 
  jsonb,
  boolean
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.schema';
import { submissions } from './submissions.schema';

export const quizzes = pgTable('quizzes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  timeLimit: integer('time_limit'),
  passingScore: integer('passing_score').default(70).notNull(),
  maxAttempts: integer('max_attempts').default(1).notNull(),
  questions: jsonb('questions').notNull(),
  shuffleQuestions: boolean('shuffle_questions').default(false).notNull(),
  shuffleOptions: boolean('shuffle_options').default(false).notNull(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  submissions: many(submissions),
}));

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

/**
 * Question definition for quiz questions stored in JSONB
 */
export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}