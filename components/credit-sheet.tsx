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
    TOP_UP_PACKAGES_PAISE[0].amountPaise
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkoutInFlightRef = useRef(false);
  const paymentIntentIdRef = useRef<string | null>(null);

  if (!isOpen) return null;

  const shortfallPaise = Math.max(0, requiredPaise - availablePaise);

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
          amountPaise: selectedPackage,
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
        description: "Creator Localization Credits",
        order_id: providerOrderId,
        handler: async function (response: any) {
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
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error?.message || "Payment verification failed.");
            }

            // 5. Fetch Authoritative Server Balance (Never derive financial balance on client)
            const walletRes = await fetch("/api/wallet");
            let authoritativeBalance = availablePaise;
            if (walletRes.ok) {
              const walletJson = await walletRes.json();
              if (walletJson.success) {
                authoritativeBalance = walletJson.data.availablePaise;
              }
            }

            setStatusMessage("Credits added! Starting localization…");
            if (onPaymentSuccess) {
              onPaymentSuccess(authoritativeBalance);
            }
            onClose();
          } catch (vErr: any) {
            console.error("Verification error:", vErr);
            setErrorMessage(vErr.message || "Failed to verify payment with server.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            checkoutInFlightRef.current = false;
            setIsProcessing(false);
            setStatusMessage(null);
          },
        },
        theme: {
          color: "#FF441F",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        checkoutInFlightRef.current = false;
        setErrorMessage(response.error?.description || "Payment failed.");
        setIsProcessing(false);
        setStatusMessage(null);
      });
      rzp.open();
    } catch (err: any) {
      checkoutInFlightRef.current = false;
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Payment checkout error.");
      setIsProcessing(false);
      setStatusMessage(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#121212]/10 space-y-6">
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
          <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
            Select Top-Up Amount
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {TOP_UP_PACKAGES_PAISE.map((pkg) => {
              const isSelected = selectedPackage === pkg.amountPaise;
              return (
                <button
                  key={pkg.amountPaise}
                  type="button"
                  onClick={() => setSelectedPackage(pkg.amountPaise)}
                  className={`p-3.5 rounded-2xl text-center border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FFF5F2] border-[#FF441F] ring-1 ring-[#FF441F] shadow-xs"
                      : "bg-white border-[#121212]/10 hover:border-[#121212]/25"
                  }`}
                >
                  <p className="text-lg font-black text-[#111111]">{pkg.label}</p>
                  <p className="text-[10px] text-[#8C877D] leading-tight mt-0.5">{pkg.description}</p>
                </button>
              );
            })}
          </div>
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
          disabled={isProcessing}
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
              <span>Add ₹{(selectedPackage / 100).toFixed(0)} Credits →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
