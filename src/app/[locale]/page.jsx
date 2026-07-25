"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations("common");
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
          🦷
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{t("appName")}</h1>
        <p className="text-sm text-slate-500 mb-6">{t("subtitle")}</p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
          >
            Go to Login
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-s-3 text-xs text-slate-500">
          <span>{t("language")}:</span>
          <Link
            href={pathname}
            locale="en"
            className="hover:text-teal-600 font-medium text-slate-700"
          >
            English
          </Link>
          <span>•</span>
          <Link
            href={pathname}
            locale="ar"
            className="hover:text-teal-600 font-medium text-slate-700"
          >
            العربية
          </Link>
        </div>
      </div>
    </div>
  );
}
