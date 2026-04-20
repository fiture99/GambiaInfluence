export * from "./influencers";
export * from "./businesses";

import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminUser = typeof adminUsersTable.$inferSelect;

// ─── Our Influencers Tables ───────────────────────────────────────────────────

export const oiUsersTable = pgTable("oi_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["admin", "client"] }).notNull().default("client"),
  companyName: text("company_name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export type OiUser = typeof oiUsersTable.$inferSelect;

export const oiCampaignsTable = pgTable("oi_campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  budget: text("budget"),
  status: text("status", { enum: ["pending", "active", "posted", "completed", "cancelled"] }).notNull().default("pending"),
  postUrl: text("post_url"),
  postedAt: timestamp("posted_at"),
  clientId: serial("client_id").notNull(),
  influencerId: serial("influencer_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export type OiCampaign = typeof oiCampaignsTable.$inferSelect;

export const oiQuickPromotionsTable = pgTable("oi_quick_promotions", {
  id: serial("id").primaryKey(),
  influencerId: serial("influencer_id").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  description: text("description").notNull(),
  promoType: text("promo_type").notNull(),
  status: text("status", { enum: ["new", "contacted", "in_progress", "done"] }).notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
