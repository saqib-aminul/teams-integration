import express from "express";
import session from "express-session";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";
import subscriptionsRoutes from "./routes/subscriptions.js";
import webhookRoutes from "./routes/webhook.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-very-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set true when behind HTTPS
  })
);

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Root -> start Teams login
app.get("/", (req, res) => res.redirect("/auth/teams"));

// Routes (mirror google-meet structure)
app.use("/auth", authRoutes);
app.use("/api/teams/calendar", calendarRoutes);
app.use("/api/teams/subscriptions", subscriptionsRoutes);
app.use("/webhook/ms-graph", webhookRoutes);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
