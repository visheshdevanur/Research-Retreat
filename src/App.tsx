import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InaugurationPhase, HandTrackingState, OperatorSettings } from './types';
import { CinematicStage } from './components/Layout/CinematicStage';
import { HandTrackingManager } from './components/Tracking/HandTrackingManager';
import { CameraDebugOverlay } from './components/Tracking/CameraDebugOverlay';
import { FullscreenCameraTest } from './components/Tracking/FullscreenCameraTest';
import { OperatorControlPanel } from './components/Operator/OperatorControlPanel';
import { soundEngine } from './audio/SoundEngine';
import { Camera, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [phase, setPhase] = useState<InaugurationPhase>('PHASE_A_DORMANT');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  // Load saved calibration from localStorage
  const getInitialSettings = (): OperatorSettings => {
    const saved = localStorage.getItem('mrf_inauguration_calibration_v2');
    const defaultSettings: OperatorSettings = {
      isOpen: false,
      showCameraPreview: false,
      showFullscreenTestOverlay: false,
      showLandmarks: true,
      targetX: 0.5,
      targetY: 0.51,
      targetRadius: 0.16,
      requiredHoldSeconds: 1.8,
      soundMuted: false,
      soundVolume: 0.85,
      mirrorCamera: true,
      selectedDeviceId: '',
      detectorStatus: 'Initializing WASM...',
      lastError: null,

      // Video and Audio Policy (Background music continuous through videos)
      videoAudioPolicy: 'keep_music',
      video01Src: '/assets/videos/video-01.mp4',
      video02Src: '/assets/videos/video-02.mp4',
      video03Src: '',
      video01Enabled: true,
      video02Enabled: true,
      video03Enabled: false,
      playMusicOnFinalScreen: false,
      finalScreenMode: 'rendered',
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          videoAudioPolicy: 'keep_music',
          isOpen: false,
          showFullscreenTestOverlay: false,
        };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  };

  const [settings, setSettings] = useState<OperatorSettings>(getInitialSettings);

  const [trackingState, setTrackingState] = useState<HandTrackingState>({
    detectionState: 'WAITING_FOR_CAMERA',
    detected: false,
    handCount: 0,
    palmCenter: { x: 0.5, y: 0.51 },
    rawPalmCenter: { x: 0.5, y: 0.51 },
    aligned: false,
    alignmentDistance: 1.0,
    holdProgress: 0,
    landmarks: null,
    stability: 0,
    confidence: 0,
    fps: 0,
    videoResolution: { width: 0, height: 0 },
  });

  const lostHandTimeoutRef = useRef<number | null>(null);

  // Update operator settings and persist to localStorage
  const handleUpdateSettings = useCallback((newSettings: Partial<OperatorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(
          'mrf_inauguration_calibration_v2',
          JSON.stringify({
            targetX: updated.targetX,
            targetY: updated.targetY,
            targetRadius: updated.targetRadius,
            requiredHoldSeconds: updated.requiredHoldSeconds,
            mirrorCamera: updated.mirrorCamera,
            selectedDeviceId: updated.selectedDeviceId,
            soundMuted: updated.soundMuted,
            soundVolume: updated.soundVolume,
          })
        );
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Update detector status and camera list
  const handleStatusUpdate = useCallback(
    (status: { detectorStatus: string; lastError: string | null; availableCameras: MediaDeviceInfo[] }) => {
      setSettings((prev) => ({
        ...prev,
        detectorStatus: status.detectorStatus,
        lastError: status.lastError,
      }));
      if (status.availableCameras.length > 0) {
        setAvailableCameras(status.availableCameras);
      }
    },
    []
  );

  // Handle hand tracking updates
  const handleTrackingUpdate = useCallback((newState: HandTrackingState) => {
    setTrackingState(newState);

    setPhase((currentPhase) => {
      // Transition from Phase A to Phase B when hand is detected
      if (currentPhase === 'PHASE_A_DORMANT' && newState.detected) {
        if (lostHandTimeoutRef.current) {
          clearTimeout(lostHandTimeoutRef.current);
          lostHandTimeoutRef.current = null;
        }
        return 'PHASE_B_APPROACH';
      }

      // Return to Phase A if hand is lost for more than 2.5 seconds
      if (currentPhase === 'PHASE_B_APPROACH' && !newState.detected) {
        if (!lostHandTimeoutRef.current) {
          lostHandTimeoutRef.current = window.setTimeout(() => {
            setPhase((p) => (p === 'PHASE_B_APPROACH' ? 'PHASE_A_DORMANT' : p));
            lostHandTimeoutRef.current = null;
          }, 2500);
        }
      } else if (currentPhase === 'PHASE_B_APPROACH' && newState.detected) {
        if (lostHandTimeoutRef.current) {
          clearTimeout(lostHandTimeoutRef.current);
          lostHandTimeoutRef.current = null;
        }
      }

      return currentPhase;
    });
  }, []);

  // Trigger Activation sequence
  const handleActivationTriggered = useCallback(() => {
    setPhase((current) => {
      if (current === 'PHASE_A_DORMANT' || current === 'PHASE_B_APPROACH') {
        return 'PHASE_C_CONTACT';
      }
      return current;
    });
  }, []);

  // Manual Trigger by Operator
  const handleManualTrigger = useCallback(() => {
    setPhase('PHASE_C_CONTACT');
  }, []);

  // Reset entire experience back to Phase A
  const handleReset = useCallback(() => {
    setPhase('PHASE_A_DORMANT');
    setTrackingState((prev) => ({
      ...prev,
      detected: false,
      aligned: false,
      holdProgress: 0,
      landmarks: null,
    }));
    soundEngine.startAmbientAtmosphere();
  }, []);

  // Keyboard Shortcuts (CTRL + SHIFT + P, T for Camera Test, Space for Trigger, N/ArrowRight for Video Skip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Operator Console: Ctrl + Shift + P
      if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, isOpen: !prev.isOpen }));
        return;
      }

      // Toggle Camera Test Mode: Key T
      if ((e.key === 't' || e.key === 'T') && !settings.isOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') {
          e.preventDefault();
          setSettings((prev) => ({
            ...prev,
            showFullscreenTestOverlay: !prev.showFullscreenTestOverlay,
          }));
          return;
        }
      }

      // Close overlays with Escape
      if (e.key === 'Escape') {
        if (settings.showFullscreenTestOverlay) {
          setSettings((prev) => ({ ...prev, showFullscreenTestOverlay: false }));
        } else if (settings.isOpen) {
          setSettings((prev) => ({ ...prev, isOpen: false }));
        }
        return;
      }

      // Spacebar for Emergency Activation Trigger (only in Phase A or B)
      if (e.code === 'Space' && !settings.isOpen && !settings.showFullscreenTestOverlay) {
        if (phase === 'PHASE_A_DORMANT' || phase === 'PHASE_B_APPROACH') {
          e.preventDefault();
          handleManualTrigger();
        }
      }

      // Skip Video hotkey (ArrowRight or N) for operator rehearsal
      if ((e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') && !settings.isOpen && !settings.showFullscreenTestOverlay) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') {
          if (phase === 'PHASE_VIDEO_01') {
            e.preventDefault();
            setPhase(settings.video02Enabled && settings.video02Src ? 'PHASE_VIDEO_02' : 'PHASE_F_FINAL');
          } else if (phase === 'PHASE_VIDEO_02') {
            e.preventDefault();
            setPhase('PHASE_F_FINAL');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, phase, handleManualTrigger]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-midnight-900 select-none">
      {/* Background Hand Tracking Engine (MediaPipe Tasks Vision) */}
      <HandTrackingManager
        settings={settings}
        onTrackingUpdate={handleTrackingUpdate}
        onStatusUpdate={handleStatusUpdate}
        onStreamReady={setCameraStream}
        onActivationTriggered={handleActivationTriggered}
        isActive={phase === 'PHASE_A_DORMANT' || phase === 'PHASE_B_APPROACH'}
      />

      {/* Main 1920x1080 Cinematic Stage */}
      <CinematicStage
        phase={phase}
        trackingState={trackingState}
        onPhaseChange={setPhase}
        settings={settings}
        onOpenOperatorPanel={() => setSettings((prev) => ({ ...prev, isOpen: true }))}
        onOpenTestMode={() => setSettings((prev) => ({ ...prev, showFullscreenTestOverlay: true }))}
      />

      {/* Camera Debug Overlay (Small corner view) */}
      <CameraDebugOverlay
        trackingState={trackingState}
        settings={settings}
      />

      {/* Dedicated Interactive Fullscreen Camera & Hand Skeleton Test Mode */}
      {settings.showFullscreenTestOverlay && (
        <FullscreenCameraTest
          trackingState={trackingState}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setSettings((prev) => ({ ...prev, showFullscreenTestOverlay: false }))}
          availableCameras={availableCameras}
          cameraStream={cameraStream}
        />
      )}

      {/* Hidden Master Operator Control Panel (CTRL + SHIFT + P) */}
      <OperatorControlPanel
        settings={settings}
        trackingState={trackingState}
        onUpdateSettings={handleUpdateSettings}
        currentPhase={phase}
        onJumpToPhase={setPhase}
        onManualTrigger={handleManualTrigger}
        onReset={handleReset}
        onOpenTestMode={() => setSettings((prev) => ({ ...prev, showFullscreenTestOverlay: true }))}
        availableCameras={availableCameras}
      />
    </div>
  );
};

export default App;
