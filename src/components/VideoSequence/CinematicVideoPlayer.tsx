import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VideoSlotId, VideoAudioPolicy } from '../../types';
import { soundEngine } from '../../audio/SoundEngine';

interface CinematicVideoPlayerProps {
  currentSlot: VideoSlotId;
  videoSrc: string;
  nextVideoSrc?: string;
  audioPolicy: VideoAudioPolicy;
  onEnded: () => void;
  onError: (errorMessage: string) => void;
}

export const CinematicVideoPlayer: React.FC<CinematicVideoPlayerProps> = ({
  currentSlot,
  videoSrc,
  nextVideoSrc,
  audioPolicy,
  onEnded,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync with sound engine when video mounts/unmounts
  useEffect(() => {
    soundEngine.onVideoPlaybackStart(audioPolicy);
    return () => {
      soundEngine.onVideoPlaybackEnd(audioPolicy);
    };
  }, [audioPolicy]);

  // Attempt autoPlay whenever videoSrc changes
  useEffect(() => {
    setIsLoaded(false);
    setIsPlaying(false);
    setHasError(false);
    setErrorMessage(null);

    const video = videoRef.current;
    if (!video) return;

    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn(`Video autoplay deferred for ${currentSlot}:`, err);
          // If browser restricts unmuted autoplay, try once with muted or wait for user interaction
          video.play().catch(() => {});
        });
    }
  }, [videoSrc, currentSlot]);

  // Handle actual video 'ended' event
  const handleEnded = useCallback(() => {
    console.log(`✓ Video ${currentSlot} ended cleanly via HTML5 video 'ended' event.`);
    onEnded();
  }, [currentSlot, onEnded]);

  // Handle video loading or decoding error
  const handleError = useCallback(() => {
    const error = videoRef.current?.error;
    const msg = error ? `Code ${error.code}: ${error.message}` : 'Failed to load video stream';
    console.error(`Error playing video ${currentSlot} (${videoSrc}):`, msg);
    setHasError(true);
    setErrorMessage(msg);
    onError(msg);
  }, [currentSlot, videoSrc, onError]);

  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center select-none overflow-hidden">
      {/* Active Main Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        playsInline
        controls={false}
        className={`w-full h-full object-contain transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadedData={() => setIsLoaded(true)}
        onPlay={() => setIsPlaying(true)}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Hidden Background Preload for Next Video Slot */}
      {nextVideoSrc && (
        <video
          src={nextVideoSrc}
          preload="auto"
          className="hidden pointer-events-none"
          muted
        />
      )}

      {/* Constant Institutional MIT Logo (Bottom-Right Corner Bug) */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none flex items-center justify-center animate-fade-in">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-[#030718] border-2 border-[#D6B56F] shadow-[0_0_20px_rgba(214,181,111,0.5),0_0_35px_rgba(3,7,24,0.95)] flex items-center justify-center backdrop-blur-md">
          <img
            src="/assets/logos/mitm-circular.png"
            alt="Maharaja Institute of Technology Mysore"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* Graceful Fallback if Video File Missing / Decode Fails */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-8 z-50">
          <div className="px-6 py-3 rounded-full border border-amber-400/50 bg-amber-950/40 text-amber-300 font-mono text-sm uppercase tracking-widest mb-4">
            Video Playback Notice • {currentSlot.toUpperCase()}
          </div>
          <p className="text-gray-300 font-sans text-base max-w-lg text-center mb-6">
            {errorMessage || 'Video stream could not be loaded.'}
          </p>
          <button
            onClick={onEnded}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#147BFF] to-[#42D9FF] text-white font-cinematic font-bold tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
          >
            Advance to Next Phase →
          </button>
        </div>
      )}
    </div>
  );
};
