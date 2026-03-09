CREATE TYPE "public"."product_type" AS ENUM('SINGLE', 'VARIANT');--> statement-breakpoint
CREATE TABLE "brand" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brand_name_unique" UNIQUE("name"),
	CONSTRAINT "brand_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collection" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_to_collection" (
	"product_id" text NOT NULL,
	"collection_id" text NOT NULL,
	"display_order" integer DEFAULT 0,
	CONSTRAINT "product_to_collection_product_id_collection_id_pk" PRIMARY KEY("product_id","collection_id")
);
--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "purchase_price" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "low_stock_quantity" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "brand_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "type" "product_type" DEFAULT 'SINGLE';--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "thumbnail_id" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "is_refunded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "has_warranty" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "meta_title" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "meta_image_id" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "discount_type" "discount_type" DEFAULT 'FIXED';--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "discount_value" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "discount_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "discount_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "disable_shipping" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "refresh_token" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "refresh_token" ADD COLUMN "ip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" text;--> statement-breakpoint
ALTER TABLE "product_to_collection" ADD CONSTRAINT "product_to_collection_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_to_collection" ADD CONSTRAINT "product_to_collection_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");