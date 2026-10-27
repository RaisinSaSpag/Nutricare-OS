import React from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { PolicyAlertBadge } from '../common/PolicyAlertBadge';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { formatKcal, formatGrams, formatMg } from '../../utils/formatters';

export const PolicyAuditPanel: React.FC = () => {
  const { policyRules, togglePolicyRule, meals } = useNutriCare();

  const activeRules = policyRules.filter(r => r.isActive);

  return (
    <div className="space-y-6">
      {/* Top Banner: Policy Rule Registry */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-clinical-teal" />
              Evidence-Based Policy Rule Registry & Validation Thresholds
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automated algorithmic checks run against every patient meal logged in the consumer portal
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-clinical-teal border border-teal-200">
            {activeRules.length} Active Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
          {policyRules.map(rule => (
            <div
              key={rule.id}
              className={`p-3.5 rounded-xl border transition-all ${
                rule.isActive
                  ? 'border-teal-300 bg-teal-50/30'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{rule.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-bold text-slate-700">
                      {rule.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={rule.isActive}
                  aria-label={`Enable ${rule.name}`}
                  onClick={() => togglePolicyRule(rule.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    rule.isActive ? 'bg-clinical-teal' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      rule.isActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Thresholds summary */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[10px] font-mono font-semibold text-slate-700">
                {rule.mealMaxSodium !== undefined && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Max Sodium/Meal: &lt;= {rule.mealMaxSodium} mg
                  </span>
                )}
                {rule.dailyMaxSodium !== undefined && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Daily Sodium Ceiling: &lt;= {rule.dailyMaxSodium} mg
                  </span>
                )}
                {rule.mealMinCarbs !== undefined && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Carb Window: {rule.mealMinCarbs}g - {rule.mealMaxCarbs}g
                  </span>
                )}
                {rule.mealMinFiber !== undefined && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Min Fiber: &gt;= {rule.mealMinFiber}g
                  </span>
                )}
                {rule.mealMaxPotassium !== undefined && (
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Max Potassium: &lt;= {rule.mealMaxPotassium} mg
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Meal Audit Feed */}
      <div className="bg-white rounded-2xl border border-canvas-border p-5 shadow-soft-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Patient Meal Log Audit & Automated Clinical Feedback
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review flagged items to address during consultation
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700">
            Total Meals Logged: {meals.length}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {meals.map(meal => (
            <div
              key={meal.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-xs">{meal.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {meal.slot}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {meal.timestamp}
                    </span>
                  </div>
                </div>

                {/* Macro summary pills */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                    {formatKcal(meal.nutrition.calories)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 font-bold text-amber-800 border border-amber-200">
                    {formatGrams(meal.nutrition.carbs)} Carb
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 font-bold text-teal-800 border border-teal-200">
                    {formatGrams(meal.nutrition.protein)} Pro
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    meal.nutrition.sodium > 600
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {formatMg(meal.nutrition.sodium)} Na
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 font-bold text-emerald-800 border border-emerald-200">
                    {formatGrams(meal.nutrition.fiber)} Fiber
                  </span>
                </div>
              </div>

              {/* Policy Validation Card */}
              <div className="mt-3">
                <PolicyAlertBadge results={meal.validationResults} showDetailsDefault={true} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
