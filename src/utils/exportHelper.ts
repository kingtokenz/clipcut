import { ClipItem } from '../types';

function formatSrtTime(seconds: number): string {
  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
}

function formatVttTime(seconds: number): string {
  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)}.${pad(ms, 3)}`;
}

export function generateSrtContent(clip: ClipItem): string {
  const offset = clip.startTime;
  return clip.subtitles
    .map((sub, index) => {
      const relStart = Math.max(0, sub.start - offset);
      const relEnd = Math.max(relStart + 0.5, sub.end - offset);
      return `${index + 1}\n${formatSrtTime(relStart)} --> ${formatSrtTime(relEnd)}\n${sub.text.trim()}\n`;
    })
    .join('\n');
}

export function generateVttContent(clip: ClipItem): string {
  const offset = clip.startTime;
  const body = clip.subtitles
    .map((sub, index) => {
      const relStart = Math.max(0, sub.start - offset);
      const relEnd = Math.max(relStart + 0.5, sub.end - offset);
      return `${index + 1}\n${formatVttTime(relStart)} --> ${formatVttTime(relEnd)}\n${sub.text.trim()}\n`;
    })
    .join('\n');
  return `WEBVTT - 2Short AI Generated Captions\n\n${body}`;
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(successful);
    } catch {
      document.body.removeChild(textArea);
      return Promise.resolve(false);
    }
  }
}
