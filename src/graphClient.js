import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

// Returns a Microsoft Graph client instance that uses a static access token
export const getGraphClient = (accessToken) => {
  if (!accessToken) throw new Error("Access token is required to create Graph client");
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
};

// Creates a Teams online meeting by creating a calendar event with onlineMeeting enabled
export const createMeeting = async (accessToken, subject, startDateTime, endDateTime) => {
  const client = getGraphClient(accessToken);

  const meeting = {
    subject,
    start: { dateTime: startDateTime, timeZone: "UTC" },
    end: { dateTime: endDateTime, timeZone: "UTC" },
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
  };

  const created = await client.api("/me/events").post(meeting);
  return created;
};
