import { Client } from "@microsoft/microsoft-graph-client";

const getClient = (accessToken) => {
  if (!accessToken) throw new Error("Missing access token");
  return Client.init({ authProvider: (done) => done(null, accessToken) });
};

// Microsoft Graph subscriptions for calendar events
// changeType: created, updated, deleted (or combination: "created,updated")
// resource examples: 
//  - "/me/events" (delegated)
//  - "/users/{id}/events" (app permissions)
export const createSubscription = async (accessToken, { resource = "/me/events", changeType = "created,updated,deleted", notificationUrl, clientState, expirationDateTime }) => {
  const client = getClient(accessToken);
  const body = {
    changeType,
    notificationUrl,
    resource,
    clientState: clientState || process.env.WEBHOOK_CLIENT_STATE,
  };
  // Expiration: for /events max ~ 4230 minutes (~70 hours). If not provided, set +60 minutes.
  const now = new Date();
  body.expirationDateTime = expirationDateTime || new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  return client.api("/subscriptions").post(body);
};

export const listSubscriptions = async (accessToken) => {
  const client = getClient(accessToken);
  const res = await client.api("/subscriptions").get();
  return res.value || [];
};

export const renewSubscription = async (accessToken, subscriptionId, newExpirationDateTime) => {
  const client = getClient(accessToken);
  const body = { expirationDateTime: newExpirationDateTime };
  return client.api(`/subscriptions/${subscriptionId}`).patch(body);
};

export const deleteSubscription = async (accessToken, subscriptionId) => {
  const client = getClient(accessToken);
  await client.api(`/subscriptions/${subscriptionId}`).delete();
  return { success: true };
};
