import React, { useState } from 'react';
import { useNutriCare } from '../../../context/NutriCareContext';
import { CheckSquare, Plus, Trash2, LineChart, Award } from 'lucide-react';

export const Step4Monitoring: React.FC = () => {
  const { chart, updateMonitoring } = useNutriCare();
  const { monitoring } = chart;
  const [newIndicator, setNewIndicator] = useState('');

  const handleFieldChange = (field: keyof typeof monitoring, val: any) => {
    updateMonitoring({ [field]: val });
  };

  const handleAddIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndicator.trim()) return;
    updateMonitoring({
      keyIndicators: [...monitoring.keyIndicators, newIndicator.trim()]
    });
    setNewIndicator('');
  };

  const handleRemoveIndicator = (index: number) => {
    updateMonitoring({
      keyIndicators: monitoring.keyIndicators.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Target Outcome Milestones */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Award className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            4.1 Target Biomarkers & Quantitative Milestones
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Target Weight (kg)
            </label>
            <input
              type="number"
              step="0.5"
              value={monitoring.targetWeightKg}
              onChange={e => handleFieldChange('targetWeightKg', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Target HbA1c (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={monitoring.targetHbA1c}
              onChange={e => handleFieldChange('targetHbA1c', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-teal-700 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Re-assessment Horizon (Weeks)
            </label>
            <input
              type="number" step="any"
              value={monitoring.followUpTimelineWeeks}
              onChange={e => handleFieldChange('followUpTimelineWeeks', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Next Telehealth Visit
            </label>
            <div className="relative">
              <input
                type="date"
                value={monitoring.nextAppointmentDate}
                onChange={e => handleFieldChange('nextAppointmentDate', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Monitoring Indicators List */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <CheckSquare className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            4.2 Key Monitoring Indicators & Clinical Endpoints
          </h3>
        </div>

        <div className="space-y-2 mb-4">
          {monitoring.keyIndicators.map((ind, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-clinical-teal flex items-center justify-center font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800">{ind}</span>
              </div>
              <button
                onClick={() => handleRemoveIndicator(idx)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Remove Indicator"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddIndicator} className="flex gap-2">
          <input
            type="text"
            value={newIndicator}
            onChange={e => setNewIndicator(e.target.value)}
            placeholder="Add key tracking indicator (e.g., Weekly home BP log, 85% policy compliance)..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-clinical-teal focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-clinical-teal hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Indicator</span>
          </button>
        </form>
      </div>

      {/* Clinical Re-Evaluation Notes */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <LineChart className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            4.3 Clinical Progress & Follow-up Instructions
          </h3>
        </div>

        <textarea
          rows={3}
          value={monitoring.clinicalNotes}
          onChange={e => handleFieldChange('clinicalNotes', e.target.value)}
          placeholder="Document specific criteria for follow-up evaluation and escalation pathways..."
          className="w-full p-3 text-xs rounded-xl border border-slate-200 text-slate-800 focus:border-clinical-teal focus:outline-none"
        />
      </div>
    </div>
  );
};
