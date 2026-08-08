import { get } from "@vercel/blob";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new NextResponse("Non autenticato", { status: 401 });

  const membership = await db.apartmentMembership.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) return new NextResponse("Accesso negato", { status: 403 });

  const { id } = await params;
  const attachment = await db.attachment.findFirst({
    where: {
      id,
      apartmentId: membership.apartmentId,
      billId: { not: null },
      status: "CLEAN",
      ...(membership.role === "TENANT" ? { visibility: "SHARED" as const } : {}),
    },
  });
  if (!attachment) return new NextResponse("Allegato non trovato", { status: 404 });

  try {
    const ifNoneMatch = request.headers.get("if-none-match");
    const result = await get(attachment.storageKey, {
      access: "private",
      ...(ifNoneMatch ? { ifNoneMatch } : {}),
    });
    if (!result) return new NextResponse("Allegato non trovato", { status: 404 });
    if (result.statusCode === 304) {
      return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, "Cache-Control": "private, no-cache" } });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
        "Content-Type": result.blob.contentType ?? attachment.mimeType,
        ETag: result.blob.etag,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Storage temporaneamente non disponibile", { status: 503 });
  }
}
