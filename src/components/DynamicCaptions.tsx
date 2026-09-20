import React, { useMemo } from 'react';
import {
  SubtitleLine,
  SubtitleWord,
  CaptionStyle,
  CaptionPosition,
  CaptionFontSize,
  CaptionCasing,
  CaptionDisplayLimit,
  BlendDifferenceMode,
} from '../types';
import { filterWordsByDisplayLimit } from '../utils/subtitleUtils';

interface DynamicCaptionsProps {
  style: CaptionStyle;
  activeSubtitle?: SubtitleLine;
  currentTime: number;
  clipTitle?: string;
  hookText?: string;
  position?: CaptionPosition;
  yOffset?: number;
  fontSize?: CaptionFontSize;
  casing?: CaptionCasing;
  accentColor?: string;
  displayLimit?: CaptionDisplayLimit;
  blendMode?: BlendDifferenceMode;
  poppedWordIndex?: number | null;
  popBadgeText?: string;
  popKey?: number | string;
}

export const DynamicCaptions: React.FC<DynamicCaptionsProps> = ({
  style,
  activeSubtitle,
  currentTime,
  clipTitle = '',
  hookText = '',
  position = 'bottom',
  yOffset,
  fontSize = 'md',
  casing,
  accentColor,
  displayLimit = 'none',
  blendMode = 'difference',
  poppedWordIndex = null,
  popBadgeText = 'POP!',
  popKey = 0,
}) => {
  if (!activeSubtitle) return null;

  const rawWords: SubtitleWord[] = useMemo(() => {
    let list: SubtitleWord[] = [];
    if (activeSubtitle.words && activeSubtitle.words.length > 0) {
      list = activeSubtitle.words;
    } else {
      // Fallback if words array wasn't generated: split text evenly
      const textWords = activeSubtitle.text.split(/\s+/).filter(Boolean);
      const duration = Math.max(0.6, activeSubtitle.end - activeSubtitle.start);
      const step = duration / Math.max(1, textWords.length);
      list = textWords.map((word, i) => ({
        word,
        start: activeSubtitle.start + i * step,
        end: activeSubtitle.start + (i + 1) * step,
        originalIndex: i,
      }));
    }

    if (casing === 'uppercase') {
      return list.map((w, idx) => ({
        ...w,
        word: w.word.toUpperCase(),
        originalIndex: w.originalIndex ?? idx,
      }));
    }
    if (casing === 'capitalize') {
      return list.map((w, idx) => ({
        ...w,
        word: w.word.replace(/\b\w/g, (c) => c.toUpperCase()),
        originalIndex: w.originalIndex ?? idx,
      }));
    }
    return list.map((w, idx) => ({
      ...w,
      originalIndex: w.originalIndex ?? idx,
    }));
  }, [activeSubtitle, casing]);

  // Apply display limit filter (one word, 10 letters, 15 letters, 20 letters, 25 letters, 30 letters, or none)
  const words: SubtitleWord[] = useMemo(() => {
    return filterWordsByDisplayLimit(rawWords, displayLimit, currentTime);
  }, [rawWords, displayLimit, currentTime]);

  // Find longest/most impactful word in line for emphasis styles
  const emphasisWordIdx = useMemo(() => {
    let maxLen = 0;
    let bestIdx = 0;
    words.forEach((w, i) => {
      const clean = w.word.replace(/[^a-zA-Z0-9]/g, '');
      if (clean.length > maxLen) {
        maxLen = clean.length;
        bestIdx = i;
      }
    });
    return bestIdx;
  }, [words]);

  const emphasisWord = words[emphasisWordIdx]?.word?.replace(/[^a-zA-Z0-9]/g, '') || 'FOCUS';

  const posClass =
    yOffset !== undefined
      ? ''
      : position === 'top'
      ? 'top-10'
      : position === 'upper_middle'
      ? 'top-[26%]'
      : position === 'middle'
      ? 'top-1/2 -translate-y-1/2'
      : position === 'lower_third'
      ? 'bottom-[28%]'
      : 'bottom-16';

  const customContainerStyle: React.CSSProperties =
    yOffset !== undefined
      ? { top: `${yOffset}%`, transform: 'translateY(-50%)' }
      : {};

  const scaleClass =
    fontSize === 'sm'
      ? 'scale-90'
      : fontSize === 'lg'
      ? 'scale-110'
      : fontSize === 'xl'
      ? 'scale-125'
      : 'scale-100';

  const activeAccent = accentColor || '#FCFF00';

  // Helper to wrap each word with pop animation, badge, and custom color
  const wrapWord = (
    w: SubtitleWord,
    idx: number,
    content: React.ReactNode,
    baseClassName = '',
    baseStyle: React.CSSProperties = {}
  ) => {
    const origIdx = w.originalIndex !== undefined ? w.originalIndex : idx;
    const isPopped = poppedWordIndex === origIdx || poppedWordIndex === idx;
    const finalColor = w.color || baseStyle.color;

    return (
      <span
        key={`${idx}-${w.word}-${popKey}`}
        className={`relative inline-block ${baseClassName} ${
          isPopped ? 'animate-dynamic-pop z-40' : ''
        }`}
        style={{
          ...baseStyle,
          ...(finalColor ? { color: finalColor } : {}),
        }}
      >
        {isPopped && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-emerald-400 text-zinc-950 font-black text-[9px] tracking-wider uppercase shadow-xl shadow-emerald-500/50 pointer-events-none animate-pop-badge z-50 flex items-center gap-0.5">
            <span>✨</span>
            <span>{popBadgeText || 'POP!'}</span>
          </span>
        )}
        {content}
      </span>
    );
  };

  // 1. PARALLAX LAYERS
  if (style === 'parallax_layers') {
    const parallaxFrontPos =
      yOffset !== undefined
        ? ''
        : position === 'top'
        ? 'mt-10 mb-auto'
        : position === 'upper_middle'
        ? 'mt-24 mb-auto'
        : position === 'middle'
        ? 'my-auto'
        : position === 'lower_third'
        ? 'mt-auto mb-28'
        : 'mt-auto mb-16';

    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-between p-3 select-none ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="absolute inset-x-0 top-12 flex items-center justify-center opacity-75 transform -translate-y-1">
          <span
            className="font-['Instrument_Serif',serif] text-5xl sm:text-6xl font-black uppercase text-[#e50914] tracking-wider leading-none text-center"
            style={{
              transform: 'scaleY(2.2)',
              WebkitTextStroke: '2px #e50914',
              textShadow: '2px 4px 6px #80050d, 0 0 20px rgba(229,9,20,0.4)',
            }}
          >
            {emphasisWord}
          </span>
        </div>

        <div className={`${parallaxFrontPos} mx-auto max-w-[280px] sm:max-w-[300px] text-center z-30`}>
          <div className="bg-black/50 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
            <p className="font-['Instrument_Serif',serif] text-xl sm:text-2xl text-[#eeeeee] leading-tight text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {words.map((w, idx) => {
                const isActive = currentTime >= w.start && currentTime <= w.end;
                const isPast = currentTime > w.end;
                const isItalic = idx % 3 === 2 || idx === emphasisWordIdx;
                const baseClass = `mr-1.5 transition-all duration-100 ${
                  isItalic ? 'italic' : 'normal-case'
                } ${
                  isActive
                    ? 'text-white scale-110 font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]'
                    : isPast
                    ? 'text-[#eeeeee]'
                    : 'text-[#aaaaaa]'
                }`;
                return wrapWord(w, idx, w.word, baseClass);
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. CAMERA FOLLOW
  if (style === 'camera_follow') {
    const progress = Math.min(
      1,
      Math.max(0, (currentTime - activeSubtitle.start) / Math.max(0.5, activeSubtitle.end - activeSubtitle.start))
    );
    const cameraScale = 1.25 - progress * 0.28;
    const cameraAlign =
      yOffset !== undefined
        ? 'items-center'
        : position === 'top'
        ? 'items-start pt-14'
        : position === 'upper_middle'
        ? 'items-start pt-24'
        : position === 'middle'
        ? 'items-center'
        : position === 'lower_third'
        ? 'items-end pb-28'
        : 'items-end pb-16';

    return (
      <div
        className={`absolute inset-0 pointer-events-none flex ${cameraAlign} justify-center overflow-hidden p-4 ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

        <div
          className="relative max-w-[280px] sm:max-w-[310px] text-center transition-transform duration-200 ease-out z-20"
          style={{ transform: `scale(${cameraScale.toFixed(2)})` }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
            {words.map((w, idx) => {
              const isPastOrActive = currentTime >= w.start;
              const isCurrent = currentTime >= w.start && currentTime <= w.end;
              const isAccent = idx === emphasisWordIdx || idx % 4 === 1;

              if (!isPastOrActive) return null;

              const baseClass = `font-sans font-black uppercase text-sm sm:text-base tracking-tight leading-none transition-all duration-150 ${
                isAccent ? 'text-[#ffd84d]' : 'text-white'
              } ${
                isCurrent
                  ? 'scale-110 drop-shadow-[0_2px_10px_rgba(255,216,77,0.8)]'
                  : 'opacity-90'
              }`;

              const baseStyle: React.CSSProperties = isAccent && accentColor ? { color: accentColor } : {};
              return wrapWord(w, idx, w.word, baseClass, baseStyle);
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. EDITORIAL EMPHASIS
  if (style === 'editorial_emphasis') {
    const emphasisW = words[emphasisWordIdx]?.word || '';
    const otherWords = words.filter((_, idx) => idx !== emphasisWordIdx);

    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="max-w-[300px] w-full text-left bg-black/45 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl space-y-1">
          <div className="font-['Inter',sans-serif] text-xs sm:text-sm text-[#f5f0d0] tracking-normal leading-snug flex flex-wrap gap-1">
            {otherWords.map((w, idx) => {
              const originalIdx = words.indexOf(w);
              const isActive = currentTime >= w.start && currentTime <= w.end;
              const baseClass = `transition-colors duration-75 ${
                isActive ? 'text-white font-semibold underline decoration-[#f5f0d0]/60' : 'text-[#f5f0d0]/80'
              }`;
              return wrapWord(w, originalIdx, w.word, baseClass);
            })}
          </div>

          <div className="overflow-hidden pt-0.5">
            {words[emphasisWordIdx] &&
              wrapWord(
                words[emphasisWordIdx],
                emphasisWordIdx,
                <span
                  className="inline-block font-['Playfair_Display',serif] text-3xl sm:text-4xl font-extrabold italic text-[#f5f0d0] leading-none tracking-tight transform transition-transform duration-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                  style={{
                    textShadow: '0 2px 14px rgba(0,0,0,0.8), 0 4px 28px rgba(0,0,0,0.5)',
                  }}
                >
                  {emphasisW}
                </span>
              )}
          </div>
        </div>
      </div>
    );
  }

  // 4. NEON ACCENT
  if (style === 'neon_accent') {
    const ACCENT_COLORS = [activeAccent, '#53FF01', '#FCFF00', '#FF0002'];

    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="max-w-[300px] bg-black/65 backdrop-blur-sm px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {words.map((w, idx) => {
              const isActive = currentTime >= w.start && currentTime <= w.end;
              const isAccent = idx === emphasisWordIdx || idx % 3 === 1;
              const accentCol = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              const wordColor = isAccent ? accentCol : '#FFFFFF';
              const textShadow = isAccent
                ? `0 0 4px ${accentCol}, 0 0 10px ${accentCol}, 0 0 24px ${accentCol}`
                : '0 2px 8px rgba(0,0,0,0.9)';

              const baseClass = `font-['Montserrat',sans-serif] font-extrabold uppercase text-sm sm:text-base tracking-tight leading-tight transition-transform duration-75 ${
                isActive ? 'scale-115 animate-pulse' : 'scale-100'
              }`;

              return wrapWord(w, idx, w.word, baseClass, {
                color: wordColor,
                textShadow: textShadow,
              });
            })}
          </div>
        </div>
      </div>
    );
  }

  // 5. NEON GLOW
  if (style === 'neon_glow') {
    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="max-w-[290px] bg-black/50 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-cyan-500/20 shadow-[0_0_25px_rgba(0,255,240,0.15)]">
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
            {words.map((w, idx) => {
              const isActive = currentTime >= w.start && currentTime <= w.end;
              const isPink = idx === emphasisWordIdx || idx % 4 === 2;
              const activeColor = isPink ? '#FF0099' : (accentColor || '#00FFF0');

              const baseClass = "font-['Outfit',sans-serif] font-black uppercase text-base sm:text-lg tracking-wide leading-none transition-all duration-100";
              const baseStyle: React.CSSProperties = {
                color: isActive ? activeColor : 'rgba(0, 255, 240, 0.22)',
                textShadow: isActive
                  ? `0 0 8px ${activeColor}, 0 0 20px ${activeColor}, 0 0 45px ${activeColor}`
                  : 'none',
                transform: isActive ? 'scale(1.12)' : 'scale(1)',
              };

              return wrapWord(w, idx, w.word, baseClass, baseStyle);
            })}
          </div>
        </div>
      </div>
    );
  }

  // 6. BLEND DIFFERENCE — auto-inverting captions via mix-blend-mode
  if (style === 'blend_difference') {
    const variantClass =
      blendMode === 'exclusion'
        ? 'blend-difference-soft'
        : blendMode === 'screen'
        ? 'blend-difference-screen'
        : 'blend-difference';

    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-30 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div
          className={`clip ${variantClass} max-w-[340px] select-none text-center`}
          style={
            {
              '--blend-caption-color': accentColor || 'white',
              '--blend-mode': blendMode || 'difference',
            } as React.CSSProperties
          }
        >
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
            className="block text-xl sm:text-2xl md:text-3xl tracking-tight leading-snug"
          >
            {words.map((w, idx) => {
              const isActive = currentTime >= w.start && currentTime <= w.end;
              const baseClass = `inline-block mr-1.5 transition-transform duration-100 ${
                isActive ? 'scale-115 font-black' : 'opacity-85 font-extrabold'
              }`;
              return wrapWord(w, idx, w.word, baseClass);
            })}
          </span>
        </div>
      </div>
    );
  }

  // 7. VOX ANNOTATE
  if (style === 'vox_annotate') {
    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex flex-col items-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="relative max-w-[280px] sm:max-w-[300px] bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-zinc-700/60 shadow-2xl">
          <div className="absolute -top-7 right-4 flex items-center gap-1.5 bg-[#10141d] border border-emerald-500/40 px-2 py-0.5 rounded-md shadow-md text-emerald-400 font-mono text-[10px] tracking-wider uppercase font-bold animate-fadeIn">
            <svg
              className="w-3.5 h-3.5 text-emerald-400 -scale-x-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M 3 20 C 10 14, 16 10, 21 4" strokeLinecap="round" />
            </svg>
            <span>[NOTE: {emphasisWord}]</span>
          </div>

          <p className="font-sans font-semibold text-sm sm:text-base text-zinc-100 leading-snug">
            {words.map((w, idx) => {
              const isMarkerTarget = idx === emphasisWordIdx;
              const isActive = currentTime >= w.start && currentTime <= w.end;

              if (isMarkerTarget) {
                const markerContent = (
                  <span className="relative inline-block mx-1 font-bold text-white">
                    <svg
                      className="absolute -inset-1 w-[108%] h-[120%] -z-10 text-emerald-400/80"
                      viewBox="0 0 100 40"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 4 24 C 24 20.5, 48 25.5, 70 22.5 C 80 21, 91 23, 97 21.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="26"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <span className="relative z-10 text-zinc-950 font-black px-1">
                      {w.word}
                    </span>
                  </span>
                );
                return wrapWord(w, idx, markerContent);
              }

              const baseClass = `mr-1 transition-colors ${
                isActive ? 'text-emerald-300 font-bold' : 'text-zinc-300'
              }`;
              return wrapWord(w, idx, w.word, baseClass);
            })}
          </p>
        </div>
      </div>
    );
  }

  // 8. HORMOZI BOLD
  if (style === 'hormozi') {
    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="max-w-[280px] bg-black/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10 shadow-2xl">
          <p className="text-base sm:text-lg font-black uppercase tracking-tight leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-white">
            {words.map((w, idx) => {
              const isWordActive = currentTime >= w.start && currentTime <= w.end;
              const baseClass = `mr-1.5 transition-all duration-75 ${
                isWordActive
                  ? 'text-yellow-300 scale-110 font-black underline decoration-emerald-400 decoration-2'
                  : 'text-white/90'
              }`;
              const baseStyle: React.CSSProperties = isWordActive && accentColor ? { color: accentColor } : {};
              return wrapWord(w, idx, w.word, baseClass, baseStyle);
            })}
          </p>
        </div>
      </div>
    );
  }

  // 9. MRBEAST POP
  if (style === 'mrbeast') {
    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="max-w-[280px]">
          <p className="text-lg sm:text-xl font-black uppercase tracking-wide text-yellow-300 drop-shadow-[0_3px_0px_rgba(0,0,0,1)]">
            {words.map((w, idx) => {
              const isWordActive = currentTime >= w.start && currentTime <= w.end;
              const baseClass = `mr-1.5 transition-transform ${
                isWordActive ? 'scale-125 text-emerald-400 font-extrabold' : 'text-white'
              }`;
              const baseStyle: React.CSSProperties = isWordActive && accentColor ? { color: accentColor } : {};
              return wrapWord(w, idx, w.word, baseClass, baseStyle);
            })}
          </p>
        </div>
      </div>
    );
  }

  // 10. KARAOKE WAVE
  if (style === 'karaoke') {
    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="max-w-[280px] bg-zinc-900/80 px-3.5 py-1.5 rounded-full border border-zinc-700/60 shadow-lg">
          <p className="text-sm sm:text-base font-bold text-zinc-300">
            {words.map((w, idx) => {
              const isWordActive = currentTime >= w.start;
              const baseClass = `mr-1 transition-colors ${
                isWordActive ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`;
              const baseStyle: React.CSSProperties = isWordActive && accentColor ? { color: accentColor } : {};
              return wrapWord(w, idx, w.word, baseClass, baseStyle);
            })}
          </p>
        </div>
      </div>
    );
  }

  // 11. NEON CYBER
  if (style === 'neon') {
    return (
      <div
        className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
        style={customContainerStyle}
      >
        <div className="max-w-[280px]">
          <p
            className="text-base sm:text-lg font-extrabold tracking-wide uppercase text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]"
            style={accentColor ? { color: accentColor, textShadow: `0 0 12px ${accentColor}` } : undefined}
          >
            {words.map((w, idx) => {
              const isWordActive = currentTime >= w.start && currentTime <= w.end;
              const baseClass = `mr-1.5 ${isWordActive ? 'text-white scale-110' : ''}`;
              return wrapWord(w, idx, w.word, baseClass);
            })}
          </p>
        </div>
      </div>
    );
  }

  // 12. CLEAN MINIMAL
  return (
    <div
      className={`absolute ${posClass} inset-x-4 pointer-events-none z-20 flex justify-center text-center ${scaleClass} transform origin-center transition-all`}
      style={customContainerStyle}
    >
      <div className="max-w-[280px] bg-black/75 px-3 py-1.5 rounded-lg text-white text-xs sm:text-sm font-medium tracking-normal">
        {words.map((w, idx) => {
          const isWordActive = currentTime >= w.start && currentTime <= w.end;
          const baseClass = `mr-1 ${isWordActive ? 'text-emerald-300 font-bold' : 'text-zinc-200'}`;
          return wrapWord(w, idx, w.word, baseClass);
        })}
      </div>
    </div>
  );
};
