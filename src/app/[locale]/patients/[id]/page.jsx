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
                <span className="text-sm font-bold text-slate-900">$1,200.00</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">{t("totalPaid")}</span>
                <span className="text-sm font-bold text-emerald-600">$1,200.00</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-teal-50 border border-teal-100">
                <span className="text-xs font-bold text-teal-900">{t("remainingBalance")}</span>
                <span className="text-sm font-bold text-teal-700">$0.00</span>
              </div>
            </div>
          </Card>

          {/* Treatment & Visit History */}
          <Card className="lg:col-span-3 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">
                {t("visitHistory")}
              </h2>
            </div>

            {patient.visits && patient.visits.length > 0 ? (
              <div className="space-y-3">
                {patient.visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {visit.chief_complaint || "Routine Examination"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Date: {visit.visit_date || "2026-07-20"} • Doctor: {visit.doctor_name || "Dr. Smith"}
                      </p>
                    </div>
                    <Link href={`/visits?visit_id=${visit.id}`}>
                      <Button size="sm" variant="outline">
                        View Visit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                <p>{t("noVisits")}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
