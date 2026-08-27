export const BRAND = {
  name: "gowider",
  displayName: "GoWider",
  tagline: "One Reel. Every Audience.",
  description: "Turn one short video into multiple Indian-language versions with your own voice.",
} as const;

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

export const MAX_TARGET_LANGUAGES = 3;
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_DURATION_SECONDS = 90;
export const MIN_DURATION_SECONDS = 1;
export const ACCEPTED_MIME_TYPES = ["video/mp4", "video/quicktime"] as const;

export const DEFAULT_PRICE_PER_MINUTE_PAISE = 4000; // ₹40/min = 4000 paise/min

export const TOP_UP_PACKAGES_PAISE = [
  { amountPaise: 10000, label: "₹100", description: "Good for testing" },
  { amountPaise: 25000, label: "₹250", description: "Popular choice" },
  { amountPaise: 50000, label: "₹500", description: "For regular creators" },
] as const;

export const HUMAN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  ready: "Ready to localize",
  queued: "Queued for processing",
  uploading_to_sarvam: "Preparing your Reel",
  processing: "Localizing your Reel",
  exporting: "Preparing your downloads",
  completed: "Ready",
  partial_failure: "Partially completed",
  failed: "Generation failed",
  awaiting_payment: "Awaiting credits",
};

export const GUEST_COOKIE_NAME = "gowider_guest_token";
export const GUEST_SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds
