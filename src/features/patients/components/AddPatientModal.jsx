"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { patientSchema } from "../schemas/patientSchema";
import { patientService } from "../services/patientService";

export function AddPatientModal({ isOpen, onClose, onSuccess }) {
  const t = useTranslations("patients");
  const commonT = useTranslations("common");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "male",
      birth_date: "",
      national_id: "",
      phone: "",
      email: "",
      address: "",
      registered_branch_id: 1,
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError("");
    try {
      await patientService.registerPatient(data);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Register patient error", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.national_id?.[0] ||
        commonT("serverError") ||
        "Failed to register patient";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("addPatient")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t("firstName")}
            {...register("first_name")}
            error={errors.first_name?.message}
            placeholder="John"
          />
          <Input
            label={t("lastName")}
            {...register("last_name")}
            error={errors.last_name?.message}
            placeholder="Doe"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("gender")}
            </label>
            <select
              {...register("gender")}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
              <option value="other">{t("other")}</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.gender.message}
              </p>
            )}
          </div>

          <Input
            label={t("birthDate")}
            type="date"
            {...register("birth_date")}
            error={errors.birth_date?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t("nationalId")}
            {...register("national_id")}
            error={errors.national_id?.message}
            placeholder="1092837465"
          />
          <Input
            label={t("phone")}
            {...register("phone")}
            error={errors.phone?.message}
            placeholder="+966500000000"
          />
        </div>

        <Input
          label={t("email")}
          type="email"
          {...register("email")}
          error={errors.email?.message}
          placeholder="john.doe@example.com"
        />

        <Input
          label={t("address")}
          {...register("address")}
          error={errors.address?.message}
          placeholder="Riyadh, Saudi Arabia"
        />

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
