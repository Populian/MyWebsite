CREATE TABLE "schedule_events" (
	"id" serial PRIMARY KEY,
	"event_date" text NOT NULL,
	"title" text NOT NULL,
	"venue" text DEFAULT '',
	"city_country" text DEFAULT '',
	"work_performed" text DEFAULT '',
	"link" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" serial PRIMARY KEY,
	"config_key" text NOT NULL UNIQUE,
	"config_value" text DEFAULT '{}',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"year" integer,
	"category" text DEFAULT '' NOT NULL,
	"medium" text DEFAULT '',
	"description" text DEFAULT '',
	"program_note" text DEFAULT '',
	"premiere_info" text DEFAULT '',
	"festival_selections" text DEFAULT '',
	"youtube_url" text DEFAULT '',
	"soundcloud_url" text DEFAULT '',
	"audio_url" text DEFAULT '',
	"score_pdf_url" text DEFAULT '',
	"cover_image" text DEFAULT '',
	"gallery_images" text DEFAULT '[]',
	"tags" text DEFAULT '[]',
	"featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
