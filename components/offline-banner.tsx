"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setWasOffline(true);
      const timer = setTimeout(() => setWasOffline(false), 3000);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-[#1A1816] text-[#FAF8F5] px-4 py-2.5 flex items-center justify-center gap-2 text-xs md:text-sm font-medium border-b border-[#333]">
        <WifiOff className="w-4 h-4 text-[#FF552E] animate-pulse" />
        <span>You&apos;re offline. Your Reel is still processing safely in the cloud.</span>
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-[#1A3A2A] text-[#E0F2E9] px-4 py-2 flex items-center justify-center gap-2 text-xs md:text-sm font-medium border-b border-[#2B5940] transition-all">
        <Wifi className="w-4 h-4 text-[#4ADE80]" />
        <span>Back online. Refreshing your project status…</span>
      </div>
    );
  }

  return null;
}
