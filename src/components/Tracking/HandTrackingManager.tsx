import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandTrackingState, OperatorSettings, DetectionState, HandLandmark } from '../../types';

interface HandTrackingManagerProps {
  settings: OperatorSettings;
  onTrackingUpdate: (state: HandTrackingState) => void;
  onStatusUpdate: (status: { detectorStatus: string; lastError: string | null; availableCameras: MediaDeviceInfo[] }) => void;
  onStreamReady: (stream: MediaStream | null) => void;
  onActivationTriggered: () => void;
  isActive: boolean;
}

export const HandTrackingManager: React.FC<HandTrackingManagerProps> = ({
  settings,
  onTrackingUpdate,
  onStatusUpdate,
  onStreamReady,
  onActivationTriggered,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const lastVideoTimeRef = useRef<number>(-1);
  const lastTimestampRef = useRef<number>(0);

  // FPS calculation
  const frameCountRef = useRef<number>(0);
  const lastFpsCalcRef = useRef<number>(performance.now());
  const currentFpsRef = useRef<number>(0);

  // Hold progress tracking
  const holdProgressRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const activatedRef = useRef<boolean>(false);

  // Smoothing for palm center
  const smoothPalmRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.51 });

  // 1. Initialize MediaPipe Tasks Vision HandLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function setupLandmarker() {
      try {
        onStatusUpdate({
          detectorStatus: 'Loading WASM Vision Engine...',
          lastError: null,
          availableCameras: [],
        });

        // Try local wasm first, fallback to CDN
        let vision;
        try {
          vision = await FilesetResolver.forVisionTasks('/wasm');
        } catch (localWasmErr) {
          console.warn('Local WASM load failed, using CDN fallback:', localWasmErr);
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
          );
        }

        if (isCancelled) return;

        onStatusUpdate({
          detectorStatus: 'Loading Hand Landmark Model...',
          lastError: null,
          availableCameras: [],
        });

        // Initialize with high sensitivity thresholds
        let landmarker: HandLandmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.35, // High sensitivity for stage lighting
            minHandPresenceConfidence: 0.35,
            minTrackingConfidence: 0.35,
          });
          onStatusUpdate({
            detectorStatus: 'Model Ready (GPU Accelerated)',
            lastError: null,
            availableCameras: [],
          });
        } catch (gpuErr) {
          console.warn('GPU mode failed, falling back to CPU:', gpuErr);
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/hand_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.3,
            minHandPresenceConfidence: 0.3,
            minTrackingConfidence: 0.3,
          });
          onStatusUpdate({
            detectorStatus: 'Model Ready (CPU Mode)',
            lastError: null,
            availableCameras: [],
          });
        }

        if (isCancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        console.log('[MediaPipe HandLandmarker] Successfully initialized and ready.');
      } catch (err: unknown) {
        console.error('HandLandmarker initialization failed:', err);
        const errMsg = err instanceof Error ? err.message : 'Unknown Landmarker error';
        onStatusUpdate({
          detectorStatus: 'Model Load Failed',
          lastError: errMsg,
          availableCameras: [],
        });
      }
    }

    setupLandmarker();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // ignore
        }
        landmarkerRef.current = null;
      }
    };
  }, []);

  // 2. Enumerate Cameras & Initialize Webcam Stream with Resilient Fallback
  const startCamera = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      onStatusUpdate({
        detectorStatus: landmarkerRef.current ? 'Ready' : 'Waiting for Model',
        lastError: null,
        availableCameras: videoDevices,
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      let stream: MediaStream;

      // Try optimal constraints first, then fallback to basic video: true
      try {
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: settings.selectedDeviceId
            ? { deviceId: { exact: settings.selectedDeviceId } }
            : {
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
                facingMode: 'user',
              },
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr) {
        console.warn('Optimal camera constraints failed, falling back to basic camera request:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }

      streamRef.current = stream;
      onStreamReady(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((playErr) => console.warn('Video play warning:', playErr));
          }
        };
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const errMsg = err instanceof Error ? err.message : 'Webcam permission denied or camera in use';
      onStatusUpdate({
        detectorStatus: 'Camera Inactive',
        lastError: errMsg,
        availableCameras: [],
      });
      onStreamReady(null);
    }
  }, [settings.selectedDeviceId, onStatusUpdate, onStreamReady]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // Reset activation lock when becoming active or phase resets
  useEffect(() => {
    if (isActive) {
      activatedRef.current = false;
      holdProgressRef.current = 0;
    }
  }, [isActive]);

  // 3. Continuous Video Detection Loop
  useEffect(() => {
    let animId: number;

    const detectLoop = () => {
      animId = requestAnimationFrame(detectLoop);

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      const now = performance.now();
      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = now;

      // Calculate actual FPS
      frameCountRef.current++;
      if (now - lastFpsCalcRef.current >= 1000) {
        currentFpsRef.current = Math.round((frameCountRef.current * 1000) / (now - lastFpsCalcRef.current));
        frameCountRef.current = 0;
        lastFpsCalcRef.current = now;
      }

      // Check camera readiness
      if (!video || video.readyState < 2 || video.videoWidth === 0 || !landmarker) {
        onTrackingUpdate({
          detectionState: 'WAITING_FOR_CAMERA',
          detected: false,
          handCount: 0,
          palmCenter: { ...smoothPalmRef.current },
          rawPalmCenter: { ...smoothPalmRef.current },
          aligned: false,
          alignmentDistance: 1.0,
          holdProgress: 0,
          landmarks: null,
          stability: 0,
          confidence: 0,
          fps: currentFpsRef.current,
          videoResolution: {
            width: video ? video.videoWidth : 0,
            height: video ? video.videoHeight : 0,
          },
        });
        return;
      }

      // Process video frame
      if (video.currentTime !== lastVideoTimeRef.current && video.currentTime > 0) {
        lastVideoTimeRef.current = video.currentTime;

        const nowMs = Math.round(now);
        const timestamp = Math.max(nowMs, lastTimestampRef.current + 1);
        lastTimestampRef.current = timestamp;

        try {
          const results = landmarker.detectForVideo(video, timestamp);

          if (results.landmarks && results.landmarks.length > 0) {
            const rawLandmarks = results.landmarks[0];

            // Transform landmarks: mirror X if requested
            const landmarks: HandLandmark[] = rawLandmarks.map((lm) => ({
              x: settings.mirrorCamera ? 1.0 - lm.x : lm.x,
              y: lm.y,
              z: lm.z,
            }));

            // Stable Palm Centroid from [Wrist(0), Index_MCP(5), Middle_MCP(9), Ring_MCP(13), Pinky_MCP(17)]
            const palmIndices = [0, 5, 9, 13, 17];
            const rawPalmX = palmIndices.reduce((acc, idx) => acc + landmarks[idx].x, 0) / palmIndices.length;
            const rawPalmY = palmIndices.reduce((acc, idx) => acc + landmarks[idx].y, 0) / palmIndices.length;

            // Exponential moving average filter
            const alpha = 0.45;
            smoothPalmRef.current.x = smoothPalmRef.current.x * (1 - alpha) + rawPalmX * alpha;
            smoothPalmRef.current.y = smoothPalmRef.current.y * (1 - alpha) + rawPalmY * alpha;

            // Validate open palm: ensure fingers are extended away from wrist
            const wrist = landmarks[0];
            const distSq = (p1: HandLandmark, p2: HandLandmark) => {
              const dX = p1.x - p2.x;
              const dY = p1.y - p2.y;
              return dX * dX + dY * dY;
            };

            const thumbExtended = distSq(landmarks[4], wrist) > distSq(landmarks[2], wrist) * 1.1;
            const indexExtended = distSq(landmarks[8], wrist) > distSq(landmarks[6], wrist) * 1.1;
            const middleExtended = distSq(landmarks[12], wrist) > distSq(landmarks[10], wrist) * 1.1;
            const ringExtended = distSq(landmarks[16], wrist) > distSq(landmarks[14], wrist) * 1.1;
            const pinkyExtended = distSq(landmarks[20], wrist) > distSq(landmarks[18], wrist) * 1.1;

            let extendedFingers = 0;
            if (thumbExtended) extendedFingers++;
            if (indexExtended) extendedFingers++;
            if (middleExtended) extendedFingers++;
            if (ringExtended) extendedFingers++;
            if (pinkyExtended) extendedFingers++;

            const isOpenPalm = extendedFingers >= 4;

            // Natural Euclidean distance (without artificial stretching)
            const dx = smoothPalmRef.current.x - settings.targetX;
            const dy = smoothPalmRef.current.y - settings.targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Generous alignment verification
            const isAligned = dist <= settings.targetRadius && isOpenPalm;

            // State machine update
            let state: DetectionState = 'HAND_DETECTED';

            if (!isOpenPalm) {
              state = 'ALIGN_YOUR_HAND'; // Prompts user to open their hand fully
              holdProgressRef.current = Math.max(0, holdProgressRef.current - dt * 1.5);
            } else if (!isAligned) {
              state = 'ALIGN_YOUR_HAND';
              holdProgressRef.current = Math.max(0, holdProgressRef.current - dt * 1.2);
            } else {
              state = holdProgressRef.current > 0.05 ? 'ACTIVATING' : 'HOLD_YOUR_HAND_STEADY';
              const increment = dt / settings.requiredHoldSeconds;
              holdProgressRef.current = Math.min(1.0, holdProgressRef.current + increment);

              if (holdProgressRef.current >= 1.0) {
                state = 'ACTIVATED';
                if (!activatedRef.current && isActive) {
                  activatedRef.current = true;
                  onActivationTriggered();
                }
              }
            }

            const confidence = results.handednesses?.[0]?.[0]?.score || 0.9;

            onTrackingUpdate({
              detectionState: state,
              detected: true,
              handCount: results.landmarks.length,
              palmCenter: { ...smoothPalmRef.current },
              rawPalmCenter: { x: rawPalmX, y: rawPalmY },
              aligned: isAligned,
              alignmentDistance: dist,
              holdProgress: holdProgressRef.current,
              landmarks,
              stability: Math.max(0, 1.0 - dist),
              confidence,
              fps: currentFpsRef.current,
              videoResolution: {
                width: video.videoWidth,
                height: video.videoHeight,
              },
            });
          } else {
            // No hand detected
            holdProgressRef.current = Math.max(0, holdProgressRef.current - dt * 1.8);

            onTrackingUpdate({
              detectionState: 'CAMERA_READY',
              detected: false,
              handCount: 0,
              palmCenter: { ...smoothPalmRef.current },
              rawPalmCenter: { ...smoothPalmRef.current },
              aligned: false,
              alignmentDistance: 1.0,
              holdProgress: holdProgressRef.current,
              landmarks: null,
              stability: 0,
              confidence: 0,
              fps: currentFpsRef.current,
              videoResolution: {
                width: video.videoWidth,
                height: video.videoHeight,
              },
            });
          }
        } catch (detectErr) {
          console.warn('Detection frame error:', detectErr);
        }
      }
    };

    animId = requestAnimationFrame(detectLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, settings.targetX, settings.targetY, settings.targetRadius, settings.requiredHoldSeconds, settings.mirrorCamera, onActivationTriggered, onTrackingUpdate]);

  return (
    // Active onscreen container with full 1280x720 video so Chrome never throttles video frame decoding
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '320px',
        height: '240px',
        opacity: 0.001,
        pointerEvents: 'none',
        zIndex: -10,
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        width={1280}
        height={720}
      />
    </div>
  );
};
