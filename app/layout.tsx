import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: `${BRAND.displayName} — ${BRAND.tagline}`,
  description: BRAND.description,
  openGraph: {
    title: `${BRAND.displayName} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [{ url: "/brand/logo-wordmark.png" }],
  },
  icons: {
    icon: "/brand/logo-wordmark.png",
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
