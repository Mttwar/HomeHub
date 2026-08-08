import type { View } from "@/types";

const notificationViewByType = {
  bill: "bills",
  expense: "expenses",
  issue: "issues",
  message: "messages",
  event: "calendar",
  document: "documents",
} as const satisfies Record<string, View>;

export function viewForNotificationType(type: string): View | null {
  return notificationViewByType[type as keyof typeof notificationViewByType] ?? null;
}

export function notificationTypesForView(view: View): string[] {
  return Object.entries(notificationViewByType)
    .filter(([, notificationView]) => notificationView === view)
    .map(([type]) => type);
}
