import { Patient } from '../types/clinical';
import { calculateIBW, calculateEgfrCkdEpi2021 } from '../utils/calculations';

export const DEFAULT_PATIENTS: Patient[] = [
  {
    id: 'pt-001',
    mrn: 'NC-89421',
    name: 'Eleanor Vance',
    age: 62,
    gender: 'Female',
    dob: '1964-04-18',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    phone: '+1 (555) 382-9912',
    email: 'eleanor.vance@healthmail.net',
    primaryDiagnosis: 'Type 2 Diabetes Mellitus with Stage 3a CKD (E11.22)',
    secondaryDiagnosis: 'Essential Hypertension (I10)',
    allergies: ['Penicillin', 'Shellfish'],
    assignedDietitian: 'Dr. Sarah Jenkins, MS, RD, CDCES',
    activePolicies: ['pol-low-sodium', 'pol-diabetic-renal'],
    anthropometrics: {
      heightCm: 165,
      weightKg: 74.2,
      bmi: 27.3,
      bmiClassification: 'Overweight (Pre-obesity)',
      idealBodyWeightKg: calculateIBW(165, 'Female'),
      weightChange30DaysPercent: -1.2,
      waistCircumferenceCm: 86
    },
    labs: {
      hba1cPercent: 7.8,
      fastingGlucoseMgDl: 156,
      eGfr: calculateEgfrCkdEpi2021(1.35, 62, 'Female'),
      bunMgDl: 26,
      serumCreatinineMgDl: 1.35,
      serumPotassiumMeqL: 4.8,
      serumSodiumMeqL: 139,
      totalCholesterolMgDl: 215,
      ldlCholesterolMgDl: 134,
      hdlCholesterolMgDl: 46,
      triglyceridesMgDl: 175,
      dateRecorded: '2026-10-15'
    },
    currentPrescription: {
      dailyCaloriesTarget: 1650,
      carbRatioPercent: 48,
      proteinRatioPercent: 18,
      fatRatioPercent: 34,
      proteinGPerKg: 0.8,
      sodiumLimitMg: 2000,
      potassiumLimitMg: 2000,
      fiberMinG: 28,
      fluidTargetMl: 2200,
      assignedPolicyIds: ['pol-low-sodium', 'pol-diabetic-renal'],
      counselingGoals: [
        'Maintain carbohydrate consistency (45g-60g) across three main meals',
        'Cap sodium under 600mg per meal to protect renal filtration and blood pressure',
        'Incorporate soluble fiber (>= 5g/meal) to improve postprandial glucose stability'
      ]
    }
  },
  {
    id: 'pt-002',
    mrn: 'NC-65128',
    name: 'Marcus Thorne',
    age: 48,
    gender: 'Male',
    dob: '1978-08-11',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    phone: '+1 (555) 843-1920',
    email: 'm.thorne@biotechcorp.com',
    primaryDiagnosis: 'Stage 2 Hypertension & Metabolic Syndrome (I10, E88.81)',
    secondaryDiagnosis: 'Class I Obesity (E66.01)',
    allergies: ['Peanuts'],
    assignedDietitian: 'Dr. Sarah Jenkins, MS, RD, CDCES',
    activePolicies: ['pol-low-sodium', 'pol-cardiac-dash'],
    anthropometrics: {
      heightCm: 182,
      weightKg: 104.5,
      bmi: 31.5,
      bmiClassification: 'Obesity Class I',
      idealBodyWeightKg: calculateIBW(182, 'Male'),
      weightChange30DaysPercent: -0.5,
      waistCircumferenceCm: 106
    },
    labs: {
      hba1cPercent: 6.1,
      fastingGlucoseMgDl: 112,
      eGfr: 88,
      bunMgDl: 18,
      serumCreatinineMgDl: 1.05,
      serumPotassiumMeqL: 4.2,
      serumSodiumMeqL: 142,
      totalCholesterolMgDl: 245,
      ldlCholesterolMgDl: 158,
      hdlCholesterolMgDl: 38,
      triglyceridesMgDl: 240,
      dateRecorded: '2026-10-18'
    },
    currentPrescription: {
      dailyCaloriesTarget: 1950,
      carbRatioPercent: 45,
      proteinRatioPercent: 25,
      fatRatioPercent: 30,
      proteinGPerKg: 1.2,
      sodiumLimitMg: 1500,
      potassiumLimitMg: 3500,
      fiberMinG: 35,
      fluidTargetMl: 3000,
      assignedPolicyIds: ['pol-low-sodium', 'pol-cardiac-dash'],
      counselingGoals: [
        'Shift to DASH dietary pattern with high dietary potassium from whole vegetables',
        'Substitute processed deli meats with lean poultry or plant proteins',
        'Increase daily active physical steps to >= 9,000 steps/day'
      ]
    }
  }
];
