"use client";

import { useState } from "react";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, RotateCcw, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { CreditSheet } from "./credit-sheet";

interface TransactionItem {
  id: string;
  type: string;
  amountPaise: number;
  status: string;
  createdAt: string | Date;
  metadata?: any;
}

interface BillingViewProps {
  wallet: {
    balancePaise: number;
    reservedPaise: number;
    availablePaise: number;
    formattedAvailableInr: string;
  };
  transactions: TransactionItem[];
}

export function BillingView({ wallet: initialWallet, transactions: initialTransactions }: BillingViewProps) {
  const [wallet, setWallet] = useState(initialWallet);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  function getTransactionMeta(type: string, amountPaise: number) {
    switch (type) {
      case "purchase":
        return {
          label: "Added credits",
          isPositive: true,
          icon: <ArrowDownLeft className="w-4 h-4 text-[#16A34A]" />,
          badgeClass: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
        };
      case "usage":
        return {
          label: "Reel localization",
          isPositive: false,
          icon: <ArrowUpRight className="w-4 h-4 text-[#FF441F]" />,
          badgeClass: "bg-[#FFF5F2] text-[#FF441F] border-[#FF441F]/30",
        };
      case "reservation":
        return {
          label: "Credits reserved",
          isPositive: false,
          icon: <Clock className="w-4 h-4 text-[#EAB308]" />,
          badgeClass: "bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]",
        };
      case "release":
        return {
          label: "Credits returned",
          isPositive: true,
          icon: <RotateCcw className="w-4 h-4 text-[#3B82F6]" />,
          badgeClass: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
        };
      case "refund":
        return {
          label: "Refund",
          isPositive: true,
          icon: <RotateCcw className="w-4 h-4 text-[#16A34A]" />,
          badgeClass: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
        };
      default:
        return {
          label: "Account adjustment",
          isPositive: amountPaise >= 0,
          icon: <Wallet className="w-4 h-4 text-[#8C877D]" />,
          badgeClass: "bg-[#FAF8F5] text-[#55524C] border-[#121212]/10",
        };
    }
  }

  async function handlePaymentSuccess(newBal: number) {
    setWallet((prev) => ({
      ...prev,
      availablePaise: newBal,
      balancePaise: newBal + prev.reservedPaise,
      formattedAvailableInr: `₹${(newBal / 100).toFixed(2)}`,
    }));

    // Refresh transactions
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.recentTransactions) {
          setTransactions(data.data.recentTransactions);
        }
      }
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
            Credits & Billing
          </h1>
          <p className="text-sm text-[#55524C]">
            Manage your GoWider credit balance and view usage history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTopupOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF441F] hover:bg-[#E63814] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Credits</span>
        </button>
      </div>

      {/* Wallet Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
            Available Balance
          </span>
          <p className="text-3xl font-black text-[#111111]">
            {wallet.formattedAvailableInr}
          </p>
          <p className="text-xs text-[#8C877D]">Ready for new localizations</p>
        </div>

        {/* Reserved Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
            Reserved in Active Runs
          </span>
          <p className="text-3xl font-black text-[#111111]">
            ₹{(wallet.reservedPaise / 100).toFixed(2)}
          </p>
          <p className="text-xs text-[#8C877D]">Held until processing completes</p>
        </div>

        {/* Total Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#121212]/10 shadow-xs space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
            Total Account Balance
          </span>
          <p className="text-3xl font-black text-[#111111]">
            ₹{((wallet.balancePaise || wallet.availablePaise) / 100).toFixed(2)}
          </p>
          <p className="text-xs text-[#8C877D]">Available + reserved</p>
        </div>
      </div>

      {/* Activity Ledger Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-sm space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-[#111111]">
          Credit Activity
        </h2>

        {transactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-[#111111]">No transactions yet</p>
            <p className="text-xs text-[#8C877D]">
              When you add credits or localize Reels, your ledger activity will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#121212]/08 text-[#8C877D] font-mono uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#121212]/06">
                {transactions.map((txn) => {
                  const meta = getTransactionMeta(txn.type, txn.amountPaise);
                  const inrFormatted = `₹${(Math.abs(txn.amountPaise) / 100).toFixed(2)}`;
                  const sign = meta.isPositive ? "+" : "-";

                  return (
                    <tr key={txn.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#121212]/08 flex items-center justify-center shrink-0">
                            {meta.icon}
                          </div>
                          <div>
                            <span className="font-bold text-[#111111]">{meta.label}</span>
                            {txn.metadata?.projectId && (
                              <p className="text-[10px] text-[#8C877D] font-mono">Project {txn.metadata.projectId}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-bold font-mono">
                        <span className={meta.isPositive ? "text-[#16A34A]" : "text-[#111111]"}>
                          {sign}{inrFormatted}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#55524C] font-mono">
                        {new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.badgeClass}`}
                        >
                          {txn.status || "completed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Top-Up Modal */}
      <CreditSheet
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        availablePaise={wallet.availablePaise}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
