import express from "express";
import { listEvents, createEvent, updateEvent, deleteEvent, createTeamsMeeting } from "../services/calendarService.js";
// import { Meeting } from "../../models/meeting.js";

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session?.accessToken) return res.status(401).json({ message: "Unauthorized. Please authenticate via /auth/teams" });
  next();
};

router.use(requireAuth);

// List events
router.get("/events", async (req, res) => {
  try {
    const events = await listEvents(req.session.accessToken);
    res.json(events);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list events" });
  }
});

// Create event (optionally online meeting)
router.post("/events", async (req, res) => {
  try {
    const { subject, startDateTime, endDateTime, isOnlineMeeting } = req.body;
    const created = await createEvent(req.session.accessToken, { subject, startDateTime, endDateTime, isOnlineMeeting });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// Update event
router.patch("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateEvent(req.session.accessToken, id, req.body);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// Delete event
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEvent(req.session.accessToken, id);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// Create Teams meeting and persist minimal record
router.post("/meet/create", async (req, res) => {
  try {
    const { subject, startDateTime, endDateTime } = req.body;
    const meetingData = await createTeamsMeeting(req.session.accessToken, { subject, startDateTime, endDateTime });

    // await Meeting.create({
    //   subject: meetingData.subject,
    //   startDateTime: meetingData.start?.dateTime,
    //   endDateTime: meetingData.end?.dateTime,
    //   joinUrl: meetingData.onlineMeeting?.joinUrl,
    // });

    res.status(201).json(meetingData.onlineMeeting || meetingData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create Teams meeting" });
  }
});

export default router;
