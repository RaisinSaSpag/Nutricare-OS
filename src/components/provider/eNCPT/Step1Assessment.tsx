import React from 'react';
import { useNutriCare } from '../../../context/NutriCareContext';
import { calculateBMI, calculateIBW } from '../../../utils/calculations';
import { Scale, Activity, Heart, FileText, AlertCircle } from 'lucide-react';

export const Step1Assessment: React.FC = () => {
  const { chart, updateAssessment, activePatient } = useNutriCare();
  const { anthropometrics, labs, dietaryHistoryNotes, clinicalImpressions } = chart.assessment;

  const handleAnthropometricsChange = (field: keyof typeof anthropometrics, val: number) => {
    const updated = { ...anthropometrics, [field]: val };
    if (field === 'heightCm' || field === 'weightKg') {
      const { bmi, classification } = calculateBMI(
        field === 'weightKg' ? val : anthropometrics.weightKg,
        field === 'heightCm' ? val : anthropometrics.heightCm
      );
      const ibw = calculateIBW(
        field === 'heightCm' ? val : anthropometrics.heightCm,
        activePatient.gender
      );
      updated.bmi = bmi;
      updated.bmiClassification = classification;
      updated.idealBodyWeightKg = ibw;
    }
    updateAssessment({ anthropometrics: updated });
  };

  const handleLabChange = (field: keyof typeof labs, val: any) => {
    updateAssessment({
      labs: { ...labs, [field]: val }
    });
  };

  return (
    <div className="space-y-6">
      {/* Anthropometrics Section */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Scale className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            1.1 Anthropometric Measurements & Trajectory
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Height (cm)</label>
            <input
              type="number"
              value={anthropometrics.heightCm}
              onChange={e => handleAnthropometricsChange('heightCm', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Current Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={anthropometrics.weightKg}
              onChange={e => handleAnthropometricsChange('weightKg', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Body Mass Index (BMI)</label>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
              <span className="font-black text-slate-900">{anthropometrics.bmi}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                {anthropometrics.bmiClassification}
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ideal Body Wt (Devine)</label>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-800">
              {anthropometrics.idealBodyWeightKg} kg
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">30-Day % Weight Change</label>
            <input
              type="number"
              step="0.1"
              value={anthropometrics.weightChange30DaysPercent}
              onChange={e => handleAnthropometricsChange('weightChange30DaysPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Waist Circumference (cm)</label>
            <input
              type="number"
              value={anthropometrics.waistCircumferenceCm || 0}
              onChange={e => handleAnthropometricsChange('waistCircumferenceCm', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Clinical Lab Values Section */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-clinical-teal" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1.2 Clinical Biochemical & Metabolic Lab Values
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Recorded: {labs.dateRecorded}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Glycemic Markers */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">HbA1c (%)</label>
            <input
              type="number"
              step="0.1"
              value={labs.hba1cPercent}
              onChange={e => handleLabChange('hba1cPercent', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-bold text-rose-700 border-rose-200"
            />
            <span className="text-[10px] text-slate-400">Goal &lt; 7.0%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">Fasting Glucose (mg/dL)</label>
            <input
              type="number"
              value={labs.fastingGlucoseMgDl}
              onChange={e => handleLabChange('fastingGlucoseMgDl', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-bold text-rose-700 border-rose-200"
            />
            <span className="text-[10px] text-slate-400">Ref: 70 - 99 mg/dL</span>
          </div>

          {/* Renal Markers */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">eGFR (mL/min/1.73m²)</label>
            <input
              type="number"
              value={labs.eGfr}
              onChange={e => handleLabChange('eGfr', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-bold text-amber-700 border-amber-200"
            />
            <span className="text-[10px] text-slate-400">CKD 3a: 45 - 59</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">Serum Creatinine (mg/dL)</label>
            <input
              type="number"
              step="0.01"
              value={labs.serumCreatinineMgDl}
              onChange={e => handleLabChange('serumCreatinineMgDl', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-semibold text-slate-900 border-slate-200"
            />
            <span className="text-[10px] text-slate-400">Ref: 0.6 - 1.2</span>
          </div>

          {/* Electrolytes */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">Serum Potassium (mEq/L)</label>
            <input
              type="number"
              step="0.1"
              value={labs.serumPotassiumMeqL}
              onChange={e => handleLabChange('serumPotassiumMeqL', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-bold text-amber-700 border-amber-200"
            />
            <span className="text-[10px] text-slate-400">Ref: 3.5 - 5.0</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">Serum Sodium (mEq/L)</label>
            <input
              type="number"
              value={labs.serumSodiumMeqL}
              onChange={e => handleLabChange('serumSodiumMeqL', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-semibold text-slate-900 border-slate-200"
            />
            <span className="text-[10px] text-slate-400">Ref: 135 - 145</span>
          </div>

          {/* Lipids */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">LDL-C (mg/dL)</label>
            <input
              type="number"
              value={labs.ldlCholesterolMgDl}
              onChange={e => handleLabChange('ldlCholesterolMgDl', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-semibold text-slate-900 border-slate-200"
            />
            <span className="text-[10px] text-slate-400">Goal &lt; 100</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block">Triglycerides (mg/dL)</label>
            <input
              type="number"
              value={labs.triglyceridesMgDl}
              onChange={e => handleLabChange('triglyceridesMgDl', Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white rounded-lg border font-semibold text-slate-900 border-slate-200"
            />
            <span className="text-[10px] text-slate-400">Ref &lt; 150</span>
          </div>
        </div>
      </div>

      {/* Patient Dietary History & Clinical Impressions */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <FileText className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            1.3 Dietary History & Dietitian Impressions
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Patient Dietary Recall & Food Patterns
            </label>
            <textarea
              rows={3}
              value={dietaryHistoryNotes}
              onChange={e => updateAssessment({ dietaryHistoryNotes: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Registered Dietitian Clinical Impressions
            </label>
            <textarea
              rows={3}
              value={clinicalImpressions}
              onChange={e => updateAssessment({ clinicalImpressions: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-clinical-teal focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
