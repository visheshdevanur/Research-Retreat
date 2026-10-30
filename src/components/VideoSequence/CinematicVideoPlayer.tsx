import React, { useRef, useEffect, useState, useCallback } from 'react';
import { InaugurationPhase, VideoAudioPolicy } from '../../types';
import { soundEngine } from '../../audio/SoundEngine';

interface CinematicVideoPlayerProps {
  phase: InaugurationPhase;
  video01Src: string;
  video02Src: string;
  videoAudioPolicy: VideoAudioPolicy;
  onPhaseChange: (phase: InaugurationPhase) => void;
  onSecretClick: () => void;
}

export const CinematicVideoPlayer: React.FC<CinematicVideoPlayerProps> = ({
  phase,
  video01Src,
  video02Src,
  videoAudioPolicy,
  onPhaseChange,
  onSecretClick,
}) => {
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);

  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);
  const isVideoPhase = phase === 'PHASE_VIDEO_01' || phase === 'PHASE_VIDEO_02';

  // Audio policy sync
  useEffect(() => {
    if (isVideoPhase) {
      soundEngine.onVideoPlaybackStart(videoAudioPolicy);
    }
  }, [isVideoPhase, videoAudioPolicy]);

  // Sync active slot with phase changes (e.g. from operator panel)
  useEffect(() => {
    if (phase === 'PHASE_VIDEO_01') {
      setActiveSlot(1);
      const v1 = video1Ref.current;
      if (v1) {
        v1.currentTime = 0;
        v1.play().catch(() => {});
      }
    } else if (phase === 'PHASE_VIDEO_02') {
      setActiveSlot(2);
      const v2 = video2Ref.current;
      if (v2) {
        v2.currentTime = 0;
        v2.play().catch(() => {});
      }
    }
  }, [phase]);

  // Video 1 ended -> Smooth 600ms Crossfade to Video 2
  const handleVideo1Ended = useCallback(() => {
    console.log('✓ Video 1 completed: initiating smooth crossfade to Video 2...');
    setIsCrossfading(true);
    setActiveSlot(2);
    onPhaseChange('PHASE_VIDEO_02');

    const v2 = video2Ref.current;
    if (v2) {
      v2.currentTime = 0;
      v2.play().catch((err) => console.warn('Video 2 play deferred:', err));
    }

    // End crossfade state after transition completes
    window.setTimeout(() => {
      setIsCrossfading(false);
      const v1 = video1Ref.current;
      if (v1) v1.pause();
    }, 600);
  }, [onPhaseChange]);

  // Video 2 ended -> Smooth 700ms Dissolve into Final Screen
  const handleVideo2Ended = useCallback(() => {
    console.log('✓ Video 2 completed: initiating smooth dissolve into Final Inauguration Screen...');
    onPhaseChange('PHASE_F_FINAL');
    window.setTimeout(() => {
      const v2 = video2Ref.current;
      if (v2) v2.pause();
    }, 700);
  }, [onPhaseChange]);

  return (
    <div
      className={`fixed inset-0 z-40 bg-black flex items-center justify-center select-none overflow-hidden transition-opacity duration-700 ease-in-out ${
        isVideoPhase ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* VIDEO 1 CHANNEL */}
      <video
        ref={video1Ref}
        src={video01Src}
        preload="auto"
        playsInline
        controls={false}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-600 ease-in-out ${
          activeSlot === 1 ? 'opacity-100 z-20' : 'opacity-0 z-10 pointer-events-none'
        }`}
        onEnded={handleVideo1Ended}
      />

      {/* VIDEO 2 CHANNEL */}
      <video
        ref={video2Ref}
        src={video02Src}
        preload="auto"
        playsInline
        controls={false}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-600 ease-in-out ${
          activeSlot === 2 ? 'opacity-100 z-20' : 'opacity-0 z-10 pointer-events-none'
        }`}
        onEnded={handleVideo2Ended}
      />

      {/* Constant Institutional MIT Logo (Bottom-Right Corner Watermark Cover) */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none flex items-center justify-center transition-all duration-500">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-[#030718] border-2 border-[#D6B56F] shadow-[0_0_20px_rgba(214,181,111,0.5),0_0_35px_rgba(3,7,24,0.95)] flex items-center justify-center backdrop-blur-md">
          <img
            src="/assets/logos/mitm-circular.png"
            alt="Maharaja Institute of Technology Mysore"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* Secret Hotspot for Operator Console during Video (Triple click) */}
      <div
        onClick={onSecretClick}
        title="Triple-click for Operator Console"
        className="fixed bottom-0 left-0 w-8 h-8 opacity-0 hover:opacity-10 cursor-pointer z-50 pointer-events-auto"
      />
    </div>
  );
};
