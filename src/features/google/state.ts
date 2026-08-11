export type GoogleActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialGoogleActionState: GoogleActionState = { status: "idle", message: "" };
