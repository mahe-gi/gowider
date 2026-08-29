import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/constants";
import { OfflineBanner } from "@/components/offline-banner";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gowider.in";

export const viewport: Viewport = {
  themeColor: "#FBF9F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.displayName} · ${BRAND.tagline}`,
    template: `%s · ${BRAND.displayName}`,
  },
  description:
    "Turn one short video into voice-preserving localized versions for multiple Indian languages. Upload once, choose your languages, and reach wider audiences.",
  keywords: [
    "video localization",
    "voice preservation",
    "Indic languages",
    "Instagram Reels",
    "YouTube Shorts",
    "creator tools",
    "Hindi",
    "Tamil",
    "Telugu",
    "Kannada",
  ],
  authors: [{ name: "GoWider" }],
  creator: "GoWider",
  publisher: "GoWider",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND.displayName} · ${BRAND.tagline}`,
    description:
      "Turn one short video into voice-preserving localized versions for multiple Indian languages while keeping it recognizably yours.",
    url: siteUrl,
    siteName: BRAND.displayName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/brand/logo-wordmark.png",
        width: 1200,
        height: 630,
        alt: "GoWider — One Reel. Every Audience.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.displayName} · ${BRAND.tagline}`,
    description:
      "Turn one short video into voice-preserving localized versions for multiple Indian languages.",
    images: ["/brand/logo-wordmark.png"],
  },
  icons: {
    icon: [
      { url: "/brand/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/brand/logo.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#111111] antialiased">
        <AuthProvider>
          <OfflineBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
