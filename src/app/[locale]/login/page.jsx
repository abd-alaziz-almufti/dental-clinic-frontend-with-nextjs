"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm text-2xl font-bold">
            🦷
          </div>
          <h1 className="text-xl font-bold text-slate-900">{tAuth("loginTitle")}</h1>
          <p className="text-xs text-slate-500 mt-1">{tAuth("loginSubtitle")}</p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Footer / Language Switcher */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{tCommon("appName")} v1.0</span>
          <div className="flex items-center gap-2">
            <Link
              href={pathname}
              locale="en"
              className="hover:text-teal-600 font-medium text-slate-700 transition-colors"
            >
              EN
            </Link>
            <span>•</span>
            <Link
              href={pathname}
              locale="ar"
              className="hover:text-teal-600 font-medium text-slate-700 transition-colors"
            >
              عربي
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
