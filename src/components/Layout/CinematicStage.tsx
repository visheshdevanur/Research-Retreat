import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InaugurationPhase, HandTrackingState, OperatorSettings } from '../../types';
import { HolographicHandTarget } from '../HandTarget/HolographicHandTarget';
import { AuroraWaveBackground } from '../Background/AuroraWaveBackground';
import { StagePlatform } from '../Stage/StagePlatform';
import { CircularEmblem } from '../Common/CircularEmblem';
import { EnergyBlastVFX } from '../VFX/EnergyBlastVFX';
import { MITMysoreReveal } from '../InstitutionalReveal/MITMysoreReveal';
import { MRFReveal } from '../InstitutionalReveal/MRFReveal';
import { FinalInaugurationStage } from '../InstitutionalReveal/FinalInaugurationStage';
import { CinematicVideoPlayer } from '../VideoSequence/CinematicVideoPlayer';
import { soundEngine } from '../../audio/SoundEngine';
import { Hand } from 'lucide-react';

interface CinematicStageProps {
  phase: InaugurationPhase;
  trackingState: HandTrackingState;
  onPhaseChange: (phase: InaugurationPhase) => void;
  settings: OperatorSettings;
  onOpenOperatorPanel: () => void;
  onOpenTestMode: () => void;
}

export const CinematicStage: React.FC<CinematicStageProps> = ({
  phase,
  trackingState,
  onPhaseChange,
  settings,
  onOpenOperatorPanel,
  onOpenTestMode,
}) => {
  const [contactFingerIndex, setContactFingerIndex] = useState<number>(-1);
  const phaseTimerRef = useRef<number | null>(null);

  // Secret corner clicks for operator console
  const secretClickCount = useRef<number>(0);
  const secretClickTimeout = useRef<number | null>(null);

  const handleSecretClick = () => {
    secretClickCount.current += 1;
    if (secretClickTimeout.current) clearTimeout(secretClickTimeout.current);
    secretClickTimeout.current = window.setTimeout(() => {
      secretClickCount.current = 0;
    }, 1200);

    if (secretClickCount.current >= 3) {
      secretClickCount.current = 0;
      onOpenOperatorPanel();
    }
  };

  // Sound Engine sync for Phase A and B
  useEffect(() => {
    if (phase === 'PHASE_A_DORMANT') {
      soundEngine.startAmbientAtmosphere();
      soundEngine.updateScanningSound(false, 0);
    } else if (phase === 'PHASE_B_APPROACH') {
      soundEngine.updateScanningSound(trackingState.aligned, trackingState.holdProgress);
    } else {
      soundEngine.updateScanningSound(false, 0);
    }
  }, [phase, trackingState.aligned, trackingState.holdProgress]);

  // Phase transition sequencing
  useEffect(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }

    if (phase === 'PHASE_C_CONTACT') {
      soundEngine.playContactMoment();

      // Sequential 5-finger ignition (thumb to pinky)
      setContactFingerIndex(0);
      const fingerInterval = window.setInterval(() => {
        setContactFingerIndex((prev) => {
          if (prev >= 4) {
            clearInterval(fingerInterval);
            return 4;
          }
          return prev + 1;
        });
      }, 150);

      // Transition to Blast after finger ignition complete (900ms)
      phaseTimerRef.current = window.setTimeout(() => {
        clearInterval(fingerInterval);
        onPhaseChange('PHASE_D_BLAST');
      }, 900);
    } else if (phase === 'PHASE_D_BLAST') {
      soundEngine.playInaugurationBlast();

      // Grand Energy Blast detonation duration before transitioning DIRECTLY to video sequence
      phaseTimerRef.current = window.setTimeout(() => {
        if (settings.video01Enabled && settings.video01Src) {
          onPhaseChange('PHASE_VIDEO_01');
        } else if (settings.video02Enabled && settings.video02Src) {
          onPhaseChange('PHASE_VIDEO_02');
        } else {
          onPhaseChange('PHASE_F_FINAL');
        }
      }, 2600);
    } else if (phase === 'PHASE_E_MIT_REVEAL') {
      // Retained for manual operator inspection
      soundEngine.playMITRevealSound();
      phaseTimerRef.current = window.setTimeout(() => {
        onPhaseChange('PHASE_E_MRF_REVEAL');
      }, 3400);
    } else if (phase === 'PHASE_E_MRF_REVEAL') {
      soundEngine.playMRFRevealSound();
      phaseTimerRef.current = window.setTimeout(() => {
        onPhaseChange('PHASE_F_FINAL');
      }, 3600);
    } else if (phase === 'PHASE_F_FINAL') {
      if (settings.playMusicOnFinalScreen) {
        soundEngine.playFinalTriumphantBed();
      } else {
        soundEngine.stopAmbientAtmosphere();
      }
    }

    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [phase, onPhaseChange, settings]);

  // Render bottom status indicator (only during opening stage)
  const renderBottomStatus = () => {
    if (
      phase === 'PHASE_C_CONTACT' ||
      phase === 'PHASE_D_BLAST' ||
      phase === 'PHASE_VIDEO_01' ||
      phase === 'PHASE_VIDEO_02' ||
      phase === 'PHASE_VIDEO_03' ||
      phase === 'PHASE_E_MIT_REVEAL' ||
      phase === 'PHASE_E_MRF_REVEAL' ||
      phase === 'PHASE_F_FINAL'
    ) {
      return null;
    }

    let statusText = 'PLEASE PLACE YOUR HAND';
    let dotColor = 'bg-[#42D9FF] animate-pulse';

    switch (trackingState.detectionState) {
      case 'WAITING_FOR_CAMERA':
        statusText = 'INITIALIZING CAMERA SENSORS...';
        dotColor = 'bg-amber-400 animate-pulse';
        break;
      case 'CAMERA_READY':
        statusText = 'PLEASE PLACE YOUR HAND';
        dotColor = 'bg-[#42D9FF]';
        break;
      case 'HAND_DETECTED':
        statusText = 'HAND DETECTED • SCANNING PALM...';
        dotColor = 'bg-[#147BFF] animate-ping';
        break;
      case 'ALIGN_YOUR_HAND':
        statusText = 'ALIGN YOUR PALM • KEEP HAND OPEN';
        dotColor = 'bg-amber-400 animate-ping';
        break;
      case 'HOLD_YOUR_HAND_STEADY':
        statusText = 'ALIGNING PALM • HOLD STEADY';
        dotColor = 'bg-[#42D9FF] animate-pulse';
        break;
      case 'ACTIVATING':
        statusText =
          trackingState.holdProgress >= 0.95
            ? 'PALM VERIFIED • INITIATING INAUGURATION'
            : `SCANNING PALM... • ${Math.round(trackingState.holdProgress * 100)}%`;
        dotColor = trackingState.holdProgress >= 0.95 ? 'bg-[#D6B56F] animate-ping' : 'bg-[#42D9FF] animate-ping';
        break;
      case 'ACTIVATED':
        statusText = 'PALM VERIFIED • INITIATING INAUGURATION';
        dotColor = 'bg-white';
        break;
    }

    return (
      <div className="flex flex-col items-center space-y-1.5 pointer-events-none z-30">
        {/* Refined Pill Indicator */}
        <div className="px-6 py-1.5 rounded-full border border-[#42D9FF]/40 bg-[#071633]/90 backdrop-blur-md text-[11px] sm:text-[12px] font-mono tracking-[0.22em] uppercase text-[#F8FAFF] flex items-center gap-3 shadow-2xl transition-all duration-300">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="font-semibold">{statusText}</span>
        </div>

        {/* Dynamic Hold Progress Line */}
        {trackingState.holdProgress > 0 && (
          <div className="w-52 h-1.5 bg-[#071633]/90 rounded-full overflow-hidden border border-[#42D9FF]/40 shadow-lg">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#147BFF] via-[#42D9FF] to-[#D6B56F] transition-all duration-75 shadow-[0_0_12px_#42D9FF]"
              style={{ width: `${Math.round(trackingState.holdProgress * 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030718] text-[#F8FAFF] flex flex-col justify-between select-none">
      {/* Aurora Waves Background with Living Canvas Simulation */}
      <AuroraWaveBackground
        phase={phase}
        holdProgress={trackingState.holdProgress}
        intensity={
          phase === 'PHASE_C_CONTACT'
            ? 0.35
            : phase === 'PHASE_D_BLAST'
            ? 0.85
            : phase === 'PHASE_E_MIT_REVEAL' || phase === 'PHASE_E_MRF_REVEAL'
            ? 0.25
            : phase === 'PHASE_F_FINAL'
            ? 0.2
            : trackingState.holdProgress * 0.2
        }
      />

      {/* Visual Effects Blast Engine (Bold, Solid & Unique Quantum Ignition) */}
      <EnergyBlastVFX phase={phase} origin={{ x: 0.5, y: 0.526 }} />

      {/* Cinematic Dual-Channel Video Player with Broadcast Transitions */}
      <CinematicVideoPlayer
        phase={phase}
        video01Src={settings.video01Src}
        video02Src={settings.video02Src}
        videoAudioPolicy={settings.videoAudioPolicy}
        onPhaseChange={onPhaseChange}
        onSecretClick={handleSecretClick}
      />

      {/* Real-time Reticle for actual hand proximity */}
      {trackingState.detected && (phase === 'PHASE_A_DORMANT' || phase === 'PHASE_B_APPROACH') && (
        <div
          className="fixed pointer-events-none z-40 transition-all duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${trackingState.palmCenter.x * 100}%`,
            top: `${trackingState.palmCenter.y * 100}%`,
          }}
        >
          <div
            className={`w-20 h-20 rounded-full border-2 ${
              trackingState.aligned ? 'border-emerald-400 bg-emerald-500/15' : 'border-[#42D9FF] bg-[#42D9FF]/15'
            } animate-ping opacity-75`}
          />
          <div
            className={`absolute inset-0 m-auto w-12 h-12 rounded-full border-2 ${
              trackingState.aligned
                ? 'border-emerald-300 shadow-[0_0_20px_#10B981]'
                : 'border-[#42D9FF] shadow-[0_0_20px_#42D9FF]'
            } flex items-center justify-center backdrop-blur-md`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${trackingState.aligned ? 'bg-emerald-300' : 'bg-[#42D9FF]'}`} />
          </div>
          <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#071633]/95 border border-[#42D9FF]/70 text-[9px] font-mono tracking-widest text-[#F8FAFF] uppercase shadow-xl flex items-center gap-1">
            <Hand className="w-2.5 h-2.5 text-[#42D9FF] animate-pulse" />
            <span>{trackingState.aligned ? 'PALM LOCKED' : 'PALM DETECTED'}</span>
          </div>
        </div>
      )}

      {/* 4. MASTER 1080P PHASE A SCREEN (100% Matching Approved Reference) */}
      {(phase === 'PHASE_A_DORMANT' || phase === 'PHASE_B_APPROACH' || phase === 'PHASE_C_CONTACT') && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center select-none overflow-hidden z-20">
          <img
            src="/assets/phase_a_reference_screen.png"
            alt="MRF Research Retreat 2026 Phase A Inauguration Ceremony"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Interactive touch/click trigger area over palm center */}
          <div
            onClick={() => onPhaseChange('PHASE_C_CONTACT')}
            title="Click palm to activate inauguration"
            className="absolute left-1/2 top-[52.6%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full cursor-pointer z-30 opacity-0"
          />

          {/* Bold & Solid Biometric Charging Flare & Precision Radial Gauge */}
          {(trackingState.holdProgress > 0 || phase === 'PHASE_C_CONTACT') && (
            <div className="absolute left-1/2 top-[52.6%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-150 flex items-center justify-center">
              {/* Precision SVG Circular Gauge */}
              <svg className="w-44 h-44 -rotate-90 pointer-events-none overflow-visible">
                <defs>
                  <linearGradient id="gaugeGoldCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="50%" stopColor="#147BFF" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                  <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Background Ring Track */}
                <circle
                  cx="88"
                  cy="88"
                  r="68"
                  className="stroke-cyan-500/25 fill-none"
                  strokeWidth="3.5"
                />
                {/* Active Progress Arc */}
                <circle
                  cx="88"
                  cy="88"
                  r="68"
                  fill="none"
                  stroke="url(#gaugeGoldCyan)"
                  strokeWidth={phase === 'PHASE_C_CONTACT' ? 7 : 5}
                  strokeLinecap="round"
                  filter="url(#gaugeGlow)"
                  strokeDasharray={427.26}
                  strokeDashoffset={
                    phase === 'PHASE_C_CONTACT'
                      ? 0
                      : 427.26 * (1 - Math.min(1, trackingState.holdProgress))
                  }
                  className="transition-all duration-75"
                />
              </svg>

              {/* Bold Outer Rotating Precision Ring */}
              <div
                className={`absolute w-40 h-40 rounded-full border-2 ${
                  phase === 'PHASE_C_CONTACT'
                    ? 'border-[#D4AF37] shadow-[0_0_40px_#00E5FF,0_0_80px_#D4AF37] scale-110'
                    : 'border-[#00E5FF]/50 border-dashed animate-spin'
                } transition-transform duration-150`}
                style={{
                  opacity: phase === 'PHASE_C_CONTACT' ? 1 : 0.4 + trackingState.holdProgress * 0.6,
                }}
              />

              {/* Solid Quantum Core Light */}
              <div
                className={`absolute rounded-full transition-all duration-150 ${
                  phase === 'PHASE_C_CONTACT'
                    ? 'w-24 h-24 bg-white/95 shadow-[0_0_50px_#FFFFFF,0_0_80px_#00E5FF,0_0_120px_#D4AF37] scale-125'
                    : 'w-16 h-16 bg-gradient-to-r from-[#00E5FF] to-[#D4AF37] blur-sm animate-pulse'
                }`}
                style={{
                  opacity: phase === 'PHASE_C_CONTACT' ? 1 : trackingState.holdProgress * 0.85,
                  transform: phase === 'PHASE_C_CONTACT' ? 'scale(1.25)' : `scale(${0.8 + trackingState.holdProgress * 0.4})`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* MAIN INTERACTION STAGE (Institutional reveals & final stage) */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center w-full px-4 my-auto">
        {phase === 'PHASE_E_MIT_REVEAL' && <MITMysoreReveal />}
        {phase === 'PHASE_E_MRF_REVEAL' && <MRFReveal />}

        {phase === 'PHASE_F_FINAL' && (
          settings.finalScreenMode === 'static_image' ? (
            <div className="fixed inset-0 z-40 bg-black flex items-center justify-center select-none overflow-hidden animate-fade-in">
              <img
                src="/assets/final-screen.png"
                alt="MRF Research Retreat 2026 Inauguration Final Screen"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          ) : (
            <FinalInaugurationStage />
          )
        )}
      </main>

      {/* BOTTOM FOOTER (Live status progress when hand is detected/aligning) */}
      {trackingState.holdProgress > 0 && (
        <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center">
          {renderBottomStatus()}
        </footer>
      )}

      {/* Secret Hotspot for Operator Console (Triple click) */}
      <div
        onClick={handleSecretClick}
        title="Triple-click for Operator Console (Ctrl+Shift+P)"
        className="fixed bottom-0 left-0 w-8 h-8 opacity-0 hover:opacity-10 cursor-pointer z-50 pointer-events-auto"
      />
    </div>
  );
};
