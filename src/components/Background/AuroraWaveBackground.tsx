import React, { useEffect, useRef } from 'react';
import { InaugurationPhase } from '../../types';

interface AuroraWaveBackgroundProps {
  phase?: InaugurationPhase;
  intensity?: number; // 0..1, for subtle reactive illumination during contact/blast
  holdProgress?: number; // 0..1
}

interface WaveParticle {
  t: number; // progress along the spline 0..1
  speed: number;
  offsetY: number;
  size: number;
  alpha: number;
  color: string;
}

export const AuroraWaveBackground: React.FC<AuroraWaveBackgroundProps> = ({
  phase = 'PHASE_A_DORMANT',
  intensity = 0,
  holdProgress = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<WaveParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize flowing particles along the reference wave spline
    const PARTICLE_COUNT = 75;
    const colors = [
      '#FF7A18', // Warm orange/gold (left wave)
      '#FFB830', // Amber gold
      '#E34BBF', // Magenta
      '#7548FF', // Violet
      '#147BFF', // Electric blue
      '#42D9FF', // Cyan
      '#F8FAFF', // Luminous white
    ];

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      t: Math.random(),
      speed: 0.0008 + Math.random() * 0.0016,
      offsetY: (Math.random() - 0.5) * 80,
      size: 1.2 + Math.random() * 2.4,
      alpha: 0.3 + Math.random() * 0.7,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Spline path that closely matches the user's reference image wave trajectory:
    // Left: (0, 0.74*H) rising from bottom-left with warm orange/red
    // Control points curve down into (0.42*W, 0.88*H) violet/magenta dip
    // Rising steeply into (0.84*W, 0.22*H) bright electric blue & cyan crest
    // Curving gently to (1.0*W, 0.35*H)
    const getWavePoint = (t: number, timeOffset: number = 0) => {
      // 4-point cubic bezier approximation + subtle harmonic oscillation
      const p0 = { x: -0.05 * width, y: 0.72 * height };
      const p1 = { x: 0.18 * width, y: 0.88 * height };
      const p2 = { x: 0.44 * width, y: 0.92 * height };
      const p3 = { x: 0.65 * width, y: 0.58 * height };
      const p4 = { x: 0.84 * width, y: 0.22 * height };
      const p5 = { x: 1.05 * width, y: 0.35 * height };

      // Piecewise smooth interpolation through the key crests
      let x = 0;
      let y = 0;
      if (t < 0.5) {
        const u = t * 2;
        // Segment 1: from p0 through p1 to p2
        x = (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x;
        y = (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y;
      } else {
        const u = (t - 0.5) * 2;
        // Segment 2: from p2 through p3 & p4 to p5
        x = (1 - u) * (1 - u) * (1 - u) * p2.x +
            3 * (1 - u) * (1 - u) * u * p3.x +
            3 * (1 - u) * u * u * p4.x +
            u * u * u * p5.x;
        y = (1 - u) * (1 - u) * (1 - u) * p2.y +
            3 * (1 - u) * (1 - u) * u * p3.y +
            3 * (1 - u) * u * u * p4.y +
            u * u * u * p5.y;
      }

      // Add dynamic flowing undulation
      const undulation = Math.sin(t * Math.PI * 4 - timeOffset) * 12 +
                         Math.cos(t * Math.PI * 2 + timeOffset * 0.7) * 8;

      return { x, y: y + undulation };
    };

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001; // seconds
      ctx.clearRect(0, 0, width, height);

      // 1. Flowing Wave Filaments Layer
      // We draw multi-layered translucent undulating wave ribbons matching the moire lines
      const filamentCount = 8;
      const speedMultiplier = 1.0 + holdProgress * 1.5;

      for (let f = 0; f < filamentCount; f++) {
        ctx.beginPath();
        const fOffset = (f / filamentCount) * Math.PI * 2;
        const timeShift = elapsed * 0.6 * speedMultiplier + fOffset;
        const phaseOffsetY = (f - filamentCount / 2) * 14;

        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const pt = getWavePoint(t, timeShift);
          const y = pt.y + phaseOffsetY * Math.sin(t * Math.PI);

          if (s === 0) {
            ctx.moveTo(pt.x, y);
          } else {
            ctx.lineTo(pt.x, y);
          }
        }

        // Color transitions along the wave: Gold/Orange -> Magenta -> Cyan
        const grad = ctx.createLinearGradient(0, height * 0.8, width, height * 0.3);
        const alphaBase = (0.12 + Math.sin(elapsed * 1.2 + f) * 0.05) * (1.0 + intensity * 0.8);
        grad.addColorStop(0.0, `rgba(255, 122, 24, ${alphaBase * 0.9})`);
        grad.addColorStop(0.3, `rgba(227, 75, 191, ${alphaBase * 0.8})`);
        grad.addColorStop(0.65, `rgba(117, 72, 255, ${alphaBase * 0.85})`);
        grad.addColorStop(0.85, `rgba(66, 217, 255, ${alphaBase * 1.1})`);
        grad.addColorStop(1.0, `rgba(20, 123, 255, ${alphaBase * 0.7})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 + (f % 3 === 0 ? 1.0 : 0);
        ctx.stroke();
      }

      // 2. Travelling Luminous Pulse Wave
      // A soft, glowing wave packet that rides smoothly along the ribbon
      const pulseT = (elapsed * 0.18 * speedMultiplier) % 1.0;
      const pulsePt = getWavePoint(pulseT, elapsed * 0.6);
      const pulseGrad = ctx.createRadialGradient(pulsePt.x, pulsePt.y, 0, pulsePt.x, pulsePt.y, 140);
      pulseGrad.addColorStop(0, 'rgba(66, 217, 255, 0.35)');
      pulseGrad.addColorStop(0.4, 'rgba(117, 72, 255, 0.18)');
      pulseGrad.addColorStop(1, 'rgba(3, 7, 24, 0)');
      ctx.fillStyle = pulseGrad;
      ctx.beginPath();
      ctx.arc(pulsePt.x, pulsePt.y, 140, 0, Math.PI * 2);
      ctx.fill();

      // 3. Flowing Micro-Luminescence Particles along wave trajectory
      particlesRef.current.forEach((p) => {
        p.t += p.speed * speedMultiplier;
        if (p.t > 1.0) p.t = 0;

        const pt = getWavePoint(p.t, elapsed * 0.5);
        const px = pt.x;
        const py = pt.y + p.offsetY;

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.5 + Math.sin(elapsed * 2 + p.t * 10) * 0.3);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // 4. Reactive Energy Ring expansion on Contact / Blast
      if (phase === 'PHASE_C_CONTACT' || phase === 'PHASE_D_BLAST') {
        const cx = width * 0.5;
        const cy = height * 0.52;
        const blastRadius = ((elapsed * 400) % (width * 0.8)) + 50;
        const ringGrad = ctx.createRadialGradient(cx, cy, blastRadius - 30, cx, cy, blastRadius + 30);
        ringGrad.addColorStop(0, 'rgba(66, 217, 255, 0)');
        ringGrad.addColorStop(0.5, 'rgba(66, 217, 255, 0.35)');
        ringGrad.addColorStop(0.7, 'rgba(214, 181, 111, 0.25)');
        ringGrad.addColorStop(1, 'rgba(117, 72, 255, 0)');
        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, blastRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, intensity, holdProgress]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none bg-[#030718]">
      {/* 1. Official Flowing-Wave Background Reference Asset (High-Res 1920x1080 Lanczos) */}
      <img
        src="/assets/background/aurora-waves.jpg"
        alt="MRF 2026 Aurora Wave Inauguration Background"
        className="w-full h-full object-cover object-center transition-all duration-700"
        style={{
          transform: `scale(${1.0 + intensity * 0.02})`,
          filter: `contrast(1.05) saturate(1.08) brightness(${1.0 + intensity * 0.2})`,
        }}
      />

      {/* 2. Living Interactive Canvas: Flowing Wave Filaments & Energy Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* 3. Subtle Central Contrast Depth Zone (Frames hand without obscuring waves) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse at 50% 50%,
            rgba(3, 7, 24, 0.42) 0%,
            rgba(3, 7, 24, 0.2) 45%,
            transparent 72%
          )`,
        }}
      />

      {/* 4. Top Header & Typography Contrast Gradient (Razor-sharp institutional readability) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(3, 7, 24, 0.72) 0%,
            rgba(3, 7, 24, 0.35) 16%,
            transparent 32%,
            transparent 72%,
            rgba(3, 7, 24, 0.45) 88%,
            rgba(3, 7, 24, 0.75) 100%
          )`,
        }}
      />

      {/* 5. Elegant Soft Atmospheric Edge Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 110px rgba(3, 7, 24, 0.75)',
        }}
      />
    </div>
  );
};
