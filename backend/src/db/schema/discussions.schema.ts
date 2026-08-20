import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  integer,
  boolean,
  jsonb,
  AnyPgColumn
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { courses } from './courses.schema';

/**
 * Threads table schema (discussion topics)
 */
export const threads = pgTable('threads', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  isPinned: boolean('is_pinned').default(false).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  isAnnouncement: boolean('is_announcement').default(false).notNull(),
  viewCount: integer('view_count').default(0),
  replyCount: integer('reply_count').default(0),
  tags: jsonb('tags').default([]),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Replies table schema (responses to threads)
 */
export const replies = pgTable('replies', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  threadId: uuid('thread_id')
    .notNull()
    .references(() => threads.id, { onDelete: 'cascade' }),
  parentReplyId: uuid('parent_reply_id')
    .references((): AnyPgColumn => replies.id, { onDelete: 'set null' }),
  isEdited: boolean('is_edited').default(false).notNull(),
  likes: integer('likes').default(0),
  isBestAnswer: boolean('is_best_answer').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [threads.courseId],
    references: [courses.id],
  }),
  replies: many(replies),
}));

export const repliesRelations = relations(replies, ({ one }) => ({
  author: one(users, {
    fields: [replies.authorId],
    references: [users.id],
  }),
  thread: one(threads, {
    fields: [replies.threadId],
    references: [threads.id],
  }),
  parentReply: one(replies, {
    fields: [replies.parentReplyId],
    references: [replies.id],
  }),
}));

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
export type Reply = typeof replies.$inferSelect;
export type NewReply = typeof replies.$inferInsert;