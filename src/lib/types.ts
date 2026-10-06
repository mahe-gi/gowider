import { AppError } from "./errors";

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

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: "INTERNAL_ERROR",
    };
  }

  return {
    success: false,
    error: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  };
}
