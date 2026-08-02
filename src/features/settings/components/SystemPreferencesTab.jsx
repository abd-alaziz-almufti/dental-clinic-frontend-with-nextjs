"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Card } from "@/components/ui/Card";
import { Globe, Calendar, Check, Sparkles } from "lucide-react";

export function SystemPreferencesTab() {
  const locale = useLocale();
  const t = useTranslations("settings");
  const pathname = usePathname();

  return (
    <Card className="p-6 md:p-8 shadow-xs max-w-4xl space-y-6">
      <div>
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-teal-600" />
          <span>{t("systemPreferences") || "Interface Locale & Formatting Preferences"}</span>
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {t("preferencesSubtitle") || "Client-side display preferences for language, layout direction, and date rendering."}
        </p>
      </div>

      <div className="space-y-6 divide-y divide-slate-100">
        {/* Language Selection */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 text-sm">System Interface Language</p>
            <p className="text-xs text-slate-500">Switch between Arabic (RTL) and English (LTR) layout.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={pathname}
              locale="en"
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                locale === "en"
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-teal-300"
              }`}
            >
              {locale === "en" && <Check className="w-3.5 h-3.5" />}
              <span>English (LTR)</span>
            </Link>
            <Link
              href={pathname}
              locale="ar"
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                locale === "ar"
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-teal-300"
              }`}
            >
              {locale === "ar" && <Check className="w-3.5 h-3.5" />}
              <span>العربية (RTL)</span>
            </Link>
          </div>
        </div>

        {/* Date Display Preview (Client-side via next-intl) */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Date Formatting Standard</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              API outputs raw ISO 8601 timestamps; formatted dynamically in browser using locale standard.
            </p>
          </div>
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 font-semibold">
            {new Date().toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Info Note */}
        <div className="pt-6">
          <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-xl text-xs text-teal-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Frontend Architecture Note:</strong> All date, currency, and language preferences are processed directly in the client browser adhering to internationalization standards (`next-intl`), ensuring zero unnecessary server payload.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
