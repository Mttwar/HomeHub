import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { sanitizeOriginalName, validateBillAttachment } from "@/features/attachments/validation";

export type StoredAttachment = {
  mimeType: string;
  originalName: string;
  pathname: string;
  sha256: string;
  sizeBytes: number;
  url: string;
};

export class AttachmentUploadError extends Error {}

export async function storePrivateBillAttachment(file: File, apartmentId: string): Promise<StoredAttachment> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new AttachmentUploadError("Storage privato non configurato: aggiungi BLOB_READ_WRITE_TOKEN");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  let validated;
  try {
    validated = validateBillAttachment({ bytes, declaredMimeType: file.type, size: file.size });
  } catch (error) {
    throw new AttachmentUploadError(error instanceof Error ? error.message : "Allegato non valido");
  }
  const pathname = `apartments/${apartmentId}/bills/${randomUUID()}.${validated.extension}`;
  let blob;
  try {
    blob = await put(pathname, bytes, {
      access: "private",
      addRandomSuffix: false,
      contentType: validated.mimeType,
    });
  } catch {
    throw new AttachmentUploadError("Caricamento dell’allegato non riuscito");
  }

  return {
    mimeType: validated.mimeType,
    originalName: sanitizeOriginalName(file.name),
    pathname: blob.pathname,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sizeBytes: file.size,
    url: blob.url,
  };
}

export async function removePrivateAttachment(url: string) {
  await del(url);
}
