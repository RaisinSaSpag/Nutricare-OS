import React, { useState, useEffect } from 'react';
import { useNutriCare } from '../../context/NutriCareContext';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Share2, 
  PhoneOff, 
  Activity, 
  Clock, 
  Heart, 
  ShieldAlert, 
  Calendar, 
  Sparkles, 
  Maximize2,
  ExternalLink,
  Save,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { formatSteps, formatKcal } from '../../utils/formatters';

export const TeleconsultationSuite: React.FC = () => {
  const { 
    activePatient, 
    activeTeleSession, 
    teleSessions, 
    setActiveTeleSessionId, 
    updateSessionStatus, 
    updateSessionNotes,
    wearables,
    dailyTotals,
    policyViolationsCount
  } = useNutriCare();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [videoMode, setVideoMode] = useState<'webrtc_sim' | 'jitsi_live'>('webrtc_sim');
  const [localNotes, setLocalNotes] = useState(activeTeleSession?.sessionNotes || '');
  const [callDurationSeconds, setCallDurationSeconds] = useState(540); // 9 minutes in
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (activeTeleSession) {
      setLocalNotes(activeTeleSession.sessionNotes || '');
    }
  }, [activeTeleSession]);

  // Call timer simulation if in session
  useEffect(() => {
    if (activeTeleSession?.status === 'In Session') {
      const interval = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTeleSession?.status]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveNotes = () => {
    if (activeTeleSession) {
      updateSessionNotes(activeTeleSession.id, localNotes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const complianceScore = Math.max(0, 100 - policyViolationsCount * 30);

  return (
    <div className="space-y-4">
      {/* Sessions Bar & Status Switcher */}
      <div className="bg-white rounded-2xl border border-canvas-border p-3.5 shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-clinical-teal" />
          <span className="text-xs font-bold text-slate-800">Tele-Nutrition Appointments:</span>
          <div className="flex items-center gap-1.5">
            {teleSessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveTeleSessionId(session.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeTeleSession?.id === session.id
                    ? 'bg-clinical-navy text-white shadow-soft-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {session.patientName} ({session.status})
              </button>
            ))}
          </div>
        </div>

        {/* Session Status Toggle */}
        {activeTeleSession && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Session Status:</span>
            <select
              value={activeTeleSession.status}
              onChange={e => updateSessionStatus(activeTeleSession.id, e.target.value as any)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="In Session">In Session (Active)</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Video Call & Clinical Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Virtual Consultation Screen (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
            {/* Top Overlay: Patient Info & Live Call Timer */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">{activePatient.name}</span>
                <span className="text-slate-400">({activePatient.mrn})</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 text-teal-400">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{formatTimer(callDurationSeconds)}</span>
                </div>

                {/* Mode Switcher */}
                <div className="bg-slate-900/80 backdrop-blur-md p-0.5 rounded-full border border-slate-700 flex text-[10px] font-bold">
                  <button
                    onClick={() => setVideoMode('webrtc_sim')}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      videoMode === 'webrtc_sim' ? 'bg-clinical-teal text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    WebRTC Sim
                  </button>
                  <button
                    onClick={() => setVideoMode('jitsi_live')}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      videoMode === 'jitsi_live' ? 'bg-clinical-teal text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Jitsi Live
                  </button>
                </div>
              </div>
            </div>

            {/* Video Canvas or Jitsi Embed */}
            {videoMode === 'jitsi_live' ? (
              <div className="w-full h-[400px] bg-slate-900 flex flex-col">
                <iframe
                  src={activeTeleSession?.roomUrl || 'https://meet.jit.si/NutriCareConsultationRoom-Default'}
                  allow="camera; microphone; fullscreen; display-capture"
                  className="w-full h-full border-0"
                  title="NutriCare Jitsi Video Consultation"
                />
              </div>
            ) : (
              <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center overflow-hidden">
                {/* Simulated Patient Video Stream */}
                {isVideoOn ? (
                  <div className="relative w-full h-full">
                    <img
                      src={activePatient.avatar}
                      alt={activePatient.name}
                      className="w-full h-full object-cover opacity-85 filter brightness-95 contrast-105 scale-105 transition-all duration-700"
                    />
                    {/* Simulated subtle breathing overlay gradient */}
                    <div className="absolute inset-0 bg-radial from-transparent via-slate-950/20 to-slate-950/70" />
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-500">
                    <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Patient Video Stream Muted</p>
                  </div>
                )}

                {/* Dietitian PIP (Self View) */}
                <div className="absolute bottom-16 right-4 z-20 w-28 h-20 rounded-2xl overflow-hidden border-2 border-teal-500 shadow-xl bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80"
                    alt="Dr. Sarah Jenkins"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-slate-900/80 px-1 py-0.2 rounded text-[8px] text-white font-bold">
                    You (RD)
                  </div>
                </div>

                {/* REAL-TIME CLINICAL VITALS HUD OVERLAY ON VIDEO */}
                <div className="absolute bottom-16 left-4 z-20 flex flex-col gap-1.5 max-w-xs">
                  {/* Live Wearable Biometrics Pill */}
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 text-white text-[11px] flex items-center gap-3 shadow-lg">
                    <div className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3.5 h-3.5 animate-pulse" />
                      <span className="font-bold">{wearables.heartRateBpm}</span>
                      <span className="text-[9px] text-slate-400">bpm</span>
                    </div>

                    <div className="flex items-center gap-1 text-teal-400 border-l border-slate-700 pl-2">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="font-bold">98%</span>
                      <span className="text-[9px] text-slate-400">SpO2</span>
                    </div>

                    <div className="flex items-center gap-1 text-blue-400 border-l border-slate-700 pl-2">
                      <span className="font-bold">138/84</span>
                      <span className="text-[9px] text-slate-400">BP</span>
                    </div>
                  </div>

                  {/* Policy Compliance HUD Badge */}
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-[11px] text-white flex items-center justify-between shadow-lg">
                    <span className="text-slate-300 font-medium">Meal Compliance:</span>
                    <span
                      className={`font-extrabold px-1.5 py-0.2 rounded text-[10px] ${
                        complianceScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {complianceScore}% {policyViolationsCount > 0 ? `(${policyViolationsCount} Flags)` : '(Optimal)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Video Call Controls Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-2.5 rounded-full transition-colors ${
                    isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                  }`}
                  title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-2.5 rounded-full transition-colors ${
                    isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                  }`}
                  title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => alert('Screen sharing simulation: Dietitian presenting eNCPT chart to patient.')}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  title="Share Screen with Patient"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* End Call Button */}
              {activeTeleSession && (
                <button
                  onClick={() => updateSessionStatus(activeTeleSession.id, 'Completed')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-glow-coral transition-all active:scale-95"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End Session</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Telemetry Bar beneath video */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Wearable Steps</span>
              <span className="font-extrabold text-slate-900">{formatSteps(wearables.steps)}</span>
              <span className="text-[10px] text-teal-600 block">Synced via HealthKit</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Energy Burn</span>
              <span className="font-extrabold text-slate-900">{formatKcal(wearables.activeCalories)}</span>
              <span className="text-[10px] text-slate-400 block">Goal: 500 kcal</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Hydration</span>
              <span className="font-extrabold text-slate-900">{wearables.waterIntakeMl} ml</span>
              <span className="text-[10px] text-blue-600 block">{Math.round((wearables.waterIntakeMl / wearables.waterGoalMl) * 100)}% of Rx Target</span>
            </div>
          </div>
        </div>

        {/* Right Column: In-Call Clinical Scratchpad & Live Flags (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* In-Call Real-Time Clinical Notes */}
          <div className="bg-white rounded-2xl border border-canvas-border p-4 shadow-soft-sm flex flex-col h-[340px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-clinical-teal" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  In-Consultation Clinical Notes
                </h3>
              </div>
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-clinical-teal hover:bg-teal-100 text-xs font-bold transition-colors"
              >
                {notesSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
                <span>{notesSaved ? 'Saved' : 'Save Notes'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={localNotes}
              onChange={e => setLocalNotes(e.target.value)}
              placeholder="Record real-time clinical dialogue, patient barriers, dietary adherence nuances, and agreed interventions during the live session..."
              className="mt-3 w-full flex-1 p-3 text-xs rounded-xl border border-slate-200 text-slate-800 focus:border-clinical-teal focus:outline-none resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Connected Workflow Alert: Flagged Meals to Discuss */}
          <div className="bg-white rounded-2xl border border-canvas-border p-4 shadow-soft-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Flagged Meal Violations for Session Review
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {policyViolationsCount} Flags
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs max-h-48 overflow-y-auto">
              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900">
                <div className="flex justify-between font-bold">
                  <span>Spicy Shoyu Ramen with Chashu Pork</span>
                  <span className="text-rose-700">1,490 mg Na</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Exceeds low-sodium policy meal ceiling (600 mg) by 890 mg. Patient agreed to dilute broths and order half-seasoned ramen bowls.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
                <div className="flex justify-between font-bold">
                  <span>Mediterranean Quinoa Salmon Bowl</span>
                  <span className="text-teal-700">340 mg Na • 7.5g Fiber</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Full compliance with Diabetic & Renal policies. Positive reinforcement given during call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
