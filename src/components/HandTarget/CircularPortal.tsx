import React from 'react';

interface CircularPortalProps {
  holdProgress: number; // 0..1
  isAligned: boolean;
  isDetected: boolean;
  size?: number; // default 520
}

export const CircularPortal: React.FC<CircularPortalProps> = ({
  holdProgress,
  isAligned,
  isDetected,
  size = 520,
}) => {
  const center = size / 2;
  const radius = center - 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - holdProgress * circumference;

  // Arc Head coordinates
  const progressAngle = -90 + holdProgress * 360;
  const headRad = (progressAngle * Math.PI) / 180;
  const headX = center + Math.cos(headRad) * radius;
  const headY = center + Math.sin(headRad) * radius;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-[520px] h-[520px] max-w-[80vw] max-h-[80vh] overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Luminous Electric Cyan & Blue Halo */}
          <filter id="portalCyanHalo" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="6" result="cb1" />
            <feMerge>
              <feMergeNode in="cb1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Violet Glow */}
          <filter id="portalVioletGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="vb1" />
            <feMerge>
              <feMergeNode in="vb1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Slender Cyan-to-Electric-Blue Gradient */}
          <linearGradient id="cyanBluePortalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#42D9FF" />
            <stop offset="50%" stopColor="#147BFF" />
            <stop offset="80%" stopColor="#7548FF" />
            <stop offset="92%" stopColor="#D6B56F" />
            <stop offset="100%" stopColor="#42D9FF" />
          </linearGradient>

          {/* Inner Violet & Magenta Gradient */}
          <linearGradient id="violetMagentaRingGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7548FF" />
            <stop offset="50%" stopColor="#E34BBF" />
            <stop offset="100%" stopColor="#147BFF" />
          </linearGradient>

          {/* Restrained Champagne Gold Detail Gradient */}
          <linearGradient id="portalGoldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D6B56F" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#B99752" />
          </linearGradient>

          {/* Incandescent Hold Progress Arc Gradient */}
          <linearGradient id="activeCyanGoldProgress" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#147BFF" />
            <stop offset="35%" stopColor="#42D9FF" />
            <stop offset="70%" stopColor="#D6B56F" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        {/* 1. Subtle Atmospheric Cyan Halo */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(66, 217, 255, 0.28)"
          strokeWidth="8"
          filter="url(#portalCyanHalo)"
        />

        {/* 2. Outer Fine Hairline Secondary Violet / Gold Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 14}
          fill="none"
          stroke="rgba(117, 72, 255, 0.4)"
          strokeWidth="1.2"
        />
        <circle
          cx={center}
          cy={center}
          r={radius + 18}
          fill="none"
          stroke="rgba(214, 181, 111, 0.25)"
          strokeWidth="0.8"
          strokeDasharray="4,8"
        />

        {/* 3. REFINED ILLUMINATED CYAN & ELECTRIC BLUE MAIN RING */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#cyanBluePortalGrad)"
          strokeWidth="2.4"
          filter="url(#portalCyanHalo)"
        />

        {/* 4. Fine Delicate Inner Violet / Magenta Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius - 8}
          fill="none"
          stroke="url(#violetMagentaRingGrad)"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          filter="url(#portalVioletGlow)"
        />

        {/* 5. Innermost Restrained Champagne Gold Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius - 16}
          fill="none"
          stroke="url(#portalGoldAccent)"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* 6. Four Refined Cardinal Light Pips & Golden Bracket Calipers (Image 2) */}
        {[
          { cx: center, cy: center - radius, angle: 0 },
          { cx: center + radius, cy: center, angle: 90 },
          { cx: center, cy: center + radius, angle: 180 },
          { cx: center - radius, cy: center, angle: 270 },
        ].map((pip, i) => (
          <g key={i}>
            {/* Soft Cyan/Gold Pip Bloom */}
            <circle
              cx={pip.cx}
              cy={pip.cy}
              r={isAligned ? 4.5 : 3.0}
              fill={i % 2 === 0 ? '#42D9FF' : '#D6B56F'}
              filter="url(#portalCyanHalo)"
            />
            <circle
              cx={pip.cx}
              cy={pip.cy}
              r={1.5}
              fill="#FFFFFF"
            />
            {/* Golden Bracket Calipers matching Image 2 */}
            <g transform={`rotate(${pip.angle} ${center} ${center})`}>
              <path
                d={`M ${center - 18} ${center - radius - 6} L ${center} ${center - radius - 12} L ${center + 18} ${center - radius - 6}`}
                fill="none"
                stroke="#D6B56F"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#refinedGoldGlow)"
              />
            </g>
          </g>
        ))}

        {/* 7. Incandescent Dynamic Hold-to-Activate Progress Ring */}
        {holdProgress > 0 && (
          <g>
            {/* Luminous Glow Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#activeCyanGoldProgress)"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              filter="url(#portalCyanHalo)"
              className="transition-all duration-75"
            />

            {/* Radiant Leading Edge Head Flare */}
            <circle
              cx={headX}
              cy={headY}
              r="7"
              fill="#FFFFFF"
              filter="url(#portalCyanHalo)"
              className="transition-all duration-75"
            />
            <circle
              cx={headX}
              cy={headY}
              r="3.5"
              fill="#D6B56F"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
