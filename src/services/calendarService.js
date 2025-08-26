import { Client } from "@microsoft/microsoft-graph-client";

const getClient = (accessToken) => {
  if (!accessToken) throw new Error("Missing access token");
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
};

export const listEvents = async (accessToken) => {
  const client = getClient(accessToken);
  const res = await client.api("/me/events").select("id,subject,start,end,onlineMeeting").orderby("start/dateTime DESC").get();
  return res.value || [];
};

export const getEvent = async (accessToken, eventId) => {
  const client = getClient(accessToken);
  return client.api(`/me/events/${eventId}`).get();
};

export const createEvent = async (accessToken, { subject, startDateTime, endDateTime, isOnlineMeeting = false }) => {
  const client = getClient(accessToken);
  const body = {
    subject,
    start: { dateTime: startDateTime, timeZone: "UTC" },
    end: { dateTime: endDateTime, timeZone: "UTC" },
  };
  if (isOnlineMeeting) {
    body.isOnlineMeeting = true;
    body.onlineMeetingProvider = "teamsForBusiness";
  }
  return client.api("/me/events").post(body);
};

export const updateEvent = async (accessToken, eventId, updates) => {
  const client = getClient(accessToken);
  const body = {};
  if (updates.subject !== undefined) body.subject = updates.subject;
  if (updates.startDateTime || updates.endDateTime) {
    if (updates.startDateTime) body.start = { dateTime: updates.startDateTime, timeZone: "UTC" };
    if (updates.endDateTime) body.end = { dateTime: updates.endDateTime, timeZone: "UTC" };
  }
  return client.api(`/me/events/${eventId}`).patch(body);
};

export const deleteEvent = async (accessToken, eventId) => {
  const client = getClient(accessToken);
  await client.api(`/me/events/${eventId}`).delete();
  return { success: true };
};

export const createTeamsMeeting = async (accessToken, { subject, startDateTime, endDateTime }) => {
  return createEvent(accessToken, { subject, startDateTime, endDateTime, isOnlineMeeting: true });
};
