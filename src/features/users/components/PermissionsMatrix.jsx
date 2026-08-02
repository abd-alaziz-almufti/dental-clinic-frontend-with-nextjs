"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, X, Shield, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export function PermissionsMatrix() {
  const t = useTranslations("permissions");

  const matrixData = [
    {
      module: "Patient Records & Profiles",
      superAdmin: "Full (All Branches)",
      admin: "Branch Scoped",
      doctor: "Assigned Patients Only",
    },
    {
      module: "Appointment Scheduling & Check-In",
      superAdmin: "Full (All Branches)",
      admin: "Branch Scoped",
      doctor: "View & Check-In",
    },
    {
      module: "Clinical Examination & Dental Charting",
      superAdmin: "Read Only",
      admin: "Read Only",
      doctor: "Full Write Access",
    },
    {
      module: "Invoicing & Financial Receipts",
      superAdmin: "Full (All Branches)",
      admin: "Branch Scoped",
      doctor: "Read Only",
    },
    {
      module: "Inventory & Stock Operations",
      superAdmin: "Full (All Branches)",
      admin: "Branch Scoped",
      doctor: "View Stock Only",
    },
    {
      module: "User Management & Role Assignment",
      superAdmin: "Full (All Roles)",
      admin: "Create Admin & Doctor",
      doctor: "No Access",
    },
    {
      module: "Clinic & Practice Settings",
      superAdmin: "Full Access",
      admin: "Own Branch Profile",
      doctor: "No Access",
    },
  ];

  return (
    <Card className="shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">{t("title") || "Role Access Boundaries & Security Matrix"}</h3>
          <p className="text-xs text-slate-500 font-medium">{t("subtitle") || "System access rights enforced per role across practice modules."}</p>
        </div>
        <Badge variant="info" className="self-start sm:self-auto">
          Visual System Policy V1
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold uppercase text-slate-600">
              <th className="px-6 py-3.5 text-start">Module / Security Domain</th>
              <th className="px-6 py-3.5 text-center text-purple-700">Super Admin</th>
              <th className="px-6 py-3.5 text-center text-teal-700">Branch Admin</th>
              <th className="px-6 py-3.5 text-center text-blue-700">Doctor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {matrixData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{row.module}</td>
                
                {/* Super Admin */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 font-semibold border border-purple-100">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    {row.superAdmin}
                  </span>
                </td>

                {/* Branch Admin */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-100">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    {row.admin}
                  </span>
                </td>

                {/* Doctor */}
                <td className="px-6 py-4 text-center">
                  {row.doctor === "No Access" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-semibold border border-slate-200">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                      No Access
                    </span>
                  ) : row.doctor.includes("Write") ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {row.doctor}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      {row.doctor}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
