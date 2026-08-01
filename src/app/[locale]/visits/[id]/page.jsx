"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { PatientSummarySidebar } from "@/features/visits/components/PatientSummarySidebar";
import { OdontogramGrid } from "@/features/visits/components/OdontogramGrid";
import { TreatmentPlanTable } from "@/features/visits/components/TreatmentPlanTable";
import { visitService } from "@/features/visits/services/visitService";
import { ArrowLeft, Stethoscope, Save, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function VisitDetailPage() {
  const params = useParams();
  const visitId = params.id;
  const t = useTranslations("visits");
  const commonT = useTranslations("common");

  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState(null);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [teeth, setTeeth] = useState([]);
  const [services, setServices] = useState([]);

  // Visit is read-only if user is admin (without doctor/super-admin), OR if visit status is completed/closed, OR if it has an active invoice
  const isVisitImmutable = visit && (
    visit.status === "completed" ||
    visit.status === "closed" ||
    visit.has_active_invoice
  );
  const isReadOnly = (hasRole("admin") && !hasRole("super-admin") && !hasRole("doctor")) || isVisitImmutable;

  useEffect(() => {
    async function loadVisit() {
      setLoading(true);
      try {
        const res = await visitService.getVisitById(visitId);
        const data = res.data || res;
        setVisit(data);
        setChiefComplaint(data.chief_complaint || "");
        setDiagnosisNotes(data.diagnosis || data.doctor_notes || "");
        setTeeth(data.teeth || []);
        setServices(data.services || []);
      } catch (err) {
        console.error("Failed to load visit details", err);
        setError("Visit record not found or network error.");
      } finally {
        setLoading(false);
      }
    }

    if (visitId) {
      loadVisit();
    }
  }, [visitId]);

  const handleToothConditionChange = async (toothNum, condition) => {
    if (isReadOnly) return;
    setActionError(null);

    try {
      const res = await visitService.saveToothCondition(visitId, {
        tooth_id: toothNum,
        tooth_condition_id: condition === "decay" ? 1 : condition === "filled" ? 2 : 3,
        entry_type: "diagnosis",
      });
      const added = res.data || res;
      setTeeth((prev) => [...prev.filter((t) => (t.tooth_number || t.tooth_id) !== toothNum), added]);
    } catch (err) {
      console.error("Failed to save tooth condition", err);
      const msg = err.response?.data?.message || "Cannot modify tooth condition for this visit.";
      setActionError(msg);
    }
  };

  const handleAddService = async (serviceData) => {
    if (isReadOnly) return;
    setActionError(null);

    try {
      const res = await visitService.addVisitService(visitId, serviceData);
      const added = res.data || res;
      setServices((prev) => [...prev, added]);
    } catch (err) {
      console.error("Failed to add service", err);
      const msg = err.response?.data?.message || "Cannot add service to this visit.";
      setActionError(msg);
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (isReadOnly) return;
    setActionError(null);

    try {
      await visitService.removeVisitService(visitId, serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error("Failed to remove service", err);
      const msg = err.response?.data?.message || "Cannot remove service from this visit.";
      setActionError(msg);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !visit) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-lg mx-auto py-12 text-center">
          <p className="text-red-600 font-semibold">{error || "Visit record not found"}</p>
          <Link href="/visits">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 me-2" />
              <span>Back to Visits</span>
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/visits">
              <Button size="sm" variant="outline">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Clinical Consultation & Examination</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Visit Date: {visit.checked_in_at || visit.created_at || "Today"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={visit.status === "completed" ? "success" : "info"}>
              {t(visit.status || "inProgress")}
            </Badge>
          </div>
        </div>

        {/* Read-Only Administrative Notice Banner */}
        {isReadOnly && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t("readOnlyNotice")}</span>
          </div>
        )}

        {/* Action Error Banner */}
        {actionError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* Workspace Layout Grid: Left Sidebar (Patient Summary) + Right Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column: Patient Sidebar */}
          <div className="lg:col-span-1">
            <PatientSummarySidebar patient={visit.patient} />
          </div>

          {/* Right Column: Main Clinical Examination Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chief Complaint & Diagnosis Notes */}
            <Card className="p-6 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t("chiefComplaint")}
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t("clinicalDiagnosis")}
                </label>
                <textarea
                  rows={3}
                  disabled={isReadOnly}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Record clinical examination observations, Pulp vitality, X-Ray findings..."
                />
              </div>
            </Card>

            {/* Interactive 32-Tooth Odontogram Grid */}
            <OdontogramGrid
              teeth={teeth}
              onToothConditionChange={handleToothConditionChange}
              readOnly={isReadOnly}
            />

            {/* Active Treatment Plan Table */}
            <TreatmentPlanTable
              services={services}
              onAddService={handleAddService}
              onRemoveService={handleRemoveService}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
