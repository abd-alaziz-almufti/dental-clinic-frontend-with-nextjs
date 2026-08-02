"use client";

import { Badge } from "@/components/ui/Badge";
import { UserCheck, ShieldCheck, Stethoscope, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";

export function UsersListTable({ users = [], loading = false }) {
  const t = useTranslations("users");
  const roleT = useTranslations("roles");

  const roleVariantMap = {
    "super-admin": "purple",
    super_admin: "purple",
    admin: "teal",
    doctor: "info",
  };

  const roleIconMap = {
    "super-admin": ShieldCheck,
    super_admin: ShieldCheck,
    admin: UserCog,
    doctor: Stethoscope,
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-start border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
            <th className="px-6 py-3.5 text-start">{t("name")}</th>
            <th className="px-6 py-3.5 text-start">{t("email")}</th>
            <th className="px-6 py-3.5 text-start">{t("role")}</th>
            <th className="px-6 py-3.5 text-start">{t("branch")}</th>
            <th className="px-6 py-3.5 text-start">{t("status")}</th>
            <th className="px-6 py-3.5 text-end">{t("createdDate")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => {
            const firstRole = Array.isArray(user.roles) ? user.roles[0] : user.roles;
            const rawRole = typeof firstRole === "string" ? firstRole : (firstRole?.name || user.role || "admin");
            const roleKey = (rawRole || "admin").toLowerCase();
            const RoleIcon = roleIconMap[roleKey] || UserCheck;
            const branchName = user.branch?.name || "Main Branch";

            let roleLabel = roleKey;
            try {
              if (roleKey === "super-admin" || roleKey === "super_admin") {
                roleLabel = roleT("superAdmin");
              } else if (roleKey === "admin") {
                roleLabel = roleT("admin");
              } else if (roleKey === "doctor") {
                roleLabel = roleT("doctor");
              } else {
                roleLabel = roleT(roleKey);
              }
            } catch {
              roleLabel = roleKey;
            }

            return (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                {/* User Name & Avatar */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      {user.doctor_profile && (
                        <p className="text-xs text-teal-600 font-mono">
                          Lic: {user.doctor_profile.license_number || "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{user.email}</td>

                {/* Role Badge */}
                <td className="px-6 py-4">
                  <Badge variant={roleVariantMap[roleKey] || "neutral"} className="inline-flex items-center gap-1.5">
                    <RoleIcon className="w-3.5 h-3.5" />
                    <span>{roleLabel}</span>
                  </Badge>
                </td>

                {/* Branch */}
                <td className="px-6 py-4 text-slate-700 font-medium">{branchName}</td>

                {/* Status */}
                <td className="px-6 py-4">
                  <Badge variant="success">Active</Badge>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 text-end font-mono text-xs text-slate-500">
                  {user.created_at?.split("T")[0] || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
