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

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(),
  videoDuration: integer('video_duration'),
  notesUrl: text('notes_url'),
  resources: jsonb('resources').default([]),
  order: integer('order').notNull(),
  isFree: boolean('is_free').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations with proper imports
export const chaptersRelations = relations(chapters, ({ one }) => ({
  course: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id],
  }),
}));

// Types
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;