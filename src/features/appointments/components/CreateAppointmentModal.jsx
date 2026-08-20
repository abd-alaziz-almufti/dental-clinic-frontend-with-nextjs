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
import { userService } from "@/features/users/services/userService";

export function CreateAppointmentModal({ isOpen, onClose, onSuccess, initialDate = "" }) {
  const t = useTranslations("appointments");
  const commonT = useTranslations("common");

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch patients
      patientService
        .getPatients({ per_page: 100 })
        .then((res) => setPatients(res.data || []))
        .catch(() => setPatients([]));

      // Fetch doctors dynamically from users with role 'doctor'
      userService
        .getUsers({ role: "doctor", per_page: 100 })
        .then((res) => setDoctors(res.data || []))
        .catch(() => setDoctors([]));
    }
  }, [isOpen]);

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: "",
      doctor_profile_id: "",
      appointment_date: initialDate || todayStr,
      start_time: "09:00:00",
      end_time: "09:30:00",
      reason: "Dental Consultation & Cleaning",
      notes: "",
      branch_id: 1,
    },
  });

  const selectedPatientId = watch("patient_id");
  const selectedDoctorProfileId = watch("doctor_profile_id");

  const selectedPatient = patients.find((p) => String(p.id) === String(selectedPatientId));
  const selectedDoctorUser = doctors.find(
    (u) => String(u.doctor_profile?.id) === String(selectedDoctorProfileId)
  );

  const patientBranchId = selectedPatient?.registered_branch_id || selectedPatient?.branch_id;
  const doctorBranchId = selectedDoctorUser?.branch_id || selectedDoctorUser?.doctor_profile?.branch_id;

  const hasBranchMismatch =
    selectedPatient &&
    selectedDoctorUser &&
    patientBranchId &&
    doctorBranchId &&
    Number(patientBranchId) !== Number(doctorBranchId);

  const onSubmit = async (data) => {
    if (hasBranchMismatch) {
      setServerError(
        "خطأ في الفرع: المريض المحدد ينتمي لفرع مختلف عن الدكتور المختار. يرجى اختيار دكتور ينتمي لنفس فرع المريض."
      );
      return;
    }

    setSubmitting(true);
    setServerError("");
    try {
      const payload = {
        ...data,
        branch_id: patientBranchId || doctorBranchId || data.branch_id,
      };
      await appointmentService.bookAppointment(payload);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Book appointment error", err);
      const apiErrors = err.response?.data?.errors;
      let msg = "";
      if (apiErrors && typeof apiErrors === "object") {
        const errorList = Object.values(apiErrors).flat();
        if (errorList.length > 0) {
          msg = errorList.join(" ");
        }
      }
      if (!msg) {
        msg =
          err.response?.data?.message ||
          commonT("serverError") ||
          "Failed to book appointment";
      }
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

        {hasBranchMismatch && !serverError && (
          <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-lg font-semibold flex items-center justify-between">
            <span>
              ⚠️ تنبيه: المريض من (فرع #{patientBranchId}) والدكتور من (فرع #{doctorBranchId}). يجب اختيار دكتور بنفس الفرع.
            </span>
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
            {patients.map((p) => {
              const fullName = `${p.first_name} ${p.middle_name ? p.middle_name + " " : ""}${p.last_name}`;
              const extraInfo = p.patient_number || p.phone || p.national_id || "No phone";
              return (
                <option key={p.id} value={p.id}>
                  {fullName} ({extraInfo})
                </option>
              );
            })}
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
            <option value="">-- {t("selectDoctor")} --</option>
            {doctors.map((u) => {
              const doctorProfileId = u.doctor_profile?.id;
              if (!doctorProfileId) return null;
              const specialtyName = u.doctor_profile?.specialty?.name;
              const docBranch = u.branch_id || u.doctor_profile?.branch_id;
              const isMatch = !patientBranchId || Number(docBranch) === Number(patientBranchId);
              return (
                <option key={doctorProfileId} value={doctorProfileId}>
                  Dr. {u.name} {specialtyName ? `(${specialtyName})` : ""}{" "}
                  {docBranch ? `[Branch #${docBranch}]` : ""}{" "}
                  {!isMatch ? "⚠️ Different Branch" : ""}
                </option>
              );
            })}
          </select>
          {errors.doctor_profile_id && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.doctor_profile_id.message}
            </p>
          )}
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
