import { describe, expect, it } from "vitest";
import { authFlowUrl } from "./auth-flow-url";

describe("authFlowUrl", () => {
  it("preserves an invitation callback while switching auth screens", () => {
    expect(authFlowUrl("/registrazione", "/inviti/invite-token"))
      .toBe("/registrazione?callbackURL=%2Finviti%2Finvite-token");
  });

  it("does not add an empty callback", () => {
    expect(authFlowUrl("/login")).toBe("/login");
  });
});
