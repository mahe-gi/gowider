import { AppError } from "./errors";
import { isUniqueConstraintError } from "./db-errors";

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure = {
  success: false;
  error: string;
  code: string;
  details?: unknown;
};

export type ActionResponse<T> = ActionSuccess<T> | ActionFailure;

export function actionSuccess<T>(data: T): ActionSuccess<T> {
  return {
    success: true,
    data,
  };
}

export function actionError(error: unknown): ActionFailure {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (isUniqueConstraintError(error)) {
    return {
      success: false,
      error: "This value is already taken. Please choose another.",
      code: "CONFLICT",
    };
  }

  if (error instanceof Error) {
    const isLeakedQuery =
      error.message.startsWith("Failed query:") ||
      error.message.includes("Failed query") ||
      error.name === "DrizzleError" ||
      error.name === "DrizzleQueryError";

    const safeMessage = isLeakedQuery
      ? "An unexpected error occurred. Please try again."
      : error.message;

    return {
      success: false,
      error: safeMessage,
      code: "INTERNAL_ERROR",
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  };
}
