export const MAX_BILL_ATTACHMENT_BYTES = 3 * 1024 * 1024;

export type ValidatedAttachment = {
  extension: "pdf" | "jpg" | "png" | "webp";
  mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
};

const signatures: Array<ValidatedAttachment & { matches: (bytes: Uint8Array) => boolean }> = [
  {
    extension: "pdf",
    mimeType: "application/pdf",
    matches: (bytes) => [0x25, 0x50, 0x44, 0x46, 0x2d].every((value, index) => bytes[index] === value),
  },
  {
    extension: "jpg",
    mimeType: "image/jpeg",
    matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    extension: "png",
    mimeType: "image/png",
    matches: (bytes) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value),
  },
  {
    extension: "webp",
    mimeType: "image/webp",
    matches: (bytes) =>
      [0x52, 0x49, 0x46, 0x46].every((value, index) => bytes[index] === value) &&
      [0x57, 0x45, 0x42, 0x50].every((value, index) => bytes[index + 8] === value),
  },
];

export function validateBillAttachment(input: { bytes: Uint8Array; declaredMimeType: string; size: number }): ValidatedAttachment {
  if (input.size <= 0) throw new Error("Il file selezionato è vuoto");
  if (input.size > MAX_BILL_ATTACHMENT_BYTES) throw new Error("L’allegato non può superare 3 MB");

  const detected = signatures.find((signature) => signature.matches(input.bytes));
  if (!detected) throw new Error("Formato non supportato: usa PDF, JPG, PNG o WebP");
  if (input.declaredMimeType && input.declaredMimeType !== detected.mimeType) {
    throw new Error("Il contenuto del file non corrisponde al formato dichiarato");
  }

  return { extension: detected.extension, mimeType: detected.mimeType };
}

export function sanitizeOriginalName(name: string) {
  const clean = name.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return (clean || "bolletta").slice(0, 180);
}
