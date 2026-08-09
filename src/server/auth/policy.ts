import "server-only";

export const emailVerificationRequired =
  process.env.VERCEL_ENV === "production" ||
  process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === "true";

export function assertProductionAuthConfiguration() {
  if (process.env.VERCEL_ENV !== "production") return;
  if (!process.env.RESEND_API_KEY?.trim() || !process.env.AUTH_EMAIL_FROM?.trim()) {
    throw new Error("In produzione configura RESEND_API_KEY e AUTH_EMAIL_FROM per la verifica email");
  }
}
