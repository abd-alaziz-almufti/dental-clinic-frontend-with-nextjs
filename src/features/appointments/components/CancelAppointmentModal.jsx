"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { appointmentService } from "../services/appointmentService";
import { AlertTriangle } from "lucide-react";

export function CancelAppointmentModal({ isOpen, onClose, appointment, onSuccess }) {
  const t = useTranslations("appointments");
  const commonT = useTranslations("common");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!appointment) return null;

  const handleCancel = async () => {
    setSubmitting(true);
    setError("");
    try {
      await appointmentService.cancelAppointment(appointment.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Cancel appointment error", err);
      setError(err.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("cancelAppointment")}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-800 text-sm">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <p>{t("confirmCancel")}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
          <p>
            <strong>Patient:</strong> {appointment.patient_name || appointment.patient?.name || "Patient"}
          </p>
          <p>
            <strong>Date:</strong> {appointment.appointment_date || appointment.date || "Today"}
          </p>
          <p>
            <strong>Time:</strong> {appointment.start_time || "10:00 AM"}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            {commonT("cancel")}
          </Button>
          <Button variant="danger" onClick={handleCancel} isLoading={submitting}>
            {t("cancelAppointment")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
