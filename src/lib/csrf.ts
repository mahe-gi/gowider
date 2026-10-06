import { env } from "@/env";
import { AppError } from "./errors";

/**
 * Validates request Origin and Sec-Fetch-Site against the application's base URL.
 * Throws AppError.forbidden if cross-site or origin mismatch is detected.
 */
export function assertSameOrigin(request: Request): void {
  const expectedOrigin = new URL(env.NEXT_PUBLIC_APP_URL).origin;

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    throw AppError.forbidden("Cross-site request blocked by CSRF protection");
  }

  const origin = request.headers.get("origin");
  if (origin) {
    if (origin !== expectedOrigin) {
      throw AppError.forbidden("Origin mismatch blocked by CSRF protection");
    }
    return;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    let refererOrigin: string;
    try {
      refererOrigin = new URL(referer).origin;
    } catch {
      throw AppError.forbidden("Invalid referer blocked by CSRF protection");
    }

    if (refererOrigin !== expectedOrigin) {
      throw AppError.forbidden("Referer origin mismatch blocked by CSRF protection");
    }
  }
}
