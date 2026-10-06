export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ErrorCode = "INTERNAL_ERROR", statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(message, "UNAUTHORIZED", 401);
  }

  static forbidden(message = "Permission denied"): AppError {
    return new AppError(message, "FORBIDDEN", 403);
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(message, "NOT_FOUND", 404);
  }

  static conflict(message = "Resource conflict"): AppError {
    return new AppError(message, "CONFLICT", 409);
  }

  static badRequest(message = "Invalid request", details?: unknown): AppError {
    return new AppError(message, "BAD_REQUEST", 400, details);
  }

  static validation(message = "Validation failed", details?: unknown): AppError {
    return new AppError(message, "VALIDATION_ERROR", 400, details);
  }

  static rateLimited(message = "Too many requests. Please try again later."): AppError {
    return new AppError(message, "RATE_LIMITED", 429);
  }

  static internal(message = "An unexpected error occurred"): AppError {
    return new AppError(message, "INTERNAL_ERROR", 500);
  }
}
