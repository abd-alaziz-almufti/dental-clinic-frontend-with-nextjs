"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import { RecordPaymentModal } from "@/features/billing/components/RecordPaymentModal";
import { billingService } from "@/features/billing/services/billingService";
import { ArrowLeft, Printer, Receipt, CreditCard } from "lucide-react";

function formatText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.en || val.ar || Object.values(val).find((v) => typeof v === "string") || "";
  }
  return String(val);
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id;
  const t = useTranslations("billing");

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billingService.getInvoiceById(invoiceId);
      setInvoice(res.data || res);
    } catch (err) {
      console.error("Failed to load invoice:", err);
      setError(err.response?.data?.message || "Invoice record not found.");
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoiceId) loadInvoice();
  }, [invoiceId, loadInvoice]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (error || !invoice) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center">
          <p className="text-red-600 font-semibold mb-4">{error || "Invoice not found"}</p>
          <Link href="/billing">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 me-2" /> Back to Billing</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const subtotal = (invoice.items || []).reduce((s, item) => {
    return s + parseFloat(item.unit_price || 0) * parseInt(item.quantity || 1, 10);
  }, 0);

  const totalDiscount = (invoice.items || []).reduce((s, item) => s + parseFloat(item.discount || 0), 0);
  const netTotal = parseFloat(invoice.total || 0);
  const paidAmount = parseFloat(invoice.paid_amount || 0);
  const remaining = parseFloat(invoice.remaining_balance || invoice.balance || 0);
  const patientName = invoice.patient
    ? (invoice.patient.full_name || `${invoice.patient.first_name || ""} ${invoice.patient.last_name || ""}`.trim())
    : "—";
  const isSettled = remaining <= 0 || invoice.status === "paid" || invoice.status === "cancelled";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <Link href="/billing">
              <Button size="sm" variant="outline"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-600" />
                <span>{invoice.invoice_number}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("issueDate")}: {invoice.created_at?.split("T")[0] || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="text-slate-700 hover:bg-slate-100"
            >
              <Printer className="w-4 h-4 me-1.5" />
              <span>{t("printInvoice")}</span>
            </Button>
            {!isSettled && (
              <Button size="sm" variant="primary" onClick={() => setPaymentModalOpen(true)}>
                <CreditCard className="w-4 h-4 me-1.5" />
                <span>{t("recordPayment")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* --- PRINTABLE INVOICE AREA --- */}
        <div id="printable-invoice" className="space-y-6">
          {/* Invoice Header */}
          <Card className="p-6 md:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              {/* Clinic Information */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">LD</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-900">{t("clinicInfo")}</span>
                </div>
                <p className="text-xs text-slate-500">123 Medical District, Riyadh, KSA</p>
                <p className="text-xs text-slate-500">+966 11 123 4567</p>
                <p className="text-xs text-slate-500">info@luminadental.sa</p>
              </div>

              {/* Invoice Meta */}
              <div className="sm:text-end space-y-1.5">
                <h2 className="text-2xl font-black text-teal-700 tracking-tight">INVOICE</h2>
                <p className="text-sm font-bold text-slate-900">{invoice.invoice_number}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>{t("issueDate")}: <strong className="text-slate-800">{invoice.created_at?.split("T")[0]}</strong></p>
                  {invoice.due_date && (
                    <p>{t("dueDate")}: <strong className="text-slate-800">{invoice.due_date}</strong></p>
                  )}
                </div>
                <div className="mt-2">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("billTo")}</p>
              <p className="font-bold text-slate-900 text-base">{patientName}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ID: {invoice.patient?.national_id || "—"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{invoice.patient?.phone || "—"}</p>
            </div>
          </Card>

          {/* Itemized Services Table */}
          <Card className="shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{t("itemizedServices")}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                    <th className="px-5 py-3 text-start">Service / Treatment</th>
                    <th className="px-5 py-3 text-start">Tooth #</th>
                    <th className="px-5 py-3 text-end">Unit Price</th>
                    <th className="px-5 py-3 text-end">Qty</th>
                    <th className="px-5 py-3 text-end">Discount</th>
                    <th className="px-5 py-3 text-end">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(invoice.items || []).map((item) => {
                    const unitPrice = parseFloat(item.unit_price || item.price || 0);
                    const qty = parseInt(item.quantity || 1, 10);
                    const disc = parseFloat(item.discount || 0);
                    const lineTotal = unitPrice * qty - disc;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/40">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {formatText(item.service_name) || formatText(item.service?.name) || "Dental Service"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          {item.tooth_number || item.tooth_id || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-end font-mono">${unitPrice.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-end font-mono">{qty}</td>
                        <td className="px-5 py-3.5 text-end font-mono text-red-600">
                          {disc > 0 ? `-$${disc.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-end font-mono font-bold text-slate-900">
                          ${lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Block */}
            <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-5">
              <div className="ms-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Discount</span>
                    <span className="font-mono text-red-600">-${totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-800">Net Total</span>
                  <span className="font-mono text-slate-900">${netTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-semibold">Paid Amount</span>
                  <span className="font-mono text-emerald-700 font-bold">${paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-800 font-bold">{t("remainingBalance")}</span>
                  <span className="font-mono text-amber-800 font-extrabold text-base">${remaining.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{t("paymentHistory")}</h3>
            </div>

            {(!invoice.payments || invoice.payments.length === 0) ? (
              <div className="py-10 text-center text-slate-400 text-sm bg-slate-50">
                {t("noPayments")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-3 text-start">{t("paymentDate")}</th>
                      <th className="px-5 py-3 text-start">{t("paymentMethod")}</th>
                      <th className="px-5 py-3 text-end">{t("amount")}</th>
                      <th className="px-5 py-3 text-start">{t("notes")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.payments.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-slate-50/40">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                          {pmt.payment_date?.split("T")[0] || "—"}
                        </td>
                        <td className="px-5 py-3.5 capitalize text-slate-700 font-semibold">
                          {pmt.payment_method?.replace("_", " ") || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-end font-mono font-bold text-emerald-700">
                          ${parseFloat(pmt.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{pmt.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoiceId={invoiceId}
        remainingBalance={remaining}
        onSuccess={loadInvoice}
      />
    </DashboardLayout>
  );
}
