import { z } from "zod";

export const recordKinds = ["bill", "expense", "rent", "issue", "event", "document"] as const;

const optionalDate = z.string().trim().refine((value) => !value || !Number.isNaN(Date.parse(value)), "Data non valida");

export const createRecordSchema = z.object({
  kind: z.enum(recordKinds),
  title: z.string().trim().min(2, "Inserisci almeno 2 caratteri").max(120),
  category: z.string().trim().min(2, "Scegli una categoria").max(80),
  date: optionalDate,
  notes: z.string().trim().max(4000).default(""),
  amount: z.union([z.string(), z.number()]).transform((value) => Number(value || 0)),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  visibility: z.enum(["SHARED", "OWNER_ONLY"]).default("SHARED"),
}).superRefine((value, context) => {
  if (["bill", "expense", "rent"].includes(value.kind) && (!Number.isFinite(value.amount) || value.amount <= 0 || value.amount > 1_000_000)) {
    context.addIssue({ code: "custom", path: ["amount"], message: "Inserisci un importo valido" });
  }
  if (["bill", "event", "rent"].includes(value.kind) && !value.date) {
    context.addIssue({ code: "custom", path: ["date"], message: "La data è obbligatoria" });
  }
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
