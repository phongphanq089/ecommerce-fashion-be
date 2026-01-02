CREATE TYPE "public"."discount_type" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CUSTOMER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "address" (
	"id" text PRIMARY KEY NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"avatar_url" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "profiles_phone_unique" UNIQUE("phone"),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'CUSTOMER',
	"create_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
