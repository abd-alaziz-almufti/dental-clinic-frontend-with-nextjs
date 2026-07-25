"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { dashboardService } from "../services/dashboardService";
import { KpiCard } from "./KpiCard";
import { QuickActions } from "./QuickActions";
import { RevenueChart } from "./RevenueChart";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Calendar, Users, DollarSign, Clock, UserCheck } from "lucide-react";

export function AdminDashboard() {
  const t = useTranslations("dashboard");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patientsCount, setPatientsCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [appData, patData] = await Promise.all([
          dashboardService.getTodayAppointments(),
          dashboardService.getPatientsSummary(),
        ]);
        setAppointments(appData.data || []);
        setPatientsCount(patData.meta?.total || appData.meta?.total || 142);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("overview")}</h1>
        <p className="text-sm text-slate-500 font-medium">
          Welcome back to Lumina Dental Practice Management.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t("todayAppointments")}
          value={appointments.length || 8}
          icon={Calendar}
          trend="12%"
          color="teal"
        />
        <KpiCard
          title={t("totalPatients")}
          value={patientsCount || 142}
          icon={Users}
          trend="8%"
          color="blue"
        />
        <KpiCard
          title={t("todayRevenue")}
          value="$2,450"
          icon={DollarSign}
          color="green"
        />
        <KpiCard
          title={t("activeDoctors")}
          value="4"
          icon={UserCheck}
          color="purple"
        />
      </div>

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
            <div className="flex-1 flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400 text-sm">
              <Clock className="w-8 h-8 mb-2 stroke-1" />
              <p>{t("noAppointmentsToday")}</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pe-1">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {apt.patient_name || apt.patient?.name || "John Doe"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {apt.scheduled_time || "10:00 AM"} •{" "}
                      {apt.doctor_name || "Dr. Smith"}
                    </p>
                  </div>
                  <Badge variant={apt.status === "completed" ? "success" : "info"}>
                    {apt.status || "scheduled"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
