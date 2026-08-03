"use client";

import { useTranslations } from "next-intl";
import { FileQuestion, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function NotFoundPage() {
  const t = useTranslations("errors");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-6">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-100">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-teal-700 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-900">
            {t("notFoundTitle") || "Page Not Found"}
          </h2>
          <p className="text-sm text-slate-500">
            {t("notFoundSubtitle") || "The page or resource you are looking for does not exist or has been moved."}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t("backToDashboard") || "Back to Dashboard"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
