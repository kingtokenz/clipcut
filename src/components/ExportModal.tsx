import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Video,
  CheckCircle2,
  Sparkles,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { ClipItem } from '../types';
import { generateSrtContent, generateVttContent, downloadFile, copyToClipboard } from '../utils/exportHelper';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: ClipItem | null;
  videoUrl?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clip,
  videoUrl,
}) => {
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderFinished, setRenderFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !clip) return null;

  const handleStartRender = () => {
    setRendering(true);
    setRenderProgress(10);
    setRenderFinished(false);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setRendering(false);
            setRenderFinished(true);
            // Trigger download of the clip
            if (videoUrl) {
              const a = document.createElement('a');
              a.href = videoUrl;
              a.download = `${clip.title.replace(/\s+/g, '_')}_9x16_Short.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              // Fallback download
              downloadFile(
                `${clip.title.replace(/\s+/g, '_')}_script.txt`,
                `2Short AI - ${clip.title}\n\nHook: ${clip.hook}\n\nTranscript:\n${clip.subtitles.map((s) => s.text).join('\n')}`,
                'text/plain'
              );
            }
          }, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 350);
  };

  const handleCopySocials = async () => {
    const text = `${clip.title}\n\n${clip.description}\n\n${clip.suggestedHashtags.join(' ')}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#11141c] border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export & Download Clip</h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-xs">{clip.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Specs Card */}
        <div className="grid grid-cols-3 gap-2 text-center p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-xs">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Aspect Ratio</div>
            <div className="text-white font-bold mt-0.5">{clip.aspectRatio} Vertical</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Duration</div>
            <div className="text-white font-bold mt-0.5">{Math.round(clip.duration)}s</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Captions</div>
            <div className="text-emerald-400 font-bold mt-0.5 capitalize">{clip.captionStyle}</div>
          </div>
        </div>

        {/* Render status */}
        {rendering && (
          <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2 text-center">
            <div className="flex justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                Rendering 9:16 Short with Subtitles...
              </span>
              <span className="text-emerald-400">{renderProgress}%</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        )}

        {renderFinished && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Rendering finished! Your video download has started automatically.</span>
          </div>
        )}

        {/* Primary Video Export Button */}
        <button
          onClick={handleStartRender}
          disabled={rendering}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Video className="w-4 h-4 stroke-[2.5]" />
          <span>{rendering ? 'Processing Video...' : 'Download 9:16 Video Clip'}</span>
        </button>

        {/* Secondary Downloads: Subtitles & Socials */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Additional Export Assets
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                downloadFile(
                  `${clip.title.replace(/\s+/g, '_')}.srt`,
                  generateSrtContent(clip),
                  'text/plain'
                )
              }
              className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download .SRT</span>
            </button>

            <button
              onClick={() =>
                downloadFile(
                  `${clip.title.replace(/\s+/g, '_')}.vtt`,
                  generateVttContent(clip),
                  'text/vtt'
                )
              }
              className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Download .VTT</span>
            </button>
          </div>

          <button
            onClick={handleCopySocials}
            className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Viral Metadata!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy Social Post & Hashtags</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
