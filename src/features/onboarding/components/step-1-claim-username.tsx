"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  claimUsernameAction,
  checkUsernameAvailabilityAction,
} from "../actions/claim-username";
import { normalizeUsername, USERNAME_REGEX } from "../constants";

interface Step1ClaimUsernameProps {
  initialUsername?: string;
  onSuccess: (username: string) => void;
}

export function Step1ClaimUsername({
  initialUsername = "",
  onSuccess,
}: Step1ClaimUsernameProps) {
  const [username, setUsername] = useState(initialUsername);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Debounced live availability check
  useEffect(() => {
    const trimmed = normalizeUsername(username);

    if (!trimmed) {
      setStatus("idle");
      setStatusMessage("");
      return;
    }

    if (trimmed.length < 3) {
      setStatus("invalid");
      setStatusMessage("Minimum 3 characters");
      return;
    }

    if (trimmed.length > 30) {
      setStatus("invalid");
      setStatusMessage("Maximum 30 characters");
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setStatus("invalid");
      setStatusMessage("Letters, numbers, hyphens and underscores only");
      return;
    }

    setStatus("checking");
    setStatusMessage("Checking availability...");

    const timeout = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailabilityAction(trimmed);
        if (res.success) {
          if (res.data.available) {
            setStatus("available");
            setStatusMessage("Username is available");
          } else {
            setStatus("taken");
            setStatusMessage(res.data.reason || "Username is taken");
          }
        } else {
          setStatus("invalid");
          setStatusMessage(res.error || "Validation error");
        }
      } catch {
        setStatus("idle");
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const normalized = normalizeUsername(username);
    if (!normalized) {
      setErrorMessage("Please enter a username.");
      return;
    }

    startTransition(async () => {
      const res = await claimUsernameAction(normalized);
      if (res.success) {
        onSuccess(res.data.username);
      } else {
        setErrorMessage(res.error);
        if (res.code === "CONFLICT") {
          setStatus("taken");
          setStatusMessage(res.error);
        }
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
          Step 01 / 05
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Claim Your Portfolio Handle
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Your public link will live permanently at gowider.in/
          <span className="text-white font-mono">{username || "username"}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="block text-xs uppercase tracking-wider font-mono text-zinc-300"
          >
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-mono text-sm">
              gowider.in/
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="director-cut"
              required
              className="w-full pl-28 pr-28 py-3 bg-[#0A0A0A] border border-white/10 rounded-none text-white font-mono text-sm focus:border-white focus:outline-none transition-colors"
            />

            {/* Validation Pill */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {status === "checking" && (
                <span
                  data-testid="status-pill-checking"
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-800 text-zinc-300 border border-zinc-700 animate-pulse"
                >
                  Checking...
                </span>
              )}
              {status === "available" && (
                <span
                  data-testid="status-pill-available"
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                >
                  ✓ Available
                </span>
              )}
              {status === "taken" && (
                <span
                  data-testid="status-pill-taken"
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-red-950/80 text-red-400 border border-red-800"
                >
                  ✗ Taken
                </span>
              )}
              {status === "invalid" && (
                <span
                  data-testid="status-pill-invalid"
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-amber-950/80 text-amber-400 border border-amber-800"
                >
                  ! Invalid
                </span>
              )}
            </div>
          </div>

          {statusMessage && (
            <p
              className={`text-xs ${
                status === "available"
                  ? "text-emerald-400"
                  : status === "taken" || status === "invalid"
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </div>

        {errorMessage && (
          <div
            data-testid="claim-error"
            className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 text-xs rounded-none"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || status === "taken" || status === "invalid" || !username}
          data-testid="claim-username-submit"
          className="w-full py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Claiming..." : "Claim Handle & Continue →"}
        </button>
      </form>
    </div>
  );
}
