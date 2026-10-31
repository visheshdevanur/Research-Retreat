import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InaugurationPhase } from '../../types';

interface EnergyBlastVFXProps {
  phase: InaugurationPhase;
  origin?: { x: number; y: number }; // normalized coords, default (0.5, 0.526)
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
  glowColor: string;
}

interface QuantumCorePulse {
  radius: number;
  maxRadius: number;
  alpha: number;
  growthSpeed: number;
  decaySpeed: number;
}

export const EnergyBlastVFX: React.FC<EnergyBlastVFXProps> = ({
  phase,
  origin = { x: 0.5, y: 0.526 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const corePulsesRef = useRef<QuantumCorePulse[]>([]);
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
      // 1. Palm Contact Flash Bloom (Pure White into 24K Gold & Electric Cyan)
      contactFlashIntensity.current = 1.0;

      // 2. Solid Quantum Core Pulse (Bold circular energy core expanding outward)
      corePulsesRef.current.push({
        radius: 15,
        maxRadius: 180,
        alpha: 1.0,
        growthSpeed: 9,
        decaySpeed: 0.045,
      });

      // 3. Bold Concentric Harmonic Shockwaves (Solid, crisp circular energy rings)
      // Strictly institutional palette: White, Cyan, Gold, Royal Blue
      const contactWaveConfigs = [
        { color: '#FFFFFF', glowColor: '#00E5FF', lineWidth: 7, speed: 9, delay: 0 },
        { color: '#00E5FF', glowColor: '#147BFF', lineWidth: 6, speed: 12, delay: 90 },
        { color: '#D4AF37', glowColor: '#FFF3C4', lineWidth: 8, speed: 15, delay: 180 },
        { color: '#147BFF', glowColor: '#00E5FF', lineWidth: 5, speed: 18, delay: 270 },
      ];

      contactWaveConfigs.forEach((cfg) => {
        setTimeout(() => {
          shockwavesRef.current.push({
            x: ox,
            y: oy,
            radius: 20,
            maxRadius: Math.max(canvas.width, canvas.height) * 0.75,
            speed: cfg.speed,
            lineWidth: cfg.lineWidth,
            alpha: 1.0,
            color: cfg.color,
            glowColor: cfg.glowColor,
          });
        }, cfg.delay);
      });

      // 4. Solid Coherent Energy Sparks (Strictly Gold, Cyan & White - NO chaotic rainbow colors)
      const sparkColors = ['#00E5FF', '#D4AF37', '#FFFFFF', '#147BFF', '#FFE8A3'];
      for (let p = 0; p < 140; p++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 14;
        particlesRef.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 3,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          alpha: 1.0,
          decay: 0.018 + Math.random() * 0.02,
          sparkle: Math.random() > 0.35,
          history: [],
        });
      }
    }

    if (phase === 'PHASE_D_BLAST') {
      // Grand Inauguration Blast!
      blastFlashIntensity.current = 1.0;

      // 1. Massive expanding full-screen solid shockwaves (Cyan, Gold, White)
      const blastWaveConfigs = [
        { color: '#FFFFFF', glowColor: '#00E5FF', lineWidth: 10, speed: 18, delay: 0 },
        { color: '#D4AF37', glowColor: '#FFE8A3', lineWidth: 8, speed: 22, delay: 100 },
        { color: '#00E5FF', glowColor: '#147BFF', lineWidth: 7, speed: 25, delay: 200 },
        { color: '#F5C542', glowColor: '#D4AF37', lineWidth: 6, speed: 28, delay: 300 },
      ];

      const maxScreenDim = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
      blastWaveConfigs.forEach((cfg) => {
        setTimeout(() => {
          shockwavesRef.current.push({
            x: ox,
            y: oy,
            radius: 30,
            maxRadius: maxScreenDim * 1.2,
            speed: cfg.speed,
            lineWidth: cfg.lineWidth,
            alpha: 1.0,
            color: cfg.color,
            glowColor: cfg.glowColor,
          });
        }, cfg.delay);
      });

      // 2. High-density golden-cyan stellar burst (280 particles)
      const blastSparkColors = ['#FFFFFF', '#00E5FF', '#D4AF37', '#147BFF', '#FFE8A3'];
      for (let p = 0; p < 280; p++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 24;
        particlesRef.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4.5,
          color: blastSparkColors[Math.floor(Math.random() * blastSparkColors.length)],
          alpha: 1.0,
          decay: 0.01 + Math.random() * 0.016,
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
          colors: ['#00E5FF', '#147BFF', '#D4AF37', '#FFE8A3', '#FFFFFF'],
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
            colors: ['#00E5FF', '#D4AF37', '#FFFFFF'],
            ticks: 300,
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 80,
            origin: { x: 0.9, y: 0.8 },
            colors: ['#00E5FF', '#D4AF37', '#FFFFFF'],
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
        const grad = ctx.createRadialGradient(ox, oy, 15, ox, oy, 340);
        grad.addColorStop(0, `rgba(255, 255, 255, ${contactFlashIntensity.current * 0.95})`);
        grad.addColorStop(0.25, `rgba(212, 175, 55, ${contactFlashIntensity.current * 0.75})`);
        grad.addColorStop(0.65, `rgba(0, 229, 255, ${contactFlashIntensity.current * 0.35})`);
        grad.addColorStop(1, 'rgba(6, 23, 47, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, 340, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Full-Screen Grand Blast Bloom (Phase D)
      if (blastFlashIntensity.current > 0.01) {
        blastFlashIntensity.current *= 0.94;
        const blastRadius = Math.max(canvas.width, canvas.height) * 0.9;
        const grad = ctx.createRadialGradient(ox, oy, 30, ox, oy, blastRadius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${blastFlashIntensity.current * 0.98})`);
        grad.addColorStop(0.2, `rgba(255, 232, 163, ${blastFlashIntensity.current * 0.8})`);
        grad.addColorStop(0.55, `rgba(212, 175, 55, ${blastFlashIntensity.current * 0.4})`);
        grad.addColorStop(0.8, `rgba(0, 229, 255, ${blastFlashIntensity.current * 0.2})`);
        grad.addColorStop(1, 'rgba(3, 11, 23, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. Render Solid Quantum Core Pulses
      for (let c = corePulsesRef.current.length - 1; c >= 0; c--) {
        const pulse = corePulsesRef.current[c];
        pulse.radius += pulse.growthSpeed;
        pulse.alpha -= pulse.decaySpeed;

        if (pulse.alpha <= 0.01 || pulse.radius >= pulse.maxRadius) {
          corePulsesRef.current.splice(c, 1);
          continue;
        }

        ctx.save();
        // Solid core disk with high density
        const coreGrad = ctx.createRadialGradient(ox, oy, 5, ox, oy, pulse.radius);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${pulse.alpha})`);
        coreGrad.addColorStop(0.45, `rgba(0, 229, 255, ${pulse.alpha * 0.8})`);
        coreGrad.addColorStop(0.85, `rgba(212, 175, 55, ${pulse.alpha * 0.5})`);
        coreGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, pulse.radius, 0, Math.PI * 2);
        ctx.fill();

        // Solid perimeter ring
        ctx.strokeStyle = `rgba(212, 175, 55, ${pulse.alpha})`;
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 24;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Render Bold Concentric Harmonic Shockwaves
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
        ctx.shadowColor = sw.glowColor;
        ctx.shadowBlur = 28;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Render Burst Particles & Trails (Strictly solid, clean golden-cyan sparks)
      for (let p = particlesRef.current.length - 1; p >= 0; p--) {
        const part = particlesRef.current[p];
        part.history.push({ x: part.x, y: part.y });
        if (part.history.length > 5) part.history.shift();

        part.x += part.vx;
        part.y += part.vy;
        part.vx *= 0.95; // air resistance
        part.vy *= 0.95;
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
          ctx.globalAlpha = part.alpha * 0.5;
          ctx.lineWidth = part.size * 0.7;
          ctx.shadowColor = part.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
        }

        // Draw particle head
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.sparkle && Math.random() > 0.3 ? part.alpha : part.alpha * 0.85;
        ctx.shadowColor = part.color;
        ctx.shadowBlur = 14;
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
