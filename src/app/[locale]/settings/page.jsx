"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GeneralSettingsTab } from "@/features/settings/components/GeneralSettingsTab";
import { SystemPreferencesTab } from "@/features/settings/components/SystemPreferencesTab";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Sliders, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { hasAnyRole } = useAuth();

  // Role guard: doctor is blocked
  const canAccess = hasAnyRole("super-admin", "admin");

  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'preferences'

  if (!canAccess) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl text-red-700 space-y-3 my-8 max-w-xl mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold">Access Restricted</h2>
          <p className="text-xs">Practice settings management is reserved for System Super-Admins and Branch Administrators.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title") || "Practice & System Settings"}</h1>
          <p className="text-sm text-slate-500 font-medium">{t("subtitle") || "Configure practice identity details, tax registration number, and interface preferences."}</p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t("practiceProfile") || "Branch Practice Identity"}</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "preferences"
                ? "border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t("systemPreferences") || "Interface Preferences"}</span>
          </button>
        </div>

        {/* Tab 1: Practice Profile */}
        {activeTab === "general" && <GeneralSettingsTab />}

        {/* Tab 2: System Preferences */}
        {activeTab === "preferences" && <SystemPreferencesTab />}
      </div>
    </DashboardLayout>
  );
}
