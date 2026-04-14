import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const influencersTable = pgTable("influencers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  niche: text("niche").notNull(),
  followersCount: integer("followers_count").notNull().default(0),
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  phone: text("phone"),
  whatsappNumber: text("whatsapp_number"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInfluencerSchema = createInsertSchema(influencersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInfluencer = z.infer<typeof insertInfluencerSchema>;
export type Influencer = typeof influencersTable.$inferSelect;
