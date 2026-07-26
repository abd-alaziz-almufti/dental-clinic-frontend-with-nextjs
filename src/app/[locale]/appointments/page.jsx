"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AppointmentCalendar } from "@/features/appointments/components/AppointmentCalendar";
import { CreateAppointmentModal } from "@/features/appointments/components/CreateAppointmentModal";
import { CancelAppointmentModal } from "@/features/appointments/components/CancelAppointmentModal";
import { appointmentService } from "@/features/appointments/services/appointmentService";
import { CalendarPlus, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function AppointmentsPage() {
  const t = useTranslations("appointments");

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [doctorId, setDoctorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({
        date: selectedDate,
        doctor_id: doctorId,
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to load appointments", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & Main Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-500 font-medium">{t("subtitle")}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsBookModalOpen(true)}
            className="self-start sm:self-auto"
          >
            <CalendarPlus className="w-4 h-4 me-2" />
            <span>{t("bookAppointment")}</span>
          </Button>
        </div>

        {/* Date Navigation & Doctor Filter Bar */}
        <Card className="p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Date Picker Controls */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrevDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Button size="sm" variant="outline" onClick={handleNextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedDate(todayStr)}
              className="text-xs text-teal-700 font-semibold"
            >
              {t("today")}
            </Button>
          </div>

          {/* Doctor Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full md:w-56 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">{t("allDoctors")}</option>
              <option value="1">Dr. Sarah Al-Mansoor</option>
              <option value="2">Dr. Omar Hassan</option>
            </select>
          </div>
        </Card>

        {/* Appointments List / Grid */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <AppointmentCalendar
            appointments={appointments}
            onCancelClick={(apt) => setCancelTarget(apt)}
          />
        )}
      </div>

      {/* Booking Modal */}
      <CreateAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        initialDate={selectedDate}
        onSuccess={fetchAppointments}
      />

      {/* Cancellation Modal */}
      <CancelAppointmentModal
        isOpen={!!cancelTarget}
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onSuccess={fetchAppointments}
      />
    </DashboardLayout>
  );
}
