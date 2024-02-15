CREATE TABLE IF NOT EXISTS "x_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authorId" uuid,
	"content" text,
	"createdAt" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "x_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text,
	"full_name" text
);
