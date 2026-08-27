import "server-only";
import { env } from "@/lib/env";

export const SARVAM_BASE_URL = "https://api.sarvam.ai";

export async function sarvamFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not configured.");
  }

  const url = `${SARVAM_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  headers.set("api-subscription-key", apiKey);
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorText);
    } catch {
      parsed = { message: errorText };
    }
    const message = parsed.message || parsed.error || `Sarvam API error: ${response.statusText}`;
    const error: any = new Error(message);
    error.status = response.status;
    error.data = parsed;
    throw error;
  }

  return response.json() as Promise<T>;
}
