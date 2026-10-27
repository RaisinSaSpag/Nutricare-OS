export interface Anthropometrics {
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiClassification: string;
  idealBodyWeightKg: number;
  weightChange30DaysPercent: number;
  waistCircumferenceCm?: number;
}

export interface ClinicalLabs {
  hba1cPercent: number;          // % (e.g. 7.4)
  fastingGlucoseMgDl: number;    // mg/dL (e.g. 142)
  eGfr: number;                  // mL/min/1.73m² (e.g. 58)
  bunMgDl: number;               // mg/dL (e.g. 24)
  serumCreatinineMgDl: number;   // mg/dL (e.g. 1.3)
  serumPotassiumMeqL: number;    // mEq/L (e.g. 4.9)
  serumSodiumMeqL: number;       // mEq/L (e.g. 139)
  totalCholesterolMgDl: number;  // mg/dL (e.g. 210)
  ldlCholesterolMgDl: number;    // mg/dL (e.g. 132)
  hdlCholesterolMgDl: number;    // mg/dL (e.g. 44)
  triglyceridesMgDl: number;     // mg/dL (e.g. 175)
  dateRecorded: string;
}

export interface PESStatement {
  id: string;
  domain: 'Intake (NI)' | 'Clinical (NC)' | 'Behavioral-Environmental (NB)';
  problemCode: string;           // e.g. "NI-5.4"
  problem: string;               // e.g. "Excessive Sodium Intake"
  etiology: string;              // e.g. "frequent reliance on high-sodium takeout and canned goods"
  signsSymptoms: string;         // e.g. "daily sodium intake averaging 3,200mg and stage 1 hypertension"
  fullStatement: string;         // formatted standard PES sentence
  createdAt: string;
}

export interface NutritionPrescription {
  dailyCaloriesTarget: number;
  carbRatioPercent: number;
  proteinRatioPercent: number;
  fatRatioPercent: number;
  proteinGPerKg: number;
  sodiumLimitMg: number;
  potassiumLimitMg: number;
  fiberMinG: number;
  fluidTargetMl: number;
  assignedPolicyIds: string[];
  counselingGoals: string[];
}

export interface MonitoringPlan {
  keyIndicators: string[];
  targetWeightKg: number;
  targetHbA1c: number;
  nextAppointmentDate: string;
  followUpTimelineWeeks: number;
  clinicalNotes: string;
}

export interface ENCPTChart {
  id: string;
  patientId: string;
  date: string;
  dietitianName: string;
  assessment: {
    anthropometrics: Anthropometrics;
    labs: ClinicalLabs;
    dietaryHistoryNotes: string;
    clinicalImpressions: string;
  };
  diagnosisPES: PESStatement[];
  intervention: NutritionPrescription;
  monitoring: MonitoringPlan;
  status: 'Draft' | 'Finalized';
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  dob: string;
  avatar: string;
  phone: string;
  email: string;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  allergies: string[];
  assignedDietitian: string;
  activePolicies: string[];
  anthropometrics: Anthropometrics;
  labs: ClinicalLabs;
  currentPrescription: NutritionPrescription;
}
