import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  uuid, 
  integer, 
  decimal,
  boolean,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { chapters } from './chapters.schema';
import { assignments } from './assignments.schema';
import { quizzes } from './quizzes.schema';
import { progress } from './progress.schema';
import { threads } from './discussions.schema';

/**
 * Courses table schema
 * Main course entity with instructor, pricing, and metadata
 */
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  thumbnail: text('thumbnail').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).default('0').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  instructorId: uuid('instructor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  students: jsonb('students').default([]),
  prerequisites: jsonb('prerequisites').default([]),
  whatYouWillLearn: jsonb('what_you_will_learn').default([]),
  requirements: jsonb('requirements').default([]),
  targetAudience: jsonb('target_audience').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  assignments: many(assignments),
  quizzes: many(quizzes),
  progress: many(progress),
  threads: many(threads),
}));

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;