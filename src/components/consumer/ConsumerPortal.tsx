import React from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { EnergyBalance } from './EnergyBalance';
import { MealTracker } from './MealTracker';
import { WearableSync } from './WearableSync';
import { MealTimeline } from './MealTimeline';
import { Wifi, Battery, Signal, Sparkles, Smartphone, Monitor } from 'lucide-react';

export const ConsumerPortal: React.FC = () => {
  const { consumerViewport, setConsumerViewport, activePatient } = useNutriCare();

  const isMobileSim = consumerViewport === 'mobile';

  return (
    <div className="py-6 px-4">
      {/* Viewport switch toolbar */}
      <div className="max-w-md mx-auto mb-4 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">
          Consumer Portal & Patient Telemetry
        </span>
        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg">
          <button
            onClick={() => setConsumerViewport('mobile')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              isMobileSim ? 'bg-white text-clinical-teal shadow-xs' : 'text-slate-600'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App Frame</span>
          </button>
          <button
            onClick={() => setConsumerViewport('desktop')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              !isMobileSim ? 'bg-white text-clinical-teal shadow-xs' : 'text-slate-600'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Responsive Web</span>
          </button>
        </div>
      </div>

      {isMobileSim ? (
        /* Mobile Device Frame Simulator */
        <div className="max-w-[420px] mx-auto bg-slate-900 p-3 rounded-[40px] shadow-2xl border-4 border-slate-700">
          {/* Phone Shell Inner */}
          <div className="bg-canvas rounded-[32px] overflow-hidden flex flex-col max-h-[860px]">
            {/* Phone Status Bar */}
            <div className="bg-white px-6 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-slate-100 shrink-0">
              <span>9:41</span>
              {/* Dynamic Island / Notch */}
              <div className="w-20 h-4 bg-slate-900 rounded-full" />
              <div className="flex items-center gap-1.5 text-slate-700">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Scrollable Patient View */}
            <div className="overflow-y-auto p-3.5 space-y-3.5 flex-1">
              {/* Patient Welcome Card */}
              <div className="bg-gradient-to-r from-clinical-navy to-slate-800 rounded-2xl p-4 text-white shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      Patient Intake & Tracking
                    </span>
                    <h2 className="text-base font-extrabold mt-0.5">
                      Welcome, {activePatient.name}
                    </h2>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Rx: {activePatient.primaryDiagnosis}
                    </p>
                  </div>
                  <img
                    src={activePatient.avatar}
                    alt={activePatient.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-400"
                  />
                </div>
              </div>

              {/* Energy Balance & Ring Dashboard */}
              <EnergyBalance />

              {/* Meal & Photo Logger */}
              <MealTracker />

              {/* Wearables Sync Simulator */}
              <WearableSync />

              {/* Meal Timeline */}
              <MealTimeline />
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Expanded Grid View */
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-clinical-navy via-slate-900 to-clinical-teal p-6 rounded-3xl text-white shadow-soft-md flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300">
                Patient Consumer Portal
              </span>
              <h1 className="text-2xl font-black mt-1">
                Welcome back, {activePatient.name}
              </h1>
              <p className="text-sm text-slate-200 mt-1 max-w-xl">
                Daily telemetry, photo meal logging, and policy compliance synced with your clinical dietitian team.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <EnergyBalance />
              <MealTracker />
              <MealTimeline />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <WearableSync />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
