export class TransientError extends Error {
  public readonly isTransient = true;
  constructor(message: string, public readonly retryAfterSeconds: number = 10) {
    super(message);
    this.name = "TransientError";
  }
}

export class PermanentError extends Error {
  public readonly isPermanent = true;
  constructor(message: string, public readonly errorCode: string = "PERMANENT_FAILURE") {
    super(message);
    this.name = "PermanentError";
  }
}

export function isRetryableHttpError(status?: number): boolean {
  if (!status) return false;
  // 429 Too Many Requests, 500 Internal, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export function isTransientNetworkError(err: any): boolean {
  if (!err) return false;
  if (err.isTransient) return true;
  if (err.isPermanent) return false;

  // HTTP Status check
  if (err.status && isRetryableHttpError(err.status)) {
    return true;
  }

  // Node.js System error codes
  const code = err.code || err.cause?.code;
  if (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_SOCKET" ||
    code === "EPIPE"
  ) {
    return true;
  }

  // Fetch / Abort errors
  const name = err.name || err.cause?.name;
  if (name === "AbortError" || name === "FetchError" || name === "TimeoutError") {
    return true;
  }

  // Message patterns
  const msg = (err.message || "").toLowerCase();
  if (
    msg.includes("fetch failed") ||
    msg.includes("network error") ||
    msg.includes("timeout") ||
    msg.includes("socket hang up") ||
    msg.includes("econnreset") ||
    msg.includes("gateway")
  ) {
    // Exclude explicit authentication or configuration messages
    if (
      msg.includes("api_key") ||
      msg.includes("unauthorized") ||
      msg.includes("forbidden") ||
      msg.includes("not found")
    ) {
      return false;
    }
    return true;
  }

  return false;
}
