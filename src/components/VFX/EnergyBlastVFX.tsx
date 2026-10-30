import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InaugurationPhase } from '../../types';

interface EnergyBlastVFXProps {
  phase: InaugurationPhase;
  origin?: { x: number; y: number }; // normalized coords, default (0.5, 0.53)
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  sparkle: boolean;
  history: { x: number; y: number }[];
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  lineWidth: number;
  alpha: number;
  color: string;
}

interface Filament {
  points: { x: number; y: number }[];
  alpha: number;
  color: string;
}

export const EnergyBlastVFX: React.FC<EnergyBlastVFXProps> = ({
  phase,
  origin = { x: 0.5, y: 0.53 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const filamentsRef = useRef<Filament[]>([]);
  const animFrameId = useRef<number | null>(null);
  const contactFlashIntensity = useRef<number>(0);
  const blastFlashIntensity = useRef<number>(0);

  // Trigger effects on phase transitions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ox = canvas.width * origin.x;
    const oy = canvas.height * origin.y;

    if (phase === 'PHASE_C_CONTACT') {
      // 1. Palm Contact Flash
      contactFlashIntensity.current = 1.0;

      // 2. Contact Shockwaves (expanding blue, cyan, violet, and gold energy rings)
      const contactColors = ['#42D9FF', '#7548FF', '#147BFF', '#D6B56F', '#FFFFFF'];
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          shockwavesRef.current.push({
            x: ox,
            y: oy,
            radius: 10,
            maxRadius: Math.max(canvas.width, canvas.height) * 0.7,
            speed: 8 + i * 3.5,
            lineWidth: 5 - i * 0.7,
            alpha: 0.95,
            color: contactColors[i % contactColors.length],
          });
        }, i * 80);
      }

      // 3. Cyan, Electric Blue, Violet & Gold Spark Particles Burst
      const sparkColors = ['#42D9FF', '#147BFF', '#7548FF', '#E34BBF', '#D6B56F', '#FFFFFF'];
      for (let p = 0; p < 220; p++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 16;
        particlesRef.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3.5,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          alpha: 1.0,
          decay: 0.015 + Math.random() * 0.02,
          sparkle: Math.random() > 0.4,
          history: [],
        });
      }

      // 4. Cyan & Violet Energy Filaments branching out
      filamentsRef.current = [];
      for (let f = 0; f < 8; f++) {
        const points: { x: number; y: number }[] = [{ x: ox, y: oy }];
        let curX = ox;
        let curY = oy;
        const branchAngle = (f / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const segLen = 35 + Math.random() * 25;

        for (let s = 0; s < 7; s++) {
          curX += Math.cos(branchAngle) * segLen + (Math.random() - 0.5) * 40;
          curY += Math.sin(branchAngle) * segLen + (Math.random() - 0.5) * 40;
          points.push({ x: curX, y: curY });
        }

        filamentsRef.current.push({
          points,
          alpha: 1.0,
          color: f % 3 === 0 ? '#42D9FF' : f % 3 === 1 ? '#7548FF' : '#D6B56F',
        });
      }
    }

    if (phase === 'PHASE_D_BLAST') {
      // Grand Inauguration Blast!
      blastFlashIntensity.current = 1.0;

      // 1. Massive expanding full-screen shockwaves (Cyan, Violet, Gold, White)
      const blastColors = ['#FFFFFF', '#42D9FF', '#7548FF', '#D6B56F', '#147BFF', '#E34BBF'];
      const maxScreenDim = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          shockwavesRef.current.push({
            x: ox,
            y: oy,
            radius: 20,
            maxRadius: maxScreenDim * 1.15,
            speed: 16 + i * 4,
            lineWidth: 8 - i,
            alpha: 1.0,
            color: blastColors[i % blastColors.length],
          });
        }, i * 110);
      }

      // 2. Huge explosive burst of 500+ luminous particles with long spark trails
      for (let p = 0; p < 500; p++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 26;
        particlesRef.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 5,
          color: blastColors[Math.floor(Math.random() * blastColors.length)],
          alpha: 1.0,
          decay: 0.008 + Math.random() * 0.015,
          sparkle: true,
          history: [],
        });
      }

      // 3. Luxurious celebration confetti shower
      try {
        confetti({
          particleCount: 160,
          spread: 120,
          origin: { x: origin.x, y: origin.y },
          colors: ['#42D9FF', '#147BFF', '#7548FF', '#D6B56F', '#FFFFFF'],
          ticks: 350,
          gravity: 0.6,
          scalar: 1.2,
          disableForReducedMotion: true,
        });

        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 80,
            origin: { x: 0.1, y: 0.8 },
            colors: ['#42D9FF', '#7548FF', '#D6B56F', '#FFFFFF'],
            ticks: 300,
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 80,
            origin: { x: 0.9, y: 0.8 },
            colors: ['#42D9FF', '#7548FF', '#D6B56F', '#FFFFFF'],
            ticks: 300,
          });
        }, 500);
      } catch (e) {
        // graceful fallback if canvas-confetti is not loaded
      }
    }
  }, [phase, origin.x, origin.y]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      animFrameId.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ox = canvas.width * origin.x;
      const oy = canvas.height * origin.y;

      // 1. Render Contact Flash Bloom (Phase C)
      if (contactFlashIntensity.current > 0.01) {
        contactFlashIntensity.current *= 0.92;
        const grad = ctx.createRadialGradient(ox, oy, 10, ox, oy, 320);
        grad.addColorStop(0, `rgba(255, 255, 255, ${contactFlashIntensity.current})`);
        grad.addColorStop(0.3, `rgba(234, 210, 154, ${contactFlashIntensity.current * 0.8})`);
        grad.addColorStop(0.7, `rgba(217, 165, 46, ${contactFlashIntensity.current * 0.4})`);
        grad.addColorStop(1, 'rgba(6, 23, 47, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Full-Screen Grand Blast Bloom (Phase D)
      if (blastFlashIntensity.current > 0.01) {
        blastFlashIntensity.current *= 0.94;
        const blastRadius = Math.max(canvas.width, canvas.height) * 0.9;
        const grad = ctx.createRadialGradient(ox, oy, 30, ox, oy, blastRadius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${blastFlashIntensity.current * 0.95})`);
        grad.addColorStop(0.2, `rgba(234, 210, 154, ${blastFlashIntensity.current * 0.7})`);
        grad.addColorStop(0.6, `rgba(217, 165, 46, ${blastFlashIntensity.current * 0.3})`);
        grad.addColorStop(1, 'rgba(3, 11, 23, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. Render Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += sw.speed;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

        if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = sw.lineWidth;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Render Electric Blue Filaments (Phase C)
      for (let f = filamentsRef.current.length - 1; f >= 0; f--) {
        const fil = filamentsRef.current[f];
        fil.alpha -= 0.035;

        if (fil.alpha <= 0.01) {
          filamentsRef.current.splice(f, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        fil.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = fil.color;
        ctx.globalAlpha = fil.alpha;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = fil.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Render Burst Particles & Trails
      for (let p = particlesRef.current.length - 1; p >= 0; p--) {
        const part = particlesRef.current[p];
        part.history.push({ x: part.x, y: part.y });
        if (part.history.length > 6) part.history.shift();

        part.x += part.vx;
        part.y += part.vy;
        part.vx *= 0.96; // air resistance
        part.vy *= 0.96;
        part.alpha -= part.decay;

        if (part.alpha <= 0.01) {
          particlesRef.current.splice(p, 1);
          continue;
        }

        ctx.save();

        // Draw spark motion trail
        if (part.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(part.history[0].x, part.history[0].y);
          for (let h = 1; h < part.history.length; h++) {
            ctx.lineTo(part.history[h].x, part.history[h].y);
          }
          ctx.strokeStyle = part.color;
          ctx.globalAlpha = part.alpha * 0.4;
          ctx.lineWidth = part.size * 0.6;
          ctx.stroke();
        }

        // Draw particle head
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.sparkle && Math.random() > 0.3 ? part.alpha : part.alpha * 0.8;
        ctx.shadowColor = part.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [origin.x, origin.y]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
};
