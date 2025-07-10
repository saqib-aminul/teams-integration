
import axios from "axios";

export const createMeeting = async (accessToken, subject, startDateTime, endDateTime) => {
  const meeting = {
    subject,
    start: { dateTime: startDateTime, timeZone: "UTC" },
    end: { dateTime: endDateTime, timeZone: "UTC" },
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness"
  };

  const response = await axios.post("https://graph.microsoft.com/v1.0/me/events", meeting, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  return response.data;
};
