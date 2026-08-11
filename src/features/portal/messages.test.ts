import { describe, expect, it } from "vitest";
import { directCounterpartId } from "@/features/portal/messages";

describe("directCounterpartId", () => {
  const tenants = new Set(["tenant-a", "tenant-b"]);

  it("separa una conversazione diretta per singolo inquilino", () => {
    expect(directCounterpartId("owner", ["owner", "tenant-a"], tenants)).toBe("tenant-a");
    expect(directCounterpartId("owner", ["tenant-b", "owner"], tenants)).toBe("tenant-b");
  });

  it("esclude i vecchi thread di gruppo dallo storico individuale", () => {
    expect(directCounterpartId("owner", ["owner", "tenant-a", "tenant-b"], tenants)).toBeNull();
  });

  it("rifiuta thread senza l’utente o con una controparte non autorizzata", () => {
    expect(directCounterpartId("owner", ["tenant-a", "tenant-b"], tenants)).toBeNull();
    expect(directCounterpartId("owner", ["owner", "stranger"], tenants)).toBeNull();
  });
});
