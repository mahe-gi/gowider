import { describe, it, expect } from "vitest";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError } from "@/lib/types";
import { env } from "@/env";

describe("Smoke & Foundation Harness", () => {
  it("resolves environment with valid defaults", () => {
    expect(env.NODE_ENV).toBeDefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
  });

  it("creates typed AppError instances with correct HTTP status codes", () => {
    const unauth = AppError.unauthorized();
    expect(unauth.statusCode).toBe(401);
    expect(unauth.code).toBe("UNAUTHORIZED");

    const forbidden = AppError.forbidden();
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.code).toBe("FORBIDDEN");

    const notFound = AppError.notFound();
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe("NOT_FOUND");
  });

  it("wraps actionSuccess and actionError correctly", () => {
    const successRes = actionSuccess({ id: "123" });
    expect(successRes.success).toBe(true);
    if (successRes.success) {
      expect(successRes.data.id).toBe("123");
    }

    const errorRes = actionError(AppError.notFound("Item missing"));
    expect(errorRes.success).toBe(false);
    if (!errorRes.success) {
      expect(errorRes.code).toBe("NOT_FOUND");
      expect(errorRes.error).toBe("Item missing");
    }

    // Never leak raw SQL query strings or database params
    const rawSqlError = new Error('Failed query: insert into "profiles" ("id", "user_id") values ($1, $2) params: abc,xyz');
    const sanitizedRes = actionError(rawSqlError);
    expect(sanitizedRes.success).toBe(false);
    if (!sanitizedRes.success) {
      expect(sanitizedRes.code).toBe("INTERNAL_ERROR");
      expect(sanitizedRes.error).not.toContain("Failed query");
      expect(sanitizedRes.error).not.toContain("insert into");
      expect(sanitizedRes.error).toBe("An unexpected error occurred. Please try again.");
    }
  });
});
