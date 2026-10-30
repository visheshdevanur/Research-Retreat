import React from 'react';
import { CircularEmblem } from '../Common/CircularEmblem';

export const MITMysoreReveal: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center z-40 select-none animate-fade-in">
      {/* Background Volumetric Cyan, Violet & Champagne Aura */}
      <div className="absolute w-[980px] h-[980px] rounded-full bg-gradient-to-r from-[#147BFF]/30 via-[#7548FF]/20 to-[#D6B56F]/15 blur-3xl pointer-events-none" />

      {/* Rotating Concentric Astrolabe Energy Rings */}
      <div className="absolute w-[520px] h-[520px] rounded-full border-2 border-[#42D9FF]/40 animate-spin-slow pointer-events-none shadow-[0_0_40px_rgba(66,217,255,0.35)]" />
      <div className="absolute w-[560px] h-[560px] rounded-full border border-dashed border-[#D6B56F]/30 animate-spin-reverse pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-[#7548FF]/25 animate-spin-slow pointer-events-none" />

      {/* MIT Mysore Authentic Circular Logo Display */}
      <div className="relative z-10 flex flex-col items-center animate-float">
        {/* Large Circular Emblem */}
        <div className="transform transition-all duration-1000 scale-100 hover:scale-105">
          <CircularEmblem
            size="xl"
            src="/assets/logos/mitm-circular.png"
            alt="Maharaja Institute of Technology Mysore"
            glow
          />
        </div>

        {/* Institution Titles with Grand Editorial Typography */}
        <div className="mt-8 text-center space-y-2.5">
          <p className="text-xs md:text-sm font-mono tracking-[0.45em] uppercase text-[#42D9FF] font-semibold flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#42D9FF]" />
            INSTITUTIONAL PATRON
            <span className="w-8 h-px bg-[#42D9FF]" />
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-cinematic font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F8FAFF] to-[#D6B56F] drop-shadow-[0_4px_25px_rgba(66,217,255,0.5)]">
            MAHARAJA INSTITUTE OF TECHNOLOGY
          </h2>
          <h3 className="text-xl md:text-3xl font-cinematic font-bold tracking-[0.35em] text-[#F8FAFF] drop-shadow-md">
            MYSORE
          </h3>
          <div className="w-64 h-1 mx-auto bg-gradient-to-r from-transparent via-[#42D9FF] to-transparent my-3 shadow-[0_0_15px_#42D9FF]" />
          <p className="text-xs md:text-sm font-sans tracking-[0.25em] text-slate-300 font-light uppercase">
            Recognized by AICTE, New Delhi • Affiliated to VTU, Belagavi
          </p>
        </div>
      </div>
    </div>
  );
};
