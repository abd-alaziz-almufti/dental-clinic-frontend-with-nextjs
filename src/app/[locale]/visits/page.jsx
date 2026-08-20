"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { visitService } from "@/features/visits/services/visitService";
import { userService } from "@/features/users/services/userService";
import { queryKeys } from "@/lib/queryKeys";
import { Stethoscope, ChevronLeft, ChevronRight, Filter, Calendar, User } from "lucide-react";

const statusVariantMap = {
  open: "info",
  in_progress: "info",
  completed: "success",
  closed: "neutral",
};

export default function VisitsPage() {
  const t = useTranslations("visits");

  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    userService
      .getUsers({ role: "doctor", per_page: 100 })
      .then((res) => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, []);

  const queryParams = { page, per_page: 10, status: statusFilter, doctor_id: doctorFilter };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.visits.list(queryParams),
    queryFn: () => visitService.getVisits(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const visits = data?.data || [];
  const meta = data?.meta || { current_page: page, last_page: 1, total: visits.length };

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

        {/* Status & Doctor Filter Bar */}
        <Card className="p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="open">{t("open")}</option>
                <option value="in_progress">{t("inProgress")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="closed">{t("closed")}</option>
              </select>
            </div>

            {/* Doctor Filter */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={doctorFilter}
                onChange={(e) => {
                  setDoctorFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Doctors (Branch)</option>
                {doctors.map((u) => {
                  const profileId = u.doctor_profile?.id;
                  if (!profileId) return null;
                  return (
                    <option key={profileId} value={profileId}>
                      Dr. {u.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </Card>

        {/* Visits Table */}
        <Card className="shadow-xs overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
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
