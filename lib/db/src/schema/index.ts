import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const influencersTable = pgTable('influencers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  niche: text('niche').notNull(),
  location: text('location').notNull(),
  followersCount: integer('followers_count').notNull(),
  engagementRate: text('engagement_rate'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const businessesTable = pgTable('businesses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  industry: text('industry'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const adminUsersTable = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
