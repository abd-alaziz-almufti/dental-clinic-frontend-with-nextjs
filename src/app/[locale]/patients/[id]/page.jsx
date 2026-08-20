"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PatientAvatar } from "@/features/patients/components/PatientAvatar";
import { PatientStatusBadge } from "@/features/patients/components/PatientStatusBadge";
import { patientService } from "@/features/patients/services/patientService";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Calendar,
  AlertTriangle,
  Stethoscope,
  CreditCard,
  Clock,
  User,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function PatientProfilePage() {
  const params = useParams();
  const patientId = params.id;
  const t = useTranslations("patients");
  const commonT = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPatient() {
      setLoading(true);
      try {
        const res = await patientService.getPatientById(patientId);
        setPatient(res.data || res);
      } catch (err) {
        console.error("Failed to load patient profile", err);
        setError("Patient not found or network error.");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-lg mx-auto py-12 text-center">
          <p className="text-red-600 font-semibold">{error || "Patient not found"}</p>
          <Link href="/patients">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 me-2" />
              <span>Back to Patient Registry</span>
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.name || "Patient Profile";
  const medical = patient.medical_profile || patient.medicalProfile || {};
  const invoices = patient.invoices || [];
  const visits = patient.visits || [];

  const totalBilled = invoices.reduce((s, inv) => s + parseFloat(inv.total || 0), 0);
  const totalPaid = invoices.reduce((s, inv) => {
    const paid =
      inv.paid_amount !== undefined
        ? parseFloat(inv.paid_amount || 0)
        : parseFloat(inv.total || 0) - parseFloat(inv.remaining_balance || 0);
    return s + (isNaN(paid) ? 0 : paid);
  }, 0);
  const remainingBalance = invoices.reduce((s, inv) => s + parseFloat(inv.remaining_balance || inv.balance || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link href="/patients">
            <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 me-2" />
              <span>Back to Patients</span>
            </Button>
          </Link>
        </div>

        {/* Patient Hero Header Card */}
        <Card className="p-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <PatientAvatar name={fullName} size="lg" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
                  <PatientStatusBadge status={patient.financial_status || "cleared"} />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Registered Patient • Gender: {patient.gender || "N/A"} • DOB: {patient.birth_date || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/appointments?patient_id=${patient.id}`}>
                <Button variant="primary" size="sm">
                  + Book Appointment
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-2.5 text-slate-600">
              <IdCard className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono text-xs">{patient.national_id || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{patient.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{patient.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{patient.address || "No address"}</span>
            </div>
          </div>
        </Card>

        {/* Content Grid: Medical Info + Financial + Visits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical Alerts & Information */}
          <Card className="p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-900">
                {t("medicalAlerts")}
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  {t("allergies")}
                </p>
                <p className="font-medium text-slate-800 mt-1">
                  {medical.allergies || "No known allergies"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  {t("chronicConditions")}
                </p>
                <p className="font-medium text-slate-800 mt-1">
                  {medical.chronic_conditions || medical.conditions || "None reported"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  {t("bloodGroup")}
                </p>
                <p className="font-medium text-teal-700 font-bold mt-1">
                  {medical.blood_group || "O+"}
                </p>
              </div>
            </div>
          </Card>

          {/* Billing & Financial Summary */}
          <Card className="p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 text-teal-700">
              <CreditCard className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-900">
                {t("billingSummary")}
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">{t("totalBilled")}</span>
                <span className="text-sm font-bold text-slate-900">${totalBilled.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">{t("totalPaid")}</span>
                <span className="text-sm font-bold text-emerald-600">${totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-teal-50 border border-teal-100">
                <span className="text-xs font-bold text-teal-900">{t("remainingBalance")}</span>
                <span className="text-sm font-bold text-teal-700">${remainingBalance.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Treatment & Visit History */}
          <Card className="lg:col-span-3 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {t("visitHistory")}
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {visits.length} {visits.length === 1 ? "Visit" : "Visits"}
              </span>
            </div>

            {visits.length > 0 ? (
              <div className="space-y-4">
                {visits.map((visit) => {
                  const visitDate = visit.checked_in_at
                    ? visit.checked_in_at.split("T")[0]
                    : visit.created_at?.split("T")[0] || "—";
                  const doctorName = visit.doctor?.name || "Dr. Assigned";
                  const servicesList = visit.services || [];

                  return (
                    <div
                      key={visit.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            {visit.visit_number || `#${visit.id}`}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {visitDate}
                          </span>
                          <span className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {doctorName}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {visit.chief_complaint || visit.diagnosis || "General Dental Examination"}
                          </p>
                          {visit.treatment_plan && (
                            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{visit.treatment_plan}</span>
                            </p>
                          )}
                        </div>

                        {/* Rendered Services / Treatments */}
                        {servicesList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {servicesList.map((srv, idx) => {
                              const srvName = srv.service?.name || srv.name || srv.service_name || "Treatment Service";
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                  {srvName}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Link href={`/visits?visit_id=${visit.id}`}>
                          <Button size="sm" variant="outline" className="text-teal-700 hover:bg-teal-50">
                            View Visit Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-sm">
                <Stethoscope className="w-10 h-10 mx-auto mb-2 stroke-1 text-slate-300" />
                <p className="font-semibold text-slate-600">{t("noVisits")}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Visits and treatments recorded for this patient will appear here.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
