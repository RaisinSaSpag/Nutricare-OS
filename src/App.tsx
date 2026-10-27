import React from 'react';
import { NutriCareProvider, useNutriCare } from './context/NutriCareContext';
import { Header } from './components/common/Header';
import { ConsumerPortal } from './components/consumer/ConsumerPortal';
import { ProviderDashboard } from './components/provider/ProviderDashboard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShieldCheck, HeartPulse } from 'lucide-react';

const NutriCareMainApp: React.FC = () => {
  const { currentPortal } = useNutriCare();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-slate-800">
      {/* Sticky Dual-Portal Navigation Header */}
      <Header />

      {/* Main Dual-Portal View Container */}
      <main className="flex-1 pb-12">
        <ErrorBoundary label={currentPortal === 'consumer' ? 'consumer portal' : 'provider dashboard'}>
          {currentPortal === 'consumer' ? (
            <ConsumerPortal />
          ) : (
            <ProviderDashboard />
          )}
        </ErrorBoundary>
      </main>

      {/* Clinical Tech & Bio-Vitality Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-clinical-teal" />
            <span className="font-extrabold text-slate-700">NutriCare OS</span>
            <span>— Tele-nutrition & Evidence-Based Digital Health Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Prototype: mock data only, not validated for clinical use
            </span>
            <span>•</span>
            <span>Version 2.4 (Prototype)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <NutriCareProvider>
      <NutriCareMainApp />
    </NutriCareProvider>
  );
}
