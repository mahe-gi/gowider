import { env } from "@/lib/env";
import { DEFAULT_PRICE_PER_MINUTE_PAISE } from "@/lib/constants";

export interface PricingBreakdown {
  durationSeconds: number;
  billableSeconds: number;
  targetLanguageCount: number;
  pricePerMinutePaise: number;
  costPerTargetPaise: number;
  totalCostPaise: number;
  formattedTotalInr: string;
}

export function calculateDubbingCost(
  durationSeconds: number,
  targetLanguageCount: number,
  overridePricePerMinute?: number
): PricingBreakdown {
  const pricePerMinutePaise =
    overridePricePerMinute ??
    env.GOWIDER_DUBBING_PRICE_PER_MINUTE_PAISE ??
    DEFAULT_PRICE_PER_MINUTE_PAISE;

  const validDuration = Math.max(1, durationSeconds);
  const billableSeconds = Math.ceil(validDuration);

  // Exact per-target calculation: ceil(billableSeconds * pricePerMinute / 60)
  const costPerTargetPaise = Math.ceil((billableSeconds * pricePerMinutePaise) / 60);
  const totalCostPaise = costPerTargetPaise * Math.max(1, targetLanguageCount);

  const formattedTotalInr = `₹${(totalCostPaise / 100).toFixed(2)}`;

  return {
    durationSeconds: validDuration,
    billableSeconds,
    targetLanguageCount,
    pricePerMinutePaise,
    costPerTargetPaise,
    totalCostPaise,
    formattedTotalInr,
  };
}
