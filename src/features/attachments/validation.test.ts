import { describe, expect, it } from "vitest";
import { MAX_BILL_ATTACHMENT_BYTES, sanitizeOriginalName, validateBillAttachment } from "@/features/attachments/validation";

describe("validazione allegati bolletta", () => {
  it("riconosce un PDF dalla firma reale", () => {
    const result = validateBillAttachment({ bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]), declaredMimeType: "application/pdf", size: 6 });
    expect(result).toEqual({ extension: "pdf", mimeType: "application/pdf" });
  });

  it("rifiuta un MIME che non corrisponde al contenuto", () => {
    expect(() => validateBillAttachment({ bytes: new Uint8Array([0xff, 0xd8, 0xff]), declaredMimeType: "application/pdf", size: 3 })).toThrow("non corrisponde");
  });

  it("applica il limite di dimensione e pulisce il nome", () => {
    expect(() => validateBillAttachment({ bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]), declaredMimeType: "application/pdf", size: MAX_BILL_ATTACHMENT_BYTES + 1 })).toThrow("3 MB");
    expect(sanitizeOriginalName("\u0000 bolletta.pdf ")).toBe("bolletta.pdf");
  });
});
