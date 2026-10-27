import React, { useState, useEffect } from 'react';
import { useNutriCare } from '../../../context/NutriCareContext';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText, 
} from 'lucide-react';
import { formatKcal, formatMg } from '../../../utils/formatters';

interface ClinicalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalExportModal: React.FC<ClinicalExportModalProps> = ({ isOpen, onClose }) => {
  const { chart, activePatient, policyRules } = useNutriCare();
  const [copied, setCopied] = useState(false);

  // Escape closes the dialog while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const jsonExportData = {
    metadata: {
      documentType: 'eNCPT Standardized Clinical Nutrition Record',
      system: 'NutriCare OS v2.4',
      exportTimestamp: new Date().toISOString(),
      facility: 'NutriCare Digital Health & Tele-Nutrition Network'
    },
    patient: {
      id: activePatient.id,
      mrn: activePatient.mrn,
      name: activePatient.name,
      age: activePatient.age,
      gender: activePatient.gender,
      primaryDiagnosis: activePatient.primaryDiagnosis,
      secondaryDiagnosis: activePatient.secondaryDiagnosis,
      allergies: activePatient.allergies
    },
    clinicalChart: chart,
    activePolicyRules: policyRules.filter(r => r.isActive).map(r => ({
      code: r.code,
      name: r.name,
      category: r.category
    }))
  };

  const handleCopyJSON = () => {
    navigator.clipboard
      .writeText(JSON.stringify(jsonExportData, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Clipboard unavailable; the download and print options still work.
      });
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonExportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eNCPT_Chart_${activePatient.id}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="export-dialog-title" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 id="export-dialog-title" className="text-sm font-bold">Synthesized Clinical Chart Summary (eNCPT)</h3>
              <p className="text-[11px] text-slate-400">Ready for Electronic Medical Record (EMR) integration</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-clinical-teal hover:bg-teal-600 text-xs font-bold text-white shadow-soft-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close export dialog"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 font-sans text-slate-800 text-xs space-y-6">
          {/* Clinical Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  NUTRICARE OS CLINICAL HEALTH NETWORK
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                  eNCPT Standardized Note
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Department of Clinical Nutrition & Medical Nutrition Therapy (MNT)
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-600">
              <div><strong>Document Date:</strong> {chart.date}</div>
              <div><strong>Attending Dietitian:</strong> {chart.dietitianName}</div>
              <div><strong>Status:</strong> {chart.status}</div>
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Patient Name</span>
              <span className="font-extrabold text-slate-900">{activePatient.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">MRN</span>
              <span className="font-mono font-bold text-slate-900">{activePatient.mrn}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Age / Gender</span>
              <span className="font-bold text-slate-900">{activePatient.age} yrs • {activePatient.gender}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Primary Diagnosis</span>
              <span className="font-bold text-slate-900 truncate block">{activePatient.primaryDiagnosis}</span>
            </div>
          </div>

          {/* Section 1: Assessment */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              1. Nutrition Assessment (Anthropometrics & Biochemical Labs)
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Height</span>
                <span className="font-bold">{chart.assessment.anthropometrics.heightCm} cm</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Weight</span>
                <span className="font-bold">{chart.assessment.anthropometrics.weightKg} kg</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">BMI</span>
                <span className="font-bold">{chart.assessment.anthropometrics.bmi} ({chart.assessment.anthropometrics.bmiClassification})</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Devine IBW</span>
                <span className="font-bold">{chart.assessment.anthropometrics.idealBodyWeightKg} kg</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">HbA1c</span>
                <span className="font-bold text-rose-700">{chart.assessment.labs.hba1cPercent}%</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">eGFR</span>
                <span className="font-bold text-amber-700">{chart.assessment.labs.eGfr} mL/min</span>
              </div>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              <strong>Dietary History:</strong> {chart.assessment.dietaryHistoryNotes}
            </p>
          </div>

          {/* Section 2: Nutrition Diagnosis (PES Statements) */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              2. Nutrition Diagnosis (PES Statements)
            </h4>
            <div className="space-y-2">
              {chart.diagnosisPES.map((pes, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                  <div className="font-mono text-[10px] text-teal-800 font-bold mb-0.5">
                    PES #{idx + 1} — {pes.domain} [{pes.problemCode}]
                  </div>
                  <p className="font-semibold text-slate-900 text-xs">
                    {pes.fullStatement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Nutrition Intervention */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              3. Nutrition Intervention & Prescribed Policies
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Calorie Target</span>
                <span className="font-bold">{formatKcal(chart.intervention.dailyCaloriesTarget)}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Macros (C / P / F)</span>
                <span className="font-bold">{chart.intervention.carbRatioPercent}% / {chart.intervention.proteinRatioPercent}% / {chart.intervention.fatRatioPercent}%</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Sodium Ceiling</span>
                <span className="font-bold text-rose-700">&lt;= {formatMg(chart.intervention.sodiumLimitMg)}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Potassium Ceiling</span>
                <span className="font-bold text-amber-700">&lt;= {formatMg(chart.intervention.potassiumLimitMg)}</span>
              </div>
            </div>
            <div className="text-[11px] space-y-1">
              <strong>Counseling Goals:</strong>
              <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                {chart.intervention.counselingGoals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Monitoring & Evaluation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              4. Monitoring & Evaluation Plan
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Target Weight</span>
                <span className="font-bold">{chart.monitoring.targetWeightKg} kg</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Target HbA1c</span>
                <span className="font-bold text-teal-700">{chart.monitoring.targetHbA1c}%</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Follow-up Date</span>
                <span className="font-bold">{chart.monitoring.nextAppointmentDate}</span>
              </div>
            </div>
            <p className="text-slate-700 text-[11px]">
              {chart.monitoring.clinicalNotes}
            </p>
          </div>

          {/* Clinician Signature Line */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              Unsigned draft. Dietitian of record: <strong>{chart.dietitianName}</strong>
            </div>
            <div>
              Not a signed record (prototype export)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
