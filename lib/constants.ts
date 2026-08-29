// GoWider Core Brand & Product Constants

export const BRAND = {
  name: "gowider",
  displayName: "GoWider",
  tagline: "ONE REEL. EVERY AUDIENCE.",
  description:
    "Turn one short video into localized Indian-language versions while preserving your voice, emotion, and timing.",
  accentColor: "#FF441F",
  darkColor: "#111111",
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || "gowider.in",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@gowider.in",
  feedbackEmail: process.env.NEXT_PUBLIC_FEEDBACK_EMAIL || "feedback@gowider.in",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@gowider.in",
  legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || "legal@gowider.in",
} as const;

// Supported Localization Languages (12 Indic Languages)
export const SUPPORTED_LANGUAGES = {
  "en-IN": { label: "English", native: "English" },
  "hi-IN": { label: "Hindi", native: "हिन्दी" },
  "bn-IN": { label: "Bengali", native: "বাংলা" },
  "gu-IN": { label: "Gujarati", native: "ગુજરાતી" },
  "kn-IN": { label: "Kannada", native: "ಕನ್ನಡ" },
  "ml-IN": { label: "Malayalam", native: "മലയാളം" },
  "mr-IN": { label: "Marathi", native: "मराठी" },
  "or-IN": { label: "Odia", native: "ଓଡ଼ିଆ" },
  "pa-IN": { label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  "ta-IN": { label: "Tamil", native: "தமிழ்" },
  "te-IN": { label: "Telugu", native: "తెలుగు" },
  "as-IN": { label: "Assamese", native: "অসমীয়া" },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Media Limits & Boundaries
export const MAX_DURATION_SECONDS = 90;
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = ["video/mp4", "video/quicktime"] as const;
export const MAX_TARGET_LANGUAGES = 3;

// Pricing: Stored and computed in integer paise (₹40/min = 4000 paise/min)
export const GOWIDER_DUBBING_PRICE_PER_MINUTE_PAISE = 4000;

// Razorpay Top-Up Packages (Amount in Paise)
export const TOP_UP_PACKAGES_PAISE = [
  {
    amountPaise: 10000, // ₹100
    label: "₹100",
    description: "Good for ~2.5 mins of localization",
  },
  {
    amountPaise: 25000, // ₹250
    label: "₹250",
    description: "Good for ~6.25 mins of localization",
  },
  {
    amountPaise: 50000, // ₹500
    label: "₹500",
    description: "Good for ~12.5 mins of localization",
  },
] as const;

// Guest Cookie Configuration
export const GUEST_COOKIE_NAME = "gowider_guest_session";
export const GUEST_SESSION_EXPIRY_DAYS = 1; // 24 hours

// Human-Friendly GoWider Status Labels
export const HUMAN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft created",
  uploading: "Uploading your Reel…",
  ready: "Ready for localization",
  awaiting_payment: "Awaiting credit top-up",
  queued: "Queued for processing",
  uploading_to_sarvam: "Preparing your Reel…",
  processing: "Localizing your Reel…",
  exporting: "Preparing your versions…",
  completed: "Ready to go wider",
  partial_failure: "Partially ready",
  failed: "Localization failed",
  expired: "Media expired",
};
