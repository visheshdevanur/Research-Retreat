export type InaugurationPhase =
  | 'PHASE_A_DORMANT'
  | 'PHASE_B_APPROACH'
  | 'PHASE_C_CONTACT'
  | 'PHASE_D_BLAST'
  | 'PHASE_VIDEO_01'
  | 'PHASE_VIDEO_02'
  | 'PHASE_VIDEO_03'
  | 'PHASE_E_MIT_REVEAL'
  | 'PHASE_E_MRF_REVEAL'
  | 'PHASE_F_FINAL';

export type VideoSlotId = 'video_01' | 'video_02' | 'video_03';
export type VideoAudioPolicy = 'pause_music' | 'duck_music' | 'keep_music';

export interface VideoSlotInfo {
  id: VideoSlotId;
  title: string;
  src: string;
  enabled: boolean;
  duration?: number;
  error?: string | null;
}

export type DetectionState =
  | 'WAITING_FOR_CAMERA'
  | 'CAMERA_READY'
  | 'HAND_DETECTED'
  | 'ALIGN_YOUR_HAND'
  | 'HOLD_YOUR_HAND_STEADY'
  | 'ACTIVATING'
  | 'ACTIVATED';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingState {
  detectionState: DetectionState;
  detected: boolean;
  handCount: number;
  palmCenter: { x: number; y: number }; // normalized 0..1 screen coordinates
  rawPalmCenter: { x: number; y: number };
  aligned: boolean;
  alignmentDistance: number; // distance from target center
  holdProgress: number; // 0..1
  landmarks: HandLandmark[] | null;
  stability: number; // 0..1
  confidence: number;
  fps: number;
  videoResolution: { width: number; height: number };
}

export interface CalibrationSettings {
  targetX: number; // 0..1 (default 0.5)
  targetY: number; // 0..1 (default 0.5)
  targetRadius: number; // 0..1 (default 0.16)
  requiredHoldSeconds: number; // default 1.8
  mirrorCamera: boolean;
  selectedDeviceId: string;
}

export interface OperatorSettings extends CalibrationSettings {
  isOpen: boolean;
  showCameraPreview: boolean;
  showFullscreenTestOverlay: boolean;
  showLandmarks: boolean;
  soundMuted: boolean;
  soundVolume: number;
  detectorStatus: string;
  lastError: string | null;

  // Video Sequence Settings
  videoAudioPolicy: VideoAudioPolicy;
  video01Src: string;
  video02Src: string;
  video03Src: string;
  video01Enabled: boolean;
  video02Enabled: boolean;
  video03Enabled: boolean;
  playMusicOnFinalScreen: boolean;
  finalScreenMode: 'rendered' | 'static_image';
}
