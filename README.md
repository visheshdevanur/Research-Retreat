# MRF Research Retreat 2026 — Cinematic Digital Inauguration

**Maharaja Institute of Technology, Mysore**  
*Hollywood-Grade Hand-Activated Digital Inauguration Experience for 1920 × 1080 LED Screen*

---

## 🌟 Executive Overview

This application is an independent, art-directed digital inauguration experience designed specifically for the moment the Chief Guest places their hand in front of the camera, aligning with a suspended 3D holographic hand target on the main auditorium LED screen.

Powered by **Three.js WebGL**, **MediaPipe Computer Vision**, custom procedural shaders, and a **100% Offline Web Audio API Synthesizer**, this project delivers a world-class technological inauguration with zero cloud dependencies.

---

## 🎬 Cinematic Sequence Choreography

```
[ PHASE A: DORMANT ]
   │  • Deep midnight navy (#06172F) & institutional blue (#092C60) atmosphere
   │  • Volumetric golden light shafts & cosmic drifting stardust particles
   │  • Holographic hand target materialises with glowing contour wireframes
   │  • "THE MOMENT OF DISCOVERY BEGINS" • "CHIEF GUEST, PLEASE PLACE YOUR HAND"
   ▼
[ PHASE B: REAL-TIME HAND DETECTION & ALIGNMENT ]
   │  • Real-time webcam tracking via MediaPipe 21 hand landmarks
   │  • 3D target dynamically tilts in space toward palm coordinates (parallax)
   │  • Luminous vertical scanning beam sweeps across the hand
   │  • Segmented gold calibration dial fills from 0% to 100% over 1.8s hold
   │  • Procedural rising harmonic resonance audio feedback
   │  • Graceful progress decay if hand retreats (no jarring cuts)
   ▼
[ PHASE C: THE MOMENT OF CONTACT (Signature Moment) ]
   │  • 5 fingers ignite sequentially (Thumb → Index → Middle → Ring → Pinky)
   │  • Intense concentrated golden flash at palm contact center
   │  • Deep sub-bass energy impact (95Hz → 28Hz) & electric surge
   │  • Concentric shockwave rings expand outward with blue energy filaments
   ▼
[ PHASE D: THE GRAND INAUGURATION BLAST ]
   │  • Massive golden shockwave expanding across the complete 1920×1080 display
   │  • 500+ golden burst particles with dynamic motion trails
   │  • Volumetric light scattering & metallic champagne confetti shower
   │  • Resonant cinematic brass orchestral detonation chord
   ▼
[ PHASE E1: MIT MYSORE INSTITUTIONAL REVEAL ]
   │  • MANDATORY FIRST REVEAL: Maharaja Institute of Technology, Mysore
   │  • Original MIT Mysore Crest (`mitm-logo.jpg`) assembled with light sweep
   │  • Deep heraldic institutional gong & golden filigree frame hold (4.5s)
   ▼
[ PHASE E2: MRF IDENTITY REVEAL ]
   │  • MANDATORY SECOND REVEAL: MRF Research Retreat 2026
   │  • Original MRF Logo (`mrf-logo.png`) revealed via blue energy rings
   │  • Resonant electric pulse & golden harmonic resolution hold (4.5s)
   ▼
[ PHASE F: FINAL INAUGURATION STAGE ]
   │  • Permanent triumphant composition:
   │    - "INAUGURATED" in sculpted metallic gold typography
   │    - Balanced side-by-side presentation of both original logos
   │    - "MRF RESEARCH RETREAT 2026" & "MAHARAJA INSTITUTE OF TECHNOLOGY, MYSORE"
   │  • Holds indefinitely until operator resets or exits
```

---

## 🎛️ Master Operator Controls

The operator console is strictly hidden from the audience during the ceremony:

| Action | Control | Purpose |
|---|---|---|
| **Toggle Operator Console** | `CTRL + SHIFT + P` | Opens hidden backstage settings & test console |
| **Emergency Manual Activation** | `SPACEBAR` or button in console | Instantly triggers contact blast if lighting or guest alignment is difficult |
| **Reset / Replay Ceremony** | `R` (in console) | Gracefully returns experience to Phase A |
| **Toggle 1920×1080 Fullscreen** | Console button or `F11` | Fills auditorium LED display |
| **Direct Phase Jump** | Console Phase Grid | Instantly jump to any phase (A, B, C, D, E1, E2, F) for rehearsal |
| **Live Camera Skeleton** | Checkbox in console | Shows real-time palm center and landmark skeleton |
| **Secret Click Hotspot** | Click 3 times in bottom-left corner | Opens console without keyboard attached |

---

## 🚀 Quick Launch Instructions

### 1. Rehearsal / Dev Mode
Double click:
```bash
DEV_MODE.bat
```
Or run:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 2. Live Ceremony Presentation (Kiosk Fullscreen)
Double click:
```bash
START_EXPERIENCE.bat
```
This serves the optimized production build and opens Microsoft Edge / Google Chrome in full-screen presentation mode on the 1920×1080 LED screen.

---

## 🛡️ 100% Offline & Event-Day Reliability
- **Local Hand-Tracking Models**: All MediaPipe Wasm and TFLite neural networks are pre-downloaded and stored in `/public/assets/hand-tracking/`.
- **Procedural Web Audio Engine**: All sub-bass booms, risers, scanning tones, and orchestral chords are synthesized in real-time via the Web Audio API. No external MP3 files to buffer or fail.
- **Original Institutional Logos**: Official MIT Mysore (`mitm-logo.jpg`) and MRF (`mrf-logo.png`) assets preserved in their authentic colors, proportions, and typography.
