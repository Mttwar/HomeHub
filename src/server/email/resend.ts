import "server-only";

import { createHash } from "node:crypto";
import { Resend } from "resend";

let client: Resend | undefined;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  client ??= new Resend(apiKey);
  return client;
}

export function emailIdempotencyKey(kind: string, value: string) {
  return `${kind}-${createHash("sha256").update(value).digest("hex").slice(0, 32)}`;
}

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const resend = getClient();
  const from = process.env.AUTH_EMAIL_FROM?.trim();
  if (!resend || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("Servizio email non configurato");
    return { sent: false as const };
  }

  const { error } = await resend.emails.send(
    { from, to: params.to, subject: params.subject, html: params.html, text: params.text },
    { idempotencyKey: params.idempotencyKey },
  );
  if (error) throw new Error(`Invio email non riuscito: ${error.message}`);
  return { sent: true as const };
}
