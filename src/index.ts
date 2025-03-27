import  {Hono }from 'hono'
import "dotenv/config"
import {logger} from 'hono/logger'
import {userRouter }from './users/users.router'
import {authRouter} from './authentication/auth.router'
import { therapistRouter } from './therapists/therapists.router'
import { sessionRouter } from './session/session.router'
import { diagnosticRouter } from './diagnostics/diagnostics.router'
import { feedbackRouter } from './feedback/feedback.router'
import {bookingsRouter } from './bookings/bookings.router'
import {resourcesRouter} from './resources/resources.router'
import { timeSlotRouter } from './time-slot/timeSlot.router'
import {messageRouter} from './messaging/messaging.router'
import { serve } from '@hono/node-server'
import {cors} from 'hono/cors'

const app = new Hono();
app.get('/', (c) => {
    return c.text('the code is okay')
  })

//middleware
app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Allow only your frontend
    credentials: true, // ✅ Allow authentication
  })
);

//routes
app.route("/api",userRouter)
app.route("/api",authRouter)
app.route("/api",therapistRouter)
app.route("/api",sessionRouter)
app.route("/api",diagnosticRouter)
app.route("/api", feedbackRouter)
app.route("/api", bookingsRouter)
app.route("/api", resourcesRouter)
app.route("/api", timeSlotRouter)
app.route("/api", messageRouter)
serve({
    fetch: app.fetch,
    port:Number(process.env.PORT)
  })