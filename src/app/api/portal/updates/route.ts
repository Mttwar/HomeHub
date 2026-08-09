import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { resolveActiveMembership } from "@/server/auth/active-apartment";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new NextResponse("Non autenticato", { status: 401 });

  const { membership } = await resolveActiveMembership(session.user.id);
  if (!membership) return new NextResponse("Accesso negato", { status: 403 });

  const [latestAudit, latestNotification, unreadNotifications] = await Promise.all([
    db.auditEvent.findFirst({
      where: { apartmentId: membership.apartmentId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    }),
    db.notification.findFirst({
      where: { apartmentId: membership.apartmentId, userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, readAt: true },
    }),
    db.notification.count({
      where: { apartmentId: membership.apartmentId, userId: session.user.id, readAt: null },
    }),
  ]);

  const version = [
    latestAudit?.id ?? "",
    latestAudit?.createdAt.toISOString() ?? "",
    latestNotification?.id ?? "",
    latestNotification?.createdAt.toISOString() ?? "",
    latestNotification?.readAt?.toISOString() ?? "",
    unreadNotifications,
  ].join(":");

  return NextResponse.json({ version }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
