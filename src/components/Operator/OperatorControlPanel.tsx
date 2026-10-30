import React from 'react';
import {
  X,
  Play,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Camera,
  Sliders,
  Layers,
  Sparkles,
  Zap,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Video,
  FastForward,
  Image as ImageIcon,
} from 'lucide-react';
import { InaugurationPhase, OperatorSettings, HandTrackingState, VideoAudioPolicy } from '../../types';
import { soundEngine } from '../../audio/SoundEngine';

interface OperatorControlPanelProps {
  settings: OperatorSettings;
  trackingState: HandTrackingState;
  onUpdateSettings: (newSettings: Partial<OperatorSettings>) => void;
  currentPhase: InaugurationPhase;
  onJumpToPhase: (phase: InaugurationPhase) => void;
  onManualTrigger: () => void;
  onReset: () => void;
  onOpenTestMode: () => void;
  availableCameras: MediaDeviceInfo[];
}

export const OperatorControlPanel: React.FC<OperatorControlPanelProps> = ({
  settings,
  trackingState,
  onUpdateSettings,
  currentPhase,
  onJumpToPhase,
  onManualTrigger,
  onReset,
  onOpenTestMode,
  availableCameras,
}) => {
  if (!settings.isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen error:', err);
      });
    }
  };

  const handleMuteToggle = () => {
    const nextMute = !settings.soundMuted;
    soundEngine.setMuted(nextMute);
    onUpdateSettings({ soundMuted: nextMute });
  };

  const handleVolumeChange = (vol: number) => {
    soundEngine.setVolume(vol);
    onUpdateSettings({ soundVolume: vol });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-midnight-900 border-2 border-gold-500/80 rounded-2xl shadow-[0_0_60px_rgba(217,165,46,0.4)] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-midnight-800 border-b border-institutional-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-gold-400 animate-pulse" />
            <div>
              <h2 className="text-base font-cinematic font-bold tracking-wider text-gold-300">
                MASTER CEREMONY OPERATOR & DIAGNOSTICS CONSOLE
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                MRF Research Retreat 2026 • Hotkey: [Ctrl + Shift + P]
              </p>
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ isOpen: false })}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* 1. EMERGENCY BACKUP MANUAL ACTIVATION TRIGGER */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-gold-500/20 via-gold-500/10 to-transparent border border-gold-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-cinematic font-bold text-gold-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold-400" />
                EMERGENCY MANUAL TRIGGER
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Instantly trigger the inauguration sequence if the guest's hand alignment is difficult.
              </p>
            </div>
            <button
              onClick={() => {
                onUpdateSettings({ isOpen: false });
                onManualTrigger();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-midnight-900 font-cinematic font-black tracking-wider shadow-[0_0_25px_rgba(217,165,46,0.6)] active:scale-95 transition-all text-sm whitespace-nowrap"
            >
              TRIGGER NOW
            </button>
          </div>

          {/* 2. DEDICATED WEBCAM TEST BUTTON */}
          <div className="p-4 rounded-xl bg-midnight-800/80 border border-electric-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-electric-400" />
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Full-Screen Camera & Landmark Skeleton Test
                </h4>
                <p className="text-[11px] font-mono text-slate-400">
                  Verify camera feed, test palm tracking, and calibrate target boundary in real-time.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onUpdateSettings({ isOpen: false });
                onOpenTestMode();
              }}
              className="px-4 py-2 rounded-lg bg-electric-500/20 hover:bg-electric-500/30 text-electric-300 border border-electric-400/50 text-xs font-mono font-semibold transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              OPEN CAMERA TEST
            </button>
          </div>

          {/* 3. LIVE DIAGNOSTICS & TELEMETRY */}
          <div className="p-4 rounded-xl bg-midnight-800/60 border border-institutional-700/50 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-electric-400" />
              Real-Time Hardware Diagnostics
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Detector Model</span>
                <span className="font-semibold text-gold-300 truncate block">{settings.detectorStatus}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Processing Rate</span>
                <span className="font-semibold text-white">{trackingState.fps} FPS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Resolution</span>
                <span className="font-semibold text-slate-200">
                  {trackingState.videoResolution.width}×{trackingState.videoResolution.height}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Detection State</span>
                <span className={`font-semibold ${trackingState.aligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {trackingState.detectionState}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Hand Detected</span>
                <span className="font-semibold text-white">{trackingState.detected ? 'YES (1 Hand)' : 'NO'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Palm Position</span>
                <span className="font-semibold text-sky-300">
                  ({trackingState.palmCenter.x.toFixed(2)}, {trackingState.palmCenter.y.toFixed(2)})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Confidence</span>
                <span className="font-semibold text-emerald-400">{Math.round(trackingState.confidence * 100)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Hold Progress</span>
                <span className="font-semibold text-gold-300">{Math.round(trackingState.holdProgress * 100)}%</span>
              </div>
            </div>

            {settings.lastError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Error: {settings.lastError}</span>
              </div>
            )}
          </div>

          {/* 4. CALIBRATION SLIDERS */}
          <div className="space-y-3 p-4 rounded-xl bg-midnight-800/60 border border-institutional-700/50">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-electric-400" />
              Target Position & Calibration Settings
            </h4>

            {/* Camera Selector */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Select Hardware Webcam:</label>
              <select
                value={settings.selectedDeviceId}
                onChange={(e) => onUpdateSettings({ selectedDeviceId: e.target.value })}
                className="w-full bg-midnight-900 border border-slate-700 rounded p-2 text-xs font-mono text-slate-200"
              >
                <option value="">Default System Webcam</option>
                {availableCameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>

            {/* Mirror Camera */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700 cursor-pointer">
              <span className="text-xs font-mono">Mirror Camera Horizontal (User-Facing)</span>
              <input
                type="checkbox"
                checked={settings.mirrorCamera}
                onChange={(e) => onUpdateSettings({ mirrorCamera: e.target.checked })}
                className="rounded accent-gold-500"
              />
            </label>

            {/* Target Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Target X:</span>
                  <span className="text-gold-300 font-semibold">{Math.round(settings.targetX * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.01"
                  value={settings.targetX}
                  onChange={(e) => onUpdateSettings({ targetX: parseFloat(e.target.value) })}
                  className="w-full accent-gold-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Target Y:</span>
                  <span className="text-gold-300 font-semibold">{Math.round(settings.targetY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.01"
                  value={settings.targetY}
                  onChange={(e) => onUpdateSettings({ targetY: parseFloat(e.target.value) })}
                  className="w-full accent-gold-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Target Size:</span>
                  <span className="text-gold-300 font-semibold">{Math.round(settings.targetRadius * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.08"
                  max="0.3"
                  step="0.01"
                  value={settings.targetRadius}
                  onChange={(e) => onUpdateSettings({ targetRadius: parseFloat(e.target.value) })}
                  className="w-full accent-gold-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Hold Duration */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Required Hold Duration:</span>
                <span className="text-gold-300 font-semibold">{settings.requiredHoldSeconds}s</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={settings.requiredHoldSeconds}
                onChange={(e) => onUpdateSettings({ requiredHoldSeconds: parseFloat(e.target.value) })}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 5. VIDEO SEQUENCE & PLAYBACK CONTROLS */}
          <div className="space-y-4 p-4 rounded-xl bg-midnight-800/80 border border-institutional-700/70">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Video className="w-4 h-4 text-electric-400" />
                Two-Video Sequential Playback Engine
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onJumpToPhase('PHASE_VIDEO_01')}
                  className="px-3 py-1 rounded bg-[#147BFF]/30 border border-[#42D9FF]/60 hover:bg-[#147BFF]/50 text-white font-mono text-xs flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3 text-[#42D9FF]" />
                  Play Sequence
                </button>
                {(currentPhase === 'PHASE_VIDEO_01' || currentPhase === 'PHASE_VIDEO_02') && (
                  <button
                    onClick={() => {
                      if (currentPhase === 'PHASE_VIDEO_01') onJumpToPhase(settings.video02Enabled && settings.video02Src ? 'PHASE_VIDEO_02' : 'PHASE_F_FINAL');
                      else if (currentPhase === 'PHASE_VIDEO_02') onJumpToPhase('PHASE_F_FINAL');
                    }}
                    className="px-3 py-1 rounded bg-amber-500/25 border border-amber-400/60 hover:bg-amber-500/40 text-amber-200 font-mono text-xs flex items-center gap-1.5 transition-all"
                  >
                    <FastForward className="w-3 h-3 text-amber-400" />
                    Skip Video (Hotkey: N)
                  </button>
                )}
              </div>
            </div>

            {/* Video Slot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* VIDEO 01 */}
              <div className={`p-3 rounded-lg border text-xs font-mono ${currentPhase === 'PHASE_VIDEO_01' ? 'border-[#42D9FF] bg-[#147BFF]/20 shadow-[0_0_15px_rgba(66,217,255,0.3)]' : 'border-slate-700 bg-midnight-900/60'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    VIDEO 1 (video 1.mp4)
                  </span>
                  <button
                    onClick={() => onJumpToPhase('PHASE_VIDEO_01')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    Play
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 truncate mb-1" title={settings.video01Src}>
                  {settings.video01Src}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Status:</span>
                  <span className={currentPhase === 'PHASE_VIDEO_01' ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                    {currentPhase === 'PHASE_VIDEO_01' ? '▶ PLAYING' : 'READY'}
                  </span>
                </div>
              </div>

              {/* VIDEO 02 */}
              <div className={`p-3 rounded-lg border text-xs font-mono ${currentPhase === 'PHASE_VIDEO_02' ? 'border-[#42D9FF] bg-[#147BFF]/20 shadow-[0_0_15px_rgba(66,217,255,0.3)]' : 'border-slate-700 bg-midnight-900/60'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    VIDEO 2 (video 2.mp4)
                  </span>
                  <button
                    onClick={() => onJumpToPhase('PHASE_VIDEO_02')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    Play
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 truncate mb-1" title={settings.video02Src}>
                  {settings.video02Src}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Status:</span>
                  <span className={currentPhase === 'PHASE_VIDEO_02' ? 'text-indigo-300 font-bold' : 'text-slate-400'}>
                    {currentPhase === 'PHASE_VIDEO_02' ? '▶ PLAYING' : 'READY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Audio Policy & Final Screen Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Video Audio Behaviour:</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'keep_music', label: 'Play Music (Default)' },
                    { id: 'duck_music', label: 'Duck (25%)' },
                    { id: 'pause_music', label: 'Pause Music' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdateSettings({ videoAudioPolicy: opt.id as VideoAudioPolicy })}
                      className={`px-2.5 py-1 rounded text-[11px] border transition-all ${
                        settings.videoAudioPolicy === opt.id
                          ? 'bg-[#147BFF]/40 border-[#42D9FF] text-white font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Final Static Screen Ending:</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'rendered', label: 'Rendered Layout' },
                    { id: 'static_image', label: 'Static Image (Indefinite)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdateSettings({ finalScreenMode: opt.id as 'rendered' | 'static_image' })}
                      className={`px-2.5 py-1 rounded text-[11px] border transition-all ${
                        settings.finalScreenMode === opt.id
                          ? 'bg-gold-500/30 border-gold-400 text-gold-200 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6. DIRECT PHASE NAVIGATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-electric-400" />
              Direct Phase Navigation (Current: <span className="text-gold-300 font-semibold">{currentPhase}</span>)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {[
                { id: 'PHASE_A_DORMANT', label: '1. Phase A: Dormant' },
                { id: 'PHASE_B_APPROACH', label: '2. Phase B: Tracking' },
                { id: 'PHASE_C_CONTACT', label: '3. Phase C: Contact' },
                { id: 'PHASE_D_BLAST', label: '4. Phase D: Grand Blast' },
                { id: 'PHASE_VIDEO_01', label: '5. Video 1 (video 1.mp4)' },
                { id: 'PHASE_VIDEO_02', label: '6. Video 2 (video 2.mp4)' },
                { id: 'PHASE_F_FINAL', label: '7. Phase F: Final Screen' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onJumpToPhase(p.id as InaugurationPhase)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    currentPhase === p.id
                      ? 'bg-gold-500/25 border-gold-400 text-gold-200 font-semibold shadow-[0_0_15px_rgba(217,165,46,0.25)]'
                      : 'bg-midnight-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={onReset}
                className="p-2.5 rounded-lg border border-red-500/50 bg-red-950/30 text-red-300 hover:bg-red-900/40 text-left transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All (Phase A)
              </button>
            </div>
          </div>

          {/* 6. AUDIO & VOLUME */}
          <div className="space-y-3 p-4 rounded-xl bg-midnight-800/60 border border-institutional-700/50">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-electric-400" />
                Procedural Sound Synthesis Controls
              </span>
              <button
                onClick={handleMuteToggle}
                className={`text-xs px-2.5 py-1 rounded flex items-center gap-1 ${
                  settings.soundMuted ? 'bg-red-900/50 text-red-300' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {settings.soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {settings.soundMuted ? 'UNMUTE' : 'MUTE'}
              </button>
            </h4>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Master Volume:</span>
                <span className="text-gold-300 font-semibold">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 7. FULLSCREEN & HOTKEYS */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 rounded-lg bg-institutional-800/80 hover:bg-institutional-700 text-slate-200 font-mono text-xs flex items-center gap-2 border border-institutional-600 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-electric-400" />
              Toggle 1920×1080 Fullscreen
            </button>
            <div className="text-[11px] font-mono text-slate-400">
              Hotkeys: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-gold-300">T</kbd> Camera Test • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-gold-300">Space</kbd> Emergency Trigger • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-gold-300">Ctrl+Shift+P</kbd> Console
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
