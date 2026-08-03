"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { visitService } from "@/features/visits/services/visitService";
import { Stethoscope, ChevronLeft, ChevronRight, Filter, Calendar } from "lucide-react";

export default function VisitsPage() {
  const t = useTranslations("visits");

  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await visitService.getVisits({
        page,
        per_page: 10,
        status: statusFilter,
      });
      setVisits(res.data || []);
      setMeta(res.meta || { current_page: page, last_page: 1, total: (res.data || []).length });
    } catch (err) {
      console.error("Failed to load visits", err);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const statusVariantMap = {
    in_progress: "info",
    completed: "success",
    closed: "neutral",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-500 font-medium">{t("subtitle")}</p>
          </div>
          <div className="shrink-0">
            <Link href="/appointments">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {t("newVisitHint")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Bar */}
        <Card className="p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="in_progress">{t("inProgress")}</option>
              <option value="completed">{t("completed")}</option>
              <option value="closed">{t("closed")}</option>
            </select>
          </div>
        </Card>

        {/* Visits Table */}
        <Card className="shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : visits.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 stroke-1" />
              <p className="font-semibold text-base">No clinical visits found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-3 text-start">{t("visitDate")}</th>
                    <th className="px-6 py-3 text-start">{t("patient")}</th>
                    <th className="px-6 py-3 text-start">{t("doctor")}</th>
                    <th className="px-6 py-3 text-start">{t("status")}</th>
                    <th className="px-6 py-3 text-end">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((v) => {
                    const patientName =
                      v.patient?.full_name ||
                      (v.patient
                        ? `${v.patient.first_name || ""} ${v.patient.last_name || ""}`.trim()
                        : null) ||
                      v.patient_name ||
                      "—";
                    const doctorName =
                      v.doctor?.name ||
                      v.doctor?.user?.name ||
                      v.doctor_name ||
                      "—";
                    const statusKey = v.status || "in_progress";

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-700">
                          {v.checked_in_at?.split("T")[0] || v.created_at?.split("T")[0] || "—"}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {patientName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{doctorName}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariantMap[statusKey] || "info"}>
                            {t(statusKey) || statusKey}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-end">
                          <Link href={`/visits/${v.id}`}>
                            <Button size="sm" variant="primary">
                              <Stethoscope className="w-3.5 h-3.5 me-1" />
                              <span>{t("openExamination")}</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {meta.last_page > 1 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
