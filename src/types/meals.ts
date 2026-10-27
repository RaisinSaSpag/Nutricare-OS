export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface NutritionalValues {
  calories: number;       // kcal
  carbs: number;          // g
  protein: number;        // g
  fat: number;            // g
  sodium: number;         // mg
  fiber: number;          // g
  potassium: number;      // mg
  water?: number;         // ml
}

export type PolicySeverity = 'COMPLIANT' | 'WARNING' | 'VIOLATION';

export interface PolicyValidationResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: PolicySeverity;
  metric: string;
  actualValue: number;
  threshold: number;
  unit: string;
  message: string;
  correctiveGuidance: string;
}

export interface Meal {
  id: string;
  patientId: string;
  name: string;
  timestamp: string;
  slot: MealSlot;
  nutrition: NutritionalValues;
  imageUrl?: string;
  source: 'manual' | 'photo_scan' | 'preset';
  validationResults: PolicyValidationResult[];
}

export interface PolicyRule {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'Sodium' | 'Carbohydrate' | 'Renal' | 'Cardiac' | 'General';
  isActive: boolean;
  mealMaxSodium?: number;     // mg per meal
  dailyMaxSodium?: number;    // mg per day
  mealMinCarbs?: number;      // g per meal
  mealMaxCarbs?: number;      // g per meal
  mealMinFiber?: number;      // g per meal
  mealMaxPotassium?: number;  // mg per meal
  dailyMaxPotassium?: number; // mg per day
  mealMaxFatPercent?: number; // % of meal calories
}

export interface MealPlanDaySummary {
  date: string;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalSodium: number;
  totalFiber: number;
  totalPotassium: number;
  mealCount: number;
  violationsCount: number;
  warningsCount: number;
  complianceScore: number; // 0 to 100%
}
