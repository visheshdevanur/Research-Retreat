import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const VolumetricAtmosphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. 2D Canvas for Deep Atmospheric Nebula & Moving Aurora Waves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const renderNebula = () => {
      t += 0.005;
      animId = requestAnimationFrame(renderNebula);

      const w = canvas.width;
      const h = canvas.height;

      // Base background: Deep midnight navy (#030B17 -> #06172F)
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.85);
      bgGrad.addColorStop(0, '#092246');
      bgGrad.addColorStop(0.45, '#06172F');
      bgGrad.addColorStop(1, '#030B17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Organic pulsating institutional blue aurora cloud
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const cx1 = w * 0.5 + Math.sin(t * 0.7) * 120;
      const cy1 = h * 0.45 + Math.cos(t * 0.5) * 80;
      const grad1 = ctx.createRadialGradient(cx1, cy1, 80, cx1, cy1, w * 0.55);
      grad1.addColorStop(0, 'rgba(9, 44, 96, 0.45)');
      grad1.addColorStop(0.5, 'rgba(14, 62, 133, 0.18)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Warm golden core aura behind the central stage
      const cx2 = w * 0.5 + Math.cos(t * 0.6) * 60;
      const cy2 = h * 0.52 + Math.sin(t * 0.8) * 40;
      const grad2 = ctx.createRadialGradient(cx2, cy2, 40, cx2, cy2, 380);
      grad2.addColorStop(0, 'rgba(217, 165, 46, 0.12)');
      grad2.addColorStop(0.5, 'rgba(234, 210, 154, 0.05)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // Subtle electric-blue highlight wave
      const cx3 = w * 0.5 - Math.sin(t * 0.9) * 150;
      const cy3 = h * 0.55 + Math.cos(t * 0.7) * 70;
      const grad3 = ctx.createRadialGradient(cx3, cy3, 20, cx3, cy3, 420);
      grad3.addColorStop(0, 'rgba(0, 210, 255, 0.08)');
      grad3.addColorStop(0.6, 'rgba(56, 189, 248, 0.02)');
      grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, w, h);

      // Anamorphic center horizontal light gleam
      const horizonY = h * 0.52;
      const hGrad = ctx.createLinearGradient(0, horizonY - 2, 0, horizonY + 2);
      hGrad.addColorStop(0, 'rgba(234, 210, 154, 0)');
      hGrad.addColorStop(0.5, 'rgba(234, 210, 154, 0.15)');
      hGrad.addColorStop(1, 'rgba(234, 210, 154, 0)');
      ctx.fillStyle = hGrad;
      ctx.fillRect(w * 0.15, horizonY - 1, w * 0.7, 2);

      ctx.restore();

      // Deep cinematic vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.8);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(3, 11, 23, 0.7)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    };

    renderNebula();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Three.js 3D Golden Embers & Volumetric God Rays
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // 800 Rising Golden Star Embers
    const emberCount = 800;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberColors = new Float32Array(emberCount * 3);
    const emberSizes = new Float32Array(emberCount);
    const emberVelocities: { x: number; y: number; z: number; phase: number }[] = [];

    const goldColor = new THREE.Color(0xd9a52e);
    const champagneColor = new THREE.Color(0xead29a);
    const cyanColor = new THREE.Color(0x00d2ff);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 26;
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      emberVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: 0.003 + Math.random() * 0.007,
        z: (Math.random() - 0.5) * 0.002,
        phase: Math.random() * Math.PI * 2,
      });

      const r = Math.random();
      const col = r > 0.65 ? goldColor : r > 0.35 ? champagneColor : r > 0.15 ? whiteColor : cyanColor;
      emberColors[i * 3] = col.r;
      emberColors[i * 3 + 1] = col.g;
      emberColors[i * 3 + 2] = col.b;

      emberSizes[i] = 0.08 + Math.random() * 0.14;
    }

    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(emberColors, 3));

    // Custom circular soft glow texture
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 64;
    texCanvas.height = 64;
    const tCtx = texCanvas.getContext('2d');
    if (tCtx) {
      const g = tCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255, 255, 255, 1)');
      g.addColorStop(0.2, 'rgba(234, 210, 154, 0.9)');
      g.addColorStop(0.5, 'rgba(217, 165, 46, 0.4)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      tCtx.fillStyle = g;
      tCtx.fillRect(0, 0, 64, 64);
    }
    const emberTex = new THREE.CanvasTexture(texCanvas);

    const emberMat = new THREE.PointsMaterial({
      size: 0.14,
      map: emberTex,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // 5 Slanted Volumetric Light Shafts
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    for (let s = 0; s < 5; s++) {
      const planeGeo = new THREE.PlaneGeometry(2.4 + s * 0.4, 26);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0xd9a52e,
        transparent: true,
        opacity: 0.02 + s * 0.01,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const shaft = new THREE.Mesh(planeGeo, planeMat);
      shaft.position.x = -8 + s * 4;
      shaft.position.y = 1;
      shaft.position.z = -3 + s * 0.4;
      shaft.rotation.z = -0.32;
      shaftGroup.add(shaft);
    }

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate embers with natural thermal rise and subtle sway
      const pos = embers.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        pos[i * 3 + 1] += emberVelocities[i].y;
        pos[i * 3] += Math.sin(time * 0.6 + emberVelocities[i].phase) * 0.003;
        pos[i * 3 + 2] += Math.cos(time * 0.4 + emberVelocities[i].phase) * 0.002;

        if (pos[i * 3 + 1] > 9) {
          pos[i * 3 + 1] = -9;
          pos[i * 3] = (Math.random() - 0.5) * 26;
        }
      }
      embers.geometry.attributes.position.needsUpdate = true;

      // Soft light shaft sweep
      shaftGroup.children.forEach((shaft, idx) => {
        shaft.position.x += Math.sin(time * 0.3 + idx) * 0.004;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      {/* 2D Canvas Nebula Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
      {/* Three.js 3D Particle & Light Shaft Stage */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
