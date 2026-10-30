/**
 * Cinematic Sound Engine for MRF 2026 Inauguration
 * Integrated with Official Background Audio Track & Procedural Ceremony SFX
 * Music: WhatsApp Audio 2026-10-30 at 15.22.51 (ceremony-theme.mp3)
 * Plus Hollywood-grade sound design: sub-bass impacts, harmonic risers,
 * holographic biometric scanning pulses, and triumphant ceremony fanfare.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private scanOsc: OscillatorNode | null = null;
  private scanGain: GainNode | null = null;
  private scanFilter: BiquadFilterNode | null = null;
  private isScanning = false;
  private isMuted = false;
  private volume = 0.85;
  private userInteractionBound = false;

  // Official Background Music Audio Element
  private bgAudio: HTMLAudioElement | null = null;
  private bgAudioStarted = false;

  constructor() {
    this.initBgAudio();
    this.bindUserInteraction();
  }

  private initBgAudio() {
    if (typeof window === 'undefined' || this.bgAudio) return;
    try {
      this.bgAudio = new Audio('/assets/audio/ceremony-theme.mp3');
      this.bgAudio.loop = true;
      this.bgAudio.volume = this.isMuted ? 0 : this.volume * 0.85;
      this.bgAudio.preload = 'auto';

      // Fallback path if mp3 fails
      this.bgAudio.onerror = () => {
        if (this.bgAudio && !this.bgAudio.src.includes('background-music.mpeg')) {
          console.warn('Audio mp3 fallback to mpeg source');
          this.bgAudio.src = '/assets/audio/background-music.mpeg';
          this.bgAudio.load();
        }
      };
    } catch (e) {
      console.warn('Background audio init error:', e);
    }
  }

  private bindUserInteraction() {
    if (this.userInteractionBound || typeof window === 'undefined') return;
    this.userInteractionBound = true;

    const resume = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      } else if (!this.ctx) {
        this.initContext();
      }

      // Start background music on first user interaction if not already playing
      if (this.bgAudio && this.bgAudio.paused) {
        this.bgAudio.play().catch(() => {});
        this.bgAudioStarted = true;
      }

      window.removeEventListener('click', resume);
      window.removeEventListener('keydown', resume);
      window.removeEventListener('touchstart', resume);
    };

    window.addEventListener('click', resume);
    window.addEventListener('keydown', resume);
    window.addEventListener('touchstart', resume);
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        this.masterGain.connect(compressor);
        compressor.connect(this.ctx.destination);
      } catch (e) {
        console.warn('AudioContext init deferred until user interaction');
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.bgAudio) {
      this.bgAudio.volume = muted ? 0 : this.volume * 0.85;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.bgAudio && !this.isMuted) {
      this.bgAudio.volume = this.volume * 0.85;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Phase A: Official Background Music Playback (Continuous & Persistent)
   */
  public startAmbientAtmosphere() {
    this.initContext();
    this.initBgAudio();

    if (this.bgAudio && this.bgAudio.paused) {
      this.bgAudio.volume = this.isMuted ? 0 : this.volume * 0.85;
      this.bgAudio.play().then(() => {
        this.bgAudioStarted = true;
      }).catch((e) => {
        // Will auto-start upon first user click/interaction
        console.log('Autoplay waiting for user gesture:', e.message);
      });
    }
  }

  public stopAmbientAtmosphere() {
    if (this.bgAudio && !this.bgAudio.paused) {
      // Gentle fade down rather than sudden cut
      let currentVol = this.bgAudio.volume;
      const fadeInterval = setInterval(() => {
        currentVol = Math.max(0, currentVol - 0.05);
        if (this.bgAudio) this.bgAudio.volume = currentVol;
        if (currentVol <= 0) {
          clearInterval(fadeInterval);
          this.bgAudio?.pause();
        }
      }, 50);
    }
  }

  /**
   * Video Audio Synchronization:
   * Handles background music according to the operator's audio policy:
   * 'pause_music' | 'duck_music' | 'keep_music'
   */
  public onVideoPlaybackStart(policy: 'pause_music' | 'duck_music' | 'keep_music' = 'keep_music') {
    if (!this.bgAudio) {
      this.initBgAudio();
    }
    if (policy === 'pause_music') {
      this.bgAudio?.pause();
    } else if (policy === 'duck_music') {
      if (this.bgAudio) this.bgAudio.volume = this.isMuted ? 0 : this.volume * 0.25;
    } else {
      // 'keep_music': ensure background ceremony audio plays through videos uninterrupted
      if (this.bgAudio) {
        this.bgAudio.volume = this.isMuted ? 0 : this.volume * 0.85;
        if (this.bgAudio.paused) {
          this.bgAudio.play().catch(() => {});
        }
      }
    }
  }

  public onVideoPlaybackEnd(
    policy: 'pause_music' | 'duck_music' | 'keep_music' = 'keep_music',
    targetScreen: 'video' | 'final' = 'video',
    playMusicOnFinal: boolean = true
  ) {
    if (!this.bgAudio) return;
    if (targetScreen === 'final' && !playMusicOnFinal) {
      this.bgAudio.pause();
      return;
    }
    if (this.bgAudio.paused) {
      this.bgAudio.volume = this.isMuted ? 0 : this.volume * 0.85;
      this.bgAudio.play().catch(() => {});
    } else {
      this.bgAudio.volume = this.isMuted ? 0 : this.volume * 0.85;
    }
  }

  /**
   * Phase B: Delicate futuristic biometric scanning sound & alignment riser
   */
  public updateScanningSound(active: boolean, progress: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;

      if (active) {
        if (!this.isScanning || !this.scanOsc || !this.scanGain) {
          this.isScanning = true;

          this.scanGain = this.ctx.createGain();
          this.scanGain.gain.setValueAtTime(0, t);
          this.scanGain.gain.linearRampToValueAtTime(0.18, t + 0.3);

          this.scanOsc = this.ctx.createOscillator();
          this.scanOsc.type = 'sawtooth';
          this.scanOsc.frequency.setValueAtTime(220, t);

          this.scanFilter = this.ctx.createBiquadFilter();
          this.scanFilter.type = 'bandpass';
          this.scanFilter.frequency.setValueAtTime(800, t);
          this.scanFilter.Q.setValueAtTime(8.0, t);

          this.scanOsc.connect(this.scanFilter);
          this.scanFilter.connect(this.scanGain);
          this.scanGain.connect(this.masterGain);

          this.scanOsc.start();
        }

        // Modulate frequency based on hold progress (220Hz -> 880Hz harmonic rise)
        if (this.scanOsc && this.scanFilter && this.scanGain) {
          const targetFreq = 220 + progress * 660;
          const filterFreq = 800 + progress * 2400;
          this.scanOsc.frequency.setTargetAtTime(targetFreq, t, 0.05);
          this.scanFilter.frequency.setTargetAtTime(filterFreq, t, 0.05);

          // Subtle pulse modulation
          const pulse = Math.sin(t * (12 + progress * 20)) * 0.04;
          this.scanGain.gain.setTargetAtTime(0.18 + pulse + progress * 0.12, t, 0.05);
        }
      } else {
        if (this.isScanning && this.scanGain) {
          this.isScanning = false;
          this.scanGain.gain.linearRampToValueAtTime(0, t + 0.2);
          setTimeout(() => {
            try {
              this.scanOsc?.stop();
              this.scanOsc?.disconnect();
              this.scanOsc = null;
              this.scanGain = null;
              this.scanFilter = null;
            } catch {
              // ignore
            }
          }, 250);
        }
      }
    } catch {
      // Audio error fallback
    }
  }

  /**
   * Phase C: Palm Contact Moment (sub-bass impact + crystalline chime)
   */
  public playContactMoment() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Heavy Sub-Bass Sine Thud (60Hz drop to 28Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(75, t);
      subOsc.frequency.exponentialRampToValueAtTime(28, t + 0.6);

      subGain.gain.setValueAtTime(0.85, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.95);

      // 2. High Crystalline Chime Cluster
      const chimeFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C Major Chord
      chimeFreqs.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.03);

        gain.gain.setValueAtTime(0.2, t + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2 + i * 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + i * 0.03);
        osc.stop(t + 1.4);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Phase D: Grand Inauguration Blast Detonation
   */
  public playInaugurationBlast() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Huge Subsonic Boom
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(90, t);
      boomOsc.frequency.exponentialRampToValueAtTime(24, t + 1.2);

      boomGain.gain.setValueAtTime(1.0, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

      boomOsc.connect(boomGain);
      boomGain.connect(this.masterGain);
      boomOsc.start(t);
      boomOsc.stop(t + 2.3);

      // 2. White Noise Shockwave Whoosh
      const bufferSize = this.ctx.sampleRate * 2.0;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1200, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 2.0);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      whiteNoise.start(t);
      whiteNoise.stop(t + 2.1);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Phase E1: MIT Mysore Logo Reveal Fanfare
   */
  public playMITRevealSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25]; // C-E-G-C Triumph arpeggio

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, t + idx * 0.12);

        gain.gain.setValueAtTime(0.25, t + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8 + idx * 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + idx * 0.12);
        osc.stop(t + 2.2);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Phase E2: MRF Brand Identity Reveal Chords
   */
  public playMRFRevealSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [329.63, 392.0, 493.88, 659.25]; // E-G-B-E Triumph major

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);

        gain.gain.setValueAtTime(0.28, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + idx * 0.1);
        osc.stop(t + 2.2);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Phase F: Final Grand Inauguration Fanfare
   */
  public playFinalTriumphantBed() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      // High triumphant brass-like bell swell
      const frequencies = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, t);

        gain.gain.setValueAtTime(0.18, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + idx * 0.06);
        osc.stop(t + 3.2);
      });
    } catch {
      // Audio fallback
    }
  }
}

export const soundEngine = new SoundEngine();
