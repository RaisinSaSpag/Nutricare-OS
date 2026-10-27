import { Meal, NutritionalValues, PolicyRule } from '../types/meals';
import { validateMealPlan } from './policyEngine';

export interface DailyTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
  fiber: number;
  potassium: number;
  water: number;
}

export const EMPTY_TOTALS: DailyTotals = {
  calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0, fiber: 0, potassium: 0, water: 0
};

/**
 * Validates every meal against the active rules. Each meal is checked against the cumulative
 * totals of earlier meals logged on the same local day, so daily caps are enforced.
 */
export function validateMealsCumulative(meals: Meal[], rules: PolicyRule[]): Meal[] {
  const activeRules = rules.filter(r => r.isActive);
  const ordered = [...meals].sort((a, b) => a.loggedAt - b.loggedAt);
  const running = new Map<string, { sodium: number; potassium: number; carbs: number }>();
  const resultsById = new Map<string, ReturnType<typeof validateMealPlan>>();

  for (const m of ordered) {
    const acc = running.get(m.date) ?? { sodium: 0, potassium: 0, carbs: 0 };
    resultsById.set(
      m.id,
      validateMealPlan(m.nutrition, activeRules, {
        accumulatedSodium: acc.sodium,
        accumulatedPotassium: acc.potassium,
        accumulatedCarbs: acc.carbs
      })
    );
    running.set(m.date, {
      sodium: acc.sodium + m.nutrition.sodium,
      potassium: acc.potassium + m.nutrition.potassium,
      carbs: acc.carbs + m.nutrition.carbs
    });
  }

  return meals.map(m => ({ ...m, validationResults: resultsById.get(m.id) ?? [] }));
}

/** Sums nutrition for meals whose local day equals `day` (YYYY-MM-DD). */
export function totalsForDay(meals: Meal[], day: string): DailyTotals {
  return meals
    .filter(m => m.date === day)
    .reduce<DailyTotals>(
      (acc, m: { nutrition: NutritionalValues } & Meal) => ({
        calories: acc.calories + m.nutrition.calories,
        carbs: acc.carbs + m.nutrition.carbs,
        protein: acc.protein + m.nutrition.protein,
        fat: acc.fat + m.nutrition.fat,
        sodium: acc.sodium + m.nutrition.sodium,
        fiber: acc.fiber + m.nutrition.fiber,
        potassium: acc.potassium + m.nutrition.potassium,
        water: acc.water + (m.nutrition.water || 0)
      }),
      { ...EMPTY_TOTALS }
    );
}
