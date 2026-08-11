export const GOOGLE_PROVIDER_ID = "google";
export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.app.created";
export const GOOGLE_GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export function isGoogleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function parseGoogleScopes(scope: string | null | undefined) {
  return new Set((scope ?? "").split(/[,\s]+/).map((value) => value.trim()).filter(Boolean));
}
