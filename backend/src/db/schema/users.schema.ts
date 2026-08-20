import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  uuid,
  pgEnum,
  boolean
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.schema';
import { progress } from './progress.schema';
import { threads } from './discussions.schema';
import { submissions } from './submissions.schema';

/**
 * User role enum
 */
export const userRoleEnum = pgEnum('user_role', ['student', 'lecturer', 'admin']);

/**
 * Users table schema
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('student').notNull(),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  isVerified: boolean('is_verified').default(false).notNull(),
  refreshToken: text('refresh_token'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Users table relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  progress: many(progress),
  threads: many(threads),
  submissions: many(submissions),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;