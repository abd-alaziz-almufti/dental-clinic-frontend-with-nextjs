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
  // Doctor and Super-Admin have write access; Admin role is read-only
  const isReadOnly = hasRole("admin") && !hasRole("super-admin") && !hasRole("doctor");

  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState(null);
  const [error, setError] = useState(null);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [teeth, setTeeth] = useState([]);
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadVisit() {
      setLoading(true);
      try {
        const res = await visitService.getVisitById(visitId);
        const data = res.data || res;
        setVisit(data);
        // Fix C: use correct API field names from VisitResource
        setChiefComplaint(data.chief_complaint || "");
        setDiagnosisNotes(data.diagnosis || data.doctor_notes || "");
        setTeeth(data.teeth || []);                    // VisitResource returns `teeth`, not `visit_teeth`
        setServices(data.services || []);              // VisitResource returns `services`, not `visit_services`
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

    // Update local state immediately for fast feedback
    const updatedTeeth = [...teeth.filter((t) => (t.tooth_number || t.tooth_id) !== toothNum)];
    updatedTeeth.push({ tooth_number: toothNum, condition });
    setTeeth(updatedTeeth);

    try {
      // Fix A: entry_type must be "diagnosis" or "treatment" (backend DentalChartEntryRequest)
      await visitService.saveToothCondition(visitId, {
        tooth_id: toothNum,
        tooth_condition_id: condition === "decay" ? 1 : condition === "filled" ? 2 : 3,
        entry_type: "diagnosis",
      });
    } catch (err) {
      console.error("Failed to save tooth condition", err);
    }
  };

  const handleAddService = async (serviceData) => {
    if (isReadOnly) return;
    const newService = { id: Date.now(), ...serviceData };
    setServices((prev) => [...prev, newService]);

    try {
      await visitService.addVisitService(visitId, serviceData);
    } catch (err) {
      console.error("Failed to add service", err);
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (isReadOnly) return;
    setServices((prev) => prev.filter((s) => s.id !== serviceId));

    try {
      await visitService.removeVisitService(visitId, serviceId);
    } catch (err) {
      console.error("Failed to remove service", err);
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
