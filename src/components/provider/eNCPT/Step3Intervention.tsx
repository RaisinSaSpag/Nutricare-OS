import React, { useState } from 'react';
import { useNutriCare } from '../../../context/NutriCareContext';
import { Pill, ShieldCheck, Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatKcal } from '../../../utils/formatters';

export const Step3Intervention: React.FC = () => {
  const { chart, updateIntervention, policyRules, togglePolicyRule } = useNutriCare();
  const { intervention } = chart;
  const [newGoal, setNewGoal] = useState('');

  const handleFieldChange = (field: keyof typeof intervention, val: any) => {
    updateIntervention({ [field]: val });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    updateIntervention({
      counselingGoals: [...intervention.counselingGoals, newGoal.trim()]
    });
    setNewGoal('');
  };

  const handleRemoveGoal = (index: number) => {
    updateIntervention({
      counselingGoals: intervention.counselingGoals.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Policy Rules Prescription (Connected directly to Module 1 Rule Engine) */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-clinical-teal" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3.1 Clinical Policy Rule Enforcement (Real-Time Policy Engine)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Active Rules: {policyRules.filter(r => r.isActive).length} / {policyRules.length}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Assigned policies are automatically enforced in the Consumer Portal. The validation engine flags meals exceeding these thresholds in real-time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {policyRules.map(rule => (
            <div
              key={rule.id}
              className={`p-3.5 rounded-xl border transition-all ${
                rule.isActive
                  ? 'border-teal-300 bg-teal-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rule.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                      {rule.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => togglePolicyRule(rule.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    rule.isActive ? 'bg-clinical-teal' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      rule.isActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Threshold limits list */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[10px] font-mono text-slate-700">
                {rule.mealMaxSodium && <span>Meal Na &lt;= {rule.mealMaxSodium}mg</span>}
                {rule.dailyMaxSodium && <span>Daily Na &lt;= {rule.dailyMaxSodium}mg</span>}
                {rule.mealMinCarbs && <span>Carbs {rule.mealMinCarbs}-{rule.mealMaxCarbs}g</span>}
                {rule.mealMinFiber && <span>Fiber &gt;= {rule.mealMinFiber}g</span>}
                {rule.mealMaxPotassium && <span>Potassium &lt;= {rule.mealMaxPotassium}mg</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantitative Nutrition Prescription */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Pill className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            3.2 Quantitative Nutrition Prescription Targets
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Daily Calorie Target (kcal)
            </label>
            <input
              type="number"
              value={intervention.dailyCaloriesTarget}
              onChange={e => handleFieldChange('dailyCaloriesTarget', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Carbohydrate Ratio (% kcal)
            </label>
            <input
              type="number"
              value={intervention.carbRatioPercent}
              onChange={e => handleFieldChange('carbRatioPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-amber-700 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Protein Ratio (% kcal)
            </label>
            <input
              type="number"
              value={intervention.proteinRatioPercent}
              onChange={e => handleFieldChange('proteinRatioPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-teal-700 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Fat Ratio (% kcal)
            </label>
            <input
              type="number"
              value={intervention.fatRatioPercent}
              onChange={e => handleFieldChange('fatRatioPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 focus:border-clinical-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Protein Target (g/kg IBW)
            </label>
            <input
              type="number"
              step="0.1"
              value={intervention.proteinGPerKg}
              onChange={e => handleFieldChange('proteinGPerKg', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-rose-700 block mb-1">
              Sodium Ceiling (mg/day)
            </label>
            <input
              type="number"
              value={intervention.sodiumLimitMg}
              onChange={e => handleFieldChange('sodiumLimitMg', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-rose-300 font-bold text-rose-800 bg-rose-50/30"
            />
          </div>

          <div>
            <label className="font-semibold text-amber-700 block mb-1">
              Potassium Ceiling (mg/day)
            </label>
            <input
              type="number"
              value={intervention.potassiumLimitMg}
              onChange={e => handleFieldChange('potassiumLimitMg', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 font-bold text-amber-800 bg-amber-50/30"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Fluid Target (mL/day)
            </label>
            <input
              type="number"
              value={intervention.fluidTargetMl}
              onChange={e => handleFieldChange('fluidTargetMl', Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Patient Counseling SMART Goals */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Target className="w-4 h-4 text-clinical-teal" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            3.3 Patient Nutrition Counseling SMART Goals
          </h3>
        </div>

        <div className="space-y-2 mb-4">
          {intervention.counselingGoals.map((goal, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800">{goal}</span>
              </div>
              <button
                onClick={() => handleRemoveGoal(idx)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Remove Goal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddGoal} className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            placeholder="Add new patient-agreed SMART counseling goal..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-clinical-teal focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-clinical-teal hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </form>
      </div>
    </div>
  );
};
