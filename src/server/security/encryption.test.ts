import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { decryptSensitiveString, encryptSensitiveString, isDataEncryptionConfigured } from "./encryption";

describe("application encryption", () => {
  const previousKey = process.env.DATA_ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  afterEach(() => {
    if (previousKey === undefined) delete process.env.DATA_ENCRYPTION_KEY;
    else process.env.DATA_ENCRYPTION_KEY = previousKey;
  });

  it("round-trips a sensitive value without persisting plaintext", () => {
    const encrypted = encryptSensitiveString("messaggio riservato", "email:test:body");
    expect(encrypted).not.toContain("messaggio riservato");
    expect(decryptSensitiveString(encrypted, "email:test:body")).toBe("messaggio riservato");
  });

  it("binds ciphertext to its record context", () => {
    const encrypted = encryptSensitiveString("segreto", "email:one:body");
    expect(() => decryptSensitiveString(encrypted, "email:two:body")).toThrow();
  });

  it("rejects missing or malformed keys", () => {
    process.env.DATA_ENCRYPTION_KEY = "not-a-32-byte-key";
    expect(isDataEncryptionConfigured()).toBe(false);
    expect(() => encryptSensitiveString("x", "context")).toThrow(/32 byte/);
  });
});
