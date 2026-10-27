import React, { useState } from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { MealSlot } from '../../types/meals';
import { PolicyAlertBadge } from '../common/PolicyAlertBadge';
import { formatKcal, formatGrams, formatMg } from '../../utils/formatters';
import { Trash2, Clock, Sparkles, Filter, Utensils } from 'lucide-react';

export const MealTimeline: React.FC = () => {
  const { meals, deleteMeal } = useNutriCare();
  const [selectedSlot, setSelectedSlot] = useState<string>('All');

  const filteredMeals = selectedSlot === 'All'
    ? meals
    : meals.filter(m => m.slot === selectedSlot);

  return (
    <div className="bg-white rounded-2xl border border-canvas-border p-4 shadow-soft-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Meal Timeline & Audit Log
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time policy compliance and clinical feedback
          </p>
        </div>

        {/* Filter slots */}
        <div className="flex items-center gap-1 text-xs">
          {['All', 'Breakfast', 'Lunch', 'Dinner'].map(slot => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedSlot === slot
                  ? 'bg-clinical-teal text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {filteredMeals.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          <Utensils className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p>No meals logged in this category yet.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3.5">
          {filteredMeals.map(meal => {
            const hasViolation = meal.validationResults.some(r => r.severity === 'VIOLATION');
            const hasWarning = !hasViolation && meal.validationResults.some(r => r.severity === 'WARNING');

            return (
              <div
                key={meal.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  hasViolation
                    ? 'border-rose-200 bg-rose-50/20'
                    : hasWarning
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-white hover:border-teal-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Meal Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-soft-sm border border-slate-200"
                    />
                    <span className="absolute -bottom-1 -right-1 text-[9px] font-bold px-1 py-0.2 rounded bg-slate-900 text-white shadow-xs">
                      {meal.slot}
                    </span>
                  </div>

                  {/* Meal Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {meal.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.timestamp}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{meal.source.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete meal log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Macro pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {formatKcal(meal.nutrition.calories)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                        Carb: {formatGrams(meal.nutrition.carbs)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-medium border border-teal-200">
                        Pro: {formatGrams(meal.nutrition.protein)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        Fat: {formatGrams(meal.nutrition.fat)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        meal.nutrition.sodium > 600
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        Na: {formatMg(meal.nutrition.sodium)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                        Fiber: {formatGrams(meal.nutrition.fiber)}
                      </span>
                    </div>

                    {/* Policy validation status badge & accordion */}
                    <div className="mt-2.5">
                      <PolicyAlertBadge results={meal.validationResults} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
