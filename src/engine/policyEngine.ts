import { NutritionalValues, PolicyRule, PolicyValidationResult } from '../types/meals';

export interface DailyContext {
  accumulatedSodium: number;
  accumulatedPotassium: number;
  accumulatedCarbs: number;
}

/**
 * Validates a meal against active clinical policy rules and generates
 * structured compliance indicators with actionable corrective guidance.
 */
export function validateMealPlan(
  mealData: NutritionalValues,
  activeRules: PolicyRule[],
  dailyContext?: DailyContext
): PolicyValidationResult[] {
  const results: PolicyValidationResult[] = [];

  for (const rule of activeRules) {
    if (!rule.isActive) continue;

    // 1. Check Meal Sodium Limit
    if (rule.mealMaxSodium !== undefined) {
      const isViolation = mealData.sodium > rule.mealMaxSodium;
      const isWarning = !isViolation && mealData.sodium > rule.mealMaxSodium * 0.85;
      const excess = mealData.sodium - rule.mealMaxSodium;

      results.push({
        ruleId: rule.id,
        ruleName: `${rule.name}: Meal Sodium Limit`,
        passed: !isViolation,
        severity: isViolation ? 'VIOLATION' : isWarning ? 'WARNING' : 'COMPLIANT',
        metric: 'Sodium (Per Meal)',
        actualValue: mealData.sodium,
        threshold: rule.mealMaxSodium,
        unit: 'mg',
        message: isViolation
          ? `Sodium content (${mealData.sodium} mg) exceeds meal threshold of ${rule.mealMaxSodium} mg by ${excess} mg.`
          : isWarning
          ? `Sodium content (${mealData.sodium} mg) is approaching the ${rule.mealMaxSodium} mg meal ceiling.`
          : `Sodium content (${mealData.sodium} mg) is well within clinical limits (<= ${rule.mealMaxSodium} mg).`,
        correctiveGuidance: isViolation
          ? `Corrective Action: Replace processed sauces, broths, or cured proteins with fresh herbs, garlic powder, or lemon zest. Aim to reduce portion or choose low-sodium alternatives.`
          : isWarning
          ? `Tip: Keep subsequent meals and snacks low in sodium to maintain daily target.`
          : `Great choice! Compliant with cardiac and renal safety parameters.`
      });
    }

    // 2. Check Daily Cumulative Sodium (if dailyContext provided)
    if (rule.dailyMaxSodium !== undefined && dailyContext) {
      const projectedDailySodium = dailyContext.accumulatedSodium + mealData.sodium;
      const isDailyViolation = projectedDailySodium > rule.dailyMaxSodium;
      const isDailyWarning = !isDailyViolation && projectedDailySodium > rule.dailyMaxSodium * 0.85;

      if (isDailyViolation || isDailyWarning) {
        results.push({
          ruleId: `${rule.id}-daily-sodium`,
          ruleName: `${rule.name}: Cumulative Daily Sodium`,
          passed: !isDailyViolation,
          severity: isDailyViolation ? 'VIOLATION' : 'WARNING',
          metric: 'Daily Sodium Total',
          actualValue: projectedDailySodium,
          threshold: rule.dailyMaxSodium,
          unit: 'mg',
          message: isDailyViolation
            ? `Adding this meal drives projected daily sodium to ${projectedDailySodium} mg, breaching the ${rule.dailyMaxSodium} mg daily cap.`
            : `Projected daily sodium is now ${projectedDailySodium} mg (approaching ${rule.dailyMaxSodium} mg cap).`,
          correctiveGuidance: isDailyViolation
            ? `Corrective Action: Rebalance this meal to contain under ${Math.max(0, rule.dailyMaxSodium - dailyContext.accumulatedSodium)} mg sodium to avoid exceeding your clinical day ceiling.`
            : `Keep remaining meals low in salt to stay within guideline bounds.`
        });
      }
    }

    // 3. Check Meal Carbohydrate Bounds (Diabetic / Renal)
    if (rule.mealMinCarbs !== undefined && rule.mealMaxCarbs !== undefined) {
      const isLow = mealData.carbs < rule.mealMinCarbs;
      const isHigh = mealData.carbs > rule.mealMaxCarbs;
      const passed = !isLow && !isHigh;

      if (!passed) {
        results.push({
          ruleId: rule.id,
          ruleName: `${rule.name}: Meal Carbohydrate Window`,
          passed: false,
          severity: isHigh ? 'VIOLATION' : 'WARNING',
          metric: 'Carbohydrates (Per Meal)',
          actualValue: mealData.carbs,
          threshold: isHigh ? rule.mealMaxCarbs : rule.mealMinCarbs,
          unit: 'g',
          message: isHigh
            ? `Carbohydrates (${mealData.carbs}g) exceed recommended window of ${rule.mealMinCarbs}g-${rule.mealMaxCarbs}g by ${mealData.carbs - rule.mealMaxCarbs}g.`
            : `Carbohydrates (${mealData.carbs}g) are below recommended target (${rule.mealMinCarbs}g-${rule.mealMaxCarbs}g), risking hypoglycemic dip with insulin/SFUs.`,
          correctiveGuidance: isHigh
            ? `Corrective Action: Reduce starchy carbs (rice, pasta, bread) by 1/3 portion, or substitute simple carbohydrates with complex legumes or non-starchy leafy greens.`
            : `Corrective Action: Add a complex carbohydrate source (e.g., 1/2 sweet potato, 1 slice whole grain bread, or 1 small apple) to maintain glycemic stability.`
        });
      } else {
        results.push({
          ruleId: rule.id,
          ruleName: `${rule.name}: Meal Carbohydrate Window`,
          passed: true,
          severity: 'COMPLIANT',
          metric: 'Carbohydrates (Per Meal)',
          actualValue: mealData.carbs,
          threshold: rule.mealMaxCarbs,
          unit: 'g',
          message: `Carbohydrates (${mealData.carbs}g) fall safely within target glycemic window (${rule.mealMinCarbs}g - ${rule.mealMaxCarbs}g).`,
          correctiveGuidance: `Optimal glycemic balance maintained.`
        });
      }
    }

    // 4. Check Meal Dietary Fiber Minimum
    if (rule.mealMinFiber !== undefined) {
      const isLow = mealData.fiber < rule.mealMinFiber;
      results.push({
        ruleId: rule.id,
        ruleName: `${rule.name}: Dietary Fiber Minimum`,
        passed: !isLow,
        severity: isLow ? 'WARNING' : 'COMPLIANT',
        metric: 'Dietary Fiber',
        actualValue: mealData.fiber,
        threshold: rule.mealMinFiber,
        unit: 'g',
        message: isLow
          ? `Fiber intake (${mealData.fiber}g) is below the clinical threshold of >= ${rule.mealMinFiber}g per meal.`
          : `Dietary fiber (${mealData.fiber}g) meets clinical target (>= ${rule.mealMinFiber}g).`,
        correctiveGuidance: isLow
          ? `Corrective Action: Incorporate 1 tbsp chia/flax seeds, half an avocado, steamed broccoli, or lentils to blunt glucose spikes and improve lipid profile.`
          : `Excellent fiber density for gut microbiome and glycemic moderation.`
      });
    }

    // 5. Check Potassium Ceiling (Renal / CKD)
    if (rule.mealMaxPotassium !== undefined && mealData.potassium > 0) {
      const isHigh = mealData.potassium > rule.mealMaxPotassium;
      const isWarning = !isHigh && mealData.potassium > rule.mealMaxPotassium * 0.85;

      results.push({
        ruleId: rule.id,
        ruleName: `${rule.name}: Potassium Renal Guard`,
        passed: !isHigh,
        severity: isHigh ? 'VIOLATION' : isWarning ? 'WARNING' : 'COMPLIANT',
        metric: 'Potassium (Per Meal)',
        actualValue: mealData.potassium,
        threshold: rule.mealMaxPotassium,
        unit: 'mg',
        message: isHigh
          ? `Potassium content (${mealData.potassium} mg) exceeds renal guard threshold of ${rule.mealMaxPotassium} mg.`
          : isWarning
          ? `Potassium (${mealData.potassium} mg) is approaching renal safety ceiling (${rule.mealMaxPotassium} mg).`
          : `Potassium (${mealData.potassium} mg) is safely below nephrology threshold.`,
        correctiveGuidance: isHigh
          ? `Corrective Action: Leech high-potassium tubers (potatoes) before cooking; substitute bananas/oranges with berries, apples, or pineapple.`
          : isWarning
          ? `Monitor potassium in remaining meals for the day.`
          : `Compliant with renal filtration safety standards.`
      });
    }
  }

  return results;
}

/**
 * Calculates a summary score (0 to 100) based on validation outcomes
 */
export function calculateComplianceScore(results: PolicyValidationResult[]): number {
  if (!results.length) return 100;
  const violationDeduction = results.filter(r => r.severity === 'VIOLATION').length * 35;
  const warningDeduction = results.filter(r => r.severity === 'WARNING').length * 15;
  return Math.max(0, 100 - violationDeduction - warningDeduction);
}
