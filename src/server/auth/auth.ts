import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { getAppUrl, getTrustedOrigins } from "@/server/app-url";
import { db } from "@/server/db";
import { emailIdempotencyKey, sendTransactionalEmail } from "@/server/email/resend";
import { passwordResetEmail, verificationEmail } from "@/server/email/templates";
import { assertProductionAuthConfiguration, emailVerificationRequired } from "@/server/auth/policy";

assertProductionAuthConfiguration();

export const auth = betterAuth({
  baseURL: getAppUrl(),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: emailVerificationRequired,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }) => {
      const template = passwordResetEmail(user.name, url);
      after(() => sendTransactionalEmail({ to: user.email, subject: "Reimposta la password di CasaHub", ...template, idempotencyKey: emailIdempotencyKey("password-reset", token) }));
    },
  },
  emailVerification: {
    sendOnSignUp: emailVerificationRequired,
    sendOnSignIn: emailVerificationRequired,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      const template = verificationEmail(user.name, url);
      after(() => sendTransactionalEmail({ to: user.email, subject: "Verifica il tuo account CasaHub", ...template, idempotencyKey: emailIdempotencyKey("email-verification", token) }));
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    storage: "database",
    modelName: "rateLimit",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },
  trustedOrigins: getTrustedOrigins(),
  plugins: [nextCookies()],
});
