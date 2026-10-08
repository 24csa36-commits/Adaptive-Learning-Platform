import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const MonitoringContext = createContext();

const API_BASE = 'http://localhost:8080/api/monitoring';

export const MonitoringProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 1;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [engagementData, setEngagementData] = useState({
    engagementScore: 100.0,
    monitoringCoverage: '100%',
    integrityStatus: 'VALIDATED',
    reasonCodes: [],
    signalBreakdown: {}
  });

  const [signals, setSignals] = useState({
    focusLossCount: 0,
    focusLostDurationMs: 0,
    idleDurationMs: 0,
    isWindowFocused: true,
    isUserActive: true,
    anomalyCount: 0
  });

  const [recentEvents, setRecentEvents] = useState([]);

  // Internal buffers & timers
  const pendingEventsRef = useRef([]);
  const sessionRef = useRef(null);
  const focusLossStartRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const idleCheckIntervalRef = useRef(null);
  const flushIntervalRef = useRef(null);
  const scoreIntervalRef = useRef(null);

  // Helper to format ISO timestamp without milliseconds offset issues
  const getIsoTimestamp = () => new Date().toISOString().split('.')[0];

  // 1. Flush queued events to backend
  const flushEvents = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || pendingEventsRef.current.length === 0) return;

    const eventsToShip = [...pendingEventsRef.current];
    pendingEventsRef.current = [];

    try {
      await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          events: eventsToShip
        })
      });
    } catch (err) {
      console.warn('[MonitoringLayer] Failed to flush events, requeuing:', err);
      // Re-add unsent events if safe
      pendingEventsRef.current = [...eventsToShip, ...pendingEventsRef.current];
    }
  }, []);

  // 2. Fetch latest engagement score
  const refreshEngagement = useCallback(async (sessionIdOverride) => {
    const sId = sessionIdOverride || sessionRef.current?.id;
    if (!sId) return;

    try {
      const res = await fetch(`${API_BASE}/sessions/${sId}/engagement`);
      if (res.ok) {
        const data = await res.json();
        setEngagementData(prev => ({
          ...prev,
          engagementScore: data.engagementScore !== undefined ? Math.round(data.engagementScore) : prev.engagementScore,
          monitoringCoverage: data.monitoringCoverage || prev.monitoringCoverage,
          integrityStatus: data.integrityStatus || (data.engagementScore < 50 ? 'FLAGGED' : 'VALIDATED'),
          reasonCodes: data.reasonCodes || [],
          signalBreakdown: data.signalBreakdown || {}
        }));
      }
    } catch (err) {
      // Soft fail
    }
  }, []);

  // 3. Queue an event
  const queueEvent = useCallback((type, durationMs, source = 'CLIENT_TELEMETRY') => {
    const session = sessionRef.current;
    if (!session) return;

    const event = {
      type,
      startTs: getIsoTimestamp(),
      durationMs: Math.max(0, Math.round(durationMs)),
      context: session.context || 'LEARNING',
      source
    };

    pendingEventsRef.current.push(event);
    setRecentEvents(prev => [
      { id: Date.now() + Math.random(), ...event, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19)
    ]);
  }, []);

  // 4. Start Monitoring Session
  const startSession = useCallback(async ({ courseId = 1, lessonId = 1, context = 'LEARNING' } = {}) => {
    try {
      // If already running, close existing first
      if (sessionRef.current) {
        await closeSession();
      }

      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          lessonId,
          context
        })
      });

      if (res.ok) {
        const session = await res.json();
        sessionRef.current = session;
        setCurrentSession(session);
        setIsMonitoring(true);
        lastActivityRef.current = Date.now();

        // Reset signal counters for fresh session
        setSignals({
          focusLossCount: 0,
          focusLostDurationMs: 0,
          idleDurationMs: 0,
          isWindowFocused: true,
          isUserActive: true,
          anomalyCount: 0
        });

        // Set up background flush interval (every 10s)
        flushIntervalRef.current = setInterval(flushEvents, 10000);

        // Set up score refresh interval (every 15s)
        scoreIntervalRef.current = setInterval(() => refreshEngagement(session.id), 15000);

        console.log(`[MonitoringLayer] Started session #${session.id} (${context})`);
        return session;
      }
    } catch (err) {
      console.error('[MonitoringLayer] Failed to start monitoring session:', err);
    }
  }, [userId, flushEvents, refreshEngagement]);

  // 5. Close Monitoring Session
  const closeSession = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    // Flush any pending events immediately
    await flushEvents();

    try {
      await fetch(`${API_BASE}/sessions/${session.id}/close`, {
        method: 'POST'
      });
      console.log(`[MonitoringLayer] Closed session #${session.id}`);
    } catch (err) {
      console.warn('[MonitoringLayer] Error closing session:', err);
    }

    if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);
    if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    if (idleCheckIntervalRef.current) clearInterval(idleCheckIntervalRef.current);

    sessionRef.current = null;
    setCurrentSession(null);
    setIsMonitoring(false);
  }, [flushEvents]);

  // 6. Record Timing Anomaly or Custom Proctoring Signal
  const recordAnomaly = useCallback((type = 'ANSWER_TIMING_ANOMALY', durationMs = 1500, source = 'CLIENT_PROCTOR') => {
    queueEvent(type, durationMs, source);
    setSignals(prev => ({
      ...prev,
      anomalyCount: prev.anomalyCount + 1
    }));
  }, [queueEvent]);

  // 7. Client Event Listeners for Focus and Inactivity
  useEffect(() => {
    if (!isMonitoring) return;

    // Focus Loss Handler
    const handleBlurOrHide = () => {
      setSignals(prev => ({ ...prev, isWindowFocused: false }));
      if (!focusLossStartRef.current) {
        focusLossStartRef.current = Date.now();
      }
    };

    const handleFocusOrShow = () => {
      setSignals(prev => ({ ...prev, isWindowFocused: true }));
      if (focusLossStartRef.current) {
        const duration = Date.now() - focusLossStartRef.current;
        focusLossStartRef.current = null;

        // Backend threshold: 3000ms for focus loss penalty
        if (duration >= 2500) {
          queueEvent('FOCUS_LOST', duration, 'CLIENT_WINDOW');
          setSignals(prev => ({
            ...prev,
            focusLossCount: prev.focusLossCount + 1,
            focusLostDurationMs: prev.focusLostDurationMs + duration
          }));
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBlurOrHide();
      } else {
        handleFocusOrShow();
      }
    };

    // Activity tracking (Mouse / Key / Touch)
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      setSignals(prev => (prev.isUserActive ? prev : { ...prev, isUserActive: true }));
    };

    // Idle monitor timer (checks every 5 seconds)
    idleCheckIntervalRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      // Inactivity threshold: 30,000ms (30 seconds)
      if (idleTime >= 30000) {
        setSignals(prev => ({
          ...prev,
          isUserActive: false,
          idleDurationMs: prev.idleDurationMs + 5000
        }));
        queueEvent('INACTIVE', 5000, 'CLIENT_IDLE_DETECTOR');
      }
    }, 5000);

    window.addEventListener('blur', handleBlurOrHide);
    window.addEventListener('focus', handleFocusOrShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener('blur', handleBlurOrHide);
      window.removeEventListener('focus', handleFocusOrShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);

      if (idleCheckIntervalRef.current) clearInterval(idleCheckIntervalRef.current);
    };
  }, [isMonitoring, queueEvent]);

  return (
    <MonitoringContext.Provider
      value={{
        isMonitoring,
        currentSession,
        engagementData,
        signals,
        recentEvents,
        startSession,
        closeSession,
        recordAnomaly,
        queueEvent,
        refreshEngagement
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
