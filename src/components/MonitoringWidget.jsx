import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { 
  ShieldCheck, ShieldAlert, Eye, EyeOff, Activity, AlertTriangle, 
  ChevronDown, ChevronUp, Zap, Clock, Radio, BarChart3, RefreshCw 
} from 'lucide-react';

const MonitoringWidget = ({ minimal = false }) => {
  const { 
    isMonitoring, 
    currentSession, 
    engagementData, 
    signals, 
    recentEvents, 
    recordAnomaly, 
    refreshEngagement 
  } = useMonitoring();

  const [expanded, setExpanded] = useState(false);

  if (!isMonitoring || !currentSession) return null;

  const score = engagementData.engagementScore ?? 100;
  const isHealthy = score >= 60;
  const isModerate = score >= 40 && score < 60;

  const statusColor = isHealthy 
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
    : isModerate 
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' 
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const badgeColor = isHealthy ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500';

  if (minimal) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 px-3 py-1.5 rounded-full text-xs backdrop-blur-md shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${badgeColor} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${badgeColor}`}></span>
        </span>
        <span className="text-slate-400 font-medium">Session #{currentSession.id}</span>
        <span className="text-slate-600">|</span>
        <span className={`font-bold ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
          {score}% Engagement
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 font-sans">
      {/* Expanded Telemetry HUD */}
      {expanded && (
        <div className="mb-3 w-80 sm:w-96 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-xs text-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Radio size={14} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-[13px] flex items-center gap-1.5">
                  Live Monitoring Layer
                </h4>
                <p className="text-[10px] text-slate-400">
                  Session #{currentSession.id} • {currentSession.context} Mode
                </p>
              </div>
            </div>
            <button 
              onClick={() => refreshEngagement()}
              title="Refresh Engagement Score"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Engagement</span>
              <span className={`text-base font-extrabold ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                {score}%
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Coverage</span>
              <span className="text-base font-extrabold text-indigo-300">
                {engagementData.monitoringCoverage || '100%'}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Integrity</span>
              <span className={`text-[11px] font-bold mt-1 block truncate ${engagementData.integrityStatus === 'FLAGGED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {engagementData.integrityStatus || 'VALID'}
              </span>
            </div>
          </div>

          {/* Live Signals Status */}
          <div className="space-y-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                {signals.isWindowFocused ? <Eye size={12} className="text-emerald-400" /> : <EyeOff size={12} className="text-rose-400" />}
                Window Focus
              </span>
              <span className={signals.isWindowFocused ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {signals.isWindowFocused ? 'Focused' : 'Focus Lost'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock size={12} className="text-indigo-400" /> Focus Lost Events
              </span>
              <span className="font-semibold text-slate-200">
                {signals.focusLossCount} {signals.focusLossCount === 1 ? 'time' : 'times'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity size={12} className="text-amber-400" /> User Activity
              </span>
              <span className={signals.isUserActive ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {signals.isUserActive ? 'Active' : 'Idle (>30s)'}
              </span>
            </div>

            {signals.anomalyCount > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Anomalies Detected
                </span>
                <span className="text-rose-400 font-bold">{signals.anomalyCount}</span>
              </div>
            )}
          </div>

          {/* Telemetry Log */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5 px-1">
              <span>Live Telemetry Stream</span>
              <span>{recentEvents.length} Events</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 bg-slate-900/40 rounded-lg p-2 border border-slate-800/60 font-mono text-[10px]">
              {recentEvents.length === 0 ? (
                <span className="text-slate-500 italic block text-center py-2">No penalty events recorded yet</span>
              ) : (
                recentEvents.slice(0, 5).map(ev => (
                  <div key={ev.id} className="flex justify-between items-center text-slate-300">
                    <span className="text-amber-400">{ev.type}</span>
                    <span className="text-slate-500">{ev.durationMs ? `${ev.durationMs}ms` : ''} ({ev.time})</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Demonstration Trigger Buttons */}
          <div className="flex gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => recordAnomaly('FOCUS_LOST', 4000, 'DEMO_TEST')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
            >
              <Zap size={11} className="text-amber-400" /> Test Focus Penalty
            </button>
            <button
              onClick={() => recordAnomaly('ANSWER_TIMING_ANOMALY', 800, 'DEMO_TEST')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
            >
              <AlertTriangle size={11} className="text-rose-400" /> Test Fast Anomaly
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-xl backdrop-blur-xl transition-all duration-200 hover:scale-105 ${statusColor}`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${badgeColor} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${badgeColor}`}></span>
        </span>
        
        <span className="font-bold text-xs flex items-center gap-1.5">
          <ShieldCheck size={14} />
          {signals.isWindowFocused ? 'Monitoring Active' : 'Focus Lost'}
        </span>

        <span className="text-slate-500 text-[10px]">•</span>

        <span className="font-extrabold text-xs">
          {score}%
        </span>

        {expanded ? <ChevronDown size={14} className="opacity-70" /> : <ChevronUp size={14} className="opacity-70" />}
      </button>
    </div>
  );
};

export default MonitoringWidget;
