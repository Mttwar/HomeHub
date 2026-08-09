import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession(callbackPath = "/") {
  const session = await getCurrentSession();
  if (!session?.user) {
    const callbackURL = callbackPath.startsWith("/") && !callbackPath.startsWith("//") ? callbackPath : "/";
    redirect(`/login?callbackURL=${encodeURIComponent(callbackURL)}`);
  }
  return session;
}
