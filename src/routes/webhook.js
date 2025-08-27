import express from "express";

const router = express.Router();

// Microsoft Graph subscription validation
router.get("/", (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    // Must return the token as plain text to confirm the endpoint
    return res.status(200).send(validationToken);
  }
  return res.status(400).json({ message: "Missing validationToken" });
});

// Microsoft Graph notifications receiver
router.post("/", express.json({ type: "application/json" }), async (req, res) => {
  try {
    const notifications = req.body?.value || [];
    // Immediately 202 as per Graph best practices
    res.sendStatus(202);

    // Process asynchronously
    for (const n of notifications) {
      const { clientState, resource, changeType, subscriptionId, resourceData } = n;
      if (process.env.WEBHOOK_CLIENT_STATE && clientState !== process.env.WEBHOOK_CLIENT_STATE) {
        console.warn("Ignoring notification with invalid clientState", { subscriptionId });
        continue;
      }
      // TODO: fetch latest resource using Graph if needed (requires stored user/app token)
      console.log("Graph notification:", { subscriptionId, changeType, resource, resourceData });
    }
  } catch (e) {
    console.error("Webhook processing error", e);
    // We've already acknowledged with 202, nothing else to do
  }
});

export default router;
