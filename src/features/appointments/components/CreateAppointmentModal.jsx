"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { appointmentSchema } from "../schemas/appointmentSchema";
import { appointmentService } from "../services/appointmentService";
import { patientService } from "@/features/patients/services/patientService";

export function CreateAppointmentModal({ isOpen, onClose, onSuccess, initialDate = "" }) {
  const t = useTranslations("appointments");
  const commonT = useTranslations("common");

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (isOpen) {
      patientService
        .getPatients({ per_page: 50 })
        .then((res) => setPatients(res.data || []))
        .catch(() => setPatients([]));
    }
  }, [isOpen]);

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: "",
      doctor_profile_id: "1",
      appointment_date: initialDate || todayStr,
      start_time: "09:00:00",
      end_time: "09:30:00",
      reason: "Dental Consultation & Cleaning",
      notes: "",
      branch_id: 1,
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError("");
    try {
      await appointmentService.bookAppointment(data);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Book appointment error", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.appointment_date?.[0] ||
        commonT("serverError") ||
        "Failed to book appointment";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("bookAppointment")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
            {serverError}
          </div>
        )}

        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t("selectPatient")} *
          </label>
          <select
            {...register("patient_id")}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">-- {t("selectPatient")} --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.phone || "No phone"})
              </option>
            ))}
          </select>
          {errors.patient_id && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.patient_id.message}
            </p>
          )}
        </div>

        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t("selectDoctor")} *
          </label>
          <select
            {...register("doctor_profile_id")}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="1">Dr. Sarah Al-Mansoor (General Dentistry)</option>
            <option value="2">Dr. Omar Hassan (Orthodontist)</option>
          </select>
        </div>

        {/* Date & Time Grid */}
        <Input
          label={t("appointmentDate")}
          type="date"
          {...register("appointment_date")}
          error={errors.appointment_date?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("startTime")}
            type="time"
            {...register("start_time")}
            error={errors.start_time?.message}
          />
          <Input
            label={t("endTime")}
            type="time"
            {...register("end_time")}
            error={errors.end_time?.message}
          />
        </div>

        <Input
          label={t("reason")}
          {...register("reason")}
          error={errors.reason?.message}
          placeholder="Routine Checkup, Teeth Whitening..."
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t("notes")}
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Special instructions or medical alerts..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            {commonT("cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            {commonT("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
