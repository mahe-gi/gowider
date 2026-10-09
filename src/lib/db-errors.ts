/**
 * Database error inspection utilities for PostgreSQL and Drizzle ORM.
 *
 * Drizzle ORM wraps underlying driver errors (such as NeonDbError or pg.DatabaseError)
 * inside a `DrizzleQueryError` or `DrizzleError` instance, placing the driver error
 * on `error.cause`. These helpers traverse `.cause` chains to extract PostgreSQL
 * error codes (e.g. '23505' for unique_violation) and constraint names.
 */

export function getDbErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;

  const anyErr = error as { code?: unknown; cause?: unknown };

  if (typeof anyErr.code === "string") {
    return anyErr.code;
  }

  // Drizzle ORM preserves the original database error on `.cause` (ES2022+)
  if (anyErr.cause && typeof anyErr.cause === "object") {
    return getDbErrorCode(anyErr.cause);
  }

  return undefined;
}

export function getDbErrorConstraint(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;

  const anyErr = error as { constraint?: unknown; cause?: unknown };

  if (typeof anyErr.constraint === "string") {
    return anyErr.constraint;
  }

  if (anyErr.cause && typeof anyErr.cause === "object") {
    return getDbErrorConstraint(anyErr.cause);
  }

  return undefined;
}

/**
 * Determines whether an error is a PostgreSQL unique constraint violation (SQLSTATE 23505).
 * Optionally checks if a specific constraint name was violated.
 */
export function isUniqueConstraintError(
  error: unknown,
  constraintName?: string
): boolean {
  if (!error) return false;

  const code = getDbErrorCode(error);
  const constraint = getDbErrorConstraint(error);

  const is23505 = code === "23505";

  // Additional check against error message text in case error is serialized or flattened
  const errorMsg = error instanceof Error ? error.message : "";
  const causeMsg =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : "";

  const hasUniqueIndicators =
    is23505 ||
    errorMsg.includes("23505") ||
    errorMsg.includes("unique constraint") ||
    errorMsg.includes("duplicate key") ||
    causeMsg.includes("23505") ||
    causeMsg.includes("unique constraint") ||
    causeMsg.includes("duplicate key");

  if (!hasUniqueIndicators) {
    return false;
  }

  if (constraintName) {
    if (constraint) {
      return constraint === constraintName;
    }
    if (errorMsg.includes(constraintName) || causeMsg.includes(constraintName)) {
      return true;
    }
  }

  return true;
}
