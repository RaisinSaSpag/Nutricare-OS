import { Meal, NutritionalValues } from '../types/meals';
import { localDateAt, localIsoDate } from '../utils/dates';
import { DEFAULT_POLICY_RULES } from '../engine/policyRules';
import { validateMealPlan } from '../engine/policyEngine';

export interface PresetMealTemplate {
  name: string;
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  nutrition: NutritionalValues;
  imageUrl: string;
  tag: string;
  isViolationDemo?: boolean;
}

export const PRESET_MEALS: PresetMealTemplate[] = [
  {
    name: 'Mediterranean Quinoa & Herb Salmon Bowl',
    slot: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    tag: 'Policy Compliant',
    nutrition: {
      calories: 495,
      carbs: 52,
      protein: 36,
      fat: 16,
      sodium: 340,
      fiber: 7.5,
      potassium: 620,
      water: 250
    }
  },
  {
    name: 'Steel-Cut Oats with Walnuts, Cinnamon & Berries',
    slot: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80',
    tag: 'Policy Compliant',
    nutrition: {
      calories: 365,
      carbs: 54,
      protein: 13,
      fat: 11,
      sodium: 110,
      fiber: 8.2,
      potassium: 340,
      water: 300
    }
  },
  {
    name: 'Spicy Shoyu Ramen with Chashu Pork & Nitamago',
    slot: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    tag: 'High Sodium & Carb Breach',
    isViolationDemo: true,
    nutrition: {
      calories: 780,
      carbs: 86,
      protein: 29,
      fat: 34,
      sodium: 1490, // Massive sodium violation for 600mg limit!
      fiber: 2.8,  // Fiber violation for >= 5g
      potassium: 480,
      water: 400
    }
  },
  {
    name: 'Grilled Herb Chicken Salad with Avocado & Pumpkin Seeds',
    slot: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    tag: 'Policy Compliant',
    nutrition: {
      calories: 440,
      carbs: 48,
      protein: 42,
      fat: 15,
      sodium: 380,
      fiber: 6.8,
      potassium: 680,
      water: 200
    }
  },
  {
    name: 'Double Cheeseburger with Salted French Fries',
    slot: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tag: 'Severe Multi-Policy Violation',
    isViolationDemo: true,
    nutrition: {
      calories: 920,
      carbs: 94,
      protein: 34,
      fat: 46,
      sodium: 1720,
      fiber: 3.1,
      potassium: 760,
      water: 150
    }
  },
  {
    name: 'Greek Yogurt with Sliced Strawberries & Chia',
    slot: 'Snack',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    tag: 'Renal & Glucose Friendly',
    nutrition: {
      calories: 190,
      carbs: 22,
      protein: 17,
      fat: 4,
      sodium: 65,
      fiber: 5.1,
      potassium: 290,
      water: 150
    }
  }
];

// Initial pre-loaded meal history for Eleanor Vance (pt-001 only; other patients start empty).
// Dates are computed from the current day so the seed always shows as "today" / "yesterday".
export function getInitialMeals(patientId: string): Meal[] {
  const activeRules = DEFAULT_POLICY_RULES.filter(r => r.isActive);

  const m1Nutrition: NutritionalValues = {
    calories: 365, carbs: 54, protein: 13, fat: 11, sodium: 110, fiber: 8.2, potassium: 340, water: 300
  };
  const m2Nutrition: NutritionalValues = {
    calories: 495, carbs: 52, protein: 36, fat: 16, sodium: 340, fiber: 7.5, potassium: 620, water: 250
  };
  const m3Nutrition: NutritionalValues = {
    calories: 780, carbs: 86, protein: 29, fat: 34, sodium: 1490, fiber: 2.8, potassium: 480, water: 400
  };

  const m1At = localDateAt(0, 8, 15);
  const m2At = localDateAt(0, 12, 45);
  const m3At = localDateAt(1, 19, 20);

  return [
    {
      id: 'meal-001',
      patientId,
      name: 'Steel-Cut Oats with Walnuts & Blueberries',
      slot: 'Breakfast',
      timestamp: 'Today at 08:15 AM',
      date: localIsoDate(m1At),
      loggedAt: m1At.getTime(),
      imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80',
      source: 'photo_scan',
      nutrition: m1Nutrition,
      validationResults: validateMealPlan(m1Nutrition, activeRules)
    },
    {
      id: 'meal-002',
      patientId,
      name: 'Mediterranean Quinoa & Herb Salmon Bowl',
      slot: 'Lunch',
      timestamp: 'Today at 12:45 PM',
      date: localIsoDate(m2At),
      loggedAt: m2At.getTime(),
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      source: 'photo_scan',
      nutrition: m2Nutrition,
      validationResults: validateMealPlan(m2Nutrition, activeRules)
    },
    {
      id: 'meal-003',
      patientId,
      name: 'Spicy Shoyu Ramen with Chashu Pork',
      slot: 'Dinner',
      timestamp: 'Yesterday at 07:20 PM',
      date: localIsoDate(m3At),
      loggedAt: m3At.getTime(),
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
      source: 'manual',
      nutrition: m3Nutrition,
      validationResults: validateMealPlan(m3Nutrition, activeRules)
    }
  ];
}
