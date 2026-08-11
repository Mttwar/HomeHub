import { timingSafeEqual } from "node:crypto";
import { processPendingIntegrationJobs } from "@/server/google/outbox";

function validCronAuthorization(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || supplied.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(secret));
}

export async function GET(request: Request) {
  if (!validCronAuthorization(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await processPendingIntegrationJobs({ limit: 50 });
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
