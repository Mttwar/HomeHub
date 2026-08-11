import { after } from "next/server";
import { NextResponse } from "next/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { auth } from "@/server/auth/auth";
import { resolveActiveMembership } from "@/server/auth/active-apartment";
import { processPendingIntegrationJobs } from "@/server/google/outbox";
import { activateGoogleCalendar, activateGoogleGmail } from "@/server/google/services";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeRedirectPath(url.searchParams.get("returnTo"), "/");
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.redirect(new URL(`/login?callbackURL=${encodeURIComponent(returnTo)}`, request.url));
  const { membership } = await resolveActiveMembership(session.user.id);
  if (!membership) return NextResponse.redirect(new URL("/appartamenti", request.url));

  try {
    const params = { userId: session.user.id, apartmentId: membership.apartmentId, actorId: session.user.id };
    if (url.searchParams.get("service") === "calendar") {
      await activateGoogleCalendar(params);
      after(() => processPendingIntegrationJobs({ userId: session.user.id, limit: 50 }));
    } else if (url.searchParams.get("service") === "gmail") {
      await activateGoogleGmail(params);
    } else {
      return NextResponse.redirect(new URL(`${returnTo}?google=invalid-service`, request.url));
    }
    return NextResponse.redirect(new URL(`${returnTo}?google=connected`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`${returnTo}?google=error`, request.url));
  }
}
