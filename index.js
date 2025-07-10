import express from "express";
import axios from "axios";
import open from "open";
import session from "express-session";
import dotenv from "dotenv";
import { createMeeting } from "./graphClient.js";
import { Meeting } from "./models/meeting.js";

dotenv.config();

const app = express();

app.use(session({
  secret: 'your-very-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));

const authUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize`;
const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;

const SCOPES = ["https://graph.microsoft.com/Calendars.ReadWrite"];

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

  req.session.accessToken = tokenResponse.data.access_token;

  res.send("Authenticated! You can now create a meeting at /create-meeting");
});

app.get("/create-meeting", async (req, res) => {
  const token = req.session.accessToken;
  if (!token) return res.status(401).send("Please authenticate first.");

  const start = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const end = new Date(Date.now() + 90 * 60 * 1000).toISOString();

  try {
    const meetingData = await createMeeting(token, "My Teams Meeting", start, end);

    await Meeting.create({
      subject: meetingData.subject,
      startDateTime: meetingData.start.dateTime,
      endDateTime: meetingData.end.dateTime,
      joinUrl: meetingData.onlineMeeting?.joinUrl
    });

    res.json(meetingData.onlineMeeting);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json(error.response ? error.response.data : { message: error.message });
  }
});

app.listen(3000, () => console.log("Listening at http://localhost:3000"));