"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import { RecordPaymentModal } from "@/features/billing/components/RecordPaymentModal";
import { billingService } from "@/features/billing/services/billingService";
import {
  Receipt,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function BillingPage() {
  const t = useTranslations("billing");
  const commonT = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [paymentModal, setPaymentModal] = useState({ open: false, invoiceId: null, remaining: 0 });

  // KPI aggregates (derived from list data)
  const totalBilled = invoices.reduce((s, inv) => s + parseFloat(inv.total || 0), 0);
  const totalPaid = invoices.reduce((s, inv) => {
    const paid = inv.paid_amount !== undefined
      ? parseFloat(inv.paid_amount || 0)
      : parseFloat(inv.total || 0) - parseFloat(inv.remaining_balance || 0);
    return s + (isNaN(paid) ? 0 : paid);
  }, 0);
  const outstanding = invoices.reduce((s, inv) => s + parseFloat(inv.remaining_balance || inv.balance || 0), 0);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billingService.getInvoices({ page, per_page: 12, status: statusFilter });
      setInvoices(res.data || []);
      setMeta(res.meta || { current_page: page, last_page: 1, total: (res.data || []).length });
    } catch (err) {
      console.error("Failed to load invoices:", err);
      // Fallback mock for demonstration when backend is unavailable
      setInvoices([
        { id: 1001, invoice_number: "INV-2026-0001", patient: { first_name: "Ahmed", last_name: "Al-Salem" }, total: "850.00", paid_amount: "850.00", remaining_balance: "0.00", status: "paid", created_at: "2026-07-20" },
        { id: 1002, invoice_number: "INV-2026-0002", patient: { first_name: "Sara", last_name: "Al-Harbi" }, total: "450.00", paid_amount: "200.00", remaining_balance: "250.00", status: "partial", created_at: "2026-07-22" },
        { id: 1003, invoice_number: "INV-2026-0003", patient: { first_name: "Khalid", last_name: "Al-Mutairi" }, total: "1200.00", paid_amount: "0.00", remaining_balance: "1200.00", status: "unpaid", created_at: "2026-07-25" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const kpiCards = [
    { label: "Total Billed", value: `$${totalBilled.toFixed(2)}`, icon: Receipt, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Total Paid", value: `$${totalPaid.toFixed(2)}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Outstanding", value: `$${outstanding.toFixed(2)}`, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Invoices", value: meta.total || invoices.length, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{t("subtitle")}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label} className="p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
                  <p className="text-lg font-bold text-slate-900 leading-tight">{kpi.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4 shadow-xs flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="paid">{t("paid")}</option>
            <option value="partial">{t("partial")}</option>
            <option value="unpaid">{t("unpaid")}</option>
            <option value="overdue">{t("overdue")}</option>
            <option value="cancelled">{t("cancelled")}</option>
          </select>
        </Card>

        {/* Invoices Table */}
        <Card className="shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
          ) : invoices.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 stroke-1" />
              <p className="font-semibold text-base">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="px-5 py-3 text-start">{t("invoiceNumber")}</th>
                    <th className="px-5 py-3 text-start">{t("patient")}</th>
                    <th className="px-5 py-3 text-start">{t("issueDate")}</th>
                    <th className="px-5 py-3 text-end">{t("totalAmount")}</th>
                    <th className="px-5 py-3 text-end">{t("paidAmount")}</th>
                    <th className="px-5 py-3 text-end">{t("remainingBalance")}</th>
                    <th className="px-5 py-3 text-start">{t("status")}</th>
                    <th className="px-5 py-3 text-end">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => {
                    const patientName = inv.patient
                      ? `${inv.patient.first_name || ""} ${inv.patient.last_name || ""}`.trim()
                      : inv.patient_name || "Patient";
                    const remaining = parseFloat(inv.remaining_balance || inv.balance || 0);
                    const isSettled = remaining <= 0 || inv.status === "paid" || inv.status === "cancelled";

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-teal-700">
                          {inv.invoice_number || `#${inv.id}`}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{patientName}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                          {inv.created_at?.split("T")[0] || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-end font-mono font-bold text-slate-800">
                          ${parseFloat(inv.total || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-end font-mono text-emerald-700">
                          ${parseFloat(inv.paid_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-end font-mono font-bold text-amber-700">
                          ${remaining.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <InvoiceStatusBadge status={inv.status} />
                        </td>
                        <td className="px-5 py-3.5 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/billing/invoices/${inv.id}`}>
                              <Button size="sm" variant="outline" className="text-teal-700 hover:bg-teal-50">
                                {t("viewInvoice")}
                              </Button>
                            </Link>
                            {!isSettled && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => setPaymentModal({ open: true, invoiceId: inv.id, remaining })}
                              >
                                {t("recordPayment")}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Page {meta.current_page} of {meta.last_page}
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, invoiceId: null, remaining: 0 })}
        invoiceId={paymentModal.invoiceId}
        remainingBalance={paymentModal.remaining}
        onSuccess={fetchInvoices}
      />
    </DashboardLayout>
  );
}
