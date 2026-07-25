"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslations } from "next-intl";

export default function PatientsPage() {
  const t = useTranslations("nav");

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{t("patients")}</h1>
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">
          Patient Registry Module (Phase 3 Spec Ready)
        </div>
      </div>
    </DashboardLayout>
  );
}
