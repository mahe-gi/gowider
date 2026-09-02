"use client";

import { useState, useRef } from "react";
import { X, Wallet, Check, Loader2, AlertCircle } from "lucide-react";
import { TOP_UP_PACKAGES_PAISE } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CreditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPaise?: number;
  availablePaise?: number;
  generationRunId?: string;
  onPaymentSuccess?: (newBalancePaise: number) => void;
}

export function CreditSheet({
  isOpen,
  onClose,
  requiredPaise = 0,
  availablePaise = 0,
  generationRunId,
  onPaymentSuccess,
}: CreditSheetProps) {
  const [selectedPackage, setSelectedPackage] = useState<number>(
    TOP_UP_PACKAGES_PAISE[0].amountPaise // ₹40
  );
  const [isCustom, setIsCustom] = useState(false);
  const [customAmountRupees, setCustomAmountRupees] = useState<string>("40");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkoutInFlightRef = useRef(false);
  const paymentIntentIdRef = useRef<string | null>(null);

  if (!isOpen) return null;

  const shortfallPaise = Math.max(0, requiredPaise - availablePaise);

  const effectiveAmountPaise = isCustom
    ? Math.round((parseFloat(customAmountRupees) || 0) * 100)
    : selectedPackage;

  const effectiveAmountRupees = effectiveAmountPaise / 100;
  const estimatedMins = (effectiveAmountRupees / 40).toFixed(1);

  async function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleCheckout() {
    if (checkoutInFlightRef.current) return;

    if (effectiveAmountPaise < 1000) {
      setErrorMessage("Minimum top-up amount is ₹10.");
      return;
    }

    if (effectiveAmountPaise > 1000000) {
      setErrorMessage("Maximum top-up amount is ₹10,000.");
      return;
    }

    checkoutInFlightRef.current = true;
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage("Preparing secure checkout…");

    try {
      // 1. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay payment SDK. Please check your connection.");
      }

      if (!paymentIntentIdRef.current) {
        paymentIntentIdRef.current = typeof crypto !== "undefined" && crypto.randomUUID ? `pay_intent_${crypto.randomUUID()}` : `pay_intent_${Date.now()}`;
      }
      const paymentIntentId = paymentIntentIdRef.current;

      // 2. Create Order in Backend
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPaise: effectiveAmountPaise,
          paymentIntentId,
          generationRunId,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error?.message || "Failed to initiate payment.");
      }

      const { providerOrderId, keyId, amountPaise } = orderData.data;

      // 3. Open Razorpay Modal
      setStatusMessage("Awaiting payment…");

      const options = {
        key: keyId,
        amount: amountPaise,
        currency: "INR",
        name: "GoWider",
        description: `Add ₹${(amountPaise / 100).toFixed(0)} Credits`,
        order_id: providerOrderId,
        image: "/brand/logo.png",
        theme: {
          color: "#FF441F",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStatusMessage(null);
            checkoutInFlightRef.current = false;
          },
        },
        handler: async (response: any) => {
          setStatusMessage("Verifying payment…");
          try {
            // 4. Verify Payment Server-Side
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                providerOrderId: response.razorpay_order_id,
                providerPaymentId: response.razorpay_payment_id,
                providerSignature: response.razorpay_signature,
                paymentIntentId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error?.message || "Payment verification failed.");
            }

            setStatusMessage("Payment successful!");
            checkoutInFlightRef.current = false;
            paymentIntentIdRef.current = null;

            if (onPaymentSuccess) {
              onPaymentSuccess(verifyData.data.balancePaise);
            }

            setTimeout(() => {
              onClose();
              setIsProcessing(false);
              setStatusMessage(null);
            }, 1000);
          } catch (err: any) {
            setErrorMessage(err.message || "Could not verify payment with server.");
            setIsProcessing(false);
            setStatusMessage(null);
            checkoutInFlightRef.current = false;
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setErrorMessage(response.error?.description || "Payment failed or was cancelled.");
        setIsProcessing(false);
        setStatusMessage(null);
        checkoutInFlightRef.current = false;
      });

      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start checkout. Please try again.");
      setIsProcessing(false);
      setStatusMessage(null);
      checkoutInFlightRef.current = false;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#FBF9F5] border border-[#121212]/10 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-2 text-[#8C877D] hover:text-[#111111] rounded-full hover:bg-[#121212]/05 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#FFF1EE] border border-[#FF441F]/20 flex items-center justify-center text-[#FF441F]">
          <Wallet className="w-6 h-6" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111111]">
            Add GoWider Credits
          </h2>
          {shortfallPaise > 0 ? (
            <p className="text-xs sm:text-sm text-[#55524C]">
              You need <span className="font-bold text-[#111111]">₹{(shortfallPaise / 100).toFixed(0)}</span> more to generate these localized versions.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-[#55524C]">
              Top up your balance to localize Reels whenever you create them.
            </p>
          )}
        </div>

        {/* Balance Overview */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#121212]/08 text-xs sm:text-sm">
          <div>
            <p className="text-[#8C877D]">Current Balance</p>
            <p className="text-base font-bold text-[#111111]">₹{(availablePaise / 100).toFixed(2)}</p>
          </div>
          {requiredPaise > 0 && (
            <div className="text-right">
              <p className="text-[#8C877D]">Required</p>
              <p className="text-base font-bold text-[#FF441F]">₹{(requiredPaise / 100).toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Selectable Packages */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
              Select Top-Up Amount
            </label>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs font-semibold text-[#FF441F] hover:underline cursor-pointer"
            >
              {isCustom ? "← Choose preset package" : "Enter custom amount →"}
            </button>
          </div>

          {!isCustom ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TOP_UP_PACKAGES_PAISE.map((pkg) => {
                const isSelected = selectedPackage === pkg.amountPaise;
                return (
                  <button
                    key={pkg.amountPaise}
                    type="button"
                    onClick={() => setSelectedPackage(pkg.amountPaise)}
                    className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FFF5F2] border-[#FF441F] ring-1 ring-[#FF441F] shadow-xs"
                        : "bg-white border-[#121212]/10 hover:border-[#121212]/25"
                    }`}
                  >
                    <p className="text-base sm:text-lg font-black text-[#111111]">{pkg.label}</p>
                    <p className="text-[10px] text-[#8C877D] leading-tight mt-0.5">{pkg.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 p-4 rounded-2xl bg-white border border-[#FF441F]/30 ring-1 ring-[#FF441F]/20">
              <label className="block text-xs text-[#55524C] font-medium">
                Enter Custom Amount (in INR ₹)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-base font-bold text-[#111111]">₹</span>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  step="1"
                  value={customAmountRupees}
                  onChange={(e) => setCustomAmountRupees(e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#121212]/15 focus:outline-none focus:ring-2 focus:ring-[#FF441F] focus:border-transparent font-bold text-base text-[#111111]"
                />
              </div>
              <p className="text-[11px] text-[#8C877D]">
                Good for ~{estimatedMins} mins of localization (₹40/min). Min: ₹10, Max: ₹10,000.
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="button"
          disabled={isProcessing || (isCustom && (!customAmountRupees || parseFloat(customAmountRupees) < 10))}
          onClick={handleCheckout}
          className="w-full py-4 rounded-2xl font-bold text-sm bg-[#FF441F] hover:bg-[#E63814] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage || "Processing…"}</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 text-white/80" />
              <span>Add ₹{effectiveAmountRupees.toFixed(0)} Credits →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
