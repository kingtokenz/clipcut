import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Split,
  Palette,
  Clock,
  Type,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Maximize2,
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Wand2,
  Activity,
  Zap,
} from 'lucide-react';
import {
  ClipItem,
  SubtitleLine,
  SubtitleWord,
  CaptionPosition,
  CaptionFontSize,
  CaptionCasing,
  CaptionStyle,
  CaptionDisplayLimit,
} from '../types';
import { DynamicCaptions } from './DynamicCaptions';
import {
  splitLineAtWord,
  splitLineInHalf,
  rechunkSubtitlesByLength,
  rechunkSubtitlesByLetters,
  autoSplitLongLines,
  mergeAdjacentLines,
  computeReadabilityStats,
  DISPLAY_LIMIT_OPTIONS,
} from '../utils/subtitleUtils';

interface CaptionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: ClipItem;
  videoUrl?: string;
  thumbnailUrl?: string;
  onUpdateClip: (updated: ClipItem) => void;
}

const PALETTE_COLORS = [
  { name: 'Laser Yellow', hex: '#FCFF00' },
  { name: 'Electric Lime', hex: '#53FF01' },
  { name: 'Cyber Cyan', hex: '#00FFF0' },
  { name: 'Hot Coral', hex: '#FF3B30' },
  { name: 'Purple Blaze', hex: '#A855F7' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export const CaptionEditModal: React.FC<CaptionEditModalProps> = ({
  isOpen,
  onClose,
  clip,
  videoUrl,
  thumbnailUrl,
  onUpdateClip,
}) => {
  if (!isOpen) return null;

  // Tabs: 'inspector' (lines & word timing/color/split) | 'readability' (length customization & auto-split) | 'position' (position & safe zones) | 'styles'
  const [activeTab, setActiveTab] = useState<'inspector' | 'readability' | 'position' | 'styles'>('inspector');

  // Video playback in preview
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(clip.startTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);

  // Dynamic Pop Animation state
  const [poppedWordIndex, setPoppedWordIndex] = useState<number | null>(null);
  const [popBadgeText, setPopBadgeText] = useState<string>('POP!');
  const [popKey, setPopKey] = useState<number>(1);

  // Subtitle search & inspector
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLineIdx, setExpandedLineIdx] = useState<number | null>(0);
  const [activeColorPickerWord, setActiveColorPickerWord] = useState<{ lineIdx: number; wordIdx: number } | null>(null);
  const [targetWordLength, setTargetWordLength] = useState<number>(clip.captionMaxWords || 3);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const subtitles = useMemo(() => clip.subtitles || [], [clip.subtitles]);

  // Readability telemetry
  const stats = useMemo(
    () => computeReadabilityStats(subtitles, clip.duration || (clip.endTime - clip.startTime)),
    [subtitles, clip.duration, clip.endTime, clip.startTime]
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Find active subtitle line for preview
  const activeSubtitle = useMemo(() => {
    return subtitles.find((s) => currentTime >= s.start && currentTime <= s.end);
  }, [subtitles, currentTime]);

  // Trigger dynamic pop animation
  const triggerDynamicPop = (wordIdx: number, badge = 'POP!', seekTimestamp?: number) => {
    if (seekTimestamp !== undefined) {
      setCurrentTime(seekTimestamp);
      if (videoRef.current) {
        videoRef.current.currentTime = seekTimestamp;
      }
    }
    setPoppedWordIndex(wordIdx);
    setPopBadgeText(badge);
    setPopKey(Date.now());

    // Auto-clear pop state after animation completes
    setTimeout(() => {
      setPoppedWordIndex(null);
    }, 1200);
  };

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      if (t >= clip.endTime) {
        videoRef.current.currentTime = clip.startTime;
        setCurrentTime(clip.startTime);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= clip.endTime || currentTime < clip.startTime) {
        videoRef.current.currentTime = clip.startTime;
        setCurrentTime(clip.startTime);
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (newTime: number) => {
    const bounded = Math.max(clip.startTime, Math.min(clip.endTime, newTime));
    setCurrentTime(bounded);
    if (videoRef.current) {
      videoRef.current.currentTime = bounded;
    }
  };

  const loopActiveLine = () => {
    if (!activeSubtitle) return;
    handleSeek(activeSubtitle.start);
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // --- SUBTITLE MUTATION HANDLERS WITH DYNAMIC POP TRIGGER ---

  // 1. Update word timing
  const handleUpdateWordTiming = (
    lineIdx: number,
    wordIdx: number,
    field: 'start' | 'end',
    delta: number
  ) => {
    const targetLine = subtitles[lineIdx];
    if (!targetLine || !targetLine.words) return;

    const words = [...targetLine.words];
    const targetWord = words[wordIdx];
    if (!targetWord) return;

    let newStart = targetWord.start;
    let newEnd = targetWord.end;

    if (field === 'start') {
      newStart = Number(Math.max(0, newStart + delta).toFixed(2));
      if (newStart >= newEnd) newEnd = Number((newStart + 0.1).toFixed(2));
    } else {
      newEnd = Number(Math.max(newStart + 0.1, newEnd + delta).toFixed(2));
    }

    words[wordIdx] = {
      ...targetWord,
      start: newStart,
      end: newEnd,
    };

    // Recalculate line boundaries
    const lineStart = Math.min(...words.map((w) => w.start));
    const lineEnd = Math.max(...words.map((w) => w.end));

    const updatedSubtitles = [...subtitles];
    updatedSubtitles[lineIdx] = {
      ...targetLine,
      start: lineStart,
      end: lineEnd,
      words,
    };

    onUpdateClip({
      ...clip,
      subtitles: updatedSubtitles,
    });

    // TRIGGER DYNAMIC POP
    const badgeLabel = delta > 0 ? `+${delta.toFixed(1)}s` : `${delta.toFixed(1)}s`;
    triggerDynamicPop(wordIdx, `⏱️ ${badgeLabel}`, newStart);
  };

  // 2. Update word color
  const handleSetWordColor = (
    lineIdx: number,
    wordIdx: number,
    colorHex: string | undefined
  ) => {
    const targetLine = subtitles[lineIdx];
    if (!targetLine || !targetLine.words) return;

    const words = [...targetLine.words];
    const targetWord = words[wordIdx];
    if (!targetWord) return;

    words[wordIdx] = {
      ...targetWord,
      color: colorHex,
    };

    const updatedSubtitles = [...subtitles];
    updatedSubtitles[lineIdx] = {
      ...targetLine,
      words,
    };

    onUpdateClip({
      ...clip,
      subtitles: updatedSubtitles,
    });

    setActiveColorPickerWord(null);

    // TRIGGER DYNAMIC POP
    triggerDynamicPop(wordIdx, colorHex ? '🎨 Color!' : 'Cleared', targetWord.start);
    showToast(colorHex ? `Updated word color to ${colorHex}` : 'Reset word color');
  };

  // 3. Subtitle splitting at specific word
  const handleSplitWord = (lineIdx: number, wordIdx: number) => {
    const newSubtitles = splitLineAtWord(subtitles, lineIdx, wordIdx);
    onUpdateClip({
      ...clip,
      subtitles: newSubtitles,
    });
    setExpandedLineIdx(lineIdx);
    showToast('Split subtitle line into 2 precise segments');
    // Pop first word of new line
    const nextLine = newSubtitles[lineIdx + 1];
    if (nextLine && nextLine.words && nextLine.words.length > 0) {
      triggerDynamicPop(0, '✨ Split!', nextLine.start);
    }
  };

  // 4. Subtitle split in half
  const handleSplitHalf = (lineIdx: number) => {
    const newSubtitles = splitLineInHalf(subtitles, lineIdx);
    onUpdateClip({
      ...clip,
      subtitles: newSubtitles,
    });
    showToast('Split line into 50/50 halves');
  };

  // 5. Customize subtitle length (re-chunk all subtitles)
  const handleRechunk = (length: number) => {
    const newSubtitles = rechunkSubtitlesByLength(subtitles, length);
    onUpdateClip({
      ...clip,
      captionMaxWords: length,
      subtitles: newSubtitles,
    });
    setTargetWordLength(length);
    showToast(`Re-chunked all subtitles to ${length} words/line for optimal retention`);
    if (newSubtitles.length > 0 && newSubtitles[0].words && newSubtitles[0].words.length > 0) {
      triggerDynamicPop(0, '⚡ Re-chunked', newSubtitles[0].start);
    }
  };

  // 6. Auto-split long lines
  const handleAutoSplit = () => {
    const newSubtitles = autoSplitLongLines(subtitles, targetWordLength, 3.2);
    onUpdateClip({
      ...clip,
      subtitles: newSubtitles,
    });
    showToast(`Auto-split long lines into punchy segments`);
  };

  // 7. Merge adjacent lines
  const handleMergeNext = (lineIdx: number) => {
    const newSubtitles = mergeAdjacentLines(subtitles, lineIdx);
    onUpdateClip({
      ...clip,
      subtitles: newSubtitles,
    });
    showToast('Merged adjacent subtitle lines');
  };

  // 8. Subtitle position controls
  const handleSetPositionPreset = (pos: CaptionPosition, offset: number) => {
    onUpdateClip({
      ...clip,
      captionPosition: pos,
      captionYOffset: offset,
    });
    showToast(`Position set to ${pos.replace('_', ' ')} (${offset}%)`);
  };

  const handleSetYOffset = (val: number) => {
    let matchedPos: CaptionPosition = 'bottom';
    if (val < 25) matchedPos = 'top';
    else if (val < 40) matchedPos = 'upper_middle';
    else if (val < 60) matchedPos = 'middle';
    else if (val < 80) matchedPos = 'lower_third';
    else matchedPos = 'bottom';

    onUpdateClip({
      ...clip,
      captionPosition: matchedPos,
      captionYOffset: val,
    });
  };

  // Filtered lines for search
  const filteredSubtitles = useMemo(() => {
    if (!searchQuery.trim()) return subtitles.map((line, idx) => ({ line, idx }));
    const q = searchQuery.toLowerCase();
    return subtitles
      .map((line, idx) => ({ line, idx }))
      .filter(({ line }) => line.text.toLowerCase().includes(q));
  }, [subtitles, searchQuery]);

  return (
    <div
      id="caption-edit-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden"
    >
      <div
        id="caption-edit-modal-container"
        className="w-full max-w-6xl max-h-[94vh] h-[94vh] bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Dynamic Caption Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  {clip.captionStyle.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Modify word timings, colors, split lines, and optimize subtitle length with dynamic pop animations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Test Pop button in header */}
            <button
              id="test-dynamic-pop-header-btn"
              onClick={() => {
                const words = activeSubtitle?.words || [];
                const targetIdx = words.length > 0 ? Math.floor(words.length / 2) : 0;
                triggerDynamicPop(targetIdx, '✨ DYNAMIC POP!', activeSubtitle?.start);
                showToast('Dynamic Pop animation triggered!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Test dynamic pop animation on active caption"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Test Dynamic Pop</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST FEEDBACK */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl animate-fadeIn flex items-center gap-1.5 pointer-events-none">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* MAIN STUDIO BODY: 2 COLUMNS */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* ============================================================ */}
          {/* LEFT COLUMN: 9:16 LIVE CAPTION PREVIEW CANVAS (lg:col-span-5) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950 flex flex-col items-center justify-between p-4 overflow-y-auto">
            {/* PREVIEW TOP BAR */}
            <div className="w-full flex items-center justify-between gap-2 pb-2 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-zinc-300">9:16 Shorts Canvas</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSafeZone(!showSafeZone)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    showSafeZone
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Toggle TikTok/Reels Safe Margin guidelines"
                >
                  <Eye className="w-3 h-3" />
                  <span>Safe Margins</span>
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 9:16 PHONE FRAME CONTAINER */}
            <div
              id="caption-preview-stage"
              className="relative w-full max-w-[260px] sm:max-w-[280px] aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl flex items-center justify-center select-none"
            >
              {/* VIDEO SOURCE OR POSTER */}
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={thumbnailUrl}
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Clip background"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 flex items-center justify-center">
                  <span className="text-[11px] text-zinc-600 uppercase tracking-widest font-mono">
                    9:16 Video Frame
                  </span>
                </div>
              )}

              {/* TIKTOK & INSTAGRAM REELS SAFE ZONE OVERLAY */}
              {showSafeZone && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Top Safe Area (search & tabs) */}
                  <div className="absolute top-0 inset-x-0 h-10 border-b border-dashed border-red-500/30 bg-red-500/5 flex items-center justify-between px-3 text-[9px] font-mono text-red-400/80">
                    <span>TikTok Top Safe Bar</span>
                    <span>10%</span>
                  </div>

                  {/* Right Action Icons column (Like, Comment, Share, Sound Disc) */}
                  <div className="absolute top-28 right-2 bottom-16 w-10 border-l border-dashed border-red-500/30 bg-red-500/5 flex flex-col items-center justify-around text-red-400/70 py-4">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px]">❤️</div>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px]">💬</div>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px]">↗️</div>
                    <div className="w-5 h-5 rounded-full bg-white/20 animate-spin text-[8px]">🎵</div>
                  </div>

                  {/* Bottom Safe Area (username & caption description) */}
                  <div className="absolute bottom-0 inset-x-0 h-14 border-t border-dashed border-red-500/30 bg-red-500/5 flex flex-col justify-center px-3 text-[9px] font-mono text-red-400/80">
                    <span className="font-bold">@creator • TikTok UI Zone</span>
                    <span className="text-[8px] text-red-400/60">Captions placed here will be obscured</span>
                  </div>
                </div>
              )}

              {/* DYNAMIC CAPTIONS WITH POP ANIMATION */}
              {activeSubtitle ? (
                <DynamicCaptions
                  style={clip.captionStyle}
                  activeSubtitle={activeSubtitle}
                  currentTime={currentTime}
                  clipTitle={clip.title}
                  hookText={clip.hook}
                  position={clip.captionPosition || 'bottom'}
                  yOffset={clip.captionYOffset}
                  fontSize={clip.captionFontSize || 'md'}
                  casing={clip.captionCasing}
                  accentColor={clip.captionAccentColor}
                  displayLimit={clip.captionDisplayLimit || 'none'}
                  poppedWordIndex={poppedWordIndex}
                  popBadgeText={popBadgeText}
                  popKey={popKey}
                />
              ) : (
                <div className="absolute bottom-16 inset-x-4 pointer-events-none text-center">
                  <span className="text-[11px] bg-black/60 px-2.5 py-1 rounded-full text-zinc-400 font-medium">
                    (No subtitle at {currentTime.toFixed(1)}s)
                  </span>
                </div>
              )}

              {/* CENTER PLAY OVERLAY ON PAUSE */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer z-30"
                  aria-label="Play video"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              )}
            </div>

            {/* PREVIEW BOTTOM PLAYHEAD SCRUBBER & CONTROLS */}
            <div className="w-full space-y-2 pt-3">
              {/* Timeline scrubber bar */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-400 w-10 text-right">
                  {currentTime.toFixed(1)}s
                </span>
                <input
                  type="range"
                  min={clip.startTime}
                  max={clip.endTime}
                  step={0.05}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-zinc-800 accent-emerald-500 rounded-lg cursor-pointer"
                />
                <span className="font-mono text-[10px] text-zinc-400 w-10">
                  {clip.endTime.toFixed(1)}s
                </span>
              </div>

              {/* Play / Pause / Loop line / Test Pop Bar */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-800 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={loopActiveLine}
                    disabled={!activeSubtitle}
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-800 cursor-pointer"
                    title="Replay active subtitle line"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Loop Line</span>
                  </button>
                </div>

                {/* Direct Trigger Dynamic Pop on current line's active word */}
                <button
                  onClick={() => {
                    const words = activeSubtitle?.words || [];
                    const activeIdx = words.findIndex((w) => currentTime >= w.start && currentTime <= w.end);
                    const chosenIdx = activeIdx >= 0 ? activeIdx : 0;
                    triggerDynamicPop(chosenIdx, '✨ POP!');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  title="Trigger Dynamic Pop animation on active word"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pop Active Word</span>
                </button>
              </div>

              {/* Interactive Quick Position Slider under preview */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-2 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-emerald-400" />
                    <span>Vertical Position</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {clip.captionYOffset ?? (clip.captionPosition === 'top' ? 12 : clip.captionPosition === 'upper_middle' ? 26 : clip.captionPosition === 'middle' ? 50 : clip.captionPosition === 'lower_third' ? 72 : 82)}%
                  </span>
                </div>

                <input
                  type="range"
                  min={12}
                  max={86}
                  step={1}
                  value={clip.captionYOffset ?? (clip.captionPosition === 'top' ? 12 : clip.captionPosition === 'upper_middle' ? 26 : clip.captionPosition === 'middle' ? 50 : clip.captionPosition === 'lower_third' ? 72 : 82)}
                  onChange={(e) => handleSetYOffset(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 accent-emerald-400 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <button
                    onClick={() => handleSetPositionPreset('top', 14)}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                      clip.captionPosition === 'top' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => handleSetPositionPreset('upper_middle', 28)}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                      clip.captionPosition === 'upper_middle' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Upper Mid
                  </button>
                  <button
                    onClick={() => handleSetPositionPreset('middle', 50)}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                      clip.captionPosition === 'middle' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => handleSetPositionPreset('lower_third', 72)}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                      clip.captionPosition === 'lower_third' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Lower 3rd
                  </button>
                  <button
                    onClick={() => handleSetPositionPreset('bottom', 84)}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                      clip.captionPosition === 'bottom' || !clip.captionPosition ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Bottom
                  </button>
                </div>
              </div>

              {/* Amount of Words Displayed on Screen at a Time */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Words Displayed on Screen</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                    {DISPLAY_LIMIT_OPTIONS.find((o) => o.id === (clip.captionDisplayLimit || 'none'))?.label || 'None (Full)'}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center">
                  {DISPLAY_LIMIT_OPTIONS.map((opt) => {
                    const isSelected = (clip.captionDisplayLimit || 'none') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onUpdateClip({ ...clip, captionDisplayLimit: opt.id });
                          showToast(`Set on-screen display: ${opt.label}`);
                        }}
                        className={`py-1.5 px-1 rounded-lg text-[10px] transition-all font-semibold cursor-pointer truncate ${
                          isSelected
                            ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                            : 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title={opt.desc}
                      >
                        {opt.label === 'One Word' ? '1 Word' : opt.label === 'None (Full)' ? 'None' : opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: TABS & SUBTITLE CONTROLS (lg:col-span-7)        */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-zinc-950">
            {/* TABS NAVIGATION */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 pt-2 bg-zinc-900/40 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('inspector')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'inspector'
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Lines & Words</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px]">
                    {subtitles.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('readability')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'readability'
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Subtitle Splitting & Length</span>
                </button>

                <button
                  onClick={() => setActiveTab('position')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'position'
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Position & Margins</span>
                </button>

                <button
                  onClick={() => setActiveTab('styles')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'styles'
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Style Presets</span>
                </button>
              </div>

              {/* READABILITY SCORE PILL IN TAB BAR */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                <Activity className="w-3 h-3" />
                <span>{stats.avgWordsPerLine} w/line</span>
                <span className="text-zinc-500">•</span>
                <span>{stats.ratingLabel}</span>
              </div>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ============================================================ */}
              {/* TAB 1: LINES & WORD INSPECTOR (TIMING, COLOR, WORD SPLITTING) */}
              {/* ============================================================ */}
              {activeTab === 'inspector' && (
                <div className="space-y-3">
                  {/* SEARCH & QUICK ACTION BAR */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search spoken dialogue in this clip..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>

                    <button
                      onClick={handleAutoSplit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                      title="Automatically split long sentences into punchy chunks"
                    >
                      <Split className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Auto-Split Long</span>
                    </button>
                  </div>

                  {/* SUBTITLE LINES LIST */}
                  <div className="space-y-2.5">
                    {filteredSubtitles.map(({ line, idx }) => {
                      const isExpanded = expandedLineIdx === idx;
                      const words = line.words || [];
                      const isCurrentActive = currentTime >= line.start && currentTime <= line.end;

                      return (
                        <div
                          key={idx}
                          className={`border rounded-xl transition-all ${
                            isCurrentActive
                              ? 'bg-emerald-950/15 border-emerald-500/50 shadow-md'
                              : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          {/* LINE SUMMARY HEADER */}
                          <div className="p-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  handleSeek(line.start);
                                  triggerDynamicPop(0, '▶️ Seek', line.start);
                                }}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                  isCurrentActive
                                    ? 'bg-emerald-500 text-zinc-950'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                                title="Play from line start"
                              >
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                              </button>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                                  <Clock className="w-3 h-3 text-emerald-400" />
                                  <span>{line.start.toFixed(2)}s - {line.end.toFixed(2)}s</span>
                                  <span className="text-zinc-600">•</span>
                                  <span className="text-zinc-500">{(line.end - line.start).toFixed(2)}s</span>
                                  <span className="text-zinc-600">•</span>
                                  <span className="text-emerald-400/80 font-bold">{words.length} words</span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug">
                                  {line.text}
                                </p>
                              </div>
                            </div>

                            {/* LINE ACTIONS */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleSplitHalf(idx)}
                                className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Split line 50/50 in half"
                              >
                                <Split className="w-3.5 h-3.5 text-emerald-400" />
                              </button>

                              {idx < subtitles.length - 1 && (
                                <button
                                  onClick={() => handleMergeNext(idx)}
                                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                                  title="Merge with next line"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => setExpandedLineIdx(isExpanded ? null : idx)}
                                className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title={isExpanded ? 'Collapse word inspector' : 'Inspect individual words, timings & colors'}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* EXPANDED WORD-BY-WORD INSPECTOR */}
                          {isExpanded && (
                            <div className="border-t border-zinc-800/80 p-3 bg-zinc-950/70 space-y-3">
                              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                <span className="font-semibold text-zinc-300 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Word Timing, Colors & Splitting</span>
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  Modifying word timing or color triggers preview Dynamic Pop
                                </span>
                              </div>

                              {/* WORDS GRID / CHIPS */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {words.map((w, wIdx) => {
                                  const isWordPlaying = currentTime >= w.start && currentTime <= w.end;
                                  const isColorPickerOpen =
                                    activeColorPickerWord?.lineIdx === idx &&
                                    activeColorPickerWord?.wordIdx === wIdx;

                                  return (
                                    <div
                                      key={wIdx}
                                      className={`p-2.5 rounded-xl border transition-all ${
                                        isWordPlaying
                                          ? 'bg-emerald-950/25 border-emerald-500/60 ring-1 ring-emerald-500/40'
                                          : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className="font-bold text-xs px-1.5 py-0.5 rounded bg-zinc-800"
                                            style={w.color ? { color: w.color } : {}}
                                          >
                                            {w.word}
                                          </span>
                                          {w.color && (
                                            <span
                                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                                              style={{ backgroundColor: w.color }}
                                            />
                                          )}
                                        </div>

                                        {/* WORD-LEVEL SPLIT BUTTON */}
                                        {wIdx < words.length - 1 && (
                                          <button
                                            onClick={() => handleSplitWord(idx, wIdx)}
                                            className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-300 rounded text-[10px] font-medium border border-zinc-700/60 transition-colors cursor-pointer"
                                            title={`Split line right after "${w.word}"`}
                                          >
                                            <Split className="w-3 h-3 text-emerald-400" />
                                            <span>Split here</span>
                                          </button>
                                        )}
                                      </div>

                                      {/* TIMING CONTROLS FOR THIS WORD */}
                                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                                        {/* Start time nudge */}
                                        <div className="flex items-center gap-1">
                                          <span className="text-zinc-500">In:</span>
                                          <button
                                            onClick={() => handleUpdateWordTiming(idx, wIdx, 'start', -0.1)}
                                            className="w-4 h-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center justify-center cursor-pointer"
                                            title="-0.1s start timing"
                                          >
                                            -
                                          </button>
                                          <span className="text-zinc-300 font-bold">{w.start.toFixed(2)}s</span>
                                          <button
                                            onClick={() => handleUpdateWordTiming(idx, wIdx, 'start', 0.1)}
                                            className="w-4 h-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center justify-center cursor-pointer"
                                            title="+0.1s start timing"
                                          >
                                            +
                                          </button>
                                        </div>

                                        {/* End time nudge */}
                                        <div className="flex items-center gap-1">
                                          <span className="text-zinc-500">Out:</span>
                                          <button
                                            onClick={() => handleUpdateWordTiming(idx, wIdx, 'end', -0.1)}
                                            className="w-4 h-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center justify-center cursor-pointer"
                                            title="-0.1s end timing"
                                          >
                                            -
                                          </button>
                                          <span className="text-zinc-300 font-bold">{w.end.toFixed(2)}s</span>
                                          <button
                                            onClick={() => handleUpdateWordTiming(idx, wIdx, 'end', 0.1)}
                                            className="w-4 h-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center justify-center cursor-pointer"
                                            title="+0.1s end timing"
                                          >
                                            +
                                          </button>
                                        </div>

                                        {/* COLOR PICKER TRIGGER FOR THIS WORD */}
                                        <button
                                          onClick={() =>
                                            setActiveColorPickerWord(
                                              isColorPickerOpen ? null : { lineIdx: idx, wordIdx: wIdx }
                                            )
                                          }
                                          className={`p-1 rounded border transition-colors cursor-pointer ${
                                            isColorPickerOpen
                                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                          }`}
                                          title="Set custom word highlight color"
                                        >
                                          <Palette className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {/* COLOR SWATCH DROPDOWN FOR THIS WORD */}
                                      {isColorPickerOpen && (
                                        <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between gap-1.5 animate-fadeIn">
                                          <span className="text-[10px] text-zinc-400 font-medium">Color:</span>
                                          <div className="flex items-center gap-1">
                                            {PALETTE_COLORS.map((col) => (
                                              <button
                                                key={col.hex}
                                                onClick={() => handleSetWordColor(idx, wIdx, col.hex)}
                                                className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 cursor-pointer shadow-sm"
                                                style={{ backgroundColor: col.hex }}
                                                title={col.name}
                                              />
                                            ))}
                                            <button
                                              onClick={() => handleSetWordColor(idx, wIdx, undefined)}
                                              className="px-1.5 py-0.5 text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded cursor-pointer"
                                              title="Reset to style default"
                                            >
                                              Reset
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 2: SUBTITLE SPLITTING & READABILITY LENGTH CUSTOMIZATION */}
              {/* ============================================================ */}
              {activeTab === 'readability' && (
                <div className="space-y-4">
                  {/* READABILITY OVERVIEW CARD */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs sm:text-sm font-bold text-white">
                          Short-Form Readability & Retention Analytics
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        {stats.ratingLabel}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      TikTok, Instagram Reels, and YouTube Shorts algorithms heavily reward viewers watching to completion.
                      Subtitles with <strong>1 to 4 words per line</strong> achieve the highest retention because viewers track motion rhythmically without reading ahead.
                    </p>

                    {/* TELEMETRY METRIC STATS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Words / Line</span>
                        <span className="text-lg font-bold text-emerald-400">{stats.avgWordsPerLine}</span>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Pace (WPS)</span>
                        <span className="text-lg font-bold text-zinc-200">{stats.wordsPerSecond}</span>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Words</span>
                        <span className="text-lg font-bold text-zinc-200">{stats.totalWords}</span>
                      </div>
                      <div className="bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Line Count</span>
                        <span className="text-lg font-bold text-zinc-200">{stats.lineCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* AMOUNT OF WORDS DISPLAYED ON SCREEN AT A TIME */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            Amount of Words Displayed on Screen at a Time
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Controls the visual text window displayed on screen during playback.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto font-mono text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold">
                        Active: {DISPLAY_LIMIT_OPTIONS.find((o) => o.id === (clip.captionDisplayLimit || 'none'))?.label || 'None (Full)'}
                      </span>
                    </div>

                    {/* 7 PRESET CARDS: One Word, 10 Letters, 15 Letters, 20 Letters, 25 Letters, 30 Letters, None */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {DISPLAY_LIMIT_OPTIONS.map((opt) => {
                        const isSelected = (clip.captionDisplayLimit || 'none') === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              onUpdateClip({ ...clip, captionDisplayLimit: opt.id });
                              showToast(`Active on screen: ${opt.label}`);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-sm'
                                : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                {opt.id === 'one_word' ? (
                                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                ) : opt.id === 'none' ? (
                                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <Type className="w-3.5 h-3.5 text-teal-400" />
                                )}
                                <span>{opt.label}</span>
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-snug">
                              {opt.desc}
                            </p>
                            {opt.maxLetters && (
                              <span className="inline-block mt-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                Max {opt.maxLetters} characters / screen
                              </span>
                            )}
                            {opt.id === 'one_word' && (
                              <span className="inline-block mt-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                                1 spoken word at a time
                              </span>
                            )}
                            {opt.id === 'none' && (
                              <span className="inline-block mt-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                Full subtitle sentence
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* ACTION TO PERMANENTLY RE-CHUNK SUBTITLES BY SELECTED LETTER BUDGET */}
                    {(clip.captionDisplayLimit && clip.captionDisplayLimit !== 'none') && (
                      <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="text-[11px] text-zinc-400">
                          Want the actual subtitle line files formatted to this size?
                        </div>
                        <button
                          onClick={() => {
                            const limit = clip.captionDisplayLimit;
                            const maxL =
                              limit === 'one_word'
                                ? 1
                                : limit === '10_letters'
                                ? 10
                                : limit === '15_letters'
                                ? 15
                                : limit === '20_letters'
                                ? 20
                                : limit === '25_letters'
                                ? 25
                                : limit === '30_letters'
                                ? 30
                                : 30;
                            const updated = rechunkSubtitlesByLetters(subtitles, maxL);
                            onUpdateClip({ ...clip, subtitles: updated });
                            showToast(`Permanently re-chunked subtitles to ${maxL <= 1 ? '1 word' : `${maxL} letters`} per line!`);
                          }}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Re-chunk Subtitle File by {DISPLAY_LIMIT_OPTIONS.find((o) => o.id === clip.captionDisplayLimit)?.label}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SUBTITLE LENGTH CUSTOMIZER */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          Customize Subtitle Length for Optimal Readability
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Re-segments every subtitle line to your exact word target while preserving all audio timestamps.
                        </p>
                      </div>
                      <span className="font-mono text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold">
                        Target: {targetWordLength} words
                      </span>
                    </div>

                    {/* PRESET CHIPS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRechunk(2)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          targetWordLength === 2
                            ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Punchy (1–2 words)</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          Alex Hormozi kinetic style. Highest viewer dopamine and rapid pacing.
                        </p>
                      </button>

                      <button
                        onClick={() => handleRechunk(3)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          targetWordLength === 3
                            ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Balanced (3–4 words)</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          TikTok sweet spot. Natural speech cadence with easy readability.
                        </p>
                      </button>

                      <button
                        onClick={() => handleRechunk(6)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          targetWordLength === 6
                            ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                          <Type className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Extended (5–7 words)</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          Storytelling & podcasts. More context per line for thoughtful topics.
                        </p>
                      </button>
                    </div>

                    {/* CUSTOM WORDS-PER-LINE SLIDER */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Custom Words Per Subtitle Line</span>
                        <span className="font-bold text-emerald-400">{targetWordLength} words</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        step={1}
                        value={targetWordLength}
                        onChange={(e) => setTargetWordLength(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 accent-emerald-500 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                        <span>1 (Ultra-fast)</span>
                        <span>4 (Optimal)</span>
                        <span>8 (Long)</span>
                      </div>
                    </div>

                    {/* ONE-CLICK RE-CHUNK BUTTON */}
                    <button
                      onClick={() => handleRechunk(targetWordLength)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Re-chunk All Subtitles to {targetWordLength} Words/Line Now</span>
                    </button>
                  </div>

                  {/* SMART SPLITTING TOOLS */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Smart Subtitle Splitting Tools
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Instantly split long sentences at natural punctuation points or combine short lines.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={handleAutoSplit}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer"
                      >
                        <Split className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-zinc-200">Auto-Split at Grammatical Pauses</div>
                          <div className="text-[11px] text-zinc-400">Splits lines exceeding 3.5s at commas and periods</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          let modified = [...subtitles];
                          for (let i = 0; i < modified.length - 1; i++) {
                            const words = modified[i].words || [];
                            if (words.length <= 1) {
                              modified = mergeAdjacentLines(modified, i);
                              break;
                            }
                          }
                          onUpdateClip({ ...clip, subtitles: modified });
                          showToast('Merged short isolated line with neighbor');
                        }}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-zinc-200">Consolidate 1-Word Stragglers</div>
                          <div className="text-[11px] text-zinc-400">Merges awkward single-word lines into balanced pairs</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 3: SUBTITLE POSITION & SAFE ZONES                          */}
              {/* ============================================================ */}
              {activeTab === 'position' && (
                <div className="space-y-4">
                  {/* POSITION PRESETS */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Subtitle Vertical Placement
                      </h4>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {clip.captionYOffset ?? 82}% from top
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { pos: 'top' as CaptionPosition, offset: 14, label: 'Top (Header)', desc: 'Under video header' },
                        { pos: 'upper_middle' as CaptionPosition, offset: 28, label: 'Upper-Mid', desc: 'Above face zone' },
                        { pos: 'middle' as CaptionPosition, offset: 50, label: 'Center', desc: 'Direct center' },
                        { pos: 'lower_third' as CaptionPosition, offset: 72, label: 'Lower-3rd', desc: 'Above UI bar' },
                        { pos: 'bottom' as CaptionPosition, offset: 84, label: 'Bottom', desc: 'Classic Shorts' },
                      ].map((item) => {
                        const isSelected =
                          clip.captionPosition === item.pos ||
                          (clip.captionYOffset && Math.abs(clip.captionYOffset - item.offset) <= 6);

                        return (
                          <button
                            key={item.pos}
                            onClick={() => handleSetPositionPreset(item.pos, item.offset)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <div className="text-xs font-bold text-white mb-0.5">{item.label}</div>
                            <div className="text-[10px] text-zinc-500">{item.desc}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* FINE Y-OFFSET SLIDER */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Fine-Tuning Vertical Y-Offset Slider</span>
                        <span className="font-mono text-emerald-400 font-bold">{clip.captionYOffset ?? 82}%</span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={86}
                        step={1}
                        value={clip.captionYOffset ?? 82}
                        onChange={(e) => handleSetYOffset(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 accent-emerald-500 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* SAFE ZONES & PLATFORM OVERLAYS */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Platform Safe Zone Guidelines
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Mobile short-form apps render interactive buttons over the video. Subtitles should stay within safe bounds.
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                        <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-zinc-200">TikTok Safe Area:</span>
                          <p className="text-zinc-400 text-[11px] mt-0.5">
                            Keep captions between <strong>14% and 78%</strong> vertically to avoid the bottom username caption and right-hand like/comment buttons.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                        <Smartphone className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-zinc-200">Instagram Reels & YouTube Shorts Safe Area:</span>
                          <p className="text-zinc-400 text-[11px] mt-0.5">
                            Keep captions centered horizontally with at least <strong>12% padding</strong> on left and right margins.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => setShowSafeZone(!showSafeZone)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{showSafeZone ? 'Hide Safe Zone Margins' : 'Show Safe Zone Margins on Preview'}</span>
                      </button>
                    </div>
                  </div>

                  {/* FONT SIZE & CASING */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Typography Scale & Casing
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Font Size */}
                      <div className="space-y-1.5">
                        <span className="text-xs text-zinc-400">Caption Font Size</span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['sm', 'md', 'lg', 'xl'] as CaptionFontSize[]).map((size) => (
                            <button
                              key={size}
                              onClick={() => onUpdateClip({ ...clip, captionFontSize: size })}
                              className={`py-1.5 text-xs rounded-lg font-bold uppercase transition-colors cursor-pointer ${
                                (clip.captionFontSize || 'md') === size
                                  ? 'bg-emerald-500 text-zinc-950'
                                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Casing */}
                      <div className="space-y-1.5">
                        <span className="text-xs text-zinc-400">Text Casing</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'uppercase' as CaptionCasing, label: 'ALL CAPS' },
                            { id: 'capitalize' as CaptionCasing, label: 'Title Case' },
                            { id: 'normal' as CaptionCasing, label: 'Natural' },
                          ].map((c) => (
                            <button
                              key={c.id}
                              onClick={() => onUpdateClip({ ...clip, captionCasing: c.id })}
                              className={`py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                                clip.captionCasing === c.id
                                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 4: STYLE PRESETS & THEMES                                  */}
              {/* ============================================================ */}
              {activeTab === 'styles' && (
                <div className="space-y-4">
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      12 Viral Kinetic Caption Themes
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Select a visual theme inspired by the top-performing creators on short-form platforms.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'hormozi' as CaptionStyle, name: 'Hormozi Bold', tag: 'High Virality' },
                        { id: 'mrbeast' as CaptionStyle, name: 'MrBeast Pop', tag: 'High Energy' },
                        { id: 'neon_accent' as CaptionStyle, name: 'Neon Accent', tag: 'Tech / Finance' },
                        { id: 'editorial_emphasis' as CaptionStyle, name: 'Editorial Serif', tag: 'Luxury / Essay' },
                        { id: 'parallax_layers' as CaptionStyle, name: 'Parallax 3D', tag: 'Cinematic' },
                        { id: 'camera_follow' as CaptionStyle, name: 'Camera Follow', tag: 'Vlog / Action' },
                        { id: 'vox_annotate' as CaptionStyle, name: 'Vox Annotate', tag: 'Educational' },
                        { id: 'neon_glow' as CaptionStyle, name: 'Neon Tube Glow', tag: 'Night / Cyber' },
                        { id: 'blend_difference' as CaptionStyle, name: 'Blend Difference', tag: 'Design' },
                        { id: 'karaoke' as CaptionStyle, name: 'Karaoke Wave', tag: 'Classic' },
                        { id: 'neon' as CaptionStyle, name: 'Neon Cyber', tag: 'Gamer' },
                        { id: 'clean_minimal' as CaptionStyle, name: 'Clean Minimal', tag: 'Subtle' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onUpdateClip({ ...clip, captionStyle: item.id });
                            showToast(`Selected style: ${item.name}`);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            clip.captionStyle === item.id
                              ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40'
                              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-white mb-0.5">{item.name}</div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-medium">
                            {item.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GLOBAL ACCENT COLOR PALETTE */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Keyword Highlight Color
                    </h4>
                    <div className="flex items-center gap-2">
                      {PALETTE_COLORS.map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => {
                            onUpdateClip({ ...clip, captionAccentColor: col.hex });
                            showToast(`Updated accent color to ${col.name}`);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shadow-md ${
                            clip.captionAccentColor === col.hex ? 'border-white scale-110' : 'border-white/20'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
