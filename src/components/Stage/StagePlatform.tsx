import React from 'react';

interface StagePlatformProps {
  intensity?: number;
}

export const StagePlatform: React.FC<StagePlatformProps> = ({ intensity = 0 }) => {
  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none pointer-events-none">
      {/* 1. Refined Upward Center Stage Spotlight Cone (Cyan, Violet & Gold light) */}
      <div
        className="absolute -top-28 w-[420px] h-[150px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(66, 217, 255, 0.25) 0%, rgba(117, 72, 255, 0.15) 35%, rgba(214, 181, 111, 0.12) 60%, transparent 80%)',
        }}
      />

      {/* 2. Complete Elegant Circular Floating Stage Dais (Fits within screen boundaries) */}
      <div className="relative w-[500px] max-w-[85vw] h-12 flex items-center justify-center">
        {/* Soft under-stage shadow */}
        <div className="absolute -bottom-3 inset-x-8 h-7 rounded-[100%] bg-black/60 blur-lg" />

        {/* Outer Tier - Slender Champagne-Gold & Cyan Edge Rim */}
        <div
          className="w-full h-full rounded-[100%] p-[1.8px] transition-all duration-700"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #42D9FF 25%, #147BFF 50%, #D6B56F 75%, #030718 100%)',
            boxShadow: `0 0 25px rgba(66, 217, 255, ${0.3 + intensity * 0.35}), 0 0 15px rgba(214, 181, 111, 0.25), 0 8px 24px rgba(3, 7, 24, 0.75)`,
          }}
        >
          {/* Inner Tier - Reflective Midnight Obsidian Glass Surface */}
          <div
            className="w-full h-full rounded-[100%] overflow-hidden relative backdrop-blur-md"
            style={{
              background: 'radial-gradient(ellipse at 50% 25%, rgba(14, 38, 77, 0.8) 0%, rgba(7, 22, 51, 0.95) 55%, rgba(3, 7, 24, 0.98) 100%)',
            }}
          >
            {/* Mirror Reflection of the Holographic Portal & Waves */}
            <div
              className="absolute inset-x-0 top-0 h-full pointer-events-none opacity-40"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(66, 217, 255, 0.45) 0%, rgba(117, 72, 255, 0.3) 40%, rgba(214, 181, 111, 0.2) 70%, transparent 85%)',
                filter: 'blur(3px)',
              }}
            />

            {/* Specular Front Edge Highlight Line */}
            <div
              className="absolute inset-x-10 top-0.5 h-[1.2px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 30%, #42D9FF 50%, rgba(255,255,255,0.95) 70%, transparent 100%)',
              }}
            />

            {/* Delicate Inner Concentric Cyan / Violet Ring */}
            <div
              className="absolute inset-x-12 top-1 bottom-1 rounded-[100%] border border-[#42D9FF]/30 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 10px rgba(66, 217, 255, 0.2)',
              }}
            />
          </div>
        </div>

        {/* Center Stage Emitter Core */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-2.5 rounded-[100%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, #42D9FF 50%, #D6B56F 85%, transparent 100%)',
            boxShadow: '0 0 16px #42D9FF, 0 0 8px #D6B56F',
            filter: 'blur(0.5px)',
          }}
        />
      </div>
    </div>
  );
};
