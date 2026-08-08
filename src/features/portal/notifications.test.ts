import { describe, expect, it } from "vitest";
import { notificationTypesForView, viewForNotificationType } from "./notifications";

describe("notification routing", () => {
  it.each([
    ["bill", "bills"],
    ["expense", "expenses"],
    ["issue", "issues"],
    ["message", "messages"],
    ["event", "calendar"],
    ["document", "documents"],
  ])("collega %s alla relativa sezione", (type, view) => {
    expect(viewForNotificationType(type)).toBe(view);
    expect(notificationTypesForView(view as Parameters<typeof notificationTypesForView>[0])).toContain(type);
  });

  it("ignora i tipi e le sezioni senza notifiche", () => {
    expect(viewForNotificationType("unknown")).toBeNull();
    expect(notificationTypesForView("dashboard")).toEqual([]);
  });
});
