import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getAppUrl, getTrustedOrigins } from "@/server/app-url";
import { db } from "@/server/db";

export const auth = betterAuth({
  baseURL: getAppUrl(),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  trustedOrigins: getTrustedOrigins(),
  plugins: [nextCookies()],
});
