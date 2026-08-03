"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PatientAvatar } from "@/features/patients/components/PatientAvatar";
import { PatientStatusBadge } from "@/features/patients/components/PatientStatusBadge";
import { AddPatientModal } from "@/features/patients/components/AddPatientModal";
import { patientService } from "@/features/patients/services/patientService";
import { Search, UserPlus, Eye, ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function PatientsPage() {
  const t = useTranslations("patients");
  const commonT = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientService.getPatients({
        page,
        per_page: 10,
        search,
      });
      setPatients(res.data || []);
      setMeta(res.meta || { current_page: page, last_page: 1, total: (res.data || []).length });
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-500 font-medium">{t("subtitle")}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 me-2" />
            <span>{t("addPatient")}</span>
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <Card className="p-4 shadow-xs">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={t("searchPlaceholder")}
              className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>
        </Card>

        {/* Patients Data Table */}
        <Card className="shadow-xs overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : patients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No patients found"
              description="Try adjusting your search criteria or click 'Add Patient' to register a new record."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-6 py-3 text-start">{t("fullName")}</th>
                    <th className="px-6 py-3 text-start">{t("nationalId")}</th>
                    <th className="px-6 py-3 text-start">{t("phone")}</th>
                    <th className="px-6 py-3 text-start">{t("gender")}</th>
                    <th className="px-6 py-3 text-start">{t("financialStatus")}</th>
                    <th className="px-6 py-3 text-end">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {patients.map((patient) => {
                    const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.name || "Unnamed Patient";
                    return (
                      <tr
                        key={patient.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <PatientAvatar name={fullName} size="md" />
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">
                                {fullName}
                              </p>
                              <p className="text-xs text-slate-400">
                                DOB: {patient.birth_date || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {patient.national_id || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {patient.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4 capitalize text-slate-700">
                          {patient.gender ? t(patient.gender.toLowerCase()) : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <PatientStatusBadge status={patient.financial_status || "cleared"} />
                        </td>
                        <td className="px-6 py-4 text-end">
                          <Link href={`/patients/${patient.id}`}>
                            <Button size="sm" variant="ghost" className="text-teal-700 hover:text-teal-800 hover:bg-teal-50">
                              <Eye className="w-4 h-4 me-1" />
                              <span>{t("profile")}</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {meta.last_page > 1 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPatients}
      />
    </DashboardLayout>
  );
}
