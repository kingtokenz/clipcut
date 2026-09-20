import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, Mic, Video, Wand2 } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  videoTitle: string;
}

const STEPS = [
  { label: 'Ingesting video & extracting audio waveform', icon: Mic },
  { label: 'Transcribing speech & detecting speakers', icon: Cpu },
  { label: 'Gemini AI calculating virality scores & hooks', icon: Sparkles },
  { label: 'Generating 9:16 auto-framing & speaker tracking', icon: Video },
  { label: 'Formatting dynamic animated captions & subtitles', icon: Wand2 },
];

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, videoTitle }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgressPercent(15);
      return;
    }

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 92) return 92;
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next;
      });
    }, 450);

    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#11141c] border border-zinc-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header animation */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Repurposing Video into Viral Shorts
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 truncate max-w-xs mx-auto">
            {videoTitle || 'Processing Video Content...'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
            <span>AI Multimodal Processing</span>
            <span className="text-emerald-400 font-semibold">{progressPercent}%</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2.5 text-left pt-2 border-t border-zinc-800/80">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20'
                    : isDone
                    ? 'text-zinc-400'
                    : 'text-zinc-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isDone
                      ? 'bg-emerald-500 text-zinc-950'
                      : isCurrent
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <span className="truncate flex-1">{step.label}</span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
