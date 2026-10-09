import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Eye, Video, Camera, Cpu } from 'lucide-react';
import { ComputerVisionProctorEngine } from '../services/ComputerVisionProctorEngine';

const ComputerVisionWebcam = ({ 
  onAnomaly, 
  onViolationStrike,
  isActive = true,
  className = ""
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [streamReady, setStreamReady] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [cvTelemetry, setCvTelemetry] = useState({
    faceDetected: false,
    faceCount: 0,
    confidence: 0,
    gaze: 'UNKNOWN',
    distance: 'UNKNOWN',
    engineMode: 'INITIALIZING',
    fps: 0,
    absenceDurationMs: 0
  });

  // Handle status updates from CV Engine
  const handleStatusUpdate = useCallback((status) => {
    setCvTelemetry(status);
  }, []);

  // Handle anomaly events dispatched by CV Engine
  const handleAnomaly = useCallback((type, durationMs, reason) => {
    console.warn(`[CV Proctor] Anomaly detected: ${type} (${durationMs}ms) - ${reason}`);
    if (onAnomaly) {
      onAnomaly(type, durationMs, reason);
    }
    if (onViolationStrike && (type === 'FACE_ABSENT' || reason === 'CV_MULTIPLE_FACES_DETECTED')) {
      onViolationStrike(reason);
    }
  }, [onAnomaly, onViolationStrike]);

  // 1. Initialize Webcam Stream
  useEffect(() => {
    if (!isActive) return;

    let mediaStream = null;

    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStreamReady(true);
          };
        }
      } catch (err) {
        console.error("[CV Proctor] Failed to acquire camera stream:", err);
        setPermissionError("Camera access required for proctored integrity verification.");
        if (onAnomaly) {
          onAnomaly('MONITOR_UNAVAILABLE', 0, 'CAMERA_PERMISSION_DENIED');
        }
      }
    };

    startCamera();

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, onAnomaly]);

  // 2. Start Computer Vision Engine when Video is ready
  useEffect(() => {
    if (!streamReady || !videoRef.current || !canvasRef.current || !isActive) return;

    const engine = new ComputerVisionProctorEngine(videoRef.current, canvasRef.current, {
      fpsLimit: 24,
      faceAbsenceThresholdMs: 5000,
      multiFaceThresholdMs: 2500,
      gazeDeviationThresholdMs: 3500,
      onStatusUpdate: handleStatusUpdate,
      onAnomaly: handleAnomaly
    });

    engine.start();
    engineRef.current = engine;

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [streamReady, isActive, handleStatusUpdate, handleAnomaly]);

  // Formatting helpers
  const isHealthy = cvTelemetry.faceDetected && cvTelemetry.faceCount === 1 && cvTelemetry.gaze === 'CENTERED';
  const isWarning = cvTelemetry.faceDetected && (cvTelemetry.gaze !== 'CENTERED' || cvTelemetry.distance !== 'OPTIMAL');
  const isViolation = !cvTelemetry.faceDetected || cvTelemetry.faceCount > 1;

  return (
    <div className={`bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl overflow-hidden relative ${className}`}>
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-400 border border-rose-500/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>REC</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <Cpu size={12} />
            <span>AI-CV: {cvTelemetry.fps} FPS</span>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
          isHealthy ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
          isWarning ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
          'text-rose-400 bg-rose-500/10 border-rose-500/30'
        }`}>
          {isHealthy ? 'Candidate Verified' : isWarning ? 'Gaze Alert' : 'Integrity Flag'}
        </span>
      </div>

      {/* Video & CV Overlay Container */}
      <div className="rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 relative shadow-inner">
        {permissionError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-rose-950/30 text-rose-400">
            <Video size={36} className="mb-2 text-rose-500" />
            <p className="text-xs font-bold">{permissionError}</p>
          </div>
        ) : (
          <>
            {/* Raw Webcam Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Dynamic Real-Time Computer Vision Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
            />
          </>
        )}
      </div>

      {/* Real-Time CV Telemetry Stats Strip */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-1.5">
          <span className="text-slate-500 block text-[9px] uppercase">Face Track</span>
          <span className={`font-bold ${cvTelemetry.faceDetected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {cvTelemetry.faceDetected ? `${cvTelemetry.faceCount} Face (${Math.round(cvTelemetry.confidence * 100)}%)` : 'None'}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-1.5">
          <span className="text-slate-500 block text-[9px] uppercase">Head Gaze</span>
          <span className={`font-bold ${
            cvTelemetry.gaze === 'CENTERED' ? 'text-emerald-400' : 
            cvTelemetry.gaze === 'UNKNOWN' ? 'text-slate-400' : 'text-amber-400'
          }`}>
            {cvTelemetry.gaze.replace('_', ' ')}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-1.5">
          <span className="text-slate-500 block text-[9px] uppercase">Distance</span>
          <span className={`font-bold ${
            cvTelemetry.distance === 'OPTIMAL' ? 'text-emerald-400' :
            cvTelemetry.distance === 'UNKNOWN' ? 'text-slate-400' : 'text-amber-400'
          }`}>
            {cvTelemetry.distance}
          </span>
        </div>
      </div>

      {/* Warning Notice If Face Is Absent */}
      {!cvTelemetry.faceDetected && streamReady && (
        <div className="mt-2 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2 text-rose-400 text-xs flex items-center gap-1.5 animate-pulse">
          <AlertTriangle size={14} className="shrink-0" />
          <span>No face in camera frame! Maintain eye contact with screen.</span>
        </div>
      )}

      {cvTelemetry.faceCount > 1 && (
        <div className="mt-2 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2 text-rose-400 text-xs flex items-center gap-1.5 animate-pulse">
          <AlertTriangle size={14} className="shrink-0" />
          <span>Multiple individuals detected in frame! Session violation logged.</span>
        </div>
      )}

      <p className="text-center text-[10px] text-slate-500 mt-2 font-semibold flex items-center justify-center gap-1">
        <ShieldCheck size={12} className="text-indigo-400" />
        Computer Vision Proctoring Active • Continuous Facial Mesh Analysis
      </p>

    </div>
  );
};

export default ComputerVisionWebcam;
