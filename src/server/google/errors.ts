import "server-only";

export class GoogleIntegrationError extends Error {
  constructor(public readonly code: string, public readonly retryable = false) {
    super(code);
    this.name = "GoogleIntegrationError";
  }
}

export function safeIntegrationErrorCode(error: unknown) {
  if (error instanceof GoogleIntegrationError) return error.code;
  if (error instanceof Error && error.message.startsWith("DATA_ENCRYPTION_KEY")) return "ENCRYPTION_NOT_CONFIGURED";
  return "INTEGRATION_FAILED";
}
