export type WearableDevice = 'Apple HealthKit' | 'Google Fit' | 'Garmin Health' | 'Fitbit';

export interface WearableMetrics {
  device: WearableDevice;
  steps: number;
  stepGoal: number;
  activeCalories: number;       // kcal burned actively
  activeCaloriesGoal: number;
  basalCalories: number;        // BMR burn
  waterIntakeMl: number;        // ml
  waterGoalMl: number;          // ml
  heartRateBpm: number;
  restingHeartRateBpm: number;
  sleepHours: number;
  sleepQualityPercent: number;
  lastSyncTimestamp: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

export interface SyncHistoryEntry {
  id: string;
  device: WearableDevice;
  timestamp: string;
  steps: number;
  activeCalories: number;
  waterIntakeMl: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}
