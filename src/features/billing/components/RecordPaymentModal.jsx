"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { billingService } from "@/features/billing/services/billingService";
import { DollarSign, CreditCard, Banknote, Shield, MoreHorizontal } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "cash", icon: Banknote, labelKey: "cash" },
  { value: "card", icon: CreditCard, labelKey: "card" },
  { value: "bank_transfer", icon: DollarSign, labelKey: "bankTransfer" },
  { value: "insurance", icon: Shield, labelKey: "insurance" },
  { value: "other", icon: MoreHorizontal, labelKey: "other" },
];

export function RecordPaymentModal({ isOpen, onClose, invoiceId, remainingBalance = 0, onSuccess }) {
  const t = useTranslations("billing");

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    if (amountNum > remainingBalance) {
      setError(`PAYMENT_EXCEEDS_BALANCE: Amount cannot exceed the remaining balance of $${remainingBalance.toFixed(2)}.`);
      return;
    }

    setLoading(true);
    try {
      await billingService.recordPayment(invoiceId, {
        amount: amountNum,
        payment_method: method,
        payment_date: paymentDate,
        notes: notes || null,
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Payment failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setMethod("cash");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("recordPayment")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Remaining Balance Info */}
        <div className="p-3.5 bg-teal-50 border border-teal-100 rounded-xl text-sm">
          <div className="flex items-center justify-between">
            <span className="text-teal-700 font-semibold">{t("remainingBalance")}:</span>
            <span className="font-bold font-mono text-teal-900 text-base">
              ${remainingBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        {/* Payment Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {t("amount")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 start-3 flex items-center text-slate-400 font-bold text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full ps-8 pe-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
              placeholder={`0.00 – max $${remainingBalance.toFixed(2)}`}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            {t("paymentMethod")} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(({ value, icon: Icon, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMethod(value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  method === value
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {t("paymentDate")} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">{t("notes")}</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this payment..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || !amount}>
            {loading ? "Recording…" : t("recordPayment")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
