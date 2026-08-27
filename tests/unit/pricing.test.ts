import { describe, it, expect } from "vitest";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";

describe("Pricing Engine (Integer Paise & Ceil Billing)", () => {
  it("calculates cost for 1 second video (minimum 1 second ceiling)", () => {
    const result = calculateDubbingCost(1, 1, 4000); // ₹40/min
    // ceil(1/60 * 1 * 4000) = ceil(66.666) = 67 paise
    expect(result.totalCostPaise).toBe(67);
    expect(result.durationSeconds).toBe(1);
    expect(result.targetLanguageCount).toBe(1);
    expect(result.formattedTotalInr).toBe("₹0.67");
  });

  it("calculates cost for 59 seconds video with 1 target", () => {
    const result = calculateDubbingCost(59, 1, 4000);
    // ceil(59/60 * 1 * 4000) = ceil(3933.33) = 3934 paise (₹39.34)
    expect(result.totalCostPaise).toBe(3934);
    expect(result.formattedTotalInr).toBe("₹39.34");
  });

  it("calculates cost for exactly 60 seconds video with 1 target", () => {
    const result = calculateDubbingCost(60, 1, 4000);
    // 60/60 * 1 * 4000 = 4000 paise (₹40.00)
    expect(result.totalCostPaise).toBe(4000);
    expect(result.formattedTotalInr).toBe("₹40.00");
  });

  it("calculates cost for 61 seconds video with 1 target", () => {
    const result = calculateDubbingCost(61, 1, 4000);
    // ceil(61/60 * 1 * 4000) = ceil(4066.66) = 4067 paise (₹40.67)
    expect(result.totalCostPaise).toBe(4067);
    expect(result.formattedTotalInr).toBe("₹40.67");
  });

  it("calculates cost for 90 seconds video with 3 target languages", () => {
    const result = calculateDubbingCost(90, 3, 4000);
    // ceil(90/60 * 3 * 4000) = ceil(1.5 * 3 * 4000) = 18000 paise (₹180.00)
    expect(result.totalCostPaise).toBe(18000);
    expect(result.targetLanguageCount).toBe(3);
    expect(result.formattedTotalInr).toBe("₹180.00");
  });

  it("handles 0 target languages gracefully", () => {
    const result = calculateDubbingCost(60, 0, 4000);
    expect(result.totalCostPaise).toBe(0);
    expect(result.formattedTotalInr).toBe("₹0.00");
  });
});
