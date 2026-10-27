import { ENCPTChart, PESStatement, Patient } from '../types/clinical';
import { TeleSession } from '../types/telehealth';
import { calculateIBW, calculateEgfrCkdEpi2021 } from '../utils/calculations';
import { localIsoDate } from '../utils/dates';

export interface NCPTTerminologyItem {
  code: string;
  term: string;
  domain: 'Intake (NI)' | 'Clinical (NC)' | 'Behavioral-Environmental (NB)';
  defaultEtiologies: string[];
  defaultSignsSymptoms: string[];
}

export const NCPT_PROBLEM_DICTIONARY: NCPTTerminologyItem[] = [
  {
    code: 'NI-5.4',
    term: 'Excessive Sodium Intake',
    domain: 'Intake (NI)',
    defaultEtiologies: [
      'frequent reliance on high-sodium convenience, canned, and restaurant foods',
      'habitual addition of table salt and sodium-rich seasoning packets during cooking',
      'lack of awareness regarding hidden sodium in bakery goods and cured meats'
    ],
    defaultSignsSymptoms: [
      'logged meal intake showing sodium exceeding 2,800 mg/day (40% above clinical limit)',
      'elevated clinic blood pressure of 144/88 mmHg and mild bilateral pedal edema',
      'food log showing multiple sodium-dense meals with >1,200 mg per serving'
    ]
  },
  {
    code: 'NI-5.8.2',
    term: 'Inconsistent or Excessive Carbohydrate Intake',
    domain: 'Intake (NI)',
    defaultEtiologies: [
      'inconsistent portion estimation of refined starches and sugar-sweetened beverages',
      'lack of carbohydrate counting education and meal spacing guidance',
      'eating large, carbohydrate-dense evening meals'
    ],
    defaultSignsSymptoms: [
      'HbA1c elevation to 7.8% and frequent postprandial glucose excursions > 180 mg/dL',
      'logged meals with carbohydrate loads exceeding 85g in a single sitting',
      'fingerstick blood glucose variability with daytime highs up to 210 mg/dL'
    ]
  },
  {
    code: 'NI-5.8.5',
    term: 'Inadequate Dietary Fiber Intake',
    domain: 'Intake (NI)',
    defaultEtiologies: [
      'limited consumption of legumes, whole intact grains, and fresh vegetables',
      'preference for refined white flour products and low-fiber snacks',
      'digestive discomfort assumptions leading to deliberate fiber restriction'
    ],
    defaultSignsSymptoms: [
      'daily intake averaging only 11g fiber (well below clinical guideline >= 28g)',
      'patient reporting gastrointestinal transit sluggishness and constipation',
      'elevated LDL cholesterol (134 mg/dL) with minimal soluble viscous fiber in diet'
    ]
  },
  {
    code: 'NI-5.10.1',
    term: 'Excessive Mineral Intake: Potassium',
    domain: 'Intake (NI)',
    defaultEtiologies: [
      'excessive consumption of high-potassium foods without proper cooking leeching',
      'use of salt substitutes containing potassium chloride in setting of reduced GFR',
      'unmonitored intake of high-potassium fruit juices and smoothies'
    ],
    defaultSignsSymptoms: [
      'serum potassium above reference range in the context of reduced eGFR (see latest lab panel)',
      'food logs indicating meal potassium values frequently crossing 800 mg',
      'history of hyperkalemic warnings on nephrology metabolic panels'
    ]
  },
  {
    code: 'NC-3.1',
    term: 'Involuntary Weight Loss',
    domain: 'Clinical (NC)',
    defaultEtiologies: [
      'insufficient oral intake secondary to poor appetite and chronic disease anorexia',
      'increased metabolic requirements due to systemic inflammatory stress',
      'chewing difficulty or dentition issues restricting caloric intake'
    ],
    defaultSignsSymptoms: [
      'documented 8% involuntary weight drop over past 90 days',
      'observable temporal wasting and clavicular muscle loss',
      'daily calorie intake failing to meet estimated basal energy requirements'
    ]
  },
  {
    code: 'NC-3.3',
    term: 'Overweight / Obesity (Class I)',
    domain: 'Clinical (NC)',
    defaultEtiologies: [
      'chronic positive energy balance with caloric intake exceeding total daily energy expenditure',
      'sedentary daily lifestyle with low wearable active burn (<200 kcal/day)',
      'consumption of energy-dense, nutrient-poor ultra-processed snacks'
    ],
    defaultSignsSymptoms: [
      'body mass index (BMI) of 31.5 kg/m² with elevated waist circumference of 106 cm',
      'wearable telemetry confirming average steps < 3,500/day',
      'co-existing metabolic biomarkers of insulin resistance and dyslipidemia'
    ]
  },
  {
    code: 'NB-1.1',
    term: 'Food- and Nutrition-Related Knowledge Deficit',
    domain: 'Behavioral-Environmental (NB)',
    defaultEtiologies: [
      'no previous formal medical nutrition therapy (MNT) or registered dietitian consultation',
      'misleading dietary information from online marketing and commercial diet trends',
      'confusion over nutrition facts labels and clinical restriction terminology'
    ],
    defaultSignsSymptoms: [
      'patient verbalizing uncertainty regarding low-sodium substitutes and portion sizes',
      'repeated purchase of processed "diet" foods high in hidden sodium and phosphorus',
      'expressed desire for structured meal guidance and clinical navigation'
    ]
  }
];

export const INITIAL_PES_STATEMENTS: PESStatement[] = [
  {
    id: 'pes-001',
    domain: 'Intake (NI)',
    problemCode: 'NI-5.4',
    problem: 'Excessive Sodium Intake',
    etiology: 'frequent reliance on high-sodium takeout and canned broths',
    signsSymptoms: 'dietary logs showing sodium exceeding 2,800 mg/day and clinic BP of 144/88 mmHg',
    fullStatement: 'Excessive Sodium Intake [NI-5.4] related to frequent reliance on high-sodium takeout and canned broths as evidenced by dietary logs showing sodium exceeding 2,800 mg/day and clinic BP of 144/88 mmHg.',
    createdAt: '2026-10-27T08:00:00Z'
  },
  {
    id: 'pes-002',
    domain: 'Intake (NI)',
    problemCode: 'NI-5.8.2',
    problem: 'Inconsistent or Excessive Carbohydrate Intake',
    etiology: 'inconsistent portion estimation of refined starches',
    signsSymptoms: 'elevated HbA1c of 7.8% and postprandial glucose excursions > 180 mg/dL',
    fullStatement: 'Inconsistent or Excessive Carbohydrate Intake [NI-5.8.2] related to inconsistent portion estimation of refined starches as evidenced by elevated HbA1c of 7.8% and postprandial glucose excursions > 180 mg/dL.',
    createdAt: '2026-10-27T08:05:00Z'
  }
];

export const INITIAL_ENCPT_CHART: ENCPTChart = {
  id: 'chart-eleanor-01',
  patientId: 'pt-001',
  date: '2026-10-27',
  dietitianName: 'Dr. Sarah Jenkins, MS, RD, CDCES',
  assessment: {
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
    dietaryHistoryNotes: 'Patient reports typically eating 3 meals/day with frequent reliance on restaurant soups and canned foods. Breakfast consists of oatmeal or toast; lunch often involves deli sandwiches or soup; dinner includes noodles or rice dishes. Enjoys tea with honey. Water intake approximately 1.2 - 1.5 L/day.',
    clinicalImpressions: '62-year-old female presenting with co-morbid T2DM and Stage 3a CKD. Glomerular filtration rate is reduced (eGFR 52), making sodium and potassium balance paramount. Dietary recall indicates excess sodium driving mild fluid retention and hypertension. Patient is motivated to use mobile photo logging.'
  },
  diagnosisPES: INITIAL_PES_STATEMENTS,
  intervention: {
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
      'Transition away from commercial canned soups to homemade low-sodium vegetable stocks (target <600mg sodium per meal)',
      'Maintain consistent carbohydrate intake (45-60g) across Breakfast, Lunch, and Dinner with whole grains',
      'Increase dietary fiber to >= 28g/day through chia seeds, legumes, and cruciferous vegetables',
      'Log at least 3 meals daily via NutriCare OS photo tracker for automated policy checking'
    ]
  },
  monitoring: {
    keyIndicators: [
      'Self-monitored fasting blood glucose (Target: 90-130 mg/dL)',
      'Weekly blood pressure log (Target: < 130/80 mmHg)',
      'NutriCare OS meal policy compliance score (Target: >= 85%)',
      'Repeat HbA1c and Comprehensive Metabolic Panel (eGFR, K+, Na+) in 12 weeks'
    ],
    targetWeightKg: 70.0,
    targetHbA1c: 7.0,
    nextAppointmentDate: '2026-11-17',
    followUpTimelineWeeks: 3,
    clinicalNotes: 'Follow-up via NutriCare OS Tele-consultation suite in 3 weeks to evaluate meal policy compliance trends and blood pressure response.'
  },
  status: 'Finalized'
};

export const INITIAL_TELE_SESSIONS: TeleSession[] = [
  {
    id: 'tele-001',
    patientId: 'pt-001',
    patientName: 'Eleanor Vance',
    dietitianName: 'Dr. Sarah Jenkins, MS, RD, CDCES',
    scheduledTime: 'Today at 03:00 PM',
    durationMinutes: 45,
    status: 'In Session',
    roomUrl: 'https://meet.jit.si/nutricare-demo-tele-001',
    mode: 'webrtc_sim',
    sessionNotes: 'Reviewing recent high-sodium dinner flag (Ramen bowl). Patient open to recipe adjustments for lower sodium broths.'
  },
  {
    id: 'tele-002',
    patientId: 'pt-002',
    patientName: 'Marcus Thorne',
    dietitianName: 'Dr. Sarah Jenkins, MS, RD, CDCES',
    scheduledTime: 'Tomorrow at 10:00 AM',
    durationMinutes: 30,
    status: 'Upcoming',
    roomUrl: 'https://meet.jit.si/nutricare-demo-tele-002',
    mode: 'webrtc_sim',
    sessionNotes: 'Initial MNT assessment for Stage 2 HTN and DASH dietary guideline onboarding.'
  }
];

/**
 * Empty chart for a patient with no charting yet. Anthropometrics, labs and prescription
 * are copied from the patient record (never from another patient's chart). Target values
 * are copied from current values and must be reviewed by the dietitian.
 */
export function createBlankChart(patient: Patient): ENCPTChart {
  return {
    id: `chart-${patient.id}`,
    patientId: patient.id,
    date: localIsoDate(),
    dietitianName: patient.assignedDietitian,
    assessment: {
      anthropometrics: { ...patient.anthropometrics },
      labs: { ...patient.labs },
      dietaryHistoryNotes: '',
      clinicalImpressions: '',
    },
    diagnosisPES: [],
    intervention: {
      ...patient.currentPrescription,
      assignedPolicyIds: [...patient.currentPrescription.assignedPolicyIds],
      counselingGoals: [...patient.currentPrescription.counselingGoals],
    },
    monitoring: {
      keyIndicators: [],
      targetWeightKg: patient.anthropometrics.idealBodyWeightKg,
      targetHbA1c: patient.labs.hba1cPercent,
      nextAppointmentDate: '',
      followUpTimelineWeeks: 12,
      clinicalNotes: '',
    },
    status: 'Draft',
  };
}
