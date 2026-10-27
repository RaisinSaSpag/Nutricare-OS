import React, { useState } from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { PatientSummaryCard } from './PatientSummaryCard';
import { ENCPTChartContainer } from './eNCPT/ENCPTChartContainer';
import { TeleconsultationSuite } from './TeleconsultationSuite';
import { PolicyAuditPanel } from './PolicyAuditPanel';
import { WearableSync } from '../consumer/WearableSync';
import { 
  FileText, 
  Video, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Watch,
  UserCheck
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { policyViolationsCount, teleSessions, activePatient } = useNutriCare();
  const [activeTab, setActiveTab] = useState<'charting' | 'telehealth' | 'policy' | 'wearables'>('charting');

  const inSessionAppointment = teleSessions.find(s => s.status === 'In Session');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Patient Demographic & Clinical Strip */}
      <PatientSummaryCard
        onOpenTelehealth={() => setActiveTab('telehealth')}
        onOpenCharting={() => setActiveTab('charting')}
      />

      {/* Primary Workstation Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('charting')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'charting'
                ? 'border-clinical-teal text-clinical-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-clinical-teal" />
            <span>eNCPT Clinical Charting</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono text-slate-700">
              4 Steps
            </span>
          </button>

          <button
            onClick={() => setActiveTab('telehealth')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'telehealth'
                ? 'border-clinical-teal text-clinical-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-4 h-4 text-rose-500" />
            <span>Virtual Consultation Suite</span>
            {inSessionAppointment && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'policy'
                ? 'border-clinical-teal text-clinical-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Policy Engine & Meal Audit</span>
            {policyViolationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                {policyViolationsCount} Flags
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wearables')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'wearables'
                ? 'border-clinical-teal text-clinical-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Watch className="w-4 h-4 text-teal-600" />
            <span>Wearables & Telemetry</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Attending: <strong>Dr. Sarah Jenkins, RD</strong></span>
        </div>
      </div>

      {/* Main Tab View Area */}
      <div className="transition-all">
        {activeTab === 'charting' && <ENCPTChartContainer />}
        {activeTab === 'telehealth' && <TeleconsultationSuite />}
        {activeTab === 'policy' && <PolicyAuditPanel />}
        {activeTab === 'wearables' && (
          <div className="max-w-2xl mx-auto">
            <WearableSync />
          </div>
        )}
      </div>
    </div>
  );
};
