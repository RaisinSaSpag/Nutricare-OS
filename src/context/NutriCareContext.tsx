import React, { createContext, useContext, useState, useMemo } from 'react';
import { Meal, PolicyRule, MealSlot, NutritionalValues, PolicyValidationResult } from '../types/meals';
import { Patient, ENCPTChart, PESStatement } from '../types/clinical';
import { WearableMetrics, SyncHistoryEntry, WearableDevice } from '../types/wearables';
import { TeleSession } from '../types/telehealth';
import { DEFAULT_POLICY_RULES } from '../engine/policyRules';
import { validateMealPlan } from '../engine/policyEngine';
import { DEFAULT_PATIENTS } from '../mock/defaultPatients';
import { getInitialMeals, PRESET_MEALS } from '../mock/defaultMeals';
import { INITIAL_WEARABLE_METRICS, INITIAL_SYNC_HISTORY, generateMockSyncData } from '../mock/mockWearables';
import { INITIAL_ENCPT_CHART, INITIAL_TELE_SESSIONS } from '../mock/defaultCharts';

interface NutriCareContextType {
  currentPortal: 'consumer' | 'provider';
  setPortal: (portal: 'consumer' | 'provider') => void;
  consumerViewport: 'mobile' | 'desktop';
  setConsumerViewport: (vp: 'mobile' | 'desktop') => void;

  // Patient & Clinical Profile
  patients: Patient[];
  activePatient: Patient;
  setActivePatientId: (id: string) => void;

  // Meals & Policy Validation
  meals: Meal[];
  policyRules: PolicyRule[];
  togglePolicyRule: (ruleId: string) => void;
  addMeal: (mealData: {
    name: string;
    slot: MealSlot;
    nutrition: NutritionalValues;
    imageUrl?: string;
    source: 'manual' | 'photo_scan' | 'preset';
  }) => void;
  deleteMeal: (mealId: string) => void;

  // Real-time Day Totals & Policy Metrics
  dailyTotals: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    sodium: number;
    fiber: number;
    potassium: number;
    water: number;
  };
  policyViolationsCount: number;
  policyWarningsCount: number;

  // Wearables & Telemetry
  wearables: WearableMetrics;
  syncHistory: SyncHistoryEntry[];
  isSyncingWearable: boolean;
  syncWearables: (device?: WearableDevice) => Promise<void>;

  // eNCPT Clinical Chart
  chart: ENCPTChart;
  updateAssessment: (updates: Partial<ENCPTChart['assessment']>) => void;
  addPESStatement: (pes: Omit<PESStatement, 'id' | 'createdAt'>) => void;
  removePESStatement: (id: string) => void;
  updateIntervention: (updates: Partial<ENCPTChart['intervention']>) => void;
  updateMonitoring: (updates: Partial<ENCPTChart['monitoring']>) => void;

  // Telehealth Consultation
  teleSessions: TeleSession[];
  activeTeleSession: TeleSession | null;
  setActiveTeleSessionId: (id: string | null) => void;
  updateSessionStatus: (sessionId: string, status: TeleSession['status']) => void;
  updateSessionNotes: (sessionId: string, notes: string) => void;

  // Reset
  resetData: () => void;
}

const NutriCareContext = createContext<NutriCareContextType | undefined>(undefined);

export const NutriCareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPortal, setPortal] = useState<'consumer' | 'provider'>('consumer');
  const [consumerViewport, setConsumerViewport] = useState<'mobile' | 'desktop'>('mobile');

  // Patients
  const [patients, setPatients] = useState<Patient[]>(DEFAULT_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>(DEFAULT_PATIENTS[0].id);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === activePatientId) || patients[0];
  }, [patients, activePatientId]);

  // Policy Rules
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>(DEFAULT_POLICY_RULES);

  // Meals
  const [meals, setMeals] = useState<Meal[]>(() => getInitialMeals(activePatientId));

  // Re-validate all meals when policyRules change
  const validatedMeals = useMemo(() => {
    const activeRules = policyRules.filter(r => r.isActive);
    return meals.map(m => ({
      ...m,
      validationResults: validateMealPlan(m.nutrition, activeRules)
    }));
  }, [meals, policyRules]);

  // Daily Totals
  const dailyTotals = useMemo(() => {
    return validatedMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.nutrition.calories,
        carbs: acc.carbs + m.nutrition.carbs,
        protein: acc.protein + m.nutrition.protein,
        fat: acc.fat + m.nutrition.fat,
        sodium: acc.sodium + m.nutrition.sodium,
        fiber: acc.fiber + m.nutrition.fiber,
        potassium: acc.potassium + m.nutrition.potassium,
        water: acc.water + (m.nutrition.water || 0)
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0, fiber: 0, potassium: 0, water: 0 }
    );
  }, [validatedMeals]);

  const { policyViolationsCount, policyWarningsCount } = useMemo(() => {
    let violations = 0;
    let warnings = 0;
    validatedMeals.forEach(m => {
      m.validationResults.forEach(r => {
        if (r.severity === 'VIOLATION') violations++;
        if (r.severity === 'WARNING') warnings++;
      });
    });
    return { policyViolationsCount: violations, policyWarningsCount: warnings };
  }, [validatedMeals]);

  // Wearables
  const [wearables, setWearables] = useState<WearableMetrics>(INITIAL_WEARABLE_METRICS);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>(INITIAL_SYNC_HISTORY);
  const [isSyncingWearable, setIsSyncingWearable] = useState<boolean>(false);

  const syncWearables = async (device: WearableDevice = 'Apple HealthKit') => {
    setIsSyncingWearable(true);
    setWearables(prev => ({ ...prev, syncStatus: 'syncing' }));

    // Simulate realistic asynchronous network call to Apple Health / Google Fit REST simulator
    await new Promise(resolve => setTimeout(resolve, 900));

    const { metrics, historyEntry } = generateMockSyncData(wearables, device);
    setWearables(metrics);
    setSyncHistory(prev => [historyEntry, ...prev]);
    setIsSyncingWearable(false);
  };

  // Policy rule toggle
  const togglePolicyRule = (ruleId: string) => {
    setPolicyRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // Add meal
  const addMeal = (mealData: {
    name: string;
    slot: MealSlot;
    nutrition: NutritionalValues;
    imageUrl?: string;
    source: 'manual' | 'photo_scan' | 'preset';
  }) => {
    const activeRules = policyRules.filter(r => r.isActive);
    const validation = validateMealPlan(mealData.nutrition, activeRules, {
      accumulatedSodium: dailyTotals.sodium,
      accumulatedPotassium: dailyTotals.potassium,
      accumulatedCarbs: dailyTotals.carbs
    });

    const now = new Date();
    const timeFormatted = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      patientId: activePatient.id,
      name: mealData.name,
      timestamp: timeFormatted,
      slot: mealData.slot,
      nutrition: mealData.nutrition,
      imageUrl: mealData.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
      source: mealData.source,
      validationResults: validation
    };

    setMeals(prev => [newMeal, ...prev]);
  };

  const deleteMeal = (mealId: string) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
  };

  // eNCPT Chart
  const [chart, setChart] = useState<ENCPTChart>(INITIAL_ENCPT_CHART);

  const updateAssessment = (updates: Partial<ENCPTChart['assessment']>) => {
    setChart(prev => ({
      ...prev,
      assessment: { ...prev.assessment, ...updates }
    }));
  };

  const addPESStatement = (pesData: Omit<PESStatement, 'id' | 'createdAt'>) => {
    const newPes: PESStatement = {
      ...pesData,
      id: `pes-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setChart(prev => ({
      ...prev,
      diagnosisPES: [...prev.diagnosisPES, newPes]
    }));
  };

  const removePESStatement = (id: string) => {
    setChart(prev => ({
      ...prev,
      diagnosisPES: prev.diagnosisPES.filter(p => p.id !== id)
    }));
  };

  const updateIntervention = (updates: Partial<ENCPTChart['intervention']>) => {
    setChart(prev => ({
      ...prev,
      intervention: { ...prev.intervention, ...updates }
    }));
  };

  const updateMonitoring = (updates: Partial<ENCPTChart['monitoring']>) => {
    setChart(prev => ({
      ...prev,
      monitoring: { ...prev.monitoring, ...updates }
    }));
  };

  // Telehealth
  const [teleSessions, setTeleSessions] = useState<TeleSession[]>(INITIAL_TELE_SESSIONS);
  const [activeTeleSessionId, setActiveTeleSessionId] = useState<string | null>('tele-001');

  const activeTeleSession = useMemo(() => {
    return teleSessions.find(s => s.id === activeTeleSessionId) || null;
  }, [teleSessions, activeTeleSessionId]);

  const updateSessionStatus = (sessionId: string, status: TeleSession['status']) => {
    setTeleSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, status } : s))
    );
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
    setTeleSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, sessionNotes: notes } : s))
    );
  };

  // Reset to initial defaults
  const resetData = () => {
    setPatients(DEFAULT_PATIENTS);
    setActivePatientId(DEFAULT_PATIENTS[0].id);
    setPolicyRules(DEFAULT_POLICY_RULES);
    setMeals(getInitialMeals(DEFAULT_PATIENTS[0].id));
    setWearables(INITIAL_WEARABLE_METRICS);
    setSyncHistory(INITIAL_SYNC_HISTORY);
    setChart(INITIAL_ENCPT_CHART);
    setTeleSessions(INITIAL_TELE_SESSIONS);
    setActiveTeleSessionId('tele-001');
  };

  return (
    <NutriCareContext.Provider
      value={{
        currentPortal,
        setPortal,
        consumerViewport,
        setConsumerViewport,
        patients,
        activePatient,
        setActivePatientId,
        meals: validatedMeals,
        policyRules,
        togglePolicyRule,
        addMeal,
        deleteMeal,
        dailyTotals,
        policyViolationsCount,
        policyWarningsCount,
        wearables,
        syncHistory,
        isSyncingWearable,
        syncWearables,
        chart,
        updateAssessment,
        addPESStatement,
        removePESStatement,
        updateIntervention,
        updateMonitoring,
        teleSessions,
        activeTeleSession,
        setActiveTeleSessionId,
        updateSessionStatus,
        updateSessionNotes,
        resetData
      }}
    >
      {children}
    </NutriCareContext.Provider>
  );
};

export const useNutriCare = () => {
  const context = useContext(NutriCareContext);
  if (!context) {
    throw new Error('useNutriCare must be used within a NutriCareProvider');
  }
  return context;
};
