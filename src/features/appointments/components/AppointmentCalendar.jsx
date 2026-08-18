"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { Clock, User, CalendarX, Stethoscope, ClipboardPlus } from "lucide-react";

export function AppointmentCalendar({ appointments = [], onCancelClick, onCheckInClick }) {
  const t = useTranslations("appointments");
  const [checkingIn, setCheckingIn] = useState({});

  const statusVariant = {
    scheduled: "info",
    confirmed: "teal",
    completed: "success",
    cancelled: "danger",
    attended: "success",
  };

  const handleCheckIn = async (apt) => {
    setCheckingIn((prev) => ({ ...prev, [apt.id]: true }));
    try {
      await onCheckInClick?.(apt);
    } finally {
      setCheckingIn((prev) => ({ ...prev, [apt.id]: false }));
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-xs">
        <Clock className="w-10 h-10 mx-auto mb-3 stroke-1" />
        <p className="font-semibold text-base">{t("noAppointments")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((apt) => {
        const patientName =
          apt.patient?.full_name ||
          (apt.patient
            ? `${apt.patient.first_name || ""} ${apt.patient.last_name || ""}`.trim()
            : null) ||
          apt.patient_name ||
          "—";
        const doctorName =
          apt.doctor?.user?.name ||
          apt.doctor_profile?.user?.name ||
          apt.doctorProfile?.user?.name ||
          apt.doctor_name ||
          "—";
        const status = (apt.status || "scheduled").toLowerCase();

        return (
          <div
            key={apt.id}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant={statusVariant[status] || "info"}>
                  {t(status) || status}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {apt.start_time || "09:00 AM"}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{patientName}</span>
              </h3>

              <p className="text-xs text-slate-500 mt-1 font-medium">
                {t("doctor")}: {doctorName}
              </p>

              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-3">
                {apt.reason || "General Consultation"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {/* Check-In button: only for scheduled / confirmed */}
                {(status === "scheduled" || status === "confirmed") && (
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={checkingIn[apt.id]}
                    onClick={() => handleCheckIn(apt)}
                    className="text-xs"
                  >
                    <ClipboardPlus className="w-3.5 h-3.5 me-1" />
                    <span>{t("checkIn")}</span>
                  </Button>
                )}

                {/* View Visit link: only when already attended/completed */}
                {(status === "attended" || status === "completed") && (
                  <Link href={`/visits?appointment_id=${apt.id}&patient_id=${apt.patient_id}`}>
                    <Button size="sm" variant="outline" className="text-teal-700 hover:bg-teal-50 text-xs">
                      <Stethoscope className="w-3.5 h-3.5 me-1" />
                      <span>{t("viewVisit")}</span>
                    </Button>
                  </Link>
                )}
              </div>

              {status !== "cancelled" && status !== "completed" && status !== "attended" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onCancelClick?.(apt)}
                >
                  <CalendarX className="w-3.5 h-3.5 me-1" />
                  <span>{t("cancel")}</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
