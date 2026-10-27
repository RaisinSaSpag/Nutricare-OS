import React, { createContext, useContext, useState, useMemo, useRef } from 'react';
import { Meal, PolicyRule, MealSlot, NutritionalValues } from '../types/meals';
import { Patient, ENCPTChart, PESStatement } from '../types/clinical';
import { WearableMetrics, SyncHistoryEntry, WearableDevice } from '../types/wearables';
import { TeleSession } from '../types/telehealth';
import { DEFAULT_POLICY_RULES } from '../engine/policyRules';
import { DailyTotals, totalsForDay, validateMealsCumulative } from '../engine/mealPipeline';
import { canTransition } from '../engine/teleSessionStateMachine';
import { DEFAULT_PATIENTS } from '../mock/defaultPatients';
import { getInitialMeals } from '../mock/defaultMeals';
import {
  INITIAL_WEARABLE_METRICS,
  INITIAL_SYNC_HISTORY,
  generateMockSyncData,
  createEmptyWearables
} from '../mock/mockWearables';
import { INITIAL_ENCPT_CHART, INITIAL_TELE_SESSIONS, createBlankChart } from '../mock/defaultCharts';
import { localIsoDate } from '../utils/dates';

type PortalView = 'consumer' | 'provider';

interface NutriCareContextType {
  currentPortal: PortalView;
  setPortal: (portal: PortalView) => void;
  consumerViewport: 'mobile' | 'desktop';
  setConsumerViewport: (vp: 'mobile' | 'desktop') => void;

  // Patient & Clinical Profile
  patients: Patient[];
  activePatient: Patient;
  /** Selects a patient and that patient's first open telehealth session (keeps both in sync). */
  setActivePatientId: (id: string) => void;

  // Meals & Policy Validation (all scoped to the active patient)
  meals: Meal[];
  policyRules: PolicyRule[];
  togglePolicyRule: (ruleId: string) => void;
  addMeal: (mealData: {
    name: string;
    slot: MealSlot;
    nutrition: NutritionalValues;
    imageUrl?: string;
    source: 'manual' | 'photo_scan' | 'preset';
  }) => boolean;
  deleteMeal: (mealId: string) => void;

  // Today's totals for the active patient (local calendar day only)
  dailyTotals: DailyTotals;
  policyViolationsCount: number;
  policyWarningsCount: number;

  // Wearables & Telemetry (active patient)
  wearables: WearableMetrics;
  syncHistory: SyncHistoryEntry[];
  isSyncingWearable: boolean;
  syncWearables: (device?: WearableDevice) => Promise<void>;

  // eNCPT Clinical Chart (active patient)
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
  /** Returns false (and changes nothing) if the transition is not allowed. */
  updateSessionStatus: (sessionId: string, status: TeleSession['status']) => boolean;
  updateSessionNotes: (sessionId: string, notes: string) => void;

  // Reset
  resetData: () => void;
}

const NutriCareContext = createContext<NutriCareContextType | undefined>(undefined);

const FIRST_PATIENT = DEFAULT_PATIENTS[0];
const NO_MEALS: Meal[] = [];
const NO_SYNC: SyncHistoryEntry[] = [];

/** Seeded per-patient state. Only patients with real seed data get it; others start empty. */
const buildInitialMealsByPatient = (): Record<string, Meal[]> => ({
  [FIRST_PATIENT.id]: getInitialMeals(FIRST_PATIENT.id)
});

const buildInitialCharts = (): Record<string, ENCPTChart> => {
  const charts: Record<string, ENCPTChart> = {};
  for (const p of DEFAULT_PATIENTS) {
    charts[p.id] = p.id === INITIAL_ENCPT_CHART.patientId ? INITIAL_ENCPT_CHART : createBlankChart(p);
  }
  return charts;
};

const buildInitialWearables = (): Record<string, WearableMetrics> => {
  const map: Record<string, WearableMetrics> = {};
  for (const p of DEFAULT_PATIENTS) {
    map[p.id] = p.id === FIRST_PATIENT.id ? INITIAL_WEARABLE_METRICS : createEmptyWearables();
  }
  return map;
};

const buildInitialSyncHistory = (): Record<string, SyncHistoryEntry[]> => {
  const map: Record<string, SyncHistoryEntry[]> = {};
  for (const p of DEFAULT_PATIENTS) {
    map[p.id] = p.id === FIRST_PATIENT.id ? INITIAL_SYNC_HISTORY : NO_SYNC;
  }
  return map;
};

export const NutriCareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPortal, setPortal] = useState<PortalView>('consumer');
  const [consumerViewport, setConsumerViewport] = useState<'mobile' | 'desktop'>('mobile');

  // Patients
  const [patients, setPatients] = useState<Patient[]>(DEFAULT_PATIENTS);
  const [activePatientId, setActivePatientIdState] = useState<string>(FIRST_PATIENT.id);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === activePatientId) || patients[0];
  }, [patients, activePatientId]);

  // Policy Rules
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>(DEFAULT_POLICY_RULES);

  // Per-patient clinical state. Every consumer below reads the active patient's slice only.
  const [mealsByPatient, setMealsByPatient] = useState<Record<string, Meal[]>>(buildInitialMealsByPatient);
  const [chartsByPatient, setChartsByPatient] = useState<Record<string, ENCPTChart>>(buildInitialCharts);
  const [wearablesByPatient, setWearablesByPatient] = useState<Record<string, WearableMetrics>>(buildInitialWearables);
  const [syncByPatient, setSyncByPatient] = useState<Record<string, SyncHistoryEntry[]>>(buildInitialSyncHistory);

  const activeId = activePatient.id;
  const rawMeals = mealsByPatient[activeId] ?? NO_MEALS;

  // Meals with results computed from active rules, using cumulative same-day totals.
  const validatedMeals = useMemo(
    () => validateMealsCumulative(rawMeals, policyRules),
    [rawMeals, policyRules]
  );

  // Daily totals: today only (local calendar day).
  const today = localIsoDate();
  const dailyTotals = useMemo<DailyTotals>(() => totalsForDay(validatedMeals, today), [validatedMeals, today]);

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

  // Wearables (active patient)
  const wearables = wearablesByPatient[activeId] ?? createEmptyWearables();
  const syncHistory = syncByPatient[activeId] ?? NO_SYNC;
  const [isSyncingWearable, setIsSyncingWearable] = useState<boolean>(false);

  // Latest wearable state for the async sync. Reading `wearablesByPatient` directly after the
  // await would use the value captured before the request started.
  const wearablesRef = useRef(wearablesByPatient);
  wearablesRef.current = wearablesByPatient;

  const syncWearables = async (device: WearableDevice = 'Apple HealthKit') => {
    const patientId = activeId;
    setIsSyncingWearable(true);
    setWearablesByPatient(prev => ({
      ...prev,
      [patientId]: { ...(prev[patientId] ?? createEmptyWearables()), syncStatus: 'syncing' }
    }));

    try {
      // Simulated network call to the device-data REST endpoint.
      await new Promise(resolve => setTimeout(resolve, 900));

      const current = wearablesRef.current[patientId] ?? createEmptyWearables();
      const { metrics, historyEntry } = generateMockSyncData(current, device);
      setWearablesByPatient(prev => ({ ...prev, [patientId]: metrics }));
      setSyncByPatient(prev => ({
        ...prev,
        [patientId]: [historyEntry, ...(prev[patientId] ?? NO_SYNC)]
      }));
    } catch {
      setWearablesByPatient(prev => ({
        ...prev,
        [patientId]: { ...(prev[patientId] ?? createEmptyWearables()), syncStatus: 'error' }
      }));
    } finally {
      setIsSyncingWearable(false);
    }
  };

  // Policy rule toggle
  const togglePolicyRule = (ruleId: string) => {
    setPolicyRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // Add meal. Returns false if the nutrition payload is invalid (nothing is stored).
  const addMeal = (mealData: {
    name: string;
    slot: MealSlot;
    nutrition: NutritionalValues;
    imageUrl?: string;
    source: 'manual' | 'photo_scan' | 'preset';
  }): boolean => {
    const numbers = Object.values(mealData.nutrition).filter((v): v is number => typeof v === 'number');
    if (numbers.some(v => !Number.isFinite(v) || v < 0)) return false;
    if (!mealData.name.trim()) return false;

    const now = new Date();
    const newMeal: Meal = {
      id: `meal-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      patientId: activeId,
      name: mealData.name.trim(),
      timestamp: `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      date: localIsoDate(now),
      loggedAt: now.getTime(),
      slot: mealData.slot,
      nutrition: mealData.nutrition,
      imageUrl: mealData.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
      source: mealData.source,
      // Placeholder; the derived pipeline above recomputes results with cumulative context.
      validationResults: []
    };

    setMealsByPatient(prev => ({
      ...prev,
      [activeId]: [newMeal, ...(prev[activeId] ?? NO_MEALS)]
    }));
    return true;
  };

  const deleteMeal = (mealId: string) => {
    setMealsByPatient(prev => ({
      ...prev,
      [activeId]: (prev[activeId] ?? NO_MEALS).filter(m => m.id !== mealId)
    }));
  };

  // eNCPT Chart (active patient)
  const chart = chartsByPatient[activeId] ?? createBlankChart(activePatient);

  const updateChart = (update: (c: ENCPTChart) => ENCPTChart) => {
    setChartsByPatient(prev => {
      const current = prev[activeId] ?? createBlankChart(activePatient);
      return { ...prev, [activeId]: update(current) };
    });
  };

  const updateAssessment = (updates: Partial<ENCPTChart['assessment']>) => {
    updateChart(c => ({ ...c, assessment: { ...c.assessment, ...updates } }));
  };

  const addPESStatement = (pesData: Omit<PESStatement, 'id' | 'createdAt'>) => {
    const newPes: PESStatement = {
      ...pesData,
      id: `pes-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    updateChart(c => ({ ...c, diagnosisPES: [...c.diagnosisPES, newPes] }));
  };

  const removePESStatement = (id: string) => {
    updateChart(c => ({ ...c, diagnosisPES: c.diagnosisPES.filter(p => p.id !== id) }));
  };

  const updateIntervention = (updates: Partial<ENCPTChart['intervention']>) => {
    updateChart(c => ({ ...c, intervention: { ...c.intervention, ...updates } }));
  };

  const updateMonitoring = (updates: Partial<ENCPTChart['monitoring']>) => {
    updateChart(c => ({ ...c, monitoring: { ...c.monitoring, ...updates } }));
  };

  // Telehealth
  const [teleSessions, setTeleSessions] = useState<TeleSession[]>(INITIAL_TELE_SESSIONS);
  const [activeTeleSessionId, setActiveTeleSessionIdState] = useState<string | null>(FIRST_SESSION_ID());

  const activeTeleSession = useMemo(() => {
    return teleSessions.find(s => s.id === activeTeleSessionId) || null;
  }, [teleSessions, activeTeleSessionId]);

  // Selecting a session also selects its patient, so header, video overlay and notes always agree.
  const setActiveTeleSessionId = (id: string | null) => {
    setActiveTeleSessionIdState(id);
    const session = teleSessions.find(s => s.id === id);
    if (session) setActivePatientIdState(session.patientId);
  };

  // Selecting a patient selects that patient's open session (or none).
  const setActivePatientId = (id: string) => {
    setActivePatientIdState(id);
    const forPatient = teleSessions.filter(s => s.patientId === id);
    const open = forPatient.find(s => s.status === 'Upcoming' || s.status === 'In Session');
    setActiveTeleSessionIdState((open ?? forPatient[0])?.id ?? null);
  };

  const updateSessionStatus = (sessionId: string, status: TeleSession['status']): boolean => {
    const current = teleSessions.find(s => s.id === sessionId);
    if (!current || !canTransition(current.status, status)) return false;
    // Only one consultation can be live at a time.
    if (status === 'In Session' && teleSessions.some(s => s.id !== sessionId && s.status === 'In Session')) {
      return false;
    }
    setTeleSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, status } : s)));
    return true;
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
    setTeleSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, sessionNotes: notes } : s))
    );
  };

  // Reset to initial defaults
  const resetData = () => {
    setPatients(DEFAULT_PATIENTS);
    setActivePatientIdState(FIRST_PATIENT.id);
    setPolicyRules(DEFAULT_POLICY_RULES);
    setMealsByPatient(buildInitialMealsByPatient());
    setChartsByPatient(buildInitialCharts());
    setWearablesByPatient(buildInitialWearables());
    setSyncByPatient(buildInitialSyncHistory());
    setTeleSessions(INITIAL_TELE_SESSIONS);
    setActiveTeleSessionIdState(FIRST_SESSION_ID());
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

/** Id of the session shown when the app opens (the first mock session). */
function FIRST_SESSION_ID(): string | null {
  return INITIAL_TELE_SESSIONS[0]?.id ?? null;
}

export const useNutriCare = () => {
  const context = useContext(NutriCareContext);
  if (!context) {
    throw new Error('useNutriCare must be used within a NutriCareProvider');
  }
  return context;
};
