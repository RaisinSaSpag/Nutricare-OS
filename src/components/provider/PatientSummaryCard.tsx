import React from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { 
  Video, 
  FileText, 
  AlertCircle,
} from 'lucide-react';
import { formatSteps } from '../../utils/formatters';

interface PatientSummaryCardProps {
  onOpenTelehealth: () => void;
  onOpenCharting: () => void;
}

export const PatientSummaryCard: React.FC<PatientSummaryCardProps> = ({
  onOpenTelehealth,
  onOpenCharting
}) => {
  const { activePatient, policyViolationsCount, policyWarningsCount, wearables } = useNutriCare();


  return (
    <div className="bg-white rounded-3xl border border-canvas-border p-5 shadow-soft-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Patient Profile Avatar & Demographics */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={activePatient.avatar}
              alt={activePatient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-soft-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {activePatient.name}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                MRN: {activePatient.mrn}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-clinical-teal border border-teal-200">
                {activePatient.age} yrs • {activePatient.gender}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              Dx: {activePatient.primaryDiagnosis}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
              <span>Allergies: <strong className="text-rose-700 font-semibold">{activePatient.allergies.join(', ') || 'NKDA'}</strong></span>
              <span>•</span>
              <span>Dietitian: <strong className="text-slate-700">{activePatient.assignedDietitian}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onOpenTelehealth}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-sm"
          >
            <Video className="w-3.5 h-3.5 text-rose-600" />
            <span>Launch Tele-Consultation</span>
          </button>

          <button
            onClick={onOpenCharting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-clinical-navy hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-soft-sm"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>eNCPT Clinical Chart</span>
          </button>
        </div>
      </div>

      {/* Clinical Telemetry & Anthropometrics Fast-Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">BMI</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-black text-slate-900">{activePatient.anthropometrics.bmi}</span>
            <span className="text-[10px] text-amber-700 font-bold">{activePatient.anthropometrics.bmiClassification}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Weight / IBW</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-black text-slate-900">{activePatient.anthropometrics.weightKg} kg</span>
            <span className="text-[10px] text-slate-400">/ {activePatient.anthropometrics.idealBodyWeightKg}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Glycemic (HbA1c)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-black text-rose-700">{activePatient.labs.hba1cPercent}%</span>
            <span className="text-[10px] text-slate-400">Glu: {activePatient.labs.fastingGlucoseMgDl}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Renal (eGFR)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-black text-amber-700">{activePatient.labs.eGfr}</span>
            <span className="text-[10px] text-slate-400">K+: {activePatient.labs.serumPotassiumMeqL}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Wearable Telemetry</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-black text-clinical-teal">{formatSteps(wearables.steps)}</span>
            <span className="text-[10px] text-slate-400">steps</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Policy Compliance</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            {policyViolationsCount === 0 ? (
              policyWarningsCount === 0 ? (
                <span className="text-xs font-black text-emerald-700">No flags</span>
              ) : (
                <span className="text-xs font-black text-amber-700">{policyWarningsCount} caution{policyWarningsCount > 1 ? 's' : ''}</span>
              )
            ) : (
              <span className="text-xs font-black text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {policyViolationsCount} Flags
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
