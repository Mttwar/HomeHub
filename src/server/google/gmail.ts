import "server-only";

import { googleApiFetch } from "@/server/google/api";
import { GOOGLE_GMAIL_SEND_SCOPE } from "@/server/google/constants";
import { getGoogleAccessToken } from "@/server/google/tokens";

type GmailMessage = { id: string; threadId?: string };

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodedHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(singleLine(value), "utf8").toString("base64")}?=`;
}

function mimeMessage(params: { id: string; from: string; to: string; subject: string; body: string }) {
  const lines = [
    `From: ${singleLine(params.from)}`,
    `To: ${singleLine(params.to)}`,
    `Subject: ${encodedHeader(params.subject)}`,
    `Message-ID: <casahub-${params.id}@mail.casahub.local>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    params.body.replace(/\r?\n/g, "\r\n"),
  ].join("\r\n");
  return Buffer.from(lines, "utf8").toString("base64url");
}

export async function sendGmailMessage(params: { deliveryId: string; userId: string; from: string; to: string; subject: string; body: string }) {
  const accessToken = await getGoogleAccessToken(params.userId, GOOGLE_GMAIL_SEND_SCOPE);
  return googleApiFetch<GmailMessage>(accessToken, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    body: JSON.stringify({ raw: mimeMessage({ id: params.deliveryId, from: params.from, to: params.to, subject: params.subject, body: params.body }) }),
  });
}
