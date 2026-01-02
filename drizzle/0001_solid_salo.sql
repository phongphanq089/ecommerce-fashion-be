CREATE TABLE "attribute_value" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"attribute_id" uuid NOT NULL,
	CONSTRAINT "attribute_value_attribute_id_value_unique" UNIQUE("attribute_id","value")
);
--> statement-breakpoint
CREATE TABLE "attribute_value_to_variant" (
	"attribute_value_id" uuid NOT NULL,
	"product_variant_id" text NOT NULL,
	CONSTRAINT "attribute_value_to_variant_attribute_value_id_product_variant_id_pk" PRIMARY KEY("attribute_value_id","product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "attribute" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "attribute_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" text PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_variant_id" text NOT NULL,
	CONSTRAINT "cart_item_cart_id_product_variant_id_unique" UNIQUE("cart_id","product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"create_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp,
	"user_id" uuid NOT NULL,
	CONSTRAINT "cart_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" text,
	CONSTRAINT "category_name_unique" UNIQUE("name"),
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"value" double precision NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"url" text NOT NULL,
	"file_type" "media_type" NOT NULL,
	"size" integer NOT NULL,
	"alt_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"folder_id" uuid,
	"file_id" text
);
--> statement-breakpoint
CREATE TABLE "media_folder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"parent_id" uuid
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"price_at_purchase" double precision NOT NULL,
	"order_id" uuid NOT NULL,
	"product_variant_id" text NOT NULL,
	CONSTRAINT "order_item_order_id_product_variant_id_unique" UNIQUE("order_id","product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_amount" double precision NOT NULL,
	"status" "order_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"user_id" uuid NOT NULL,
	"shipping_address_id" text NOT NULL,
	"coupon_id" text,
	"discount_amount" double precision DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING',
	"method" text NOT NULL,
	"transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"order_id" uuid NOT NULL,
	CONSTRAINT "payment_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" text PRIMARY KEY NOT NULL,
	"display_order" integer DEFAULT 0,
	"product_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	CONSTRAINT "product_image_media_id_unique" UNIQUE("media_id"),
	CONSTRAINT "product_image_product_id_media_id_unique" UNIQUE("product_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"price" double precision NOT NULL,
	"stock_quantity" integer DEFAULT 0,
	"product_id" uuid NOT NULL,
	CONSTRAINT "product_variant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp,
	"category_id" text NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "attribute_value_to_variant" ADD CONSTRAINT "attribute_value_to_variant_attribute_value_id_attribute_value_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attribute_value"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_value_to_variant" ADD CONSTRAINT "attribute_value_to_variant_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parent_idx" ON "category" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "product_image_product_idx" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variant_product_idx" ON "product_variant" USING btree ("product_id");