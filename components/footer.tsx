import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="py-12 border-t border-[#121212]/10 bg-[#FAF8F5] text-xs text-[#8C877D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="relative h-6 w-24">
            <Image src="/brand/logo.png" alt="GoWider" fill className="object-contain object-left" />
          </div>
          <span className="text-[#55524C]">· {BRAND.tagline}</span>
        </div>

        <div className="flex items-center gap-6">
          <span>Powered by Sarvam AI Dubbing</span>
          <span>Private Cloud Storage (R2)</span>
        </div>
      </div>
    </footer>
  );
}
