import React, { useEffect, useState, useRef } from 'react';
import { InaugurationPhase, DetectionState, HandLandmark } from '../../types';

interface DimensionalHolographicHandProps {
  phase: InaugurationPhase;
  detectionState: DetectionState;
  holdProgress: number; // 0..1
  isAligned: boolean;
  isDetected: boolean;
  contactFingerIndex: number;
  landmarks?: HandLandmark[] | null;
  palmCenter?: { x: number; y: number };
}

export const DimensionalHolographicHand: React.FC<DimensionalHolographicHandProps> = ({
  phase,
  detectionState,
  holdProgress,
  isAligned,
  isDetected,
  contactFingerIndex,
  landmarks,
  palmCenter,
}) => {
  const isContact = phase === 'PHASE_C_CONTACT' || phase === 'PHASE_D_BLAST';
  const isVerified = holdProgress >= 0.98 || isContact;

  // Real-time animation for the scanning beam and waveform
  const [scanBeamY, setScanBeamY] = useState<number>(360);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let start = performance.now();
    const update = (now: number) => {
      const elapsed = (now - start) * 0.001; // seconds

      if (isVerified) {
        // Lock at palm center on verification
        setScanBeamY(350);
      } else if (isAligned) {
        // Rapid active biometric scanning sweep across fingers to palm (y: 140 to 480)
        const cycle = (elapsed * 1.5) % 1.0;
        const y = 480 - cycle * 340;
        setScanBeamY(y);
      } else if (isDetected) {
        // Moderate scan sweep
        const y = 320 + Math.sin(elapsed * 2.5) * 150;
        setScanBeamY(y);
      } else {
        // Gentle idle scanning beam oscillation
        const y = 330 + Math.sin(elapsed * 1.2) * 130;
        setScanBeamY(y);
      }

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAligned, isDetected, isVerified]);

  // Fingertip positions on 560x650 viewport for sensor brackets
  // Exact coordinates matching the 5 distinct fingers of realistic-biometric-palm.png:
  const fingertips = [
    { name: 'THUMB',  x: 165, y: 310, idx: 0, angle: -36 },
    { name: 'INDEX',  x: 236, y: 168, idx: 1, angle: -5 },
    { name: 'MIDDLE', x: 288, y: 130, idx: 2, angle: 0 },
    { name: 'RING',   x: 348, y: 155, idx: 3, angle: 6 },
    { name: 'PINKY',  x: 408, y: 250, idx: 4, angle: 18 },
  ];

  // 21 MediaPipe landmark nodes mapped onto the 560x650 viewport
  const targetLandmarks = [
    { x: 288, y: 535 }, // 0: Wrist
    // Thumb
    { x: 242, y: 460 }, // 1: Thumb CMC
    { x: 202, y: 410 }, // 2: Thumb MCP
    { x: 178, y: 355 }, // 3: Thumb IP
    { x: 165, y: 310 }, // 4: Thumb Tip
    // Index
    { x: 248, y: 345 }, // 5: Index MCP
    { x: 242, y: 275 }, // 6: Index PIP
    { x: 238, y: 218 }, // 7: Index DIP
    { x: 236, y: 168 }, // 8: Index Tip
    // Middle
    { x: 290, y: 338 }, // 9: Middle MCP (Palm Centroid)
    { x: 290, y: 260 }, // 10: Middle PIP
    { x: 289, y: 190 }, // 11: Middle DIP
    { x: 288, y: 130 }, // 12: Middle Tip
    // Ring
    { x: 335, y: 350 }, // 13: Ring MCP
    { x: 342, y: 275 }, // 14: Ring PIP
    { x: 346, y: 210 }, // 15: Ring DIP
    { x: 348, y: 155 }, // 16: Ring Tip
    // Pinky
    { x: 375, y: 375 }, // 17: Pinky MCP
    { x: 388, y: 330 }, // 18: Pinky PIP
    { x: 398, y: 288 }, // 19: Pinky DIP
    { x: 408, y: 250 }, // 20: Pinky Tip
  ];

  const boneConnections = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm Transverse Knuckle Arch
    [5, 9], [9, 13], [13, 17],
  ];

  const progressPercent = Math.round(holdProgress * 100);

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* 1. BRAND NEW REALISTIC 3D HOLOGRAPHIC HUMAN PALM ASSET */}
      {/* Exactly 5 anatomically correct fingers with clearly visible negative spaces between every finger */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-transform duration-300"
        style={{
          transform: `scale(${1.0 + holdProgress * 0.04})`,
        }}
      >
        <img
          src="/assets/hand/realistic-biometric-palm.png"
          alt="Anatomical Realistic Biometric Human Palm"
          className="w-[340px] h-[395px] object-contain object-center pointer-events-none select-none transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 25px rgba(66, 217, 255, ${0.45 + holdProgress * 0.4}))
                     drop-shadow(0 0 15px rgba(214, 181, 111, ${0.25 + holdProgress * 0.4}))
                     brightness(${1.0 + (isAligned ? 0.25 : 0) + (isVerified ? 0.35 : 0)})
                     contrast(1.12)`,
            opacity: isContact ? 1 : 0.92,
          }}
        />
      </div>

      {/* 2. LIVE BIOMETRIC SCANNING SVG OVERLAY (560x650 viewport) */}
      <svg
        viewBox="0 0 560 650"
        className="relative z-20 w-full h-full max-w-[560px] max-h-[650px] overflow-visible drop-shadow-[0_12px_45px_rgba(20,123,255,0.4)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Luminous Cyan Bloom Filter */}
          <filter id="scanCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="b1" />
            <feGaussianBlur stdDeviation="10" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Golden Palm Core Bloom Filter */}
          <filter id="scanGoldGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="gb1" />
            <feGaussianBlur stdDeviation="16" result="gb2" />
            <feMerge>
              <feMergeNode in="gb2" />
              <feMergeNode in="gb1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Laser Beam Volumetric Glow */}
          <filter id="laserBeamFilter" x="-20%" y="-150%" width="140%" height="400%">
            <feGaussianBlur stdDeviation="5" result="lb1" />
            <feMerge>
              <feMergeNode in="lb1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Horizontal Laser Beam Gradient */}
          <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#147BFF" stopOpacity="0" />
            <stop offset="15%" stopColor="#42D9FF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="85%" stopColor="#42D9FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#147BFF" stopOpacity="0" />
          </linearGradient>

          {/* Laser Volumetric Soft Spread */}
          <linearGradient id="laserVolumetricGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#42D9FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#42D9FF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#42D9FF" stopOpacity="0" />
          </linearGradient>

          {/* Palm Center Radial Core */}
          <radialGradient id="palmCoreRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="30%" stopColor="#FAF8F3" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#D6B56F" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#42D9FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#071633" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* =========================================================================
            LAYER 1: 21-JOINT BIOMETRIC LANDMARK SKELETON
            Visualizes MediaPipe kinematic joint nodes over the realistic human hand
           ========================================================================= */}
        <g>
          {/* Interphalangeal bone links */}
          {boneConnections.map(([sIdx, eIdx], i) => {
            const p1 = targetLandmarks[sIdx];
            const p2 = targetLandmarks[eIdx];
            return (
              <line
                key={`bone-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isAligned ? '#42D9FF' : 'rgba(66, 217, 255, 0.45)'}
                strokeWidth={isAligned ? 1.4 : 0.9}
                strokeDasharray={isAligned ? undefined : '2,3'}
              />
            );
          })}

          {/* 21 Anatomical Joint Nodes */}
          {targetLandmarks.map((pt, idx) => {
            const isTip = [4, 8, 12, 16, 20].includes(idx);
            const isIgnited = isContact && contactFingerIndex >= Math.floor(idx / 4);

            return (
              <g key={`node-${idx}`} filter="url(#scanCyanGlow)">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isIgnited ? 5.5 : isTip ? 4.0 : 2.2}
                  fill={isIgnited ? '#D6B56F' : isTip ? '#FFFFFF' : '#42D9FF'}
                />
                {isTip && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isIgnited ? 15 : isAligned ? 9 : 6}
                    fill="none"
                    stroke={isIgnited ? '#D6B56F' : '#42D9FF'}
                    strokeWidth={1}
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* =========================================================================
            LAYER 2: FINGERTIP BIOMETRIC TARGET BRACKETS (Image 2)
            Square sensor brackets with corner calipers around all 5 fingertips
           ========================================================================= */}
        {fingertips.map((tip) => {
          const isIgnited = isContact && contactFingerIndex >= tip.idx;
          const s = 15; // half bracket size
          return (
            <g key={`bracket-${tip.idx}`} transform={`translate(${tip.x}, ${tip.y}) rotate(${tip.angle})`}>
              {/* Corner calipers for target tracking box */}
              <path
                d={`M -${s} -${s/2} L -${s} -${s} L -${s/2} -${s}
                    M ${s/2} -${s} L ${s} -${s} L ${s} -${s/2}
                    M -${s} ${s/2} L -${s} ${s} L -${s/2} ${s}
                    M ${s/2} ${s} L ${s} ${s} L ${s} ${s/2}`}
                fill="none"
                stroke={isIgnited ? '#D6B56F' : isAligned ? '#42D9FF' : 'rgba(66, 217, 255, 0.65)'}
                strokeWidth="1.4"
                filter="url(#scanCyanGlow)"
              />
              {/* Target ID Label */}
              <text
                x="0"
                y={`-${s + 3}`}
                textAnchor="middle"
                className="text-[8px] font-mono tracking-widest font-bold fill-[#42D9FF]"
                opacity={isAligned ? 0.95 : 0.65}
              >
                P{tip.idx + 1}
              </text>
            </g>
          );
        })}

        {/* =========================================================================
            LAYER 3: HORIZONTAL BIOMETRIC LASER SCANNING BEAM (Image 2)
            Cyan-white laser beam sweeping vertically across palm
           ========================================================================= */}
        <g filter="url(#laserBeamFilter)">
          {/* Volumetric glow spread */}
          <rect
            x="110"
            y={scanBeamY - 18}
            width="350"
            height="36"
            fill="url(#laserVolumetricGrad)"
            pointerEvents="none"
          />
          {/* Razor-sharp laser line */}
          <line
            x1="120"
            y1={scanBeamY}
            x2="450"
            y2={scanBeamY}
            stroke="url(#laserBeamGrad)"
            strokeWidth={isAligned ? '3.2' : '2.0'}
          />
          <circle cx="120" cy={scanBeamY} r="2.5" fill="#FFFFFF" />
          <circle cx="450" cy={scanBeamY} r="2.5" fill="#FFFFFF" />
        </g>

        {/* =========================================================================
            LAYER 4: CENTRAL GOLDEN BIOMETRIC TARGET CORE (Palm Center)
            Concentric target rings, 8 calibration ticks, star crosshairs
           ========================================================================= */}
        <g transform="translate(288, 385)">
          {/* Outer Segmented Astrolabe Ring */}
          <circle
            r="48"
            fill="none"
            stroke={isAligned ? '#42D9FF' : 'rgba(117, 72, 255, 0.45)'}
            strokeWidth="1.2"
            strokeDasharray="6,6"
            className="animate-spin-slow origin-center"
          />

          {/* Golden Biometric Target Ring with 8 Cardinal Ticks */}
          <circle
            r="32"
            fill="none"
            stroke={isAligned ? '#D6B56F' : 'rgba(214, 181, 111, 0.6)'}
            strokeWidth="1.4"
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
            <line
              key={`tick-${ang}`}
              x1="0"
              y1="-32"
              x2="0"
              y2="-37"
              stroke="#D6B56F"
              strokeWidth="1.2"
              transform={`rotate(${ang})`}
            />
          ))}

          {/* Golden Activation Core Beacon */}
          <circle
            r={isContact ? 80 : isAligned ? 24 + holdProgress * 14 : 16}
            fill="url(#palmCoreRadial)"
            opacity={isContact ? 1 : 0.8 + holdProgress * 0.2}
            filter="url(#scanGoldGlow)"
          />

          {/* Precision Star Crosshairs */}
          <line
            x1="-16"
            y1="0"
            x2="16"
            y2="0"
            stroke={isAligned ? '#FFFFFF' : '#D6B56F'}
            strokeWidth="1.6"
          />
          <line
            x1="0"
            y1="-16"
            x2="0"
            y2="16"
            stroke={isAligned ? '#FFFFFF' : '#D6B56F'}
            strokeWidth="1.6"
          />
        </g>

        {/* =========================================================================
            LAYER 5: BIOMETRIC TELEMETRY HUD PANELS (Image 2)
            Right: Segmented scan progress & feature mapping telemetry
            Left: Biometric waveform & signal indicators
           ========================================================================= */}
        {/* RIGHT TELEMETRY BOX */}
        <g transform="translate(415, 225)">
          <rect
            x="0"
            y="0"
            width="135"
            height="105"
            rx="5"
            fill="#071633"
            fillOpacity="0.8"
            stroke="#42D9FF"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          {/* Caliper corners */}
          <path d="M 0 8 L 0 0 L 8 0" fill="none" stroke="#42D9FF" strokeWidth="1.5" />
          <path d="M 127 0 L 135 0 L 135 8" fill="none" stroke="#42D9FF" strokeWidth="1.5" />

          {/* Telemetry Header */}
          <text x="10" y="18" className="text-[9px] font-mono tracking-widest font-bold fill-[#42D9FF]">
            {isVerified ? 'VERIFIED' : isAligned ? 'SCANNING...' : isDetected ? 'DETECTED' : 'STANDBY'}
          </text>
          <text x="125" y="18" textAnchor="end" className="text-[9px] font-mono font-bold fill-[#F8FAFF]">
            {progressPercent}%
          </text>

          {/* Segmented Progress Meter Bar */}
          <g transform="translate(10, 25)">
            {Array.from({ length: 12 }).map((_, i) => {
              const active = i / 12 <= holdProgress;
              return (
                <rect
                  key={i}
                  x={i * 9.5}
                  y="0"
                  width="7.5"
                  height="6"
                  rx="1"
                  fill={active ? '#42D9FF' : '#147BFF'}
                  fillOpacity={active ? 1 : 0.25}
                />
              );
            })}
          </g>

          {/* Diagnostic Status Lines */}
          <text x="10" y="48" className="text-[7.5px] font-mono tracking-wider fill-[#7DD3FC]">
            PALM DETECTION: {isDetected ? 'LOCKED' : 'SEARCHING'}
          </text>
          <text x="10" y="61" className="text-[7.5px] font-mono tracking-wider fill-[#7DD3FC]">
            FEATURE MAPPING: {isAligned ? 'ACTIVE' : 'IDLE'}
          </text>
          <text x="10" y="74" className="text-[7.5px] font-mono tracking-wider fill-[#7DD3FC]">
            BIOMETRIC ANALYSIS: {isVerified ? 'COMPLETE' : isAligned ? 'RUNNING' : 'WAITING'}
          </text>
          <text x="10" y="88" className="text-[7.5px] font-mono tracking-wider font-semibold fill-[#D6B56F]">
            {isVerified ? 'CONFIRMED' : isAligned ? 'PLEASE HOLD STEADY' : 'PLACE PALM IN LIGHT'}
          </text>
        </g>

        {/* LEFT TELEMETRY BOX (Signal Waveform) */}
        <g transform="translate(15, 240)">
          <rect
            x="0"
            y="0"
            width="105"
            height="85"
            rx="5"
            fill="#071633"
            fillOpacity="0.8"
            stroke="#42D9FF"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <text x="8" y="16" className="text-[7.5px] font-mono tracking-widest font-bold fill-[#42D9FF]">
            BIO-TELEMETRY
          </text>
          {/* ECG/Pulse Waveform Polyline */}
          <path
            d="M 8 38 L 28 38 L 34 26 L 39 48 L 44 32 L 49 40 L 54 38 L 96 38"
            fill="none"
            stroke="#42D9FF"
            strokeWidth="1.2"
            filter="url(#scanCyanGlow)"
          />
          {/* Signal Level Bars */}
          <g transform="translate(8, 52)">
            {[14, 22, 18, 26, 24, 20].map((val, i) => (
              <rect
                key={i}
                x={i * 6}
                y={24 - (isDetected ? val : val * 0.4)}
                width="3.5"
                height={isDetected ? val : val * 0.4}
                rx="0.5"
                fill={i % 2 === 0 ? '#42D9FF' : '#147BFF'}
                fillOpacity={0.85}
              />
            ))}
          </g>
          <text x="50" y="63" className="text-[7px] font-mono fill-[#D6B56F]">
            STATUS: {isDetected ? 'ACTIVE' : 'READY'}
          </text>
          <text x="50" y="73" className="text-[7px] font-mono fill-[#F8FAFF]">
            MATCH: {progressPercent}%
          </text>
        </g>
      </svg>
    </div>
  );
};
