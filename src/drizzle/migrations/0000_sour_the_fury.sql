CREATE TYPE "public"."booking_status" AS ENUM('Pending', 'Confirmed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('Sent', 'Read', 'Deleted');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'therapist', 'patient');--> statement-breakpoint
CREATE TABLE "authentication" (
	"auth_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'patient' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "authentication_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "available_time_slots" (
	"slot_id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_booked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"booking_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"therapist_id" integer NOT NULL,
	"slot_id" integer NOT NULL,
	"booking_status" "booking_status" DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "diagnostics" (
	"diagnostic_id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"diagnosis" varchar(255) NOT NULL,
	"recommendations" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"feedback_id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer,
	"comments" text,
	"therapist_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"booking_id" integer,
	"content" text NOT NULL,
	"status" "message_status" DEFAULT 'Sent',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpesa_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"phone_number" varchar(15) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reference_code" varchar(50) NOT NULL,
	"mpesa_receipt_number" varchar(50),
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"status" "payment_status" DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"resource_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"session_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"contact_phone" varchar(20),
	"address" text,
	"role" "role" DEFAULT 'patient' NOT NULL,
	"specialization" varchar(255),
	"experience_years" integer,
	"profile_picture" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "authentication" ADD CONSTRAINT "authentication_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "available_time_slots" ADD CONSTRAINT "available_time_slots_therapist_id_users_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_therapist_id_users_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_available_time_slots_slot_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."available_time_slots"("slot_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_session_id_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_session_id_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_bookings_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpesa_transactions" ADD CONSTRAINT "mpesa_transactions_booking_id_bookings_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_booking_id_bookings_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "available_time_slots_therapist_id_date_start_time_index" ON "available_time_slots" USING btree ("therapist_id","date","start_time");