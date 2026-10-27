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
  // Invalid height would otherwise return a plausible-looking 45.5 / 50.0 kg.
  if (!(heightCm > 0)) return 0;
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
  // Invalid input yields NaN (not a fabricated 1500 kcal) so callers can detect it.
  if (!(weightKg > 0 && heightCm > 0 && age > 0)) return NaN;
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'Male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
}

/**
 * CKD-EPI 2021 (race-free) estimated GFR, mL/min/1.73m².
 * Returns 0 for invalid input so the caller can show "not calculable".
 */
export function calculateEgfrCkdEpi2021(
  serumCreatinineMgDl: number,
  age: number,
  gender: 'Female' | 'Male' | 'Other'
): number {
  if (!(serumCreatinineMgDl > 0 && age > 0)) return 0;
  const female = gender === 'Female';
  const kappa = female ? 0.7 : 0.9;
  const alpha = female ? -0.241 : -0.302;
  const ratio = serumCreatinineMgDl / kappa;
  let egfr = 142 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.2) * Math.pow(0.9938, age);
  if (female) egfr *= 1.012;
  return Math.round(egfr);
}
