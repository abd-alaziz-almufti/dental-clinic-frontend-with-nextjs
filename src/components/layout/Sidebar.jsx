"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link, usePathname } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/queryKeys";
import { patientService } from "@/features/patients/services/patientService";
import { appointmentService } from "@/features/appointments/services/appointmentService";
import { visitService } from "@/features/visits/services/visitService";
import { billingService } from "@/features/billing/services/billingService";
import { userService } from "@/features/users/services/userService";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  UserCog,
  Briefcase,
  CreditCard,
  BarChart3,
  Package,
  ShieldCheck,
  Settings,
  X,
} from "lucide-react";

export function Sidebar({ isOpen, onClose }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, hasAnyRole } = useAuth();
  const queryClient = useQueryClient();

  const handlePrefetch = (href) => {
    try {
      if (href === "/patients") {
        queryClient.prefetchQuery({
          queryKey: queryKeys.patients.list({ page: 1, per_page: 10, search: "" }),
          queryFn: () => patientService.getPatients({ page: 1, per_page: 10, search: "" }),
          staleTime: 2 * 60 * 1000,
        });
      } else if (href === "/appointments") {
        const todayStr = new Date().toISOString().split("T")[0];
        queryClient.prefetchQuery({
          queryKey: queryKeys.appointments.list({ date: todayStr, doctor_id: "" }),
          queryFn: () => appointmentService.getAppointments({ date: todayStr, doctor_id: "" }),
          staleTime: 60 * 1000,
        });
      } else if (href === "/visits") {
        queryClient.prefetchQuery({
          queryKey: queryKeys.visits.list({ page: 1, per_page: 10, status: "" }),
          queryFn: () => visitService.getVisits({ page: 1, per_page: 10, status: "" }),
          staleTime: 2 * 60 * 1000,
        });
      } else if (href === "/billing") {
        queryClient.prefetchQuery({
          queryKey: queryKeys.invoices.list({ page: 1, per_page: 12, status: "" }),
          queryFn: () => billingService.getInvoices({ page: 1, per_page: 12, status: "" }),
          staleTime: 60 * 1000,
        });
      } else if (href === "/users") {
        queryClient.prefetchQuery({
          queryKey: queryKeys.users.list({ page: 1, per_page: 25, search: "", role: "" }),
          queryFn: () => userService.getUsers({ page: 1, per_page: 25, search: "", role: "" }),
          staleTime: 2 * 60 * 1000,
        });
      }
    } catch (e) {
      // Ignore prefetch errors silently
    }
  };

  const navItems = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      roles: ["super-admin", "admin", "doctor"],
    },
    {
      href: "/patients",
      label: t("patients"),
      icon: Users,
      roles: ["super-admin", "admin", "doctor"],
    },
    {
      href: "/appointments",
      label: t("appointments"),
      icon: Calendar,
      roles: ["super-admin", "admin", "doctor"],
    },
    {
      href: "/visits",
      label: t("visits"),
      icon: Stethoscope,
      roles: ["super-admin", "admin", "doctor"],
    },
    {
      href: "/doctors",
      label: t("doctors"),
      icon: UserCog,
      roles: ["super-admin", "admin"],
    },
    {
      href: "/services",
      label: t("services"),
      icon: Briefcase,
      roles: ["super-admin", "admin"],
    },
    {
      href: "/billing",
      label: t("billing"),
      icon: CreditCard,
      roles: ["super-admin", "admin", "doctor"],
    },
    {
      href: "/reports",
      label: t("reports"),
      icon: BarChart3,
      roles: ["super-admin", "admin"],
    },
    {
      href: "/inventory",
      label: t("inventory"),
      icon: Package,
      roles: ["super-admin", "admin", "doctor"],
    },
    {
      href: "/users",
      label: t("users"),
      icon: ShieldCheck,
      roles: ["super-admin", "admin"],
    },
    {
      href: "/settings",
      label: t("settings"),
      icon: Settings,
      roles: ["super-admin", "admin"],
    },
  ];

  const filteredItems = navItems.filter((item) => hasAnyRole(item.roles));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 start-0 z-50 w-64 bg-white border-e border-slate-200 shadow-sm flex flex-col transition-transform duration-300 lg:translate-x-0 lg:rtl:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              L
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Lumina Dental
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Clinic Management
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                onMouseEnter={() => handlePrefetch(item.href)}
                onFocus={() => handlePrefetch(item.href)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${isActive
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-teal-600" : "text-slate-400"
                    }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Role Footer Badge */}
        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm uppercase">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {user.roles?.[0] || "User"}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
