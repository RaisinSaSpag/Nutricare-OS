import React, { useState } from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { WearableDevice } from '../../types/wearables';
import { 
  Watch, 
  Flame, 
  Footprints, 
  Droplets, 
  Heart, 
  Moon, 
  RefreshCw, 
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatSteps, formatKcal } from '../../utils/formatters';

export const WearableSync: React.FC = () => {
  const { wearables, syncHistory, isSyncingWearable, syncWearables } = useNutriCare();
  const [selectedDevice, setSelectedDevice] = useState<WearableDevice>('Apple HealthKit');
  const [showHistory, setShowHistory] = useState(false);

  const handleSync = () => {
    syncWearables(selectedDevice);
  };

  const stepPercent = Math.min(100, Math.round((wearables.steps / wearables.stepGoal) * 100));
  const activeKcalPercent = Math.min(100, Math.round((wearables.activeCalories / wearables.activeCaloriesGoal) * 100));
  const waterPercent = Math.min(100, Math.round((wearables.waterIntakeMl / wearables.waterGoalMl) * 100));

  return (
    <div className="bg-white rounded-2xl border border-canvas-border p-4 shadow-soft-sm">
      {/* Header & Device Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-clinical-teal flex items-center justify-center">
            <Watch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Wearable Telemetry Sync
            </h3>
            <p className="text-[11px] text-slate-400">
              Mock REST API: Apple HealthKit / Google Fit
            </p>
          </div>
        </div>

        {/* Sync Action Button */}
        <button
          onClick={handleSync}
          disabled={isSyncingWearable}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm ${
            isSyncingWearable
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-clinical-teal hover:bg-teal-700 text-white active:scale-95 shadow-glow-teal'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWearable ? 'animate-spin' : ''}`} />
          <span>{isSyncingWearable ? 'Syncing...' : 'Sync Wearables'}</span>
        </button>
      </div>

      {/* Device Picker Tabs */}
      <div className="flex items-center gap-2 mt-3 text-xs">
        {(['Apple HealthKit', 'Google Fit'] as WearableDevice[]).map(device => (
          <button
            key={device}
            onClick={() => setSelectedDevice(device)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedDevice === device
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {device}
          </button>
        ))}
        <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{wearables.lastSyncTimestamp}</span>
        </span>
      </div>

      {/* Live Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2.5 mt-3.5">
        {/* Daily Steps */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Steps</span>
            <Footprints className="w-3.5 h-3.5 text-vitality-blue" />
          </div>
          <div className="mt-1">
            <span className="text-base font-extrabold text-slate-900">
              {formatSteps(wearables.steps)}
            </span>
            <div className="text-[10px] text-slate-400 font-medium">
              Goal: {formatSteps(wearables.stepGoal)}
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-vitality-blue h-full rounded-full transition-all duration-500"
              style={{ width: `${stepPercent}%` }}
            />
          </div>
        </div>

        {/* Active Energy Burned */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Burn</span>
            <Flame className="w-3.5 h-3.5 text-vitality-coral" />
          </div>
          <div className="mt-1">
            <span className="text-base font-extrabold text-slate-900">
              {formatKcal(wearables.activeCalories)}
            </span>
            <div className="text-[10px] text-slate-400 font-medium">
              Goal: {formatKcal(wearables.activeCaloriesGoal)}
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-vitality-coral h-full rounded-full transition-all duration-500"
              style={{ width: `${activeKcalPercent}%` }}
            />
          </div>
        </div>

        {/* Water Intake */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Hydration</span>
            <Droplets className="w-3.5 h-3.5 text-clinical-teal" />
          </div>
          <div className="mt-1">
            <span className="text-base font-extrabold text-slate-900">
              {wearables.waterIntakeMl} ml
            </span>
            <div className="text-[10px] text-slate-400 font-medium">
              Goal: {wearables.waterGoalMl} ml
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-clinical-teal h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Biometrics (HR & Sleep) */}
      <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-teal-50/50 border border-teal-100">
          <Heart className="w-4 h-4 text-rose-500" />
          <div>
            <span className="text-slate-500 text-[10px] block">Heart Rate</span>
            <span className="font-bold text-slate-800">
              {wearables.heartRateBpm} <span className="text-[10px] font-normal text-slate-400">bpm (Rest: {wearables.restingHeartRateBpm})</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
          <Moon className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="text-slate-500 text-[10px] block">Sleep Duration</span>
            <span className="font-bold text-slate-800">
              {wearables.sleepHours} hrs <span className="text-[10px] font-normal text-slate-400">({wearables.sleepQualityPercent}% qual)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sync Log Toggle */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-[11px] font-semibold text-clinical-teal hover:underline flex items-center gap-1"
        >
          <span>{showHistory ? 'Hide REST Sync Log' : 'View REST API Payload Log'}</span>
        </button>
        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>{wearables.syncStatus === 'synced' ? 'Synced this session' : 'Not synced this session'}</span>
        </span>
      </div>

      {showHistory && (
        <div className="mt-2 p-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] space-y-1.5 max-h-32 overflow-y-auto">
          <div className="text-teal-400 font-bold">// Apple HealthKit / Google Fit API Sync History</div>
          {syncHistory.map(entry => (
            <div key={entry.id} className="border-b border-slate-800 pb-1">
              <span className="text-slate-400">[{entry.timestamp}]</span> {entry.device}: {entry.steps} steps, {entry.activeCalories} kcal, {entry.waterIntakeMl} mL &rarr; {entry.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
