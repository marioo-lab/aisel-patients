export type ApiErrorBody = {
  error: { code: string; message: string; fieldErrors?: Record<string, string> };
};

/** Thrown by the api-client when a response is not ok; carries the envelope. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}
