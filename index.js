import express from "express";
import axios from "axios";
import open from "open";

import dotenv from "dotenv";
dotenv.config();

const app = express();

const authUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize`;
const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;

const SCOPES = ["https://graph.microsoft.com/Calendars.ReadWrite"]; // Changed scope

let accessToken = ""; // Store access token

app.get("/", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.REDIRECT_URI,
    response_mode: "query",
    scope: SCOPES.join(" "),
  });

  const fullUrl = `${authUrl}?${params.toString()}`;
  open(fullUrl);
  res.send("Opening Microsoft login...");
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  const tokenResponse = await axios.post(
    tokenUrl,
    new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      scope: SCOPES.join(" "),
      code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: "authorization_code",
      client_secret: process.env.CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  accessToken = tokenResponse.data.access_token; // Store access token

  res.send("Authentication successful! You can now create a meeting at /create-meeting");
});

// New route to create a meeting
app.get("/create-meeting", async (req, res) => {
  if (!accessToken) {
    return res.status(401).send("Authentication required. Please go to the root path to authenticate.");
  }

  const event = {
    subject: "My Teams Meeting",
    start: {
      dateTime: new Date(new Date().getTime() + 3600000).toISOString(), // 1 hour from now
      timeZone: "UTC",
    },
    end: {
      dateTime: new Date(new Date().getTime() + 3600000 + 1800000).toISOString(), // 1.5 hours from now
      timeZone: "UTC",
    },
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
  };

  try {
    const response = await axios.post("https://graph.microsoft.com/v1.0/me/events", event, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data.onlineMeeting);
  } catch (error) {
    console.error(error.response.data);
    res.status(500).json(error.response.data);
  }
});


app.listen(3000, () => console.log("Listening at http://localhost:3000"));