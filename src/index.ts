// import  {Hono }from 'hono'
// import "dotenv/config"
// import {logger} from 'hono/logger'
// import {userRouter }from './users/users.router'
// import {authRouter} from './authentication/auth.router'
// import { therapistRouter } from './therapists/therapists.router'
// import { sessionRouter } from './session/session.router'
// import { diagnosticRouter } from './diagnostics/diagnostics.router'
// import { feedbackRouter } from './feedback/feedback.router'
// import {bookingsRouter } from './bookings/bookings.router'
// import {resourcesRouter} from './resources/resources.router'
// import { timeSlotRouter } from './time-slot/timeSlot.router'
// import {messageRouter} from './messaging/messaging.router'
// import { serve } from '@hono/node-server'
// import {cors} from 'hono/cors'

// const app = new Hono();
// app.get('/', (c) => {
//     return c.text('the code is okay')
//   })

// //middleware
// app.use(
//   cors({
//     origin: "http://localhost:5173", // ✅ Allow only your frontend
//     credentials: true, // ✅ Allow authentication
//   })
// );

// //routes
// app.route("/api",userRouter)
// app.route("/api",authRouter)
// app.route("/api",therapistRouter)
// app.route("/api",sessionRouter)
// app.route("/api",diagnosticRouter)
// app.route("/api", feedbackRouter)
// app.route("/api", bookingsRouter)
// app.route("/api", resourcesRouter)
// app.route("/api", timeSlotRouter)
// app.route("/api", messageRouter)
// serve({
//     fetch: app.fetch,
//     port:Number(process.env.PORT)
//   })


//index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

// Import routers
import { userRouter } from "./users/users.router";
import { authRouter } from "./authentication/auth.router";
// import { therapistRouter } from "./therapists.router";
import { sessionRouter } from "./session/session.router";
import { diagnosticRouter } from "./diagnostics/diagnostics.router";
import { feedbackRouter } from "./feedback/feedback.router";
import { bookingsRouter } from "./bookings/bookings.router";
import { resourcesRouter } from "./resources/resources.router";
import { timeSlotRouter } from "./time-slot/timeSlot.router";
import { messageRouter } from "./messaging/messaging.router";
import mpesaRouter from "./mpesa/mpesa.router"; // ✅ Import Mpesa router

const app = new Hono();

// Middleware
app.use(logger());
app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // Allow frontend access
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Health check route
app.get("/", (c) => c.text("The code is okay"));

// API Routes
app.route("/api/users", userRouter);
app.route("/api/auth", authRouter);
// app.route("/api/therapists", therapistRouter);
app.route("/api/sessions", sessionRouter);
app.route("/api/diagnostics", diagnosticRouter);
app.route("/api/feedback", feedbackRouter);
app.route("/api/bookings", bookingsRouter);
app.route("/api/resources", resourcesRouter);
app.route("/api/time-slots", timeSlotRouter);
app.route("/api/messages", messageRouter); // Fixed messages route
app.route("/api/mpesa", mpesaRouter); // ✅ Mount Mpesa Router

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Start the server
serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8000,
});

export default app;
