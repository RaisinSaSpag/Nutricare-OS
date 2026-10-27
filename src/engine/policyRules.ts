import { PolicyRule } from '../types/meals';

export const DEFAULT_POLICY_RULES: PolicyRule[] = [
  {
    id: 'pol-low-sodium',
    name: 'AHA Low-Sodium Clinical Policy',
    code: 'POL-NA-2000',
    description: 'Restricts daily sodium to <= 2,000 mg and per-meal sodium to <= 600 mg to manage hypertension and fluid retention.',
    category: 'Sodium',
    isActive: true,
    mealMaxSodium: 600,
    dailyMaxSodium: 2000,
  },
  {
    id: 'pol-diabetic-renal',
    name: 'ADA/KDOQI Diabetic & Renal Policy',
    code: 'POL-DM-CKD',
    description: 'Stabilizes postprandial glucose (45g-60g carbs/meal) and provides >= 5g fiber while capping potassium <= 700mg/meal to protect nephrons.',
    category: 'Renal',
    isActive: true,
    mealMinCarbs: 45,
    mealMaxCarbs: 60,
    mealMinFiber: 5,
    mealMaxPotassium: 700,
    dailyMaxPotassium: 2000,
  },
  {
    id: 'pol-cardiac-dash',
    name: 'DASH Dietary Guidelines for Cardiac Care',
    code: 'POL-DASH-1500',
    description: 'Cardioprotective standard limiting sodium to <= 500 mg per meal and requiring >= 6g dietary fiber per meal.',
    category: 'Cardiac',
    isActive: false,
    mealMaxSodium: 500,
    dailyMaxSodium: 1500,
    mealMinFiber: 6,
  },
  {
    id: 'pol-high-protein-wound',
    name: 'High-Protein Metabolic Support',
    code: 'POL-PRO-MET',
    description: 'Aimed at wound healing, sarcopenia prevention, and metabolic support with balanced carbohydrates.',
    category: 'General',
    isActive: false,
    mealMinCarbs: 30,
    mealMaxCarbs: 75,
    mealMinFiber: 4,
  }
];
