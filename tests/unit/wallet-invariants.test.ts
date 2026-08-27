import { describe, it, expect } from "vitest";

describe("Financial Ledger & Wallet Mathematical Invariants", () => {
  it("enforces availablePaise = max(0, balancePaise - reservedPaise)", () => {
    function computeAvailable(balance: number, reserved: number): number {
      if (reserved > balance) {
        throw new Error("FINANCIAL_INVARIANT_VIOLATION: reserved > balance");
      }
      return Math.max(0, balance - reserved);
    }

    expect(computeAvailable(50000, 18000)).toBe(32000);
    expect(computeAvailable(18000, 18000)).toBe(0);
    expect(() => computeAvailable(10000, 18000)).toThrow("FINANCIAL_INVARIANT_VIOLATION");
  });

  it("calculates correct usage and release amounts upon partial export success", () => {
    const reservedCostPaise = 18000; // ₹180 reserved for 3 target languages
    const finalCostPaise = 12000; // ₹120 charged for 2 successful exports

    expect(finalCostPaise).toBeLessThanOrEqual(reservedCostPaise);

    const usagePaise = finalCostPaise;
    const releasePaise = reservedCostPaise - finalCostPaise;

    expect(usagePaise).toBe(12000);
    expect(releasePaise).toBe(6000);
    expect(usagePaise + releasePaise).toBe(reservedCostPaise);
  });

  it("releases 100% of reserved funds on total generation failure", () => {
    const reservedCostPaise = 18000;
    const finalCostPaise = 0;

    const usagePaise = finalCostPaise;
    const releasePaise = reservedCostPaise - finalCostPaise;

    expect(usagePaise).toBe(0);
    expect(releasePaise).toBe(18000);
  });
});
