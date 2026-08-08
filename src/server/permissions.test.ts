import { describe, expect, it } from "vitest";
import { assertCan, can } from "@/server/permissions";

describe("permessi del portale", () => {
  it("consente al proprietario le operazioni amministrative", () => {
    expect(can("OWNER", "apartment:update")).toBe(true);
    expect(can("OWNER", "membership:update")).toBe(true);
    expect(can("OWNER", "bill:create")).toBe(true);
    expect(can("OWNER", "bill:update")).toBe(true);
    expect(can("OWNER", "expense:update")).toBe(true);
    expect(can("OWNER", "rent:create")).toBe(true);
    expect(can("OWNER", "issue:update")).toBe(true);
    expect(can("OWNER", "document:create")).toBe(true);
  });

  it("limita l'inquilino a segnalazioni e messaggi", () => {
    expect(can("TENANT", "issue:create")).toBe(true);
    expect(can("TENANT", "message:create")).toBe(true);
    expect(can("TENANT", "issue:comment")).toBe(true);
    expect(can("TENANT", "event:respond")).toBe(true);
    expect(can("TENANT", "bill:create")).toBe(false);
    expect(can("TENANT", "apartment:update")).toBe(false);
    expect(can("TENANT", "membership:update")).toBe(false);
    expect(can("TENANT", "bill:update")).toBe(false);
    expect(can("TENANT", "expense:update")).toBe(false);
    expect(can("TENANT", "rent:create")).toBe(false);
    expect(can("TENANT", "issue:update")).toBe(false);
  });

  it("rifiuta esplicitamente un'azione non autorizzata", () => {
    expect(() => assertCan("TENANT", "expense:create")).toThrow("Operazione non autorizzata");
  });
});
