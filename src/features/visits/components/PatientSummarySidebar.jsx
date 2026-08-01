import { PatientAvatar } from "@/features/patients/components/PatientAvatar";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, User, Calendar, ExternalLink } from "lucide-react";

export function PatientSummarySidebar({ patient }) {
  if (!patient) return null;

  const fullName =
    patient.full_name ||
    `${patient.first_name || ""} ${patient.last_name || ""}`.trim() ||
    patient.name ||
    "—";

  const medical = patient.medical_profile || patient.medicalProfile || {};

  return (
    <Card className="p-5 shadow-xs space-y-5">
      {/* Patient Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <PatientAvatar name={fullName} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900 text-base truncate">{fullName}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            ID: {patient.national_id || patient.id}
          </p>
        </div>
      </div>

      {/* Basic Demographics */}
      <div className="space-y-2.5 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Gender</span>
          <span className="font-semibold text-slate-800 capitalize">
            {patient.gender || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Date of Birth</span>
          <span className="font-semibold text-slate-800">
            {patient.birth_date || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Phone</span>
          <span className="font-mono font-semibold text-slate-800">
            {patient.phone || "N/A"}
          </span>
        </div>
      </div>

      {/* Medical Alerts Panel */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-100 space-y-2">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Medical Alerts</span>
        </div>

        <div className="text-xs text-amber-900 space-y-1">
          <p>
            <strong>Allergies:</strong> {medical.allergies || "None"}
          </p>
          <p>
            <strong>Conditions:</strong> {medical.chronic_conditions || "None"}
          </p>
          <p>
            <strong>Blood Group:</strong> {medical.blood_group || "O+"}
          </p>
        </div>
      </div>

      {/* Link to Full Patient Profile */}
      <Link href={`/patients/${patient.id}`} className="block">
        <Button variant="outline" size="sm" className="w-full text-teal-700 hover:bg-teal-50">
          <ExternalLink className="w-3.5 h-3.5 me-1" />
          <span>View Full Profile</span>
        </Button>
      </Link>
    </Card>
  );
}
