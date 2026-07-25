"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslations } from "next-intl";

export default function DoctorsPage() {
  const t = useTranslations("nav");

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{t("doctors")}</h1>
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">
          Doctors Catalog & Availability Management
        </div>
      </div>
    </DashboardLayout>
  );
}
