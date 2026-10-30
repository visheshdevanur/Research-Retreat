import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CircularEmblem } from '../Common/CircularEmblem';

export const FinalInaugurationStage: React.FC = () => {
  // Launch celebration confetti bursts matching the aurora palette
  useEffect(() => {
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#42D9FF', '#147BFF', '#7548FF', '#D6B56F', '#FFFFFF'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#42D9FF', '#147BFF', '#7548FF', '#D6B56F', '#FFFFFF'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-8 px-8 z-40 select-none animate-fade-in">
      {/* Background radial ambient halo */}
      <div className="absolute w-[1200px] h-[800px] rounded-full bg-gradient-to-r from-[#147BFF]/25 via-[#7548FF]/20 to-[#E34BBF]/15 blur-3xl pointer-events-none" />

      {/* TOP: Triumphant INAUGURATED Banner */}
      <div className="text-center space-y-3 z-10 pt-1 animate-float">
        <div className="inline-flex items-center gap-4 px-8 py-1.5 rounded-full border border-[#42D9FF]/50 bg-[#071633]/85 backdrop-blur-xl shadow-[0_0_30px_rgba(66,217,255,0.35)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#42D9FF] animate-ping" />
          <span className="text-xs md:text-sm font-cinematic tracking-[0.35em] uppercase text-[#F8FAFF] font-bold">
            MAHARAJA RESEARCH FOUNDATION
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#D6B56F] animate-ping" />
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-cinematic font-black tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFF] to-[#D6B56F] drop-shadow-[0_6px_45px_rgba(66,217,255,0.7)]">
          INAUGURATED
        </h1>
        <div className="w-96 h-1.5 mx-auto bg-gradient-to-r from-transparent via-[#42D9FF] to-transparent shadow-[0_0_25px_#42D9FF]" />
      </div>

      {/* CENTER: Harmonious Dual Institutional Identity Logos */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 my-auto">
        {/* Left: MIT Mysore Circular Crest */}
        <div className="flex flex-col items-center group">
          <div className="transform transition-transform duration-500 hover:scale-105">
            <CircularEmblem
              size="lg"
              src="/assets/logos/mitm-circular.png"
              alt="Maharaja Institute of Technology Mysore"
              glow
            />
          </div>
          <span className="mt-4 text-xs md:text-sm font-cinematic tracking-[0.25em] text-[#F8FAFF] font-bold uppercase drop-shadow-sm text-center">
            Maharaja Institute of Technology
          </span>
          <span className="text-[11px] font-mono tracking-widest text-[#42D9FF] uppercase">
            Mysore
          </span>
        </div>

        {/* Central Luminous Divider */}
        <div className="hidden md:flex flex-col items-center justify-center h-48 opacity-80">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#42D9FF] shadow-[0_0_10px_#42D9FF]" />
          <div className="w-4 h-4 rounded-full border-2 border-[#42D9FF] bg-[#071633] my-2 shadow-[0_0_15px_#42D9FF] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D6B56F]" />
          </div>
          <div className="w-px h-16 bg-gradient-to-t from-transparent to-[#42D9FF] shadow-[0_0_10px_#42D9FF]" />
        </div>

        {/* Right: MRF Circular Logo */}
        <div className="flex flex-col items-center group">
          <div className="transform transition-transform duration-500 hover:scale-105">
            <CircularEmblem
              size="lg"
              src="/assets/logos/mrf-circular.png"
              alt="Maharaja Research Foundation"
              glow
            />
          </div>
          <span className="mt-4 text-xs md:text-sm font-cinematic tracking-[0.25em] text-[#F8FAFF] font-bold uppercase drop-shadow-sm text-center">
            Maharaja Research Foundation
          </span>
          <span className="text-[11px] font-mono tracking-widest text-[#D6B56F] uppercase">
            MRF Retreat 2026
          </span>
        </div>
      </div>

      {/* BOTTOM: Event Title & Institutional Footer */}
      <div className="text-center space-y-2 z-10 pb-2">
        <h2 className="text-2xl md:text-4xl font-cinematic font-bold tracking-[0.25em] text-white drop-shadow-[0_2px_15px_rgba(66,217,255,0.6)]">
          MRF RESEARCH RETREAT 2026
        </h2>
        <p className="text-sm md:text-base font-cinematic tracking-[0.3em] text-[#D6B56F] uppercase">
          MAHARAJA INSTITUTE OF TECHNOLOGY, MYSORE
        </p>
        <p className="text-xs font-sans tracking-widest text-slate-300 uppercase pt-1">
          Affiliated to Visvesvaraya Technological University, Belagavi
        </p>
      </div>
    </div>
  );
};
