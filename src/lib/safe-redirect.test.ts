import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps internal callback paths", () => {
    expect(safeRedirectPath("/inviti/token", "/onboarding")).toBe("/inviti/token");
  });

  it("rejects protocol-relative and malformed external redirects", () => {
    expect(safeRedirectPath("//evil.example", "/onboarding")).toBe("/onboarding");
    expect(safeRedirectPath("/\\evil.example", "/onboarding")).toBe("/onboarding");
    expect(safeRedirectPath("https://evil.example", "/onboarding")).toBe("/onboarding");
  });
});
