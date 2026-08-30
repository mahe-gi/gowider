import "server-only";
import { sarvamFetch } from "./client";

export interface TranslateParams {
  input: string;
  sourceLanguage: string;
  targetLanguage: string;
  mode?: "code-mixed" | "modern-colloquial" | "formal";
}

/**
 * Translates input text into natural conversational code-mixed Indian speech
 * (e.g. Tenglish, Hinglish, Tanglish) using Sarvam Mayura.
 */
export async function translateText(params: TranslateParams): Promise<string> {
  const mode = params.mode || "code-mixed";
  try {
    const data = await sarvamFetch<{ translated_text: string }>("/translate", {
      method: "POST",
      body: JSON.stringify({
        input: params.input,
        source_language_code: params.sourceLanguage,
        target_language_code: params.targetLanguage,
        model: "mayura:v1",
        mode,
      }),
    });

    return data.translated_text || params.input;
  } catch (err: any) {
    console.warn(`Translation with mayura:v1 (${mode}) failed, falling back:`, err.message);
    // Fallback to sarvam-translate:v1 for languages outside mayura:v1
    try {
      const fallback = await sarvamFetch<{ translated_text: string }>("/translate", {
        method: "POST",
        body: JSON.stringify({
          input: params.input,
          source_language_code: params.sourceLanguage,
          target_language_code: params.targetLanguage,
          model: "sarvam-translate:v1",
          mode: "formal",
        }),
      });
      return fallback.translated_text || params.input;
    } catch {
      return params.input;
    }
  }
}
