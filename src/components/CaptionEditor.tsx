import React, { useState, useMemo } from 'react';
import {
  Type,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Sliders,
  Sparkles,
  Play,
  FileText,
  Download,
  ArrowUp,
  ArrowDown,
  Split,
  Palette,
  Minus,
  Wand2,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ClipItem,
  SubtitleLine,
  SubtitleWord,
  CaptionStyle,
  CaptionPosition,
  CaptionFontSize,
  CaptionCasing,
  CaptionDisplayLimit,
} from '../types';
import {
  generateSrtContent,
  generateVttContent,
  downloadFile,
  copyToClipboard,
} from '../utils/exportHelper';
import {
  splitLineAtWord,
  rechunkSubtitlesByLength,
  rechunkSubtitlesByLetters,
  autoSplitLongLines,
  computeReadabilityStats,
  DISPLAY_LIMIT_OPTIONS,
} from '../utils/subtitleUtils';

interface CaptionEditorProps {
  clip: ClipItem;
  onUpdateClip: (updated: ClipItem) => void;
  currentTime?: number;
  onSeekToTime?: (time: number) => void;
  isModal?: boolean;
  onCloseModal?: () => void;
  onOpenExpandModal?: () => void;
}

export const CaptionEditor: React.FC<CaptionEditorProps> = ({
  clip,
  onUpdateClip,
  currentTime = 0,
  onSeekToTime,
  isModal = false,
  onCloseModal,
  onOpenExpandModal,
}) => {
  const [editorTab, setEditorTab] = useState<'lines' | 'style' | 'tools'>('lines');
  const [expandedWordLineIdx, setExpandedWordLineIdx] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2400);
  };

  // Safe subtitles array
  const subtitles = clip.subtitles || [];

  // Update line text & re-compute default words if needed
  const handleUpdateLineText = (index: number, newText: string) => {
    const targetLine = subtitles[index];
    if (!targetLine) return;

    // Distribute word timings based on duration
    const textWords = newText.split(/\s+/).filter(Boolean);
    const duration = Math.max(0.4, targetLine.end - targetLine.start);
    const step = textWords.length > 0 ? duration / textWords.length : 0;

    const newWords: SubtitleWord[] = textWords.map((word, i) => ({
      word,
      start: Number((targetLine.start + i * step).toFixed(2)),
      end: Number((targetLine.start + (i + 1) * step).toFixed(2)),
    }));

    const updated = [...subtitles];
    updated[index] = {
      ...targetLine,
      text: newText,
      words: newWords,
    };

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
  };

  // Update line timestamps
  const handleUpdateLineTimestamps = (index: number, start: number, end: number) => {
    const targetLine = subtitles[index];
    if (!targetLine) return;

    const boundedStart = Math.max(0, Number(start.toFixed(2)));
    const boundedEnd = Math.max(boundedStart + 0.2, Number(end.toFixed(2)));
    const duration = boundedEnd - boundedStart;

    // Scale word timings proportionally
    const words = targetLine.words || [];
    const updatedWords =
      words.length > 0
        ? words.map((w, i) => {
            const step = duration / words.length;
            return {
              ...w,
              start: Number((boundedStart + i * step).toFixed(2)),
              end: Number((boundedStart + (i + 1) * step).toFixed(2)),
            };
          })
        : undefined;

    const updated = [...subtitles];
    updated[index] = {
      ...targetLine,
      start: boundedStart,
      end: boundedEnd,
      words: updatedWords,
    };

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
  };

  // Update a single word in a line
  const handleUpdateSingleWord = (
    lineIdx: number,
    wordIdx: number,
    newWordStr: string,
    newStart?: number,
    newEnd?: number
  ) => {
    const targetLine = subtitles[lineIdx];
    if (!targetLine || !targetLine.words) return;

    const updatedWords = [...targetLine.words];
    const currentWord = updatedWords[wordIdx];
    if (!currentWord) return;

    updatedWords[wordIdx] = {
      word: newWordStr,
      start: newStart !== undefined ? Number(newStart.toFixed(2)) : currentWord.start,
      end: newEnd !== undefined ? Number(newEnd.toFixed(2)) : currentWord.end,
    };

    const newFullText = updatedWords.map((w) => w.word).join(' ');

    const updated = [...subtitles];
    updated[lineIdx] = {
      ...targetLine,
      text: newFullText,
      words: updatedWords,
    };

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
  };

  // Auto evenly re-distribute word timings for a line
  const handleEvenlyDistributeWords = (lineIdx: number) => {
    const targetLine = subtitles[lineIdx];
    if (!targetLine) return;

    const words = (targetLine.words || targetLine.text.split(/\s+/).map((w) => ({ word: w, start: 0, end: 0 })))
      .filter((w) => w.word.trim().length > 0);

    if (words.length === 0) return;
    const duration = Math.max(0.4, targetLine.end - targetLine.start);
    const step = duration / words.length;

    const reTimed = words.map((w, i) => ({
      word: w.word,
      start: Number((targetLine.start + i * step).toFixed(2)),
      end: Number((targetLine.start + (i + 1) * step).toFixed(2)),
    }));

    const updated = [...subtitles];
    updated[lineIdx] = {
      ...targetLine,
      words: reTimed,
    };

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
    showToast(`Evenly distributed ${reTimed.length} word timings`);
  };

  // Add new line
  const handleAddLine = (insertAfterIdx?: number) => {
    let newStart = clip.startTime;
    let newEnd = clip.startTime + 2.5;

    if (insertAfterIdx !== undefined && subtitles[insertAfterIdx]) {
      const prev = subtitles[insertAfterIdx];
      newStart = Number((prev.end + 0.1).toFixed(2));
      newEnd = Number((newStart + 2.4).toFixed(2));
    } else if (subtitles.length > 0) {
      const last = subtitles[subtitles.length - 1];
      newStart = Number((last.end + 0.1).toFixed(2));
      newEnd = Number((newStart + 2.4).toFixed(2));
    }

    if (newEnd > clip.endTime) {
      newEnd = clip.endTime;
    }

    const newLine: SubtitleLine = {
      start: newStart,
      end: newEnd,
      text: 'New viral caption text...',
      words: [
        { word: 'New', start: newStart, end: Number((newStart + 0.5).toFixed(2)) },
        { word: 'viral', start: Number((newStart + 0.5).toFixed(2)), end: Number((newStart + 1.1).toFixed(2)) },
        { word: 'caption', start: Number((newStart + 1.1).toFixed(2)), end: Number((newStart + 1.8).toFixed(2)) },
        { word: 'text...', start: Number((newStart + 1.8).toFixed(2)), end: newEnd },
      ],
    };

    const updated = [...subtitles];
    if (insertAfterIdx !== undefined) {
      updated.splice(insertAfterIdx + 1, 0, newLine);
    } else {
      updated.push(newLine);
    }

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
    showToast('New caption line added');
  };

  // Duplicate line
  const handleDuplicateLine = (index: number) => {
    const target = subtitles[index];
    if (!target) return;

    const duration = target.end - target.start;
    const newStart = Number((target.end + 0.1).toFixed(2));
    const newEnd = Number((newStart + duration).toFixed(2));

    const duplicated: SubtitleLine = {
      ...target,
      start: newStart,
      end: newEnd,
      words: target.words?.map((w) => ({
        ...w,
        start: Number((w.start + duration + 0.1).toFixed(2)),
        end: Number((w.end + duration + 0.1).toFixed(2)),
      })),
    };

    const updated = [...subtitles];
    updated.splice(index + 1, 0, duplicated);

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
    showToast('Line duplicated');
  };

  // Split line into two halves
  const handleSplitLine = (index: number) => {
    const target = subtitles[index];
    if (!target) return;

    const words = target.text.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      showToast('Need at least 2 words to split line');
      return;
    }

    const midWordIdx = Math.ceil(words.length / 2);
    const firstHalfWords = words.slice(0, midWordIdx);
    const secondHalfWords = words.slice(midWordIdx);

    const midTime = Number(((target.start + target.end) / 2).toFixed(2));

    const line1: SubtitleLine = {
      start: target.start,
      end: midTime,
      text: firstHalfWords.join(' '),
      words: firstHalfWords.map((w, i) => {
        const step = (midTime - target.start) / firstHalfWords.length;
        return {
          word: w,
          start: Number((target.start + i * step).toFixed(2)),
          end: Number((target.start + (i + 1) * step).toFixed(2)),
        };
      }),
    };

    const line2: SubtitleLine = {
      start: midTime,
      end: target.end,
      text: secondHalfWords.join(' '),
      words: secondHalfWords.map((w, i) => {
        const step = (target.end - midTime) / secondHalfWords.length;
        return {
          word: w,
          start: Number((midTime + i * step).toFixed(2)),
          end: Number((midTime + (i + 1) * step).toFixed(2)),
        };
      }),
    };

    const updated = [...subtitles];
    updated.splice(index, 1, line1, line2);

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
    showToast('Split into 2 timed lines');
  };

  // Delete line
  const handleDeleteLine = (index: number) => {
    if (subtitles.length <= 1) {
      showToast('Cannot delete the last remaining line');
      return;
    }
    const updated = subtitles.filter((_, i) => i !== index);
    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
    showToast('Line deleted');
  };

  // Move line up / down
  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= subtitles.length) return;

    const updated = [...subtitles];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
  };

  // Find & Replace across all subtitles
  const handleFindAndReplace = () => {
    if (!findText.trim()) {
      showToast('Enter text to find');
      return;
    }

    let matchCount = 0;
    const regex = new RegExp(findText, 'gi');

    const updated = subtitles.map((line) => {
      if (regex.test(line.text)) {
        const newText = line.text.replace(regex, (m) => {
          matchCount++;
          return replaceText;
        });

        // re-split words
        const textWords = newText.split(/\s+/).filter(Boolean);
        const duration = Math.max(0.4, line.end - line.start);
        const step = duration / Math.max(1, textWords.length);
        const words = textWords.map((w, i) => ({
          word: w,
          start: Number((line.start + i * step).toFixed(2)),
          end: Number((line.start + (i + 1) * step).toFixed(2)),
        }));

        return { ...line, text: newText, words };
      }
      return line;
    });

    onUpdateClip({ ...clip, subtitles: updated });
    showToast(`Replaced ${matchCount} occurrence${matchCount === 1 ? '' : 's'}`);
  };

  // Shift all timings by deltaSeconds
  const handleShiftTimings = (delta: number) => {
    const updated = subtitles.map((line) => {
      const newStart = Math.max(0, Number((line.start + delta).toFixed(2)));
      const newEnd = Math.max(newStart + 0.2, Number((line.end + delta).toFixed(2)));
      const words = line.words?.map((w) => ({
        ...w,
        start: Math.max(0, Number((w.start + delta).toFixed(2))),
        end: Math.max(0.1, Number((w.end + delta).toFixed(2))),
      }));
      return { ...line, start: newStart, end: newEnd, words };
    });

    onUpdateClip({ ...clip, subtitles: updated });
    showToast(`Shifted all subtitles by ${delta > 0 ? `+${delta}` : delta}s`);
  };

  // Quick Format: Uppercase all
  const handleBatchCasing = (casing: CaptionCasing) => {
    const updated = subtitles.map((line) => {
      let newText = line.text;
      if (casing === 'uppercase') newText = line.text.toUpperCase();
      if (casing === 'capitalize') {
        newText = line.text.replace(/\b\w/g, (c) => c.toUpperCase());
      }
      const words = line.words?.map((w) => ({
        ...w,
        word:
          casing === 'uppercase'
            ? w.word.toUpperCase()
            : casing === 'capitalize'
            ? w.word.charAt(0).toUpperCase() + w.word.slice(1)
            : w.word,
      }));
      return { ...line, text: newText, words };
    });

    onUpdateClip({
      ...clip,
      captionCasing: casing,
      subtitles: updated,
    });
    showToast(`Converted all captions to ${casing}`);
  };

  // Remove filler words
  const handleRemoveFillerWords = () => {
    const fillers = /\b(um|uh|like|you know|sort of|kind of|er|ah)\b/gi;
    let removedCount = 0;

    const updated = subtitles.map((line) => {
      const newText = line.text.replace(fillers, () => {
        removedCount++;
        return '';
      }).replace(/\s+/g, ' ').trim();

      const textWords = newText.split(/\s+/).filter(Boolean);
      const duration = Math.max(0.4, line.end - line.start);
      const step = duration / Math.max(1, textWords.length);
      const words = textWords.map((w, i) => ({
        word: w,
        start: Number((line.start + i * step).toFixed(2)),
        end: Number((line.start + (i + 1) * step).toFixed(2)),
      }));

      return { ...line, text: newText, words };
    });

    onUpdateClip({ ...clip, subtitles: updated });
    showToast(`Cleaned ${removedCount} filler word${removedCount === 1 ? '' : 's'}`);
  };

  // Filtered lines
  const filteredSubtitles = useMemo(() => {
    if (!searchFilter.trim()) return subtitles;
    const q = searchFilter.toLowerCase();
    return subtitles.filter((s) => s.text.toLowerCase().includes(q));
  }, [subtitles, searchFilter]);

  // Caption Styles List
  const CAPTION_STYLES: { id: CaptionStyle; label: string; desc: string; badge: string }[] = [
    { id: 'parallax_layers', label: '🔴 Parallax 3D', desc: 'Instrument Serif with 3D red layer', badge: 'High Engagement' },
    { id: 'camera_follow', label: '🎥 Camera Follow', desc: 'Pull-back zoom & gold accents', badge: 'Dynamic' },
    { id: 'editorial_emphasis', label: '📰 Editorial Serif', desc: 'Inter + Playfair 800 italic', badge: 'Classy' },
    { id: 'neon_accent', label: '⚡ Neon Accent', desc: 'Multi-layer green/red/yellow', badge: 'Vibrant' },
    { id: 'neon_glow', label: '💫 Neon Tube Glow', desc: 'Outfit 900 cyan & pink tubes', badge: 'Cyber' },
    { id: 'blend_difference', label: '🌓 Blend Invert', desc: 'Auto-adapts to video colors', badge: 'High Contrast' },
    { id: 'vox_annotate', label: '✏️ Vox Annotate', desc: 'SVG marker + callout note', badge: 'Explainer' },
    { id: 'hormozi', label: '🔥 Hormozi Bold', desc: 'Word highlight with bounce', badge: 'Creator #1' },
    { id: 'mrbeast', label: '💥 MrBeast Pop', desc: 'Bold stroke comic outline', badge: 'Viral Pop' },
    { id: 'karaoke', label: '🎤 Karaoke Wave', desc: 'Audio-synced fluid fill', badge: 'Rhythmic' },
    { id: 'neon', label: '🌐 Cyber Cyan', desc: 'Cyan drop-shadow glow', badge: 'Modern' },
    { id: 'minimal', label: '✨ Clean Minimal', desc: 'Subtle translucent badge', badge: 'Subtle' },
  ];

  const ACCENT_COLORS = [
    { id: '#FCFF00', name: 'Laser Yellow', bg: 'bg-[#FCFF00]' },
    { id: '#53FF01', name: 'Electric Lime', bg: 'bg-[#53FF01]' },
    { id: '#00FFF0', name: 'Cyber Cyan', bg: 'bg-[#00FFF0]' },
    { id: '#FF3B30', name: 'Hot Coral', bg: 'bg-[#FF3B30]' },
    { id: '#10B981', name: 'Emerald', bg: 'bg-[#10B981]' },
    { id: '#A855F7', name: 'Purple Blaze', bg: 'bg-[#A855F7]' },
  ];

  return (
    <div
      className={`flex flex-col ${
        isModal ? 'h-[85vh] max-h-[820px] w-full max-w-4xl bg-[#11141c] rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden' : 'h-full'
      }`}
    >
      {/* Toast Notification Banner */}
      {feedbackMsg && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-300 font-semibold flex items-center justify-between animate-fadeIn">
          <span>{feedbackMsg}</span>
          <span className="text-[10px] opacity-75">Updated</span>
        </div>
      )}

      {/* Editor Sub-Header Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-3 py-2 gap-2">
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setEditorTab('lines')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              editorTab === 'lines'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Lines & Timings ({subtitles.length})</span>
          </button>

          <button
            onClick={() => setEditorTab('style')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              editorTab === 'style'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Style & Position</span>
          </button>

          <button
            onClick={() => setEditorTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              editorTab === 'tools'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI & Batch Tools</span>
          </button>
        </div>

        {isModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close editor"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {!isModal && onOpenExpandModal && (
          <button
            onClick={onOpenExpandModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900 border border-zinc-800/80 rounded-lg transition-colors"
            title="Expand into full screen studio"
          >
            <Maximize2 className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Expand Studio</span>
          </button>
        )}
      </div>

      {/* TAB 1: LINES & TIMINGS */}
      {editorTab === 'lines' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Quick Bar: Search + Add Line + Jump Action */}
          <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search captions..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddLine()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line</span>
              </button>
            </div>
          </div>

          {/* Subtitle Lines Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredSubtitles.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 space-y-2">
                <Type className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No captions match your filter</p>
                <button
                  onClick={() => setSearchFilter('')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredSubtitles.map((sub, idx) => {
                const originalIdx = subtitles.findIndex((s) => s === sub);
                const isActive = currentTime >= sub.start && currentTime <= sub.end;
                const isWordBreakdownOpen = expandedWordLineIdx === originalIdx;
                const duration = Number((sub.end - sub.start).toFixed(2));
                const wordsList = sub.words || sub.text.split(/\s+/).map((w) => ({ word: w, start: sub.start, end: sub.end }));

                return (
                  <div
                    key={originalIdx}
                    className={`rounded-xl border transition-all duration-150 ${
                      isActive
                        ? 'bg-zinc-900/95 border-emerald-500/70 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Line Header: Timestamps + Status + Jump Play */}
                    <div className="flex items-center justify-between p-2.5 border-b border-zinc-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        {/* Playhead jump button */}
                        <button
                          onClick={() => onSeekToTime && onSeekToTime(sub.start)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-emerald-500 text-zinc-950 font-bold'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                          title="Seek & play this line"
                        >
                          <Play className="w-3 h-3 ml-0.5" />
                        </button>

                        {/* Line Index & Active status */}
                        <span className="font-mono text-[11px] text-zinc-500">#{originalIdx + 1}</span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live
                          </span>
                        )}

                        {/* Timestamp Range Controls */}
                        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-300">
                          {/* Start Input with nudge */}
                          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5">
                            <button
                              onClick={() =>
                                handleUpdateLineTimestamps(originalIdx, Math.max(0, sub.start - 0.1), sub.end)
                              }
                              className="text-zinc-500 hover:text-zinc-200 px-0.5"
                              title="-0.1s"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              value={sub.start.toFixed(1)}
                              onChange={(e) =>
                                handleUpdateLineTimestamps(originalIdx, parseFloat(e.target.value) || 0, sub.end)
                              }
                              className="w-12 bg-transparent text-center text-zinc-200 focus:outline-none"
                            />
                            <span className="text-zinc-500 text-[9px]">s</span>
                            <button
                              onClick={() =>
                                handleUpdateLineTimestamps(originalIdx, sub.start + 0.1, sub.end)
                              }
                              className="text-zinc-500 hover:text-zinc-200 px-0.5"
                              title="+0.1s"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-zinc-600">→</span>

                          {/* End Input with nudge */}
                          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5">
                            <button
                              onClick={() =>
                                handleUpdateLineTimestamps(originalIdx, sub.start, Math.max(sub.start + 0.1, sub.end - 0.1))
                              }
                              className="text-zinc-500 hover:text-zinc-200 px-0.5"
                              title="-0.1s"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              value={sub.end.toFixed(1)}
                              onChange={(e) =>
                                handleUpdateLineTimestamps(originalIdx, sub.start, parseFloat(e.target.value) || sub.start + 0.5)
                              }
                              className="w-12 bg-transparent text-center text-zinc-200 focus:outline-none"
                            />
                            <span className="text-zinc-500 text-[9px]">s</span>
                            <button
                              onClick={() =>
                                handleUpdateLineTimestamps(originalIdx, sub.start, sub.end + 0.1)
                              }
                              className="text-zinc-500 hover:text-zinc-200 px-0.5"
                              title="+0.1s"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-zinc-500 text-[10px] ml-1">
                            ({duration}s • {wordsList.length}w)
                          </span>
                        </div>
                      </div>

                      {/* Header Actions: Re-order, Duplicate, Split, Delete */}
                      <div className="flex items-center gap-1 text-zinc-500">
                        <button
                          onClick={() => handleMoveLine(originalIdx, 'up')}
                          disabled={originalIdx === 0}
                          className="p-1 hover:text-zinc-200 disabled:opacity-30"
                          title="Move line up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveLine(originalIdx, 'down')}
                          disabled={originalIdx === subtitles.length - 1}
                          className="p-1 hover:text-zinc-200 disabled:opacity-30"
                          title="Move line down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDuplicateLine(originalIdx)}
                          className="p-1 hover:text-emerald-400"
                          title="Duplicate line"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSplitLine(originalIdx)}
                          className="p-1 hover:text-teal-400"
                          title="Split line in half"
                        >
                          <Split className="w-3 h-3" />
                        </button>
                        {subtitles.length > 1 && (
                          <button
                            onClick={() => handleDeleteLine(originalIdx)}
                            className="p-1 hover:text-red-400"
                            title="Delete line"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Line Text Field */}
                    <div className="p-2.5 space-y-2">
                      <textarea
                        rows={2}
                        value={sub.text}
                        onChange={(e) => handleUpdateLineText(originalIdx, e.target.value)}
                        className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                        placeholder="Type subtitle line..."
                      />

                      {/* Word-level Timing Inspector toggle */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          onClick={() =>
                            setExpandedWordLineIdx(isWordBreakdownOpen ? null : originalIdx)
                          }
                          className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors"
                        >
                          {isWordBreakdownOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          <span>
                            {isWordBreakdownOpen ? 'Hide Word Timings' : `Inspect Word Timings (${wordsList.length})`}
                          </span>
                        </button>

                        <button
                          onClick={() => handleEvenlyDistributeWords(originalIdx)}
                          className="text-[10px] text-zinc-400 hover:text-zinc-200"
                          title="Evenly re-distribute word timings based on line duration"
                        >
                          Auto-distribute words
                        </button>
                      </div>

                      {/* Word Inspector Chips & Editor */}
                      {isWordBreakdownOpen && (
                        <div className="mt-2 p-2.5 bg-zinc-900/70 border border-zinc-800/80 rounded-lg space-y-2 animate-fadeIn">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Individual Word Timestamps:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {wordsList.map((w, wIdx) => {
                              const isWordActive = currentTime >= w.start && currentTime <= w.end;
                              return (
                                <div
                                  key={wIdx}
                                  className={`flex items-center justify-between p-1.5 rounded-md border text-[11px] transition-all ${
                                    isWordActive
                                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                                      : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                                  }`}
                                >
                                  {/* Word Text Input */}
                                  <input
                                    type="text"
                                    value={w.word}
                                    onChange={(e) =>
                                      handleUpdateSingleWord(originalIdx, wIdx, e.target.value)
                                    }
                                    className="w-20 bg-transparent text-xs font-semibold focus:outline-none"
                                  />

                                  {/* Word Start - End */}
                                  <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={w.start.toFixed(1)}
                                      onChange={(e) =>
                                        handleUpdateSingleWord(
                                          originalIdx,
                                          wIdx,
                                          w.word,
                                          parseFloat(e.target.value) || w.start,
                                          w.end
                                        )
                                      }
                                      className="w-10 bg-zinc-900 border border-zinc-800 text-center rounded text-zinc-300 focus:outline-none"
                                    />
                                    <span>-</span>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={w.end.toFixed(1)}
                                      onChange={(e) =>
                                        handleUpdateSingleWord(
                                          originalIdx,
                                          wIdx,
                                          w.word,
                                          w.start,
                                          parseFloat(e.target.value) || w.end
                                        )
                                      }
                                      className="w-10 bg-zinc-900 border border-zinc-800 text-center rounded text-zinc-300 focus:outline-none"
                                    />
                                  </div>

                                  <div className="flex items-center gap-0.5">
                                    {/* Word-level split button */}
                                    {wIdx < wordsList.length - 1 && (
                                      <button
                                        onClick={() => {
                                          const updated = splitLineAtWord(subtitles, originalIdx, wIdx);
                                          onUpdateClip({ ...clip, subtitles: updated });
                                          showToast('Split subtitle after word');
                                        }}
                                        className="p-1 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                                        title={`Split line after "${w.word}"`}
                                      >
                                        <Split className="w-2.5 h-2.5 text-emerald-400" />
                                      </button>
                                    )}

                                    {/* Word Jump Play button */}
                                    <button
                                      onClick={() => onSeekToTime && onSeekToTime(w.start)}
                                      className="p-1 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                                      title="Play word"
                                    >
                                      <Play className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STYLE & POSITION */}
      {editorTab === 'style' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Theme Grid */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 block">
                Caption Animation Theme ({clip.captionStyle})
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Instant Preview on Stage
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAPTION_STYLES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onUpdateClip({ ...clip, captionStyle: preset.id })}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    clip.captionStyle === preset.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate text-white">{preset.label}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Position & Font Size & Casing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Position */}
            <div className="bg-zinc-950/70 border border-zinc-800 p-3 rounded-xl space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">Vertical Placement</label>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { id: 'top', label: 'Top', icon: ArrowUp },
                    { id: 'middle', label: 'Middle', icon: Minus },
                    { id: 'bottom', label: 'Bottom', icon: ArrowDown },
                  ] as const
                ).map((pos) => {
                  const Icon = pos.icon;
                  const isSelected = (clip.captionPosition || 'bottom') === pos.id;
                  return (
                    <button
                      key={pos.id}
                      onClick={() => onUpdateClip({ ...clip, captionPosition: pos.id })}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-500 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{pos.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Sizing */}
            <div className="bg-zinc-950/70 border border-zinc-800 p-3 rounded-xl space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">Font Scale</label>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { id: 'sm', label: 'S' },
                    { id: 'md', label: 'M' },
                    { id: 'lg', label: 'L' },
                    { id: 'xl', label: 'XL' },
                  ] as const
                ).map((size) => {
                  const isSelected = (clip.captionFontSize || 'md') === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => onUpdateClip({ ...clip, captionFontSize: size.id })}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-500 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Casing */}
            <div className="bg-zinc-950/70 border border-zinc-800 p-3 rounded-xl space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">Text Casing</label>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { id: 'uppercase', label: 'ALL CAPS' },
                    { id: 'capitalize', label: 'Title Case' },
                    { id: 'normal', label: 'Natural' },
                  ] as const
                ).map((c) => {
                  const isSelected = (clip.captionCasing || 'uppercase') === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onUpdateClip({ ...clip, captionCasing: c.id })}
                      className={`py-2 px-1 rounded-lg text-[10px] font-semibold border transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-500 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Accent Color Palette */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              Keyword Accent Glow Color
            </label>
            <div className="flex items-center gap-3">
              {ACCENT_COLORS.map((col) => {
                const isSelected = clip.captionAccentColor === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => onUpdateClip({ ...clip, captionAccentColor: col.id })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-white bg-zinc-800 text-white font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${col.bg} inline-block`} />
                    <span className="text-[11px]">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount of Words Displayed on Screen at a Time */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-zinc-200 block">
                  Words Displayed on Screen at a Time
                </label>
                <span className="text-[10px] text-zinc-400">
                  Limit visible text window during playback
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                {DISPLAY_LIMIT_OPTIONS.find((o) => o.id === (clip.captionDisplayLimit || 'none'))?.label || 'None (Full)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DISPLAY_LIMIT_OPTIONS.map((opt) => {
                const isSelected = (clip.captionDisplayLimit || 'none') === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onUpdateClip({ ...clip, captionDisplayLimit: opt.id });
                      showToast(`Display on screen: ${opt.label}`);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/80 text-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title={opt.desc}
                  >
                    <div className="text-[11px] font-bold text-white flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-0.5 truncate">
                      {opt.id === 'one_word' ? '1 word pop' : opt.maxLetters ? `Max ${opt.maxLetters} chars` : 'Full line'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI & BATCH TOOLS */}
      {editorTab === 'tools' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Customize Subtitle Length for Optimal Readability */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customize Subtitle Length for Optimal Readability</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Optimizes retention by segmenting dialogue into high-engagement chunks.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  const updated = rechunkSubtitlesByLength(subtitles, 2);
                  onUpdateClip({ ...clip, captionMaxWords: 2, subtitles: updated });
                  showToast('Re-chunked subtitles to 2 words/line (Punchy)');
                }}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-white">Punchy (1–2w)</div>
                <div className="text-[9px] text-zinc-400">Alex Hormozi style</div>
              </button>

              <button
                onClick={() => {
                  const updated = rechunkSubtitlesByLength(subtitles, 3);
                  onUpdateClip({ ...clip, captionMaxWords: 3, subtitles: updated });
                  showToast('Re-chunked subtitles to 3-4 words/line (Balanced)');
                }}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-white">Balanced (3–4w)</div>
                <div className="text-[9px] text-zinc-400">TikTok sweet spot</div>
              </button>

              <button
                onClick={() => {
                  const updated = rechunkSubtitlesByLength(subtitles, 6);
                  onUpdateClip({ ...clip, captionMaxWords: 6, subtitles: updated });
                  showToast('Re-chunked subtitles to 5-7 words/line (Extended)');
                }}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-white">Extended (5–7w)</div>
                <div className="text-[9px] text-zinc-400">Storytelling flow</div>
              </button>
            </div>

            <button
              onClick={() => {
                const updated = autoSplitLongLines(subtitles, 4, 3.2);
                onUpdateClip({ ...clip, subtitles: updated });
                showToast('Auto-split long lines at natural pause points');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Split className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Split Lines Exceeding 4 Words</span>
            </button>
          </div>

          {/* Find & Replace */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
            <div className="text-xs font-bold text-zinc-200">Find & Replace Across Captions</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Find word (e.g. gonna)..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Replace with (e.g. going to)..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleFindAndReplace}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
            >
              Replace All Across All Lines
            </button>
          </div>

          {/* Audio Sync Shifter */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">Audio Sync Offset Adjuster</span>
              <span className="text-[10px] text-zinc-500">Fix audio/video lead or lag</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
              <button
                onClick={() => handleShiftTimings(-1.0)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono"
              >
                -1.0s
              </button>
              <button
                onClick={() => handleShiftTimings(-0.5)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono"
              >
                -0.5s
              </button>
              <button
                onClick={() => handleShiftTimings(-0.1)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono"
              >
                -0.1s
              </button>
              <button
                onClick={() => handleShiftTimings(0.1)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono"
              >
                +0.1s
              </button>
              <button
                onClick={() => handleShiftTimings(0.5)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono"
              >
                +0.5s
              </button>
              <button
                onClick={() => handleShiftTimings(1.0)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono"
              >
                +1.0s
              </button>
            </div>
          </div>

          {/* Quick Transformers */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
            <div className="text-xs font-bold text-zinc-200">Instant Caption Cleaners</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleBatchCasing('uppercase')}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-left transition-colors"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Convert to ALL CAPS</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  High-energy Shorts & TikTok uppercase text
                </div>
              </button>

              <button
                onClick={handleRemoveFillerWords}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-left transition-colors"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strip Filler Words</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Remove "um", "uh", "like", "you know"
                </div>
              </button>
            </div>
          </div>

          {/* Export Subtitles */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
            <div className="text-xs font-bold text-zinc-200">Export Formatted Subtitles</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() =>
                  downloadFile(
                    `${clip.title.replace(/\s+/g, '_')}.srt`,
                    generateSrtContent(clip),
                    'text/plain'
                  )
                }
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>.SRT File</span>
              </button>

              <button
                onClick={() =>
                  downloadFile(
                    `${clip.title.replace(/\s+/g, '_')}.vtt`,
                    generateVttContent(clip),
                    'text/vtt'
                  )
                }
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>.VTT File</span>
              </button>

              <button
                onClick={async () => {
                  const plain = subtitles.map((s) => s.text).join('\n');
                  const ok = await copyToClipboard(plain);
                  if (ok) {
                    setCopiedFormat('txt');
                    setTimeout(() => setCopiedFormat(null), 2000);
                  }
                }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedFormat === 'txt' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-yellow-400" />
                )}
                <span>Copy Text</span>
              </button>

              <button
                onClick={async () => {
                  const ok = await copyToClipboard(JSON.stringify(subtitles, null, 2));
                  if (ok) {
                    setCopiedFormat('json');
                    setTimeout(() => setCopiedFormat(null), 2000);
                  }
                }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedFormat === 'json' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Copy JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
