"use client";

import { useQueries } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { dashboardService } from "../services/dashboardService";
import { KpiCard } from "./KpiCard";
import { QuickActions } from "./QuickActions";
import { RevenueChart } from "./RevenueChart";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KpiCardsSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { Calendar, Users, DollarSign, Clock, UserCheck } from "lucide-react";

export function AdminDashboard() {
  const t = useTranslations("dashboard");

  const todayStr = new Date().toISOString().split("T")[0];

  const [appointmentsQuery, patientsQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.dashboard.todayAppointments(todayStr),
        queryFn: () => dashboardService.getTodayAppointments(),
        staleTime: 60 * 1000, // 1 minute — appointments change frequently
      },
      {
        queryKey: queryKeys.dashboard.patientsSummary(),
        queryFn: () => dashboardService.getPatientsSummary(),
        staleTime: 5 * 60 * 1000, // 5 minutes — patient count is stable
      },
    ],
  });

  const appointments = appointmentsQuery.data?.data || [];
  const patientsCount = patientsQuery.data?.meta?.total ?? (patientsQuery.data?.data?.length || 0);
  const loading = appointmentsQuery.isLoading || patientsQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("overview")}</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Welcome to Lumina Dental Practice Management.
        </p>
      </div>

      {/* KPI Cards Grid — show skeleton while loading */}
      {loading ? (
        <KpiCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title={t("todayAppointments")}
            value={appointments.length}
            icon={Calendar}
            color="teal"
          />
          <KpiCard
            title={t("totalPatients")}
            value={patientsCount}
            icon={Users}
            color="blue"
          />
          <KpiCard
            title={t("todayRevenue")}
            value="—"
            icon={DollarSign}
            color="green"
          />
          <KpiCard
            title={t("activeDoctors")}
            value="—"
            icon={UserCheck}
            color="purple"
          />
        </div>
      )}

      {/* Quick Actions Panel */}
      <QuickActions />

      {/* Revenue Chart & Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Today's Schedule Overview */}
        <Card className="p-5 shadow-xs flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            {t("todaySchedule")}
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400 text-sm">
              <Clock className="w-8 h-8 mb-2 stroke-1" />
              <p>{t("noAppointmentsToday")}</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pe-1">
              {appointments.map((apt) => {
                const patientName =
                  apt.patient?.full_name ||
                  (apt.patient?.first_name
                    ? `${apt.patient.first_name} ${apt.patient.last_name || ""}`.trim()
                    : null) ||
                  apt.patient_name ||
                  "—";

                const doctorName =
                  apt.doctor?.user?.name ||
                  apt.doctorProfile?.user?.name ||
                  apt.doctor_name ||
                  "—";

                const timeStr = apt.start_time || apt.scheduled_time || "—";

                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {patientName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {timeStr} • {doctorName}
                      </p>
                    </div>
                    <Badge variant={apt.status === "completed" ? "success" : "info"}>
                      {apt.status || "scheduled"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
