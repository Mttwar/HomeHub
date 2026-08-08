export type PortalMutationState = { status: "idle" | "success" | "error"; message: string };

export const initialPortalMutationState: PortalMutationState = { status: "idle", message: "" };
