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

      {/* Visual Effects Blast Engine */}
      <EnergyBlastVFX phase={phase} />

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

      {/* TOP HEADER: Only visible on Phase A / B / C */}
      {(phase === 'PHASE_A_DORMANT' || phase === 'PHASE_B_APPROACH' || phase === 'PHASE_C_CONTACT') && (
        <header className="relative z-30 pt-5 px-10 md:px-14 flex items-center justify-between pointer-events-none">
          {/* Left: Original Circular MIT Mysore Logo */}
          <div className="flex items-center">
            <CircularEmblem
              size="md"
              src="/assets/logos/mitm-circular.png"
              alt="Maharaja Institute of Technology Mysore"
              glow
            />
          </div>

          {/* Center: Editorial Event Typography */}
          <div className="text-center flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-cinematic font-semibold tracking-[0.4em] uppercase text-[#D6B56F] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              MAHARAJA RESEARCH FOUNDATION
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-cinematic tracking-[0.22em] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F8FAFF] to-[#D6B56F] drop-shadow-[0_2px_18px_rgba(66,217,255,0.5)] my-0.5">
              MRF RESEARCH RETREAT 2026
            </h2>
            <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.48em] uppercase text-[#42D9FF] font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              INAUGURATION CEREMONY
            </span>
          </div>

          {/* Right: Original Circular MRF Logo */}
          <div className="flex items-center">
            <CircularEmblem
              size="md"
              src="/assets/logos/mrf-circular.png"
              alt="Maharaja Research Foundation"
              glow
            />
          </div>
        </header>
      )}

      {/* MAIN INTERACTION STAGE */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center w-full px-4 my-auto">
        {(phase === 'PHASE_A_DORMANT' || phase === 'PHASE_B_APPROACH' || phase === 'PHASE_C_CONTACT') && (
          <div className="flex flex-col items-center justify-center w-full max-w-4xl">
            {/* Supporting Instruction Above Target */}
            <div className="text-center mb-1 space-y-1.5 pointer-events-none animate-float">
              <h1 className="text-2xl sm:text-3xl md:text-[34px] font-cinematic font-bold tracking-[0.16em] whitespace-nowrap text-[#F8FAFF] drop-shadow-[0_3px_20px_rgba(66,217,255,0.6)]">
                CHIEF GUEST, PLEASE PLACE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6B56F] via-[#FFFFFF] to-[#D6B56F]">YOUR HAND</span>
              </h1>
              <div className="inline-flex items-center px-6 py-1 rounded-full border border-[#42D9FF]/40 bg-[#071633]/85 backdrop-blur-md shadow-[0_0_15px_rgba(66,217,255,0.25)]">
                <p className="text-xs sm:text-sm font-sans tracking-[0.38em] text-[#42D9FF] font-medium uppercase">
                  ALIGN YOUR PALM WITH THE ILLUMINATED AREA
                </p>
              </div>
            </div>

            {/* Central Circular Portal & Dimensional Holographic Glass Hand */}
            <div className="relative w-full h-[470px] flex items-center justify-center">
              <HolographicHandTarget
                phase={phase}
                trackingState={trackingState}
                contactFingerIndex={contactFingerIndex}
                onTargetClick={() => onPhaseChange('PHASE_C_CONTACT')}
              />
            </div>

            {/* Floating Architectural Stage Platform */}
            <div className="relative -mt-4 w-full flex items-center justify-center z-10 pointer-events-none">
              <StagePlatform intensity={trackingState.holdProgress} />
            </div>
          </div>
        )}

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

      {/* BOTTOM FOOTER */}
      <footer className="relative z-30 pb-4 px-8 flex flex-col items-center justify-center">
        {renderBottomStatus()}
      </footer>

      {/* Secret Hotspot for Operator Console (Triple click) */}
      <div
        onClick={handleSecretClick}
        title="Triple-click for Operator Console (Ctrl+Shift+P)"
        className="fixed bottom-0 left-0 w-8 h-8 opacity-0 hover:opacity-10 cursor-pointer z-50 pointer-events-auto"
      />
    </div>
  );
};
