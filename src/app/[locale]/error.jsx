"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function ErrorBoundary({ error, reset }) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("Unhandled client application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            {t("somethingWentWrong") || "Something went wrong"}
          </h2>
          <p className="text-sm text-slate-500">
            {t("errorSubtitle") || "An unexpected application error occurred. You can attempt to refresh the page view."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t("tryAgain") || "Try Again"}</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t("backToDashboard") || "Back to Dashboard"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
