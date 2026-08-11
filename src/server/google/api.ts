import "server-only";

import { GoogleIntegrationError } from "@/server/google/errors";

type GoogleErrorPayload = { error?: { status?: string; errors?: Array<{ reason?: string }> } };

function googleErrorCode(status: number, payload: GoogleErrorPayload | null) {
  const reason = payload?.error?.errors?.[0]?.reason ?? payload?.error?.status;
  const safeReason = reason?.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 60).toUpperCase();
  return `GOOGLE_${status}${safeReason ? `_${safeReason}` : ""}`;
}

export async function googleApiFetch<T>(accessToken: string, url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    let payload: GoogleErrorPayload | null = null;
    try { payload = await response.json() as GoogleErrorPayload; } catch { /* never persist response bodies */ }
    const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
    throw new GoogleIntegrationError(googleErrorCode(response.status, payload), retryable);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
