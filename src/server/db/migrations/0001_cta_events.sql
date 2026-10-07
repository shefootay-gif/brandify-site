CREATE TABLE "cta_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"cta" text DEFAULT '' NOT NULL,
	"page" text DEFAULT '' NOT NULL,
	"locale" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cta_events_created_idx" ON "cta_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cta_events_type_idx" ON "cta_events" USING btree ("type");