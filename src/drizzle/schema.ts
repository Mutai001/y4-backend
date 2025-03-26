import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  time,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["admin", "therapist", "patient"]);
export const bookingStatusEnum = pgEnum("booking_status", ["Pending", "Confirmed", "Cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["Pending", "Completed", "Failed"]);
export const messageStatusEnum = pgEnum("message_status", ["Sent", "Read", "Deleted"]);

// Users Table (Unified for Patients and Therapists)
export const users = pgTable("users", {
  id: serial("user_id").primaryKey(),
  full_name: text("full_name").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  contact_phone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  role: roleEnum("role").default("patient").notNull(),
  specialization: varchar("specialization", { length: 255 }), // for therapists
  experience_years: integer("experience_years"),
  profile_picture: text("profile_picture"), // Added profile picture field
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Authentication Table
export const authentication = pgTable("authentication", {
  id: serial("auth_id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  role: roleEnum("role").default("patient").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Messaging Table
export const messages = pgTable("messages", {
  id: serial("message_id").primaryKey(),
  sender_id: integer("sender_id").notNull().references(() => users.id),
  receiver_id: integer("receiver_id").notNull().references(() => users.id),
  booking_id: integer("booking_id").references(() => bookings.id),
  content: text("content").notNull(),
  status: messageStatusEnum("status").default("Sent"),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Available Time Slots Table
export const availableTimeSlots = pgTable("available_time_slots", {
  id: serial("slot_id").primaryKey(),
  therapist_id: integer("therapist_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  is_booked: boolean("is_booked").default(false).notNull(),
}, (table) => ({
  uniqueSlotConstraint: uniqueIndex().on(table.therapist_id, table.date, table.start_time),
}));

// Bookings Table
export const bookings = pgTable("bookings", {
  id: serial("booking_id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  therapist_id: integer("therapist_id").notNull().references(() => users.id),
  slot_id: integer("slot_id").notNull().references(() => availableTimeSlots.id),
  booking_status: bookingStatusEnum("booking_status").default("Pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Sessions Table
export const sessions = pgTable("sessions", {
  id: serial("session_id").primaryKey(),
  booking_id: integer("booking_id").notNull().references(() => bookings.id),
  session_notes: text("session_notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Updated Feedback Table
export const feedback = pgTable("feedback", {
  id: serial("feedback_id").primaryKey(),
  session_id: integer("session_id").notNull().references(() => sessions.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating"),
  comments: text("comments"),
  therapist_notes: text("therapist_notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Diagnostics Table
export const diagnostics = pgTable("diagnostics", {
  id: serial("diagnostic_id").primaryKey(),
  session_id: integer("session_id").notNull().references(() => sessions.id),
  diagnosis: varchar("diagnosis", { length: 255 }).notNull(),
  recommendations: text("recommendations"),
  created_at: timestamp("created_at").defaultNow(),
});

// M-Pesa Transactions Table
export const mpesaTransactions = pgTable("mpesa_transactions", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id").notNull().references(() => bookings.id),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference_code: varchar("reference_code", { length: 50 }).notNull(),
  mpesa_receipt_number: varchar("mpesa_receipt_number", { length: 50 }),
  transaction_date: timestamp("transaction_date").defaultNow().notNull(),
  status: paymentStatusEnum("status").default("Pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Self-Help Resources Table
export const resources = pgTable("resources", {
  id: serial("resource_id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Relations

// bookings has many sessions
export const usersRelations = relations(users, ({ many, one }) => ({
  authentication: one(authentication),
  availableTimeSlots: many(availableTimeSlots),
  bookingsAsPatient: many(bookings, { relationName: "patient_bookings" }),
  bookingsAsTherapist: many(bookings, { relationName: "therapist_bookings" }),
  sentMessages: many(messages, { relationName: "sent_messages" }),
  receivedMessages: many(messages, { relationName: "received_messages" }),
  feedback: many(feedback),
}));

// authentication has one user
export const authenticationRelations = relations(authentication, ({ one }) => ({
  user: one(users, {
    fields: [authentication.user_id],
    references: [users.id],
  }),
}));

// availableTimeSlots has many bookings
export const availableTimeSlotsRelations = relations(availableTimeSlots, ({ one, many }) => ({
  therapist: one(users, {
    fields: [availableTimeSlots.therapist_id],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

// bookings has one user (patient) and one therapist
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  patient: one(users, {
    fields: [bookings.user_id],
    references: [users.id],
    relationName: "patient_bookings",
  }),
  therapist: one(users, {
    fields: [bookings.therapist_id],
    references: [users.id],
    relationName: "therapist_bookings",
  }),
  slot: one(availableTimeSlots, {
    fields: [bookings.slot_id],
    references: [availableTimeSlots.id],
  }),
  sessions: many(sessions),
  mpesaTransaction: many(mpesaTransactions),
  messages: many(messages),
}));

// sessions has one booking and many diagnostics and feedback
export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [sessions.booking_id],
    references: [bookings.id],
  }),
  diagnostics: many(diagnostics),
  feedback: many(feedback),
}));

// feedback has one session and one user
export const diagnosticsRelations = relations(diagnostics, ({ one }) => ({
  session: one(sessions, {
    fields: [diagnostics.session_id],
    references: [sessions.id],
  }),
}));

// feedback has one session and one user
export const feedbackRelations = relations(feedback, ({ one }) => ({
  session: one(sessions, {
    fields: [feedback.session_id],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [feedback.user_id],
    references: [users.id],
  }),
}));

// resources has many feedback
export const mpesaTransactionsRelations = relations(mpesaTransactions, ({ one }) => ({
  booking: one(bookings, {
    fields: [mpesaTransactions.booking_id],
    references: [bookings.id],
  }),
}));

// resources has many feedback
export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
    relationName: "sent_messages",
  }),
  receiver: one(users, {
    fields: [messages.receiver_id],
    references: [users.id],
    relationName: "received_messages",
  }),
  booking: one(bookings, {
    fields: [messages.booking_id],
    references: [bookings.id],
  }),
}));

// Utility Function for Generating Time Slots
export function generateTimeSlots() {
  return [
    { start: "08:00", end: "10:00" },
    { start: "10:00", end: "12:00" },
    { start: "12:00", end: "14:00" },
    { start: "14:00", end: "16:00" },
    { start: "16:00", end: "18:00" }
  ];
}

export const DEFAULT_TIME_SLOTS = generateTimeSlots();

export function createAvailableTimeSlots(
  therapistId: number, 
  date: Date, 
  slots: Array<{start: string, end: string}> = DEFAULT_TIME_SLOTS
) {
  return slots.map(slot => ({
    therapist_id: therapistId,
    date,
    start_time: slot.start,
    end_time: slot.end,
    is_booked: false
  }));
}

// Type Inference
//users table
export type TIUsers = typeof users.$inferInsert;
export type TSUsers = typeof users.$inferSelect;

// authentication table
export type TIAuthentication = typeof authentication.$inferInsert;
export type TSAuthentication = typeof authentication.$inferSelect;

// messages table
export type TIMessages = typeof messages.$inferInsert;
export type TSMessages = typeof messages.$inferSelect;

// available_time_slots table
export type TIAvailableTimeSlots = typeof availableTimeSlots.$inferInsert;
export type TSAvailableTimeSlots = typeof availableTimeSlots.$inferSelect;

// bookings table
export type TIBookings = typeof bookings.$inferInsert;
export type TSBookings = typeof bookings.$inferSelect;

// feedback table
export type TISessions = typeof sessions.$inferInsert;
export type TSSessions = typeof sessions.$inferSelect;

// diagnostics table
export type TIDiagnostics = typeof diagnostics.$inferInsert;
export type TSDiagnostics = typeof diagnostics.$inferSelect;

// feedback table
export type TIFeedback = typeof feedback.$inferInsert;
export type TSFeedback = typeof feedback.$inferSelect;

// mpesa_transactions table
export type TIMpesaTransactions = typeof mpesaTransactions.$inferInsert;
export type TSMpesaTransactions = typeof mpesaTransactions.$inferSelect;

// resources table
export type TIResources = typeof resources.$inferInsert;
export type TSResources = typeof resources.$inferSelect;