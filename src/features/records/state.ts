export type CreateRecordState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialCreateRecordState: CreateRecordState = {
  status: "idle",
  message: "",
};
