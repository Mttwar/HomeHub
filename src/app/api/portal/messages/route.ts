import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { resolveActiveMembership } from "@/server/auth/active-apartment";
import { getMessagesForMember } from "@/server/dal/portal";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new NextResponse("Non autenticato", { status: 401 });

  const { membership } = await resolveActiveMembership(session.user.id);
  if (!membership) return new NextResponse("Accesso negato", { status: 403 });

  const rawCounterpartId = request.nextUrl.searchParams.get("counterpartId");
  const parsedCounterpartId = rawCounterpartId ? z.string().cuid().safeParse(rawCounterpartId) : null;
  if (parsedCounterpartId && !parsedCounterpartId.success) {
    return new NextResponse("Conversazione non valida", { status: 400 });
  }

  const data = await getMessagesForMember({
    userId: session.user.id,
    apartmentId: membership.apartmentId,
    role: membership.role,
  }, parsedCounterpartId?.data);

  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
