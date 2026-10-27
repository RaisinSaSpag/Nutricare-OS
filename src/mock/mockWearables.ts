import { WearableMetrics, SyncHistoryEntry, WearableDevice } from '../types/wearables';

export const INITIAL_WEARABLE_METRICS: WearableMetrics = {
  device: 'Apple HealthKit',
  steps: 8420,
  stepGoal: 10000,
  activeCalories: 480,
  activeCaloriesGoal: 500,
  basalCalories: 1420,
  waterIntakeMl: 1850,
  waterGoalMl: 2200,
  heartRateBpm: 72,
  restingHeartRateBpm: 64,
  sleepHours: 7.4,
  sleepQualityPercent: 88,
  lastSyncTimestamp: '12 minutes ago',
  syncStatus: 'idle'
};

export const INITIAL_SYNC_HISTORY: SyncHistoryEntry[] = [
  {
    id: 'sync-1',
    device: 'Apple HealthKit',
    timestamp: 'Today at 02:15 PM',
    steps: 8420,
    activeCalories: 480,
    waterIntakeMl: 1850,
    status: 'SUCCESS'
  },
  {
    id: 'sync-2',
    device: 'Apple HealthKit',
    timestamp: 'Today at 08:30 AM',
    steps: 2310,
    activeCalories: 140,
    waterIntakeMl: 600,
    status: 'SUCCESS'
  },
  {
    id: 'sync-3',
    device: 'Google Fit',
    timestamp: 'Yesterday at 09:45 PM',
    steps: 9840,
    activeCalories: 512,
    waterIntakeMl: 2100,
    status: 'SUCCESS'
  }
];

export function generateMockSyncData(currentMetrics: WearableMetrics, device: WearableDevice): {
  metrics: WearableMetrics;
  historyEntry: SyncHistoryEntry;
} {
  // Add 400 - 900 steps on each sync
  const addedSteps = Math.floor(Math.random() * 500) + 400;
  const addedKcal = Math.floor(addedSteps * 0.042);
  const addedWater = Math.floor(Math.random() * 200) + 250;

  const newSteps = currentMetrics.steps + addedSteps;
  const newActiveKcal = currentMetrics.activeCalories + addedKcal;
  const newWater = Math.min(3000, currentMetrics.waterIntakeMl + addedWater);
  const newBpm = Math.floor(Math.random() * 8) + 68;

  const now = new Date();
  const timeString = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const updatedMetrics: WearableMetrics = {
    ...currentMetrics,
    device,
    steps: newSteps,
    activeCalories: newActiveKcal,
    waterIntakeMl: newWater,
    heartRateBpm: newBpm,
    lastSyncTimestamp: 'Just now',
    syncStatus: 'synced'
  };

  const historyEntry: SyncHistoryEntry = {
    id: `sync-${Date.now()}`,
    device,
    timestamp: timeString,
    steps: newSteps,
    activeCalories: newActiveKcal,
    waterIntakeMl: newWater,
    status: 'SUCCESS'
  };

  return { metrics: updatedMetrics, historyEntry };
}
