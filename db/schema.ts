import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const works = pgTable("works", {
  id: serial().primaryKey(),
  title: text().notNull(),
  year: integer(),
  category: text().notNull().default(""),
  medium: text().default(""),
  description: text().default(""),
  programNote: text("program_note").default(""),
  premiereInfo: text("premiere_info").default(""),
  festivalSelections: text("festival_selections").default(""),
  youtubeUrl: text("youtube_url").default(""),
  soundcloudUrl: text("soundcloud_url").default(""),
  audioUrl: text("audio_url").default(""),
  scorePdfUrl: text("score_pdf_url").default(""),
  coverImage: text("cover_image").default(""),
  galleryImages: text("gallery_images").default("[]"),
  tags: text().default("[]"),
  featured: boolean().default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteConfig = pgTable("site_config", {
  id: serial().primaryKey(),
  configKey: text("config_key").notNull().unique(),
  configValue: text("config_value").default("{}"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scheduleEvents = pgTable("schedule_events", {
  id: serial().primaryKey(),
  eventDate: text("event_date").notNull(),
  title: text().notNull(),
  venue: text().default(""),
  cityCountry: text("city_country").default(""),
  workPerformed: text("work_performed").default(""),
  link: text().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
