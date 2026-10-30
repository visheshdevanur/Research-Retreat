import React, { useRef, useEffect } from 'react';
import { HandTrackingState, OperatorSettings } from '../../types';

interface CameraDebugOverlayProps {
  trackingState: HandTrackingState;
  settings: OperatorSettings;
}

export const CameraDebugOverlay: React.FC<CameraDebugOverlayProps> = ({
  trackingState,
  settings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const targetX = canvas.width * settings.targetX;
    const targetY = canvas.height * settings.targetY;
    const targetR = settings.targetRadius * canvas.width;

    // Target boundary
    ctx.strokeStyle = trackingState.aligned ? '#D9A52E' : 'rgba(0, 210, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(targetX, targetY, targetR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair
    ctx.strokeStyle = trackingState.aligned ? '#FFFFFF' : 'rgba(0, 210, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(targetX - 10, targetY);
    ctx.lineTo(targetX + 10, targetY);
    ctx.moveTo(targetX, targetY - 10);
    ctx.lineTo(targetX, targetY + 10);
    ctx.stroke();

    // Hand Skeleton
    if (trackingState.landmarks && trackingState.landmarks.length === 21) {
      const lms = trackingState.landmarks;
      const chains = [
        [0, 1, 2, 3, 4],
        [0, 5, 6, 7, 8],
        [0, 9, 10, 11, 12],
        [0, 13, 14, 15, 16],
        [0, 17, 18, 19, 20],
        [5, 9, 13, 17],
      ];

      ctx.strokeStyle = trackingState.aligned ? 'rgba(217, 165, 46, 0.9)' : 'rgba(0, 210, 255, 0.7)';
      ctx.lineWidth = 2.5;
      chains.forEach((chain) => {
        ctx.beginPath();
        chain.forEach((idx, i) => {
          const x = lms[idx].x * canvas.width;
          const y = lms[idx].y * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      lms.forEach((lm, idx) => {
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, idx % 4 === 0 ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = idx % 4 === 0 ? '#EAD29A' : '#38BDF8';
        ctx.fill();
      });

      // Palm Center
      const px = trackingState.palmCenter.x * canvas.width;
      const py = trackingState.palmCenter.y * canvas.height;

      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.strokeStyle = trackingState.aligned ? '#10B981' : '#F59E0B';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [trackingState, settings.targetX, settings.targetY, settings.targetRadius]);

  if (!settings.showCameraPreview) return null;

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-midnight-800/90 border border-institutional-700/80 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden z-40">
      <div className="px-3 py-2 bg-midnight-900/90 border-b border-institutional-700/50 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
          Webcam Diagnostics
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
          trackingState.aligned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {trackingState.detectionState}
        </span>
      </div>

      <div className="relative aspect-video w-full bg-black/60 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-full object-contain"
        />

        {!trackingState.detected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-mono text-slate-400 tracking-wider">
              No hand in view
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 space-y-1.5 text-[10px] font-mono text-slate-300">
        <div className="flex justify-between">
          <span>FPS: {trackingState.fps}</span>
          <span>Hold: {Math.round(trackingState.holdProgress * 100)}%</span>
          <span>Status: {settings.detectorStatus}</span>
        </div>
      </div>
    </div>
  );
};
