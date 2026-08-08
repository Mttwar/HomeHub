import { describe, expect, it } from "vitest";
import { createRecordSchema } from "@/features/records/schema";

describe("validazione creazione record", () => {
  it("accetta una segnalazione valida senza importo", () => {
    const result = createRecordSchema.safeParse({ kind: "issue", title: "Perdita cucina", category: "Manutenzione", date: "", notes: "Dal rubinetto", amount: "0", priority: "HIGH" });
    expect(result.success).toBe(true);
  });

  it("richiede importo e scadenza per una bolletta", () => {
    const result = createRecordSchema.safeParse({ kind: "bill", title: "Fornitore", category: "Energia", date: "", notes: "", amount: "0", priority: "MEDIUM" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors).toMatchObject({ amount: expect.any(Array), date: expect.any(Array) });
  });

  it("rifiuta importi fuori limite", () => {
    const result = createRecordSchema.safeParse({ kind: "expense", title: "Spesa", category: "Altro", date: "2026-07-22", notes: "", amount: "1000001", priority: "MEDIUM" });
    expect(result.success).toBe(false);
  });

  it("accetta la visibilità riservata per un documento", () => {
    const result = createRecordSchema.safeParse({ kind: "document", title: "Verbale consegna", category: "Locazione", date: "", notes: "", amount: "0", priority: "MEDIUM", visibility: "OWNER_ONLY" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.visibility).toBe("OWNER_ONLY");
  });

  it("richiede importo e decorrenza per un canone", () => {
    const result = createRecordSchema.safeParse({ kind: "rent", title: "Canone mensile", category: "Affitto", date: "", notes: "", amount: "0", priority: "MEDIUM" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors).toMatchObject({ amount: expect.any(Array), date: expect.any(Array) });
  });
});
