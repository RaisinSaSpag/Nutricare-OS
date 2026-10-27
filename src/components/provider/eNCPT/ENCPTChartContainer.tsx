import React, { useState } from 'react';
import { useNutriCare } from '../../../context/NutriCareContext';
import { Step1Assessment } from './Step1Assessment';
import { Step2DiagnosisPES } from './Step2DiagnosisPES';
import { Step3Intervention } from './Step3Intervention';
import { Step4Monitoring } from './Step4Monitoring';
import { ClinicalExportModal } from './ClinicalExportModal';
import { 
  Stethoscope, 
  Pill, 
  LineChart, 
  FileDown, 
  FileText
} from 'lucide-react';

export const ENCPTChartContainer: React.FC = () => {
  const { chart, policyRules } = useNutriCare();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Assessment',
      subtitle: 'Anthropometrics & Labs',
      icon: <FileText className="w-4 h-4" />,
      badge: `${chart.assessment.anthropometrics.bmi} BMI`
    },
    {
      num: 2,
      title: 'Diagnosis (PES)',
      subtitle: 'Structured Statements',
      icon: <Stethoscope className="w-4 h-4" />,
      badge: `${chart.diagnosisPES.length} PES`
    },
    {
      num: 3,
      title: 'Intervention',
      subtitle: 'Prescriptions & Policies',
      icon: <Pill className="w-4 h-4" />,
      badge: `${policyRules.filter(r => r.isActive).length} Policies`
    },
    {
      num: 4,
      title: 'Monitoring & Eval',
      subtitle: 'Goals & Timeline',
      icon: <LineChart className="w-4 h-4" />,
      badge: `HbA1c < ${chart.monitoring.targetHbA1c}%`
    }
  ];

  return (
    <div className="space-y-4">
      {/* Step Navigation Header */}
      <div className="bg-white rounded-2xl border border-canvas-border p-2.5 shadow-soft-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto flex-1">
          {steps.map(step => (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num as 1 | 2 | 3 | 4)}
              className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                activeStep === step.num
                  ? 'bg-clinical-navy text-white shadow-soft-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  activeStep === step.num
                    ? 'bg-clinical-teal text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black truncate">{step.title}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold ${
                    activeStep === step.num ? 'bg-teal-900/60 text-teal-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.badge}
                  </span>
                </div>
                <span className={`text-[10px] block truncate ${
                  activeStep === step.num ? 'text-slate-300' : 'text-slate-400'
                }`}>
                  {step.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Export / Synthesis Action */}
        <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-clinical-teal hover:bg-teal-700 text-white font-bold text-xs shadow-soft-sm transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Clinical Note (PDF / JSON)</span>
          </button>
        </div>
      </div>

      {/* Active Step Content */}
      <div className="transition-all">
        {activeStep === 1 && <Step1Assessment />}
        {activeStep === 2 && <Step2DiagnosisPES />}
        {activeStep === 3 && <Step3Intervention />}
        {activeStep === 4 && <Step4Monitoring />}
      </div>

      {/* Export Clinical Modal */}
      <ClinicalExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
