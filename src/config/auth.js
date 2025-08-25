import dotenv from "dotenv";
import { ConfidentialClientApplication } from "@azure/msal-node";

dotenv.config();

const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET,
  },
};

const RESOURCE_SCOPES = ["https://graph.microsoft.com/Calendars.ReadWrite"];
const LOGIN_SCOPES = [...RESOURCE_SCOPES, "offline_access", "openid", "profile"];

const cca = new ConfidentialClientApplication(msalConfig);

export const getAuthCodeUrl = async () => {
  return cca.getAuthCodeUrl({ scopes: LOGIN_SCOPES, redirectUri: process.env.REDIRECT_URI });
};

export const acquireTokenByCode = (code) => {
  return cca.acquireTokenByCode({ code, scopes: RESOURCE_SCOPES, redirectUri: process.env.REDIRECT_URI });
};

export { cca, RESOURCE_SCOPES, LOGIN_SCOPES };
