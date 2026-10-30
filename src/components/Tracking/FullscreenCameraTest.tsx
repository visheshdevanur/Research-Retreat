import React, { useRef, useEffect } from 'react';
import { HandTrackingState, OperatorSettings } from '../../types';
import { X, CheckCircle2, AlertCircle, Sliders, Camera, RefreshCw } from 'lucide-react';

interface FullscreenCameraTestProps {
  trackingState: HandTrackingState;
  settings: OperatorSettings;
  onUpdateSettings: (newSettings: Partial<OperatorSettings>) => void;
  onClose: () => void;
  availableCameras: MediaDeviceInfo[];
  cameraStream: MediaStream | null;
}

export const FullscreenCameraTest: React.FC<FullscreenCameraTestProps> = ({
  trackingState,
  settings,
  onUpdateSettings,
  onClose,
  availableCameras,
  cameraStream,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach shared webcam stream to test video
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((e) => console.warn('Test video play warning:', e));
    }
  }, [cameraStream]);

  // Draw Live Skeleton & Calibration Target on Canvas Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Target Activation Boundary
    const tx = settings.targetX * w;
    const ty = settings.targetY * h;
    const tr = settings.targetRadius * w;

    // Target boundary ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.lineWidth = trackingState.aligned ? 4 : 2;
    ctx.strokeStyle = trackingState.aligned
      ? 'rgba(217, 165, 46, 0.95)'
      : 'rgba(0, 210, 255, 0.6)';
    ctx.setLineDash(trackingState.aligned ? [] : [10, 6]);
    ctx.shadowColor = trackingState.aligned ? '#D9A52E' : '#00D2FF';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Target center reticle
    ctx.save();
    ctx.strokeStyle = trackingState.aligned ? '#FFFFFF' : '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx - 20, ty);
    ctx.lineTo(tx + 20, ty);
    ctx.moveTo(tx, ty - 20);
    ctx.lineTo(tx, ty + 20);
    ctx.stroke();
    ctx.restore();

    // 2. Draw Hand Landmark Skeleton
    if (trackingState.landmarks && trackingState.landmarks.length === 21) {
      const lms = trackingState.landmarks;

      // Finger bones connection chains
      const chains = [
        [0, 1, 2, 3, 4], // Thumb
        [0, 5, 6, 7, 8], // Index
        [0, 9, 10, 11, 12], // Middle
        [0, 13, 14, 15, 16], // Ring
        [0, 17, 18, 19, 20], // Pinky
        [5, 9, 13, 17], // Metacarpal bridge
      ];

      // Draw bones
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = trackingState.aligned ? '#D9A52E' : '#00D2FF';
      ctx.shadowColor = trackingState.aligned ? '#EAD29A' : '#38BDF8';
      ctx.shadowBlur = 10;

      chains.forEach((chain) => {
        ctx.beginPath();
        chain.forEach((idx, i) => {
          const pt = lms[idx];
          const px = pt.x * w;
          const py = pt.y * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
      ctx.restore();

      // Draw landmark joints
      lms.forEach((lm, idx) => {
        const px = lm.x * w;
        const py = lm.y * h;
        const isTip = [4, 8, 12, 16, 20].includes(idx);

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, isTip ? 7 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isTip
          ? trackingState.aligned
            ? '#FFFFFF'
            : '#EAD29A'
          : trackingState.aligned
          ? '#D9A52E'
          : '#38BDF8';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // 3. Draw Palm Center Marker
      const px = trackingState.palmCenter.x * w;
      const py = trackingState.palmCenter.y * h;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = trackingState.aligned ? '#10B981' : '#F59E0B';
      ctx.shadowColor = trackingState.aligned ? '#10B981' : '#F59E0B';
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = trackingState.aligned ? '#10B981' : '#F59E0B';
      ctx.fill();
      ctx.restore();
    }
  }, [trackingState, settings.targetX, settings.targetY, settings.targetRadius]);

  // State styling helper
  const getStateBadge = () => {
    switch (trackingState.detectionState) {
      case 'WAITING_FOR_CAMERA':
        return { label: 'WAITING FOR CAMERA', bg: 'bg-amber-500/30 text-amber-300 border-amber-500' };
      case 'CAMERA_READY':
        return { label: 'CAMERA READY • WAVE HAND IN FRONT', bg: 'bg-sky-500/30 text-sky-300 border-sky-500' };
      case 'HAND_DETECTED':
        return { label: 'HAND DETECTED', bg: 'bg-electric-500/30 text-electric-300 border-electric-500' };
      case 'ALIGN_YOUR_HAND':
        return { label: 'ALIGN PALM INSIDE CIRCLE', bg: 'bg-amber-500/40 text-amber-300 border-amber-500 animate-pulse' };
      case 'HOLD_YOUR_HAND_STEADY':
        return { label: 'PALM ALIGNED • HOLD STEADY', bg: 'bg-emerald-500/40 text-emerald-300 border-emerald-500' };
      case 'ACTIVATING':
        return {
          label: `ACTIVATING • ${Math.round(trackingState.holdProgress * 100)}%`,
          bg: 'bg-gold-500/40 text-gold-300 border-gold-400 font-bold',
        };
      case 'ACTIVATED':
        return { label: 'INAUGURATION ACTIVATED!', bg: 'bg-white text-midnight-900 border-white font-black' };
      default:
        return { label: 'UNKNOWN', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-6 select-none animate-fade-in text-slate-200">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-base font-cinematic font-bold tracking-widest text-gold-300">
              WEBCAM & HAND TRACKING REAL-TIME TEST
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Hardware Verification & Calibration Mode
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-5 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider ${badge.bg}`}>
          {badge.label}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Close Test Mode
        </button>
      </div>

      {/* Main Video & Live Skeleton Stage */}
      <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border-2 border-gold-500/60 shadow-[0_0_50px_rgba(0,210,255,0.25)] bg-slate-950 flex items-center justify-center my-auto">
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover ${settings.mirrorCamera ? '-scale-x-100' : ''}`}
        />

        {/* 2D Overlay Canvas for Skeleton & Reticle */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Hold Progress Bar Overlay */}
        {trackingState.holdProgress > 0 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-80 bg-slate-900/90 border border-gold-400 rounded-full p-1.5 shadow-2xl backdrop-blur-md">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-gold-500 to-amber-300 transition-all duration-75"
              style={{ width: `${Math.round(trackingState.holdProgress * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom Live Calibration Controls */}
      <div className="w-full max-w-4xl p-4 rounded-xl bg-midnight-900/95 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        {/* Camera Selector */}
        <div>
          <label className="text-slate-400 block mb-1">Webcam Source:</label>
          <select
            value={settings.selectedDeviceId}
            onChange={(e) => onUpdateSettings({ selectedDeviceId: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-200 text-xs"
          >
            <option value="">Default Camera</option>
            {availableCameras.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Camera ${cam.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>

        {/* Target Position X Slider */}
        <div>
          <label className="text-slate-400 block mb-1">Target X: {Math.round(settings.targetX * 100)}%</label>
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.01"
            value={settings.targetX}
            onChange={(e) => onUpdateSettings({ targetX: parseFloat(e.target.value) })}
            className="w-full accent-gold-500"
          />
        </div>

        {/* Target Position Y Slider */}
        <div>
          <label className="text-slate-400 block mb-1">Target Y: {Math.round(settings.targetY * 100)}%</label>
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.01"
            value={settings.targetY}
            onChange={(e) => onUpdateSettings({ targetY: parseFloat(e.target.value) })}
            className="w-full accent-gold-500"
          />
        </div>

        {/* Target Radius Slider */}
        <div>
          <label className="text-slate-400 block mb-1">Target Size: {Math.round(settings.targetRadius * 100)}%</label>
          <input
            type="range"
            min="0.08"
            max="0.3"
            step="0.01"
            value={settings.targetRadius}
            onChange={(e) => onUpdateSettings({ targetRadius: parseFloat(e.target.value) })}
            className="w-full accent-gold-500"
          />
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2">
        <span>FPS: <strong className="text-gold-300">{trackingState.fps}</strong></span>
        <span>Resolution: <strong className="text-slate-200">{trackingState.videoResolution.width}×{trackingState.videoResolution.height}</strong></span>
        <span>Confidence: <strong className="text-emerald-400">{Math.round(trackingState.confidence * 100)}%</strong></span>
        <span>Palm Center: <strong className="text-sky-300">({trackingState.palmCenter.x.toFixed(2)}, {trackingState.palmCenter.y.toFixed(2)})</strong></span>
        <span>Detector: <strong className="text-gold-300">{settings.detectorStatus}</strong></span>
      </div>
    </div>
  );
};
