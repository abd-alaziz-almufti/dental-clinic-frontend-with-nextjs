"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { UserPlus, CalendarPlus, FilePlus } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function QuickActions() {
  const t = useTranslations("dashboard");

  const actions = [
    {
      title: t("addPatient"),
      href: "/patients?action=add",
      icon: UserPlus,
      color: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      title: t("createAppointment"),
      href: "/appointments?action=create",
      icon: CalendarPlus,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      title: t("newVisit"),
      href: "/visits?action=new",
      icon: FilePlus,
      color: "bg-purple-600 hover:bg-purple-700 text-white",
    },
  ];

  return (
    <Card className="p-5 shadow-xs">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        {t("quickActions")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-xs hover:shadow-md active:scale-95 ${action.color}`}
            >
              <Icon className="w-4 h-4" />
              <span>{action.title}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
