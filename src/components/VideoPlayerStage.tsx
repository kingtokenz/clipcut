import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Smartphone,
  Square,
  RectangleHorizontal,
  Scissors,
  Layers,
  Sparkles,
  Type,
} from 'lucide-react';
import { ClipItem, AspectRatio, SpeakerCropMode, CaptionStyle } from '../types';
import { DynamicCaptions } from './DynamicCaptions';

interface VideoPlayerStageProps {
  clip: ClipItem;
  videoUrl?: string;
  thumbnailUrl?: string;
  onUpdateClipTimes: (startTime: number, endTime: number) => void;
  onUpdateCropMode: (mode: SpeakerCropMode) => void;
  onUpdateAspectRatio: (ratio: AspectRatio) => void;
  onUpdateCaptionStyle: (style: CaptionStyle) => void;
}

export const VideoPlayerStage: React.FC<VideoPlayerStageProps> = ({
  clip,
  videoUrl,
  thumbnailUrl,
  onUpdateClipTimes,
  onUpdateCropMode,
  onUpdateAspectRatio,
  onUpdateCaptionStyle,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(clip.startTime);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showFramingGuides, setShowFramingGuides] = useState(false);

  // Sync video time with clip start/end boundaries
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = clip.startTime;
      setCurrentTime(clip.startTime);
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [clip.id, clip.startTime]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Loop back to start if clip bounds reached
    if (time >= clip.endTime) {
      videoRef.current.currentTime = clip.startTime;
      videoRef.current.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < clip.startTime || videoRef.current.currentTime >= clip.endTime) {
        videoRef.current.currentTime = clip.startTime;
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    const boundedTime = Math.max(clip.startTime, Math.min(clip.endTime, newTime));
    if (videoRef.current) {
      videoRef.current.currentTime = boundedTime;
    }
    setCurrentTime(boundedTime);
  };

  const handleTrimStart = (newStart: number) => {
    if (newStart < clip.endTime - 3) {
      onUpdateClipTimes(Math.max(0, newStart), clip.endTime);
      handleSeek(newStart);
    }
  };

  const handleTrimEnd = (newEnd: number) => {
    if (newEnd > clip.startTime + 3) {
      onUpdateClipTimes(clip.startTime, newEnd);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Find active subtitle line and active word for dynamic captions
  const activeSubtitle = clip.subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  // Calculate pan offset for speaker framing crop in 9:16
  let cropTransform = 'translate-x-0';
  if (clip.speakerCropMode === 'left') {
    cropTransform = '-translate-x-[25%]';
  } else if (clip.speakerCropMode === 'right') {
    cropTransform = 'translate-x-[25%]';
  } else if (clip.speakerCropMode === 'auto_tracker') {
    // Simulated intelligent speaker auto-tracking pan based on time oscillations
    const progress = (currentTime - clip.startTime) / Math.max(1, clip.duration);
    const oscillation = Math.sin(progress * Math.PI * 4) * 15;
    cropTransform = `translate-x-[${Math.round(oscillation)}%]`;
  }

  // Aspect ratio classes
  const aspectClasses = {
    '9:16': 'w-[300px] sm:w-[320px] aspect-[9/16]',
    '1:1': 'w-[320px] sm:w-[380px] aspect-square',
    '4:5': 'w-[300px] sm:w-[340px] aspect-[4/5]',
    '16:9': 'w-[360px] sm:w-[480px] aspect-video',
  }[clip.aspectRatio || '9:16'];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-4">
      {/* Top Toolbar: Aspect Ratio & Speaker Crop */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-1">
        {/* Aspect Ratio selector */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => onUpdateAspectRatio('9:16')}
            title="9:16 Vertical (Shorts/TikTok/Reels)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              clip.aspectRatio === '9:16'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16</span>
          </button>

          <button
            onClick={() => onUpdateAspectRatio('1:1')}
            title="1:1 Square (Feed & Posts)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              clip.aspectRatio === '1:1'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1</span>
          </button>

          <button
            onClick={() => onUpdateAspectRatio('16:9')}
            title="16:9 Horizontal"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              clip.aspectRatio === '16:9'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RectangleHorizontal className="w-3.5 h-3.5" />
            <span>16:9</span>
          </button>
        </div>

        {/* Framing / Crop Mode Selector */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            <span className="text-zinc-500 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Crop:
            </span>
            {(['auto_tracker', 'split', 'center'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdateCropMode(mode)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors capitalize ${
                  clip.speakerCropMode === mode
                    ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'auto_tracker' ? 'Auto Face' : mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFramingGuides(!showFramingGuides)}
            className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showFramingGuides
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Toggle Safe Zone & Framing Overlay"
          >
            Guides
          </button>
        </div>
      </div>

      {/* Main Video Frame */}
      <div
        ref={containerRef}
        className={`relative ${aspectClasses} bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/90 group flex items-center justify-center transition-all duration-300`}
      >
        {/* Video Element */}
        {videoUrl ? (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            {clip.speakerCropMode === 'split' ? (
              // Split Screen Mode: Top & Bottom angles
              <div className="w-full h-full flex flex-col">
                <div className="w-full h-1/2 overflow-hidden relative border-b border-zinc-800">
                  <video
                    src={videoUrl}
                    className="w-full h-full object-cover scale-[1.3] -translate-x-[15%]"
                    muted
                    playsInline
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-zinc-300 font-mono">
                    SPEAKER A
                  </div>
                </div>
                <div className="w-full h-1/2 overflow-hidden relative">
                  <video
                    src={videoUrl}
                    className="w-full h-full object-cover scale-[1.3] translate-x-[15%]"
                    muted
                    playsInline
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-zinc-300 font-mono">
                    SPEAKER B
                  </div>
                </div>
              </div>
            ) : (
              // Single Stream with Auto-pan or Center crop
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                muted={isMuted}
                playsInline
                className={`w-full h-full object-cover transition-transform duration-500 cursor-pointer ${
                  clip.aspectRatio === '9:16' ? 'scale-[1.8]' : 'scale-100'
                } ${cropTransform}`}
              />
            )}
          </div>
        ) : (
          // Fallback Visualizer when no direct mp4 is attached
          <div
            onClick={togglePlay}
            className="w-full h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center p-6 text-center cursor-pointer relative"
          >
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
              />
            )}
            <div className="relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-zinc-300 max-w-xs">{clip.title}</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-emerald-400 font-mono">
                {formatSeconds(currentTime)} / {formatSeconds(clip.endTime)}
              </span>
            </div>
          </div>
        )}

        {/* Top Header Overlay: Hook Pill & Virality Tag */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[170px]">{clip.hook}</span>
          </div>

          <div className="px-2 py-1 rounded-lg bg-emerald-500/90 text-zinc-950 text-[11px] font-extrabold shadow-md flex items-center gap-1">
            <span>🔥 {clip.viralityScore}%</span>
          </div>
        </div>

        {/* Framing & Safe Zone Guides (when toggled) */}
        {showFramingGuides && (
          <div className="absolute inset-0 z-20 pointer-events-none border-2 border-dashed border-emerald-400/40 m-4 rounded-xl flex flex-col justify-between p-2">
            <div className="text-[9px] font-mono text-emerald-400/80 bg-black/60 px-1 rounded w-max">
              SAFE TITLE ZONE
            </div>
            <div className="text-center text-[9px] font-mono text-emerald-400/80 bg-black/60 px-1 rounded mx-auto">
              CAPTIONS SAFE AREA
            </div>
            <div className="text-right text-[9px] font-mono text-emerald-400/80 bg-black/60 px-1 rounded w-max ml-auto">
              UI CONTROLS MARGIN
            </div>
          </div>
        )}

        {/* Dynamic Animated Subtitles Overlay */}
        {activeSubtitle && (
          <DynamicCaptions
            style={clip.captionStyle}
            activeSubtitle={activeSubtitle}
            currentTime={currentTime}
            clipTitle={clip.title}
            hookText={clip.hook}
            position={clip.captionPosition}
            yOffset={clip.captionYOffset}
            fontSize={clip.captionFontSize}
            casing={clip.captionCasing}
            accentColor={clip.captionAccentColor}
            displayLimit={clip.captionDisplayLimit}
          />
        )}

        {/* Center Big Play Button Overlay on Hover/Paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 z-30 m-auto w-14 h-14 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-zinc-950 ml-1" />
          </button>
        )}
      </div>

      {/* Playback Controls & Timeline Scrubber */}
      <div className="w-full bg-[#11141c] border border-zinc-800/90 rounded-xl p-3 space-y-2.5 shadow-lg">
        {/* Dual Handle Timeline Trimmer Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <Scissors className="w-3 h-3" />
              Trim: {formatSeconds(clip.startTime)} - {formatSeconds(clip.endTime)}
            </span>
            <span className="text-zinc-200 font-semibold font-sans">
              Duration: {Math.round(clip.endTime - clip.startTime)}s
            </span>
            <span>Current: {formatSeconds(currentTime)}</span>
          </div>

          {/* Interactive Scrub Timeline */}
          <div className="relative h-6 bg-zinc-900 rounded-lg overflow-hidden flex items-center px-1 border border-zinc-800">
            {/* Waveform pattern simulation */}
            <div className="absolute inset-0 opacity-25 flex items-center gap-0.5 px-2 pointer-events-none">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-emerald-400 rounded-full"
                  style={{ height: `${20 + ((i * 17) % 65)}%` }}
                />
              ))}
            </div>

            {/* Active clip highlighted span */}
            <input
              type="range"
              min={clip.startTime}
              max={clip.endTime}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 accent-emerald-400 bg-transparent cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center font-bold transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />}
            </button>

            <button
              onClick={() => handleSeek(clip.startTime)}
              title="Replay from clip start"
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Playback speed toggle */}
            <button
              onClick={() => {
                const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
                setPlaybackRate(nextRate);
                if (videoRef.current) videoRef.current.playbackRate = nextRate;
              }}
              className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-semibold"
            >
              {playbackRate}x
            </button>

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (videoRef.current) videoRef.current.muted = !isMuted;
              }}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Trimming Adjusters */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <button
              onClick={() => handleTrimStart(clip.startTime - 2)}
              className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-[11px] text-zinc-300"
              title="Expand start by 2s"
            >
              -2s Start
            </button>
            <button
              onClick={() => handleTrimEnd(clip.endTime + 2)}
              className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-[11px] text-zinc-300"
              title="Extend end by 2s"
            >
              +2s End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
