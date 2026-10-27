/**
 * Clinical calculation utilities for Dietitians and Nutritionists
 */

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; classification: string } {
  if (heightCm <= 0 || weightKg <= 0) return { bmi: 0, classification: 'N/A' };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let classification = 'Normal Weight';
  if (bmi < 18.5) classification = 'Underweight';
  else if (bmi < 25) classification = 'Normal Weight';
  else if (bmi < 30) classification = 'Overweight (Pre-obesity)';
  else if (bmi < 35) classification = 'Obesity Class I';
  else if (bmi < 40) classification = 'Obesity Class II';
  else classification = 'Obesity Class III (Severe)';

  return { bmi, classification };
}

/**
 * Devine Formula for Ideal Body Weight (IBW)
 */
export function calculateIBW(heightCm: number, gender: 'Female' | 'Male' | 'Other'): number {
  const inchesTotal = heightCm / 2.54;
  const inchesOver5Feet = Math.max(0, inchesTotal - 60);

  let ibw = 50;
  if (gender === 'Female') {
    ibw = 45.5 + 2.3 * inchesOver5Feet;
  } else {
    ibw = 50.0 + 2.3 * inchesOver5Feet;
  }

  return Number(ibw.toFixed(1));
}

/**
 * Mifflin-St Jeor equation for Resting Metabolic Rate (RMR / BMR)
 */
export function calculateMifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'Female' | 'Male' | 'Other'
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1500;
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'Male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
}
