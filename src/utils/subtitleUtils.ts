import { SubtitleLine, SubtitleWord, CaptionDisplayLimit } from '../types';

export interface DisplayLimitOption {
  id: CaptionDisplayLimit;
  label: string;
  badge: string;
  desc: string;
  maxLetters?: number;
}

export const DISPLAY_LIMIT_OPTIONS: DisplayLimitOption[] = [
  {
    id: 'one_word',
    label: 'One Word',
    badge: '⚡ 1 Word',
    desc: 'Single word kinetic pop (Alex Hormozi style)',
  },
  {
    id: '10_letters',
    label: '10 Letters',
    badge: '10 Letters',
    desc: 'Ultra-concise (~1–2 short words) for fast shorts',
    maxLetters: 10,
  },
  {
    id: '15_letters',
    label: '15 Letters',
    badge: '15 Letters',
    desc: 'Compact (~2–3 words) high retention',
    maxLetters: 15,
  },
  {
    id: '20_letters',
    label: '20 Letters',
    badge: '20 Letters',
    desc: 'Balanced sweet spot (~3–4 words)',
    maxLetters: 20,
  },
  {
    id: '25_letters',
    label: '25 Letters',
    badge: '25 Letters',
    desc: 'Readable rhythm (~4–5 words)',
    maxLetters: 25,
  },
  {
    id: '30_letters',
    label: '30 Letters',
    badge: '30 Letters',
    desc: 'Extended natural flow (~5–6 words)',
    maxLetters: 30,
  },
  {
    id: 'none',
    label: 'None (Full)',
    badge: 'None (Full Line)',
    desc: 'Displays the complete subtitle line without letter limits',
  },
];

/**
 * Splits a subtitle line into two separate lines immediately after the specified word.
 * Computes exact audio boundaries so neither audio nor text is desynced.
 */
export function splitLineAtWord(
  subtitles: SubtitleLine[],
  lineIdx: number,
  wordIdx: number
): SubtitleLine[] {
  const target = subtitles[lineIdx];
  if (!target) return subtitles;

  const rawWords: SubtitleWord[] =
    target.words && target.words.length > 0
      ? target.words
      : target.text.split(/\s+/).filter(Boolean).map((w, i, arr) => {
          const dur = Math.max(0.4, target.end - target.start);
          const step = dur / arr.length;
          return {
            word: w,
            start: Number((target.start + i * step).toFixed(2)),
            end: Number((target.start + (i + 1) * step).toFixed(2)),
          };
        });

  if (wordIdx < 0 || wordIdx >= rawWords.length - 1) {
    return subtitles; // Cannot split before first or after last word
  }

  const firstWords = rawWords.slice(0, wordIdx + 1);
  const secondWords = rawWords.slice(wordIdx + 1);

  const midTime = firstWords[firstWords.length - 1].end;

  const line1: SubtitleLine = {
    start: target.start,
    end: midTime,
    text: firstWords.map((w) => w.word).join(' '),
    words: firstWords,
  };

  const line2: SubtitleLine = {
    start: secondWords[0]?.start ?? midTime,
    end: target.end,
    text: secondWords.map((w) => w.word).join(' '),
    words: secondWords,
  };

  const next = [...subtitles];
  next.splice(lineIdx, 1, line1, line2);
  return next;
}

/**
 * Splits a subtitle line into two equal halves.
 */
export function splitLineInHalf(
  subtitles: SubtitleLine[],
  lineIdx: number
): SubtitleLine[] {
  const target = subtitles[lineIdx];
  if (!target) return subtitles;

  const words = (target.words && target.words.length > 0)
    ? target.words
    : target.text.split(/\s+/).filter(Boolean).map((w, i, arr) => {
        const dur = Math.max(0.4, target.end - target.start);
        const step = dur / arr.length;
        return {
          word: w,
          start: Number((target.start + i * step).toFixed(2)),
          end: Number((target.start + (i + 1) * step).toFixed(2)),
        };
      });

  if (words.length < 2) return subtitles;

  const midIdx = Math.ceil(words.length / 2) - 1;
  return splitLineAtWord(subtitles, lineIdx, midIdx);
}

/**
 * Re-chunks all subtitles in the clip according to a target words-per-line length.
 * Flattens all existing words while preserving their exact audio timestamps and custom colors,
 * then packages them into lines of size targetWordsPerLine.
 */
export function rechunkSubtitlesByLength(
  subtitles: SubtitleLine[],
  targetWordsPerLine: number
): SubtitleLine[] {
  const clampedTarget = Math.max(1, Math.min(8, targetWordsPerLine));

  // Flatten all words across all lines
  const allWords: SubtitleWord[] = [];
  subtitles.forEach((line) => {
    if (line.words && line.words.length > 0) {
      allWords.push(...line.words);
    } else {
      const textWords = line.text.split(/\s+/).filter(Boolean);
      const dur = Math.max(0.4, line.end - line.start);
      const step = textWords.length > 0 ? dur / textWords.length : 0;
      textWords.forEach((word, i) => {
        allWords.push({
          word,
          start: Number((line.start + i * step).toFixed(2)),
          end: Number((line.start + (i + 1) * step).toFixed(2)),
        });
      });
    }
  });

  if (allWords.length === 0) return subtitles;

  const newLines: SubtitleLine[] = [];
  for (let i = 0; i < allWords.length; i += clampedTarget) {
    const chunk = allWords.slice(i, i + clampedTarget);
    if (chunk.length === 0) continue;

    const lineStart = chunk[0].start;
    const lineEnd = chunk[chunk.length - 1].end;
    const text = chunk.map((w) => w.word).join(' ');

    newLines.push({
      start: lineStart,
      end: lineEnd,
      text,
      words: chunk,
    });
  }

  return newLines;
}

/**
 * Automatically splits long subtitle lines (exceeding maxWords or maxDuration)
 * at natural grammatical pauses (commas, periods, conjunctions) or midpoints.
 */
export function autoSplitLongLines(
  subtitles: SubtitleLine[],
  maxWords = 4,
  maxDuration = 3.5
): SubtitleLine[] {
  let result: SubtitleLine[] = [];

  for (let idx = 0; idx < subtitles.length; idx++) {
    const line = subtitles[idx];
    const words: SubtitleWord[] = (line.words && line.words.length > 0)
      ? line.words
      : line.text.split(/\s+/).filter(Boolean).map((w, i, arr) => {
          const dur = Math.max(0.4, line.end - line.start);
          const step = dur / arr.length;
          return {
            word: w,
            start: Number((line.start + i * step).toFixed(2)),
            end: Number((line.start + (i + 1) * step).toFixed(2)),
          };
        });

    const duration = line.end - line.start;

    if (words.length > maxWords || duration > maxDuration) {
      // Find optimal split point (prefer punctuation or conjunction)
      let bestSplitIdx = Math.floor(words.length / 2) - 1;

      for (let w = 1; w < words.length - 1; w++) {
        const text = words[w].word;
        if (/[,;!?]/.test(text)) {
          bestSplitIdx = w;
          break;
        }
      }

      const firstWords = words.slice(0, bestSplitIdx + 1);
      const secondWords = words.slice(bestSplitIdx + 1);

      result.push({
        start: line.start,
        end: firstWords[firstWords.length - 1].end,
        text: firstWords.map((w) => w.word).join(' '),
        words: firstWords,
      });

      result.push({
        start: secondWords[0]?.start ?? firstWords[firstWords.length - 1].end,
        end: line.end,
        text: secondWords.map((w) => w.word).join(' '),
        words: secondWords,
      });
    } else {
      result.push(line);
    }
  }

  return result;
}

/**
 * Merges a subtitle line with the subsequent line.
 */
export function mergeAdjacentLines(
  subtitles: SubtitleLine[],
  firstLineIdx: number
): SubtitleLine[] {
  if (firstLineIdx < 0 || firstLineIdx >= subtitles.length - 1) {
    return subtitles;
  }

  const line1 = subtitles[firstLineIdx];
  const line2 = subtitles[firstLineIdx + 1];

  const words1: SubtitleWord[] = (line1.words && line1.words.length > 0)
    ? line1.words
    : line1.text.split(/\s+/).filter(Boolean).map((w, i, arr) => ({
        word: w,
        start: line1.start,
        end: line1.end,
      }));

  const words2: SubtitleWord[] = (line2.words && line2.words.length > 0)
    ? line2.words
    : line2.text.split(/\s+/).filter(Boolean).map((w, i, arr) => ({
        word: w,
        start: line2.start,
        end: line2.end,
      }));

  const mergedLine: SubtitleLine = {
    start: line1.start,
    end: Math.max(line1.end, line2.end),
    text: `${line1.text.trim()} ${line2.text.trim()}`,
    words: [...words1, ...words2],
  };

  const next = [...subtitles];
  next.splice(firstLineIdx, 2, mergedLine);
  return next;
}

/**
 * Computes telemetry and readability statistics for the subtitle track.
 */
export function computeReadabilityStats(
  subtitles: SubtitleLine[],
  clipDuration: number
) {
  const lineCount = subtitles.length;
  let totalWords = 0;
  let totalChars = 0;

  subtitles.forEach((line) => {
    const words = line.words?.length || line.text.split(/\s+/).filter(Boolean).length;
    totalWords += words;
    totalChars += line.text.length;
  });

  const avgWordsPerLine = lineCount > 0 ? Number((totalWords / lineCount).toFixed(1)) : 0;
  const safeDuration = Math.max(1, clipDuration);
  const wordsPerSecond = Number((totalWords / safeDuration).toFixed(2));
  const wordsPerMinute = Math.round(wordsPerSecond * 60);

  let rating: 'optimal' | 'fast' | 'dense' | 'light' = 'optimal';
  let ratingLabel = 'Optimal Viral Pacing';
  let badgeColor = 'emerald';

  if (avgWordsPerLine <= 2.5 && wordsPerSecond >= 2.5) {
    rating = 'optimal';
    ratingLabel = '⚡ Hormozi High-Retention';
    badgeColor = 'emerald';
  } else if (avgWordsPerLine > 5) {
    rating = 'dense';
    ratingLabel = '📖 Story / Text-Heavy';
    badgeColor = 'amber';
  } else if (wordsPerSecond > 3.8) {
    rating = 'fast';
    ratingLabel = '🔥 Very Fast Pace';
    badgeColor = 'rose';
  } else {
    rating = 'optimal';
    ratingLabel = '🎯 Balanced Shorts Pacing';
    badgeColor = 'emerald';
  }

  return {
    lineCount,
    totalWords,
    totalChars,
    avgWordsPerLine,
    wordsPerSecond,
    wordsPerMinute,
    rating,
    ratingLabel,
    badgeColor,
  };
}

/**
 * Filters the active line's words dynamically based on the requested display limit:
 * - 'one_word': Displays only the single word currently spoken on screen.
 * - '10_letters', '15_letters', '20_letters', '25_letters', '30_letters':
 *    Partitions the line into readable letter-budget groups and displays the group
 *    containing the current active word.
 * - 'none': Returns all words in the line.
 */
export function filterWordsByDisplayLimit(
  rawWords: SubtitleWord[],
  displayLimit: CaptionDisplayLimit | undefined,
  currentTime: number
): SubtitleWord[] {
  if (!rawWords || rawWords.length === 0) return [];
  if (!displayLimit || displayLimit === 'none') {
    return rawWords.map((w, idx) => ({ ...w, originalIndex: w.originalIndex ?? idx }));
  }

  // Preserve original indices before any slicing
  const indexedWords = rawWords.map((w, idx) => ({
    ...w,
    originalIndex: w.originalIndex ?? idx,
  }));

  // Find active word at currentTime
  let activeIdx = indexedWords.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  if (activeIdx === -1) {
    // Find closest word to current time
    let minDiff = Infinity;
    activeIdx = 0;
    indexedWords.forEach((w, i) => {
      const mid = (w.start + w.end) / 2;
      const diff = Math.abs(currentTime - mid);
      if (diff < minDiff) {
        minDiff = diff;
        activeIdx = i;
      }
    });
  }

  if (displayLimit === 'one_word') {
    return [indexedWords[activeIdx]];
  }

  const letterLimitMap: Record<string, number> = {
    '10_letters': 10,
    '15_letters': 15,
    '20_letters': 20,
    '25_letters': 25,
    '30_letters': 30,
  };

  const maxLetters = letterLimitMap[displayLimit] ?? 9999;

  // Partition line into letter-budget chunks
  const chunks: SubtitleWord[][] = [];
  let currentChunk: SubtitleWord[] = [];
  let currentLen = 0;

  for (let i = 0; i < indexedWords.length; i++) {
    const wordObj = indexedWords[i];
    const wordLen = wordObj.word.length;
    const additionalLen = currentChunk.length === 0 ? wordLen : wordLen + 1; // +1 for space

    if (currentChunk.length > 0 && currentLen + additionalLen > maxLetters) {
      chunks.push(currentChunk);
      currentChunk = [wordObj];
      currentLen = wordLen;
    } else {
      currentChunk.push(wordObj);
      currentLen += additionalLen;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  // Find which chunk contains our activeIdx
  for (const chunk of chunks) {
    if (chunk.some((w) => w.originalIndex === activeIdx)) {
      return chunk;
    }
  }

  // Fallback if not matched
  return chunks[0] || [indexedWords[activeIdx]];
}

/**
 * Permanently re-chunks all subtitles across the clip according to a letter limit.
 * If maxLetters === 1, it chunks into 1-word lines.
 */
export function rechunkSubtitlesByLetters(
  subtitles: SubtitleLine[],
  maxLetters: number
): SubtitleLine[] {
  // Flatten all words across all lines
  const allWords: SubtitleWord[] = [];
  subtitles.forEach((line) => {
    if (line.words && line.words.length > 0) {
      allWords.push(...line.words);
    } else {
      const textWords = line.text.split(/\s+/).filter(Boolean);
      const dur = Math.max(0.4, line.end - line.start);
      const step = textWords.length > 0 ? dur / textWords.length : 0;
      textWords.forEach((word, i) => {
        allWords.push({
          word,
          start: Number((line.start + i * step).toFixed(2)),
          end: Number((line.start + (i + 1) * step).toFixed(2)),
        });
      });
    }
  });

  if (allWords.length === 0) return subtitles;

  const newLines: SubtitleLine[] = [];
  let currentChunk: SubtitleWord[] = [];
  let currentLen = 0;

  for (let i = 0; i < allWords.length; i++) {
    const w = allWords[i];
    const wLen = w.word.length;

    // If maxLetters is 1 (one word mode)
    if (maxLetters <= 1) {
      newLines.push({
        start: w.start,
        end: w.end,
        text: w.word,
        words: [w],
      });
      continue;
    }

    const addedLen = currentChunk.length === 0 ? wLen : wLen + 1;

    if (currentChunk.length > 0 && currentLen + addedLen > maxLetters) {
      newLines.push({
        start: currentChunk[0].start,
        end: currentChunk[currentChunk.length - 1].end,
        text: currentChunk.map((x) => x.word).join(' '),
        words: currentChunk,
      });
      currentChunk = [w];
      currentLen = wLen;
    } else {
      currentChunk.push(w);
      currentLen += addedLen;
    }
  }

  if (currentChunk.length > 0 && maxLetters > 1) {
    newLines.push({
      start: currentChunk[0].start,
      end: currentChunk[currentChunk.length - 1].end,
      text: currentChunk.map((x) => x.word).join(' '),
      words: currentChunk,
    });
  }

  return newLines;
}

