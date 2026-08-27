import { GOWIDER_DUBBING_PRICE_PER_MINUTE_PAISE } from "@/lib/constants";

export interface PricingCalculation {
  durationSeconds: number;
  billableSeconds: number;
  targetLanguageCount: number;
  pricePerMinutePaise: number;
  totalCostPaise: number;
  formattedTotalInr: string;
}

/**
 * Calculates authoritative GoWider dubbing pricing in integer paise.
 * Invariant: All financial math uses integer ceiling calculation to prevent rounding leakage.
 */
export function calculateDubbingCost(
  durationSeconds: number,
  targetLanguageCount: number,
  pricePerMinutePaise = GOWIDER_DUBBING_PRICE_PER_MINUTE_PAISE
): PricingCalculation {
  if (targetLanguageCount <= 0) {
    return {
      durationSeconds: Math.max(1, Math.ceil(durationSeconds)),
      billableSeconds: Math.max(1, Math.ceil(durationSeconds)),
      targetLanguageCount: 0,
      pricePerMinutePaise,
      totalCostPaise: 0,
      formattedTotalInr: "₹0.00",
    };
  }

  // Minimum billable unit is 1 second, ceiling to full integer seconds
  const billableSeconds = Math.max(1, Math.ceil(durationSeconds));
  const count = targetLanguageCount;

  // Pricing formula: ceil(billableSeconds / 60 * count * pricePerMinutePaise)
  const totalCostPaise = Math.ceil((billableSeconds / 60) * count * pricePerMinutePaise);
  const inrValue = (totalCostPaise / 100).toFixed(2);

  return {
    durationSeconds: Math.ceil(durationSeconds),
    billableSeconds,
    targetLanguageCount: count,
    pricePerMinutePaise,
    totalCostPaise,
    formattedTotalInr: `₹${inrValue}`,
  };
}
