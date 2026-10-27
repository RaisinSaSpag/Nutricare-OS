import React from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { 
  Activity, 
  Stethoscope, 
  User, 
  Smartphone, 
  Monitor, 
  ShieldAlert, 
  Video, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPortal,
    setPortal,
    consumerViewport,
    setConsumerViewport,
    patients,
    activePatient,
    setActivePatientId,
    policyViolationsCount,
    policyRules,
    teleSessions,
    setActiveTeleSessionId,
    resetData
  } = useNutriCare();

  const activePoliciesCount = policyRules.filter(r => r.isActive).length;
  const inSessionAppointment = teleSessions.find(s => s.status === 'In Session');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-canvas-border shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Clinical Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-clinical-navy via-clinical-teal to-vitality-green flex items-center justify-center text-white shadow-soft-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-clinical-navy font-sans">
                  Nutri<span className="text-clinical-teal">Care</span>
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-clinical-teal border border-teal-200">
                  OS v2.4
                </span>
              </div>
              <p className="text-[11px] text-canvas-muted hidden sm:block">
                Tele-Nutrition & Digital Health Integrated Workstation
              </p>
            </div>
          </div>

          {/* DUAL PORTAL INSTANT TOGGLE SWITCH */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setPortal('consumer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                currentPortal === 'consumer'
                  ? 'bg-white text-clinical-teal shadow-soft-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Consumer Portal</span>
              {policyViolationsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                  {policyViolationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPortal('provider')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                currentPortal === 'provider'
                  ? 'bg-clinical-navy text-white shadow-soft-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>Provider Dashboard</span>
            </button>
          </div>

          {/* Active Patient Selector & Clinical Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Viewport switch if on consumer portal */}
            {currentPortal === 'consumer' && (
              <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
                <button
                  onClick={() => setConsumerViewport('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${
                    consumerViewport === 'mobile' ? 'bg-white text-clinical-teal shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Mobile-First Viewport (Device Simulator)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConsumerViewport('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${
                    consumerViewport === 'desktop' ? 'bg-white text-clinical-teal shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Full-Screen Responsive View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Live Tele-Consultation Pill */}
            {inSessionAppointment && (
              <button
                onClick={() => {
                  setPortal('provider');
                  setActiveTeleSessionId(inSessionAppointment.id);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse hover:bg-rose-100 transition-colors"
                title="Active Tele-consultation Session"
              >
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <Video className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden lg:inline">Live Consultation</span>
              </button>
            )}

            {/* Patient Selector */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-8 h-8 rounded-full object-cover border border-teal-300"
              />
              <div className="hidden sm:block text-left">
                <select
                  value={activePatient.id}
                  onChange={e => setActivePatientId(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-4"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                  <span>{activePoliciesCount} active policies</span>
                </div>
              </div>
            </div>

            {/* Reset Defaults button */}
            <button
              onClick={resetData}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset state to initial mock data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
