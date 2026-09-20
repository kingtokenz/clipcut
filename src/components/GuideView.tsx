import React, { useState } from 'react';
import {
  Sparkles,
  Scissors,
  Layers,
  Type,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  ChevronDown,
  Video,
  FileText,
  Zap,
  Lightbulb,
} from 'lucide-react';

interface GuideViewProps {
  onStartCreating: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onStartCreating }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      icon: Scissors,
      title: '1. AI Moment Extraction & Virality Scoring',
      description:
        'Paste any long YouTube link or upload an MP4/WebM video. The Gemini AI engine listens to speech waveforms, identifies curiosity gaps, emotional debates, and punchlines, ranking every extracted clip from 0-100% virality.',
      color: 'text-emerald-400',
      badge: 'Multimodal AI',
    },
    {
      icon: Layers,
      title: '2. 9:16 Speaker Framing & Auto Face Tracking',
      description:
        'Standard 16:9 widescreen videos are dynamically re-framed for vertical smartphone screens. Choose AI Smart Face Tracking to follow the active speaker, or Podcast Split-Screen to frame both host and guest simultaneously.',
      color: 'text-teal-400',
      badge: 'Auto Crop',
    },
    {
      icon: Type,
      title: '3. 12 Kinetic Animated Subtitle Themes',
      description:
        'Over 85% of mobile viewers watch shorts without audio. 2Short AI generates synchronized word-by-word highlighted captions with Hormozi bold, MrBeast pop, Parallax 3D, and customizable keyword accent colors.',
      color: 'text-cyan-400',
      badge: 'Word-Sync',
    },
    {
      icon: TrendingUp,
      title: '4. Instant Export & Social Metadata Package',
      description:
        'Download your ready-to-publish 9:16 vertical video clip, export .SRT and .VTT subtitles, and copy pre-generated click-worthy titles, hooks, and hashtags formatted for YouTube Shorts, Instagram Reels, and TikTok.',
      color: 'text-indigo-400',
      badge: 'Publish Ready',
    },
  ];

  const faqs = [
    {
      question: 'How does the Virality Score algorithm calculate rank?',
      answer:
        'The algorithm evaluates three primary pillars: 3-Second Hook Retention (the strength of opening curiosity or assertion), Narrative Density (speech pace and information clarity), and Climax Resolution (whether the clip delivers a satisfying conclusion or leaves an irresistible curiosity loop).',
    },
    {
      question: 'Which aspect ratio should I export for TikTok and Instagram Reels?',
      answer:
        '9:16 (1080x1920) is the standard portrait format for TikTok, Instagram Reels, and YouTube Shorts. 1:1 Square is ideal for LinkedIn feeds, while 16:9 is standard for YouTube horizontal playback.',
    },
    {
      question: 'Can I manually edit subtitles and adjust timestamps?',
      answer:
        'Yes! Click on the Subtitles tab or "Expand Studio" inside the Shorts Studio to edit any word, split lines, adjust start/end timestamps by ±0.1s, remove filler words with 1 click, or customize font sizing and vertical position.',
    },
    {
      question: 'What video length performs best on short-form platforms?',
      answer:
        'For YouTube Shorts and TikTok, clips between 30 and 45 seconds currently achieve the highest average completion rate (over 85%). For deep insights or complex storytelling, 60-90 seconds works best on Instagram Reels and LinkedIn.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Creator Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          How 2short.ai Works
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
          Automate the entire short-form content workflow from long-form YouTube video to viral TikTok reel in seconds.
        </p>
      </div>

      {/* 4-Step Process Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-[#111520] border border-[#1e2538] rounded-2xl p-6 space-y-3 relative overflow-hidden shadow-sm hover:border-[#2b354f] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0d1017] border border-[#232a3d] flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {step.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>

      {/* Creator Tips & Best Practices */}
      <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Algorithmic Best Practices for 2026</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-[#0d1017] rounded-xl border border-zinc-800/80 space-y-2">
            <span className="text-xs font-bold text-emerald-400">The 3-Second Rule</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Ensure your first line asks a question or makes an unexpected bold claim. 70% of swipers drop off before 4 seconds if the hook lacks punch.
            </p>
          </div>

          <div className="p-4 bg-[#0d1017] rounded-xl border border-zinc-800/80 space-y-2">
            <span className="text-xs font-bold text-teal-400">Dynamic Captions</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Use animated word highlights like Hormozi or MrBeast Pop. High-contrast typography keeps viewer eyes glued even in sound-off environments.
            </p>
          </div>

          <div className="p-4 bg-[#0d1017] rounded-xl border border-zinc-800/80 space-y-2">
            <span className="text-xs font-bold text-cyan-400">Speaker Centering</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Always inspect face framing. Avoid placing faces too low where comment, share, and audio title overlays obstruct the speaker.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="bg-[#111520] border border-[#1e2538] rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-zinc-200 hover:text-white transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-white">Ready to create your next viral short?</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Test with one of our sample podcast demos or paste your own YouTube link now.
        </p>
        <button
          onClick={onStartCreating}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <span>Open Shorts Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
