import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InaugurationPhase, HandTrackingState } from '../../types';
import { DimensionalHolographicHand } from './DimensionalHolographicHand';
import { CircularPortal } from './CircularPortal';

interface HolographicHandTargetProps {
  phase: InaugurationPhase;
  trackingState: HandTrackingState;
  contactFingerIndex: number;
  onTargetClick?: () => void;
}

export const HolographicHandTarget: React.FC<HolographicHandTargetProps> = ({
  phase,
  trackingState,
  contactFingerIndex,
  onTargetClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // 3D Objects
  const targetGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Smooth tilt interpolation
  const targetTilt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentTilt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update target tilt from hand position
  useEffect(() => {
    if (trackingState.detected) {
      targetTilt.current.y = (trackingState.palmCenter.x - 0.5) * 0.45;
      targetTilt.current.x = (trackingState.palmCenter.y - 0.51) * -0.45;
    } else {
      targetTilt.current.x = 0;
      targetTilt.current.y = 0;
    }
  }, [trackingState.detected, trackingState.palmCenter]);

  // Handle mouse hover tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackingState.detected) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetTilt.current.y = x * 0.35;
      targetTilt.current.x = -y * 0.35;
    }
  };

  const handleMouseLeave = () => {
    if (!trackingState.detected) {
      targetTilt.current.x = 0;
      targetTilt.current.y = 0;
    }
  };

  // Three.js Stardust Halo Setup (clean, restrained, cinematic)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 700;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const targetGroup = new THREE.Group();
    targetGroupRef.current = targetGroup;
    scene.add(targetGroup);

    // Controlled Orbiting Stardust Particles (380 particles)
    const particleCount = 380;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const yOffsets = new Float32Array(particleCount);

    const cyanColor = new THREE.Color(0x42d9ff);
    const electricBlueColor = new THREE.Color(0x147bff);
    const violetColor = new THREE.Color(0x7548ff);
    const magentaColor = new THREE.Color(0xe34bbf);
    const goldColor = new THREE.Color(0xd6b56f);
    const whiteColor = new THREE.Color(0xf8faff);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.8 + Math.random() * 1.45;
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 1.8;

      radii[i] = radius;
      angles[i] = angle;
      speeds[i] = (0.2 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
      yOffsets[i] = yOffset;

      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = yOffset;
      posArray[i * 3 + 2] = Math.sin(angle) * radius * 0.35;

      const rVal = Math.random();
      const mixed = rVal > 0.7 ? cyanColor :
                    rVal > 0.45 ? electricBlueColor :
                    rVal > 0.3 ? violetColor :
                    rVal > 0.15 ? goldColor : whiteColor;
      colorArray[i * 3] = mixed.r;
      colorArray[i * 3 + 1] = mixed.g;
      colorArray[i * 3 + 2] = mixed.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Circular Particle Texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(66, 217, 255, 0.85)');
      grad.addColorStop(0.7, 'rgba(117, 72, 255, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.075,
      map: particleTex,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    targetGroup.add(particles);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth tilt
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.08;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.08;

      if (targetGroupRef.current) {
        targetGroupRef.current.rotation.x = currentTilt.current.x + Math.sin(time * 0.6) * 0.025;
        targetGroupRef.current.rotation.y = currentTilt.current.y + Math.cos(time * 0.4) * 0.025;
      }

      // Orbit particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const speedMultiplier = 1.0 + (trackingState.holdProgress || 0) * 2.0;
        for (let i = 0; i < particleCount; i++) {
          angles[i] += speeds[i] * delta * speedMultiplier;
          positions[i * 3] = Math.cos(angles[i]) * radii[i];
          positions[i * 3 + 1] = yOffsets[i] + Math.sin(time * 1.8 + i) * 0.04;
          positions[i * 3 + 2] = Math.sin(angles[i]) * radii[i] * 0.35;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      onClick={onTargetClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      title="Place your hand in front of the webcam or click to inaugurate"
      className="relative w-full h-full flex items-center justify-center cursor-pointer group select-none"
    >
      {/* 1. Subtle 3D Stardust Particle Halo */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center z-0"
      />

      {/* 2. Dominant Elegant Circular Gold & Blue Portal */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <CircularPortal
          holdProgress={trackingState.holdProgress}
          isAligned={trackingState.aligned}
          isDetected={trackingState.detected}
        />
      </div>

      {/* 3. Dimensional Holographic Blue Glass Hand with Golden Fingertip Coronas */}
      <div className="relative z-20 w-full h-full flex items-center justify-center pointer-events-none group-hover:scale-[1.02] transition-transform duration-300">
        <DimensionalHolographicHand
          phase={phase}
          detectionState={trackingState.detectionState}
          holdProgress={trackingState.holdProgress}
          isAligned={trackingState.aligned}
          isDetected={trackingState.detected}
          contactFingerIndex={contactFingerIndex}
          landmarks={trackingState.landmarks}
          palmCenter={trackingState.palmCenter}
        />
      </div>
    </div>
  );
};
