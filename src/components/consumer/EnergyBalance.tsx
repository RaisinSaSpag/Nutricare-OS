import React from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { BiometricRing } from '../common/BiometricRing';
import { formatKcal } from '../../utils/formatters';
import { Flame, Utensils, Scale, ShieldCheck, AlertCircle } from 'lucide-react';

export const EnergyBalance: React.FC = () => {
  const { dailyTotals, activePatient, wearables, policyViolationsCount } = useNutriCare();

  const prescribedCalories = activePatient.currentPrescription.dailyCaloriesTarget;
  const burnedTotal = wearables.basalCalories + wearables.activeCalories;
  const netBalance = dailyTotals.calories - burnedTotal;

  // Calorie ring progress
  const calPercent = Math.round((dailyTotals.calories / prescribedCalories) * 100);
  // Carbs ring progress (based on 50g * 3 meals = ~150g target)
  const targetCarbsG = Math.round((prescribedCalories * (activePatient.currentPrescription.carbRatioPercent / 100)) / 4);
  const carbPercent = Math.round((dailyTotals.carbs / targetCarbsG) * 100);
  // Water ring progress
  const targetWater = activePatient.currentPrescription.fluidTargetMl;
  const waterPercent = Math.round((wearables.waterIntakeMl / targetWater) * 100);

  return (
    <div className="bg-white rounded-2xl border border-canvas-border p-4 shadow-soft-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">
            Daily Bio-Vitality & Energy Balance
          </h2>
          <p className="text-xs text-slate-500">
            Prescribed: {formatKcal(prescribedCalories)} / day
          </p>
        </div>

        {policyViolationsCount === 0 ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Policy Compliant</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{policyViolationsCount} Policy Violation{policyViolationsCount > 1 ? 's' : ''}</span>
          </span>
        )}
      </div>

      {/* Interactive Concentric / Triple Ring Dashboard */}
      <div className="grid grid-cols-3 gap-2 py-4 border-b border-slate-100">
        <BiometricRing
          progress={calPercent}
          color="#0D9488"
          trackColor="#CCFBF1"
          label="Calories Intake"
          valueDisplay={`${dailyTotals.calories}`}
          sublabel={`/ ${prescribedCalories}`}
        />
        <BiometricRing
          progress={carbPercent}
          color="#F59E0B"
          trackColor="#FEF3C7"
          label="Carbohydrates"
          valueDisplay={`${Math.round(dailyTotals.carbs)}g`}
          sublabel={`/ ${targetCarbsG}g`}
        />
        <BiometricRing
          progress={waterPercent}
          color="#0EA5E9"
          trackColor="#E0F2FE"
          label="Hydration"
          valueDisplay={`${wearables.waterIntakeMl}`}
          sublabel={`/ ${targetWater}ml`}
        />
      </div>

      {/* Energy Balance Progress Bar: Intake vs Expenditure */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Utensils className="w-3.5 h-3.5 text-teal-600" />
            <span>Intake: {formatKcal(dailyTotals.calories)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Burned: {formatKcal(burnedTotal)}</span>
          </div>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-clinical-teal h-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((dailyTotals.calories / Math.max(1, dailyTotals.calories + burnedTotal)) * 100))}%` }}
            title={`Intake: ${dailyTotals.calories} kcal`}
          />
          <div
            className="bg-vitality-coral h-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((burnedTotal / Math.max(1, dailyTotals.calories + burnedTotal)) * 100))}%` }}
            title={`Burned: ${burnedTotal} kcal`}
          />
        </div>

        {/* Energy Status Badge */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Basal (BMR): {formatKcal(wearables.basalCalories)} + Active: {formatKcal(wearables.activeCalories)}
          </span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              netBalance <= 0
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            Net: {netBalance > 0 ? `+${netBalance}` : netBalance} kcal ({netBalance <= 0 ? 'Caloric Deficit' : 'Caloric Surplus'})
          </span>
        </div>
      </div>
    </div>
  );
};
