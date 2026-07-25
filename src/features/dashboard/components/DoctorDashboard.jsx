"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { dashboardService } from "../services/dashboardService";
import { KpiCard } from "./KpiCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Link } from "@/i18n/routing";
import { Calendar, UserCheck, Stethoscope, Clock, ChevronRight } from "lucide-react";

export function DoctorDashboard() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadDoctorData() {
      setLoading(true);
      try {
        const data = await dashboardService.getTodayAppointments();
        setAppointments(data.data || []);
      } catch (err) {
        console.error("Doctor dashboard error", err);
      } finally {
        setLoading(false);
      }
    }

    loadDoctorData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Personalized Greeting Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t("goodMorning")}, Dr. {user?.name || "Doctor"} 👋
          </h1>
          <p className="text-teal-100 text-sm mt-1">
            You have {appointments.length} patients scheduled for consultation today.
          </p>
        </div>
        <Link href="/appointments">
          <Button variant="secondary" className="hidden sm:flex">
            View Schedule
          </Button>
        </Link>
      </div>

      {/* Quick Doctor Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title={t("todayAppointments")}
          value={appointments.length || 5}
          icon={Calendar}
          color="teal"
        />
        <KpiCard
          title="Completed Visits"
          value="2"
          icon={UserCheck}
          color="green"
        />
        <KpiCard
          title="Pending Consultation"
          value="3"
          icon={Stethoscope}
          color="amber"
        />
      </div>

      {/* Today's Schedule Timeline View */}
      <Card className="p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {t("todaySchedule")}
          </h2>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 stroke-1" />
            <p className="font-medium">{t("noAppointmentsToday")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt, idx) => (
              <div
                key={apt.id || idx}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-sm transition-all"
              >
                {/* Time Column */}
                <div className="text-center min-w-[80px] pt-1">
                  <p className="text-sm font-bold text-slate-900">
                    {apt.time || "09:00 AM"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">30 mins</p>
                </div>

                {/* Timeline Bar */}
                <div className="w-1 self-stretch bg-teal-500 rounded-full" />

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {apt.patient_name || apt.patient?.name || "Patient Name"}
                    </h3>
                    <Badge variant={apt.status === "completed" ? "success" : "info"}>
                      {apt.status || "Scheduled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Reason: {apt.notes || "Regular Checkup & Cleaning"}
                  </p>

                  <div className="flex items-center gap-3">
                    <Link href={`/visits?patient_id=${apt.patient_id || 1}`}>
                      <Button size="sm" variant="primary">
                        {t("startVisit")}
                      </Button>
                    </Link>
                    <Link href={`/patients/${apt.patient_id || 1}`}>
                      <Button size="sm" variant="outline">
                        {t("viewDetails")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
