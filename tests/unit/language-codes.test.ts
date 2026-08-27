import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/constants";

describe("Supported Language Codes & Sarvam API Compatibility", () => {
  it("uses 'or-IN' for Odia (not 'od-IN' which causes Sarvam 422 error)", () => {
    expect((SUPPORTED_LANGUAGES as any)["or-IN"]).toBeDefined();
    expect((SUPPORTED_LANGUAGES as any)["or-IN"].label).toBe("Odia");
    expect((SUPPORTED_LANGUAGES as any)["od-IN"]).toBeUndefined();
  });

  it("includes 'as-IN' for Assamese", () => {
    expect((SUPPORTED_LANGUAGES as any)["as-IN"]).toBeDefined();
    expect((SUPPORTED_LANGUAGES as any)["as-IN"].label).toBe("Assamese");
  });

  it("includes all 12 key Indic language pairs with valid labels and native scripts", () => {
    const requiredCodes = [
      "en-IN",
      "hi-IN",
      "bn-IN",
      "gu-IN",
      "kn-IN",
      "ml-IN",
      "mr-IN",
      "or-IN",
      "pa-IN",
      "ta-IN",
      "te-IN",
      "as-IN",
    ];

    for (const code of requiredCodes) {
      expect(SUPPORTED_LANGUAGES[code as LanguageCode]).toBeDefined();
      expect(SUPPORTED_LANGUAGES[code as LanguageCode].label).toBeTruthy();
      expect(SUPPORTED_LANGUAGES[code as LanguageCode].native).toBeTruthy();
    }
  });
});
