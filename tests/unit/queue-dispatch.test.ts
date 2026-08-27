import { describe, it, expect, vi } from "vitest";
import { isRetryableHttpError, TransientError, PermanentError } from "@/lib/generation/errors";

describe("Generation Error Classification & Retry Policy", () => {
  it("identifies retryable HTTP status codes correctly", () => {
    expect(isRetryableHttpError(429)).toBe(true);
    expect(isRetryableHttpError(502)).toBe(true);
    expect(isRetryableHttpError(503)).toBe(true);
    expect(isRetryableHttpError(504)).toBe(true);
    expect(isRetryableHttpError(500)).toBe(true);

    expect(isRetryableHttpError(400)).toBe(false);
    expect(isRetryableHttpError(401)).toBe(false);
    expect(isRetryableHttpError(403)).toBe(false);
    expect(isRetryableHttpError(404)).toBe(false);
    expect(isRetryableHttpError(undefined)).toBe(false);
  });

  it("distinguishes transient errors from permanent errors", () => {
    const transient = new TransientError("Network timeout", 15);
    expect(transient.isTransient).toBe(true);
    expect(transient.retryAfterSeconds).toBe(15);

    const permanent = new PermanentError("SARVAM_API_KEY is not configured", "MISSING_API_KEY");
    expect(permanent.isPermanent).toBe(true);
    expect(permanent.errorCode).toBe("MISSING_API_KEY");
  });
});
