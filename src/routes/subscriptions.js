import express from "express";
import { createSubscription, listSubscriptions, renewSubscription, deleteSubscription } from "../services/subscriptionService.js";

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session?.accessToken) return res.status(401).json({ message: "Unauthorized. Please authenticate via /auth/teams" });
  next();
};

router.use(requireAuth);

// Create a subscription for calendar events
router.post("/", async (req, res) => {
  try {
    const { resource = "/me/events", changeType = "created,updated,deleted", expirationDateTime } = req.body || {};
    const notificationUrl = req.body?.notificationUrl || `${process.env.PUBLIC_BASE_URL}/webhook/ms-graph`;
    const created = await createSubscription(req.session.accessToken, {
      resource,
      changeType,
      notificationUrl,
      expirationDateTime,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create subscription" });
  }
});

// List subscriptions
router.get("/", async (req, res) => {
  try {
    const subs = await listSubscriptions(req.session.accessToken);
    res.json(subs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list subscriptions" });
  }
});

// Renew subscription
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { expirationDateTime } = req.body || {};
    if (!expirationDateTime) return res.status(400).json({ message: "expirationDateTime is required" });
    const updated = await renewSubscription(req.session.accessToken, id, expirationDateTime);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to renew subscription" });
  }
});

// Delete subscription
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSubscription(req.session.accessToken, id);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete subscription" });
  }
});

export default router;
