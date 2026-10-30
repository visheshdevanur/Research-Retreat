import React from 'react';
import { CircularEmblem } from '../Common/CircularEmblem';

export const MRFReveal: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center z-40 select-none animate-fade-in">
      {/* Background Volumetric Violet, Cyan and Champagne Gold Aura */}
      <div className="absolute w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-[#7548FF]/30 via-[#42D9FF]/25 to-[#E34BBF]/20 blur-3xl pointer-events-none" />

      {/* Counter-Rotating Astrolabe Energy Rings */}
      <div className="absolute w-[520px] h-[520px] rounded-full border-2 border-[#147BFF]/45 animate-spin-slow pointer-events-none shadow-[0_0_50px_rgba(20,123,255,0.4)]" />
      <div className="absolute w-[560px] h-[560px] rounded-full border border-dashed border-[#42D9FF]/35 animate-spin-reverse pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-[#D6B56F]/30 animate-spin-slow pointer-events-none" />

      {/* MRF Circular Logo Display */}
      <div className="relative z-10 flex flex-col items-center animate-float">
        <div className="transform transition-all duration-1000 scale-100 hover:scale-105">
          <CircularEmblem
            size="xl"
            src="/assets/logos/mrf-circular.png"
            alt="Maharaja Research Foundation"
            glow
          />
        </div>

        {/* Brand Event Titles */}
        <div className="mt-8 text-center space-y-2.5">
          <p className="text-xs md:text-sm font-mono tracking-[0.45em] uppercase text-[#D6B56F] font-semibold flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#D6B56F]" />
            ANNUAL RESEARCH CONVENTION
            <span className="w-8 h-px bg-[#D6B56F]" />
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-cinematic font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F8FAFF] to-[#D6B56F] drop-shadow-[0_4px_25px_rgba(214,181,111,0.6)]">
            MAHARAJA RESEARCH FOUNDATION
          </h2>
          <h3 className="text-xl md:text-3xl font-cinematic font-bold tracking-[0.35em] text-[#F8FAFF] drop-shadow-md">
            MRF RESEARCH RETREAT 2026
          </h3>
          <div className="w-72 h-1 mx-auto bg-gradient-to-r from-transparent via-[#42D9FF] to-transparent my-3 shadow-[0_0_15px_#42D9FF]" />
          <p className="text-xs md:text-sm font-sans tracking-[0.25em] text-slate-300 font-light uppercase">
            Pioneering Innovation • Scientific Discovery • Future Technologies
          </p>
        </div>
      </div>
    </div>
  );
};
