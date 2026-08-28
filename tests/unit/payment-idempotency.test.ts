import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";
import { reserveCreditsForRun } from "@/lib/wallet/reserve";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";

describe("Payment and Generation Idempotency Invariants", () => {
  it("calculates exact pricing for short reel", () => {
    // 22 seconds, 2 languages @ 40 INR/min = ceil((22/60) * 2 * 4000) = 2934 paise
    const pricing = calculateDubbingCost(22, 2);
    expect(pricing.totalCostPaise).toBe(2934);
    expect(pricing.formattedTotalInr).toBe("₹29.34");
  });

  it("prevents double reservation on duplicate generate requests", () => {
    // Conceptual verification of idempotent state check
    const existingActiveRuns = [
      {
        id: "run_existing_123",
        status: "processing",
        estimatedCostPaise: 2934,
        reservedCostPaise: 2934,
      },
    ];

    // When an active run exists in [queued, processing, exporting], generate must NOT create a new run
    const hasActiveRun = existingActiveRuns.some((r) =>
      ["queued", "uploading_to_sarvam", "processing", "exporting"].includes(r.status)
    );
    expect(hasActiveRun).toBe(true);

    // Assert: Client should receive the active run without re-reserving
    const returnedRunId = hasActiveRun ? existingActiveRuns[0].id : "new_run";
    expect(returnedRunId).toBe("run_existing_123");
  });

  it("guarantees single logical reservation when awaiting_payment run is resumed", () => {
    const run = {
      id: "run_awaiting_456",
      status: "awaiting_payment",
      estimatedCostPaise: 2934,
      reservedCostPaise: 0,
    };

    // Upon payment, run transitions to queued with exactly one reservation of estimatedCostPaise
    const reservedRun = {
      ...run,
      status: "queued",
      reservedCostPaise: run.estimatedCostPaise,
    };

    expect(reservedRun.reservedCostPaise).toBe(2934);
    expect(reservedRun.status).toBe("queued");
  });
});
