"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import clsx from "clsx";
import type { Subscription } from "@/db/schema/subscriptions";
import {
  createCheckoutSubscriptionAction,
  verifyPaymentAndActivateAction,
  cancelSubscriptionAction,
} from "@/features/billing/actions";

interface BillingClientProps {
  profileId: string;
  subscription: Subscription | null;
  isPro: boolean;
  publishedCount: number;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (res: unknown) => void) => void;
    };
  }
}

export function BillingClient({
  profileId,
  subscription,
  isPro,
  publishedCount,
}: BillingClientProps) {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const checkoutRes = await createCheckoutSubscriptionAction(
        profileId,
        billingInterval
      );

      if (!checkoutRes.success) {
        setErrorMessage(checkoutRes.error);
        return;
      }

      const { keyId, amount, currency, name, description, orderId, subscriptionId } =
        checkoutRes.data;

      // Handle mock/development flow when placeholder keys are used
      const isMock = keyId === "rzp_test_placeholder_key_id";

      if (isMock) {
        const activateRes = await verifyPaymentAndActivateAction({
          profileId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpayOrderId: orderId,
          razorpaySubscriptionId: subscriptionId,
          razorpaySignature: "mock_signature",
        });

        if (activateRes.success) {
          setSuccessMessage("Your account has been upgraded to Pro successfully!");
          router.refresh();
        } else {
          setErrorMessage(activateRes.error);
        }
        return;
      }

      // Ensure Razorpay SDK is available
      if (!window.Razorpay) {
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
            document.body.appendChild(script);
          });
        } catch {
          setErrorMessage("Failed to load payment gateway. Please check your internet connection or disable adblockers.");
          return;
        }
      }

      // Initialize live Razorpay modal
      const options: Record<string, unknown> = {
        key: keyId,
        amount,
        currency,
        name,
        description,
        modal: {
          ondismiss: () => {
            // Dismissed by user
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_subscription_id?: string;
          razorpay_signature: string;
        }) => {
          const activateRes = await verifyPaymentAndActivateAction({
            profileId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySubscriptionId: response.razorpay_subscription_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (activateRes.success) {
            setSuccessMessage("Payment verified! Welcome to GoWider Pro.");
            router.refresh();
          } else {
            setErrorMessage(activateRes.error);
          }
        },
        theme: {
          color: "#2997FF",
        },
      };

      if (orderId) {
        options.order_id = orderId;
      } else if (subscriptionId) {
        options.subscription_id = subscriptionId;
      }

      if (window.Razorpay) {
        const RazorpayClass = window.Razorpay;
        const razorpayInstance = new RazorpayClass(options);
        if (typeof (razorpayInstance as { on?: (event: string, handler: (res: unknown) => void) => void }).on === "function") {
          (razorpayInstance as { on: (event: string, handler: (res: unknown) => void) => void }).on("payment.failed", (response: unknown) => {
            console.error("Razorpay payment failed:", response);
            setErrorMessage("Payment failed or cancelled. Please try again.");
          });
        }
        razorpayInstance.open();
      } else {
        setErrorMessage("Payment gateway is temporarily unavailable. Please refresh and try again.");
      }
    });
  };

  const handleCancelSubscription = () => {
    if (!confirm("Are you sure you want to cancel your Pro subscription? You will retain access until the current period ends.")) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const cancelRes = await cancelSubscriptionAction(profileId);
      if (cancelRes.success) {
        setSuccessMessage("Your Pro subscription has been scheduled for cancellation.");
        router.refresh();
      } else {
        setErrorMessage(cancelRes.error || "Failed to cancel subscription");
      }
    });
  };

  const freeCap = 6;
  const isCapReached = !isPro && publishedCount >= freeCap;

  return (
    <div className="space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {/* Notifications */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
                Current Plan
              </span>
              <span
                className={clsx(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono uppercase tracking-wider",
                  isPro
                    ? "bg-amber-400/10 text-amber-300 border border-amber-400/30"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                )}
              >
                {isPro ? "PRO CREATOR" : "FREE TIER"}
              </span>
              {isPro && subscription?.cancelAtPeriodEnd && (
                <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-mono text-rose-300">
                  Canceling
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {isPro ? "GoWider Pro Studio" : "GoWider Starter"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isPro ? (
              subscription?.cancelAtPeriodEnd ? (
                <span className="text-xs text-zinc-400">
                  Access active until period ends
                </span>
              ) : (
                <button
                  type="button"
                  data-testid="cancel-subscription-btn"
                  onClick={handleCancelSubscription}
                  disabled={isPending}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:border-rose-900/60 transition disabled:opacity-50"
                >
                  {isPending ? "Updating..." : "Cancel Subscription"}
                </button>
              )
            ) : (
              <button
                type="button"
                data-testid="upgrade-pro-btn"
                onClick={handleUpgrade}
                disabled={isPending}
                className="rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition disabled:opacity-50 shadow-lg shadow-white/5"
              >
                {isPending ? "Processing..." : "Upgrade to Pro (₹299/mo)"}
              </button>
            )}
          </div>
        </div>

        {/* Feature Gates & Resource Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-900">
          {/* Projects Cap */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Published Projects</span>
              <span className="font-mono text-zinc-200 font-semibold">
                {isPro ? `${publishedCount} (Unlimited)` : `${publishedCount} / ${freeCap}`}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-500",
                  isPro
                    ? "bg-amber-400 w-full"
                    : isCapReached
                    ? "bg-rose-500 w-full"
                    : "bg-white"
                )}
                style={{
                  width: isPro ? "100%" : `${Math.min(100, (publishedCount / freeCap) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              {isPro
                ? "You have unlimited project publication."
                : isCapReached
                ? "Cap reached. Upgrade to Pro to publish more."
                : `${freeCap - publishedCount} publications remaining on Free tier.`}
            </p>
          </div>

          {/* Watermark Branding */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">GoWider Watermark</span>
              <span
                className={clsx(
                  "text-[11px] font-mono font-semibold",
                  isPro ? "text-amber-300" : "text-zinc-500"
                )}
              >
                {isPro ? "Can be hidden" : "Locked (Visible)"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              {isPro
                ? "Toggle watermark on/off anytime in Design & Aesthetic settings."
                : "Free portfolios display 'POWERED BY GOWIDER' in the footer."}
            </p>
            {isPro && (
              <Link
                href="/dashboard/design"
                className="inline-block text-[11px] text-blue-400 hover:text-blue-300 transition font-mono mt-1"
              >
                Configure in Design →
              </Link>
            )}
          </div>

          {/* Director Pro Badge */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Pro Creator Badge</span>
              <span
                className={clsx(
                  "text-[11px] font-mono font-semibold",
                  isPro ? "text-amber-300" : "text-zinc-500"
                )}
              >
                {isPro ? "Active" : "Locked"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              {isPro
                ? "Pro status highlighted on your public portfolio and creator directory."
                : "Earns priority placement on the Explore network."}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Comparison Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Compare Membership Plans</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Choose the tier that scales with your creative agency or production pipeline.
            </p>
          </div>

          {/* Interval Toggle */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingInterval("monthly")}
              className={clsx(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition",
                billingInterval === "monthly"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval("yearly")}
              className={clsx(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5",
                billingInterval === "yearly"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier Card */}
          <div
            className={clsx(
              "rounded-2xl border p-6 md:p-8 space-y-6 flex flex-col justify-between",
              !isPro ? "border-zinc-700 bg-zinc-950" : "border-zinc-900 bg-zinc-950/60 opacity-80"
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                  Starter
                </span>
                {!isPro && (
                  <span className="text-[11px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                    Active Plan
                  </span>
                )}
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">₹0</div>
                <p className="text-xs text-zinc-500 mt-1">Free forever</p>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-zinc-900 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Up to 6 published portfolio projects</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>All 3 director themes (Cinema, Editorial, Studio)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Poster-first video player (YouTube & Drive)</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>✕</span>
                  <span>GoWider footer watermark included</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>✕</span>
                  <span>Standard directory visibility</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                disabled
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-xs font-semibold text-zinc-500 cursor-default"
              >
                {!isPro ? "Current Plan" : "Included in Base Tier"}
              </button>
            </div>
          </div>

          {/* Pro Tier Card */}
          <div
            className={clsx(
              "relative rounded-2xl border p-6 md:p-8 space-y-6 flex flex-col justify-between overflow-hidden",
              isPro
                ? "border-amber-500/40 bg-zinc-950 ring-1 ring-amber-500/30"
                : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition"
            )}
          >
            {/* Ambient Accent Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-300 uppercase tracking-widest font-bold">
                    PRO STUDIO
                  </span>
                  <span className="rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                    RECOMMENDED
                  </span>
                </div>
                {isPro && (
                  <span className="text-[11px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                    Active Plan
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">
                    {billingInterval === "yearly" ? "₹3,229" : "₹299"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {billingInterval === "yearly" ? "/ year" : "/ month"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {billingInterval === "yearly"
                    ? "Billed annually (Save 10% — ₹269/month equivalent)"
                    : "Billed monthly. Cancel anytime."}
                </p>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-zinc-900 text-xs text-zinc-200">
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span className="font-medium text-white">Unlimited published projects</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span className="font-medium text-white">Remove GoWider footer watermark</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Pro Creator badge on public profile & Explore</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Priority Explore directory placement</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>High-speed video poster CDN delivery</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative z-10">
              {isPro ? (
                <div className="w-full text-center py-3 text-xs font-semibold text-amber-300 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  Pro Membership Active
                </div>
              ) : (
                <button
                  type="button"
                  data-testid="upgrade-pro-plan-cta"
                  onClick={handleUpgrade}
                  disabled={isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-200 py-3 text-xs font-bold text-black hover:from-amber-300 hover:to-amber-100 transition shadow-lg shadow-amber-400/10 disabled:opacity-50"
                >
                  {isPending
                    ? "Initializing Checkout..."
                    : `Upgrade to Pro (${billingInterval === "yearly" ? "₹3,229/yr" : "₹299/mo"})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
