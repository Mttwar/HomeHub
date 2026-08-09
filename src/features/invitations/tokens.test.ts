import { describe, expect, it } from "vitest";
import { createInvitationToken, hashInvitationToken, maskEmail, normalizeEmail } from "./tokens";

describe("invitation tokens", () => {
  it("generates an opaque token and stores only a deterministic hash", () => {
    const first = createInvitationToken();
    const second = createInvitationToken();
    expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.tokenHash).toBe(hashInvitationToken(first.token));
    expect(first.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(second.token).not.toBe(first.token);
  });

  it("normalizes and masks invitation addresses", () => {
    expect(normalizeEmail("  Mario.Rossi@Example.COM ")).toBe("mario.rossi@example.com");
    expect(maskEmail("mario@example.com")).toBe("ma•••@example.com");
  });
});
