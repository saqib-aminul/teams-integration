import express from "express";
import { getAuthCodeUrl, acquireTokenByCode } from "../config/auth.js";

const router = express.Router();

// Start MS login
router.get("/teams", async (req, res) => {
  try {
    const url = await getAuthCodeUrl();
    res.redirect(url);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to start Teams auth" });
  }
});

// Auth redirect callback
router.get("/teams/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const tokenResponse = await acquireTokenByCode(code);
    req.session.accessToken = tokenResponse.accessToken;
    // Optionally store account for silent token refresh
    req.session.account = tokenResponse.account;
    res.json({ message: "Authenticated with Microsoft", scopes: tokenResponse.scopes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Authentication failed" });
  }
});

export default router;
