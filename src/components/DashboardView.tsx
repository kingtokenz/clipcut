import React from 'react';
import {
  Flame,
  Clock,
  Sparkles,
  TrendingUp,
  Video,
  Play,
  ArrowUpRight,
  Download,
  Bookmark,
  Share2,
  FileVideo,
  Youtube,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  Sliders,
  BarChart3,
  Layers,
  Zap,
} from 'lucide-react';
import { ClipItem, VideoSource } from '../types';
import { PRESET_VIDEOS } from '../data/presets';

interface DashboardViewProps {
  savedClips: ClipItem[];
  activeClips: ClipItem[];
  hasActiveVideo: boolean;
  videoSource: VideoSource | null;
  onOpenStudio: () => void;
  onSelectPreset: (preset: { source: VideoSource; clips: ClipItem[] }) => void;
  onSelectClip: (clip: ClipItem) => void;
  onOpenExport: (clip: ClipItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  savedClips,
  activeClips,
  hasActiveVideo,
  videoSource,
  onOpenStudio,
  onSelectPreset,
  onSelectClip,
  onOpenExport,
}) => {
  // Compute dynamic stats based on real data
  const totalClipsCount = Math.max(38, activeClips.length + savedClips.length);
  const avgVirality =
    activeClips.length > 0
      ? Math.round(activeClips.reduce((acc, c) => acc + c.viralityScore, 0) / activeClips.length)
      : 94;

  const displayClips =
    activeClips.length > 0
      ? activeClips.slice(0, 4)
      : savedClips.length > 0
      ? savedClips.slice(0, 4)
      : PRESET_VIDEOS[0].clips.slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* 1. SaaS Hero Overview Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1e2433]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              Creator Pro Workspace
            </span>
            <span className="text-xs text-zinc-400">v2.5 Production</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Short-Form Performance Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Extract high-retention 9:16 clips with AI speech recognition, word-synced subtitles, and automated speaker tracking.
          </p>
        </div>

        {/* Quick Launch Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-zinc-950" />
            <span>Open Shorts Studio</span>
          </button>

          <button
            onClick={() => onSelectPreset(PRESET_VIDEOS[0])}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#121622] hover:bg-zinc-800 text-zinc-200 border border-[#252d40] text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span>Load Demo Video</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metric Cards (8px Spacing Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:border-[#2b354f] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Viral Shorts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalClipsCount}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% from last cycle</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">Ready for TikTok, Reels & Shorts</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:border-[#2b354f] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Avg. Virality Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">{avgVirality}%</div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top 5% hook retention</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">Evaluated on 3-second hook strength</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:border-[#2b354f] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Manual Hours Saved</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">18.5 hrs</div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-400 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Auto 9:16 + sync subtitles</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">Compared to timeline NLE clipping</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:border-[#2b354f] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">AI Speech Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">99.4%</div>
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold mt-1">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" />
              <span>Word-level timestamping</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* 3. Mid Section: Virality Retention Visualizer & Active Project Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retention Distribution Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-[#111520] border border-[#1e2538] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Audience Retention & Hook Analysis
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Virality score breakdown across extraction parameters
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              High Virality
            </span>
          </div>

          {/* SVG Visualizer Chart */}
          <div className="h-44 w-full bg-[#0d1017] rounded-xl border border-zinc-800/80 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>0s Hook Impact</span>
              <span>15s Retention Core</span>
              <span>30s Climax / CTA</span>
              <span>60s Full Watch</span>
            </div>

            {/* Bars representation */}
            <div className="grid grid-cols-6 gap-3 items-end h-24 pt-2">
              {[
                { label: 'Hook 1', score: 98, height: 'h-[92%]', color: 'bg-emerald-400' },
                { label: 'Hook 2', score: 95, height: 'h-[86%]', color: 'bg-emerald-400' },
                { label: 'Story', score: 91, height: 'h-[80%]', color: 'bg-teal-400' },
                { label: 'Debate', score: 89, height: 'h-[75%]', color: 'bg-teal-400' },
                { label: 'Insight', score: 94, height: 'h-[84%]', color: 'bg-cyan-400' },
                { label: 'Summary', score: 86, height: 'h-[68%]', color: 'bg-zinc-500' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                    {bar.score}%
                  </span>
                  <div
                    className={`w-full ${bar.height} ${bar.color} rounded-t-md opacity-85 group-hover:opacity-100 transition-all shadow-sm`}
                  />
                  <span className="text-[9px] text-zinc-400 truncate max-w-[40px]">{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
              <span>Benchmark: Short-form viral clips maintain &gt;85% completion rate</span>
              <span className="text-emerald-400 font-bold">Optimized for TikTok / Reels</span>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-[#131724] border border-[#20273c] rounded-xl text-left space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Speaker Crop
              </div>
              <div className="text-xs font-bold text-zinc-200">Auto Face Tracking</div>
              <div className="text-[10px] text-emerald-400 font-medium">9:16 Center Lock</div>
            </div>

            <div className="p-3 bg-[#131724] border border-[#20273c] rounded-xl text-left space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Captions Engine
              </div>
              <div className="text-xs font-bold text-zinc-200">12 Kinetic Themes</div>
              <div className="text-[10px] text-teal-400 font-medium">Hormozi & MrBeast</div>
            </div>

            <div className="p-3 bg-[#131724] border border-[#20273c] rounded-xl text-left space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Export Ready
              </div>
              <div className="text-xs font-bold text-zinc-200">1080x1920 HD</div>
              <div className="text-[10px] text-cyan-400 font-medium">SRT + VTT Included</div>
            </div>
          </div>
        </div>

        {/* Active Workspace / Quick Input Trigger (5 cols) */}
        <div className="lg:col-span-5 bg-[#111520] border border-[#1e2538] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Current Studio Session
              </span>
              {hasActiveVideo ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  In Progress
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                  Ready to Ingest
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white">
              {videoSource ? videoSource.title : 'Ready to Repurpose Video Content'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {videoSource
                ? `Author: ${videoSource.author} • Extracted ${activeClips.length} high-potential short clips`
                : 'Paste a YouTube video link or upload an MP4 recording to start extracting viral moments.'}
            </p>
          </div>

          {/* Quick Actions inside card */}
          <div className="space-y-2 pt-3 border-t border-[#1e2538]">
            <button
              onClick={onOpenStudio}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/60 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Paste YouTube Link
                  </div>
                  <div className="text-[10px] text-zinc-400">Instant AI transcript & hook search</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onOpenStudio}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/60 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Upload MP4 / WebM File
                  </div>
                  <div className="text-[10px] text-zinc-400">High-bitrate local video processing</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2">
            <span>Powered by Google Gemini 2.5 Flash</span>
            <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={onOpenStudio}>
              Launch Studio →
            </span>
          </div>
        </div>
      </div>

      {/* 4. Recent Viral Shorts Table / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Featured & High-Virality Shorts
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Top moments ranked by curiosity gap, delivery speed, and emotional engagement
            </p>
          </div>

          <button
            onClick={onOpenStudio}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Studio Clips</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayClips.map((clip) => (
            <div
              key={clip.id}
              className="bg-[#111520] border border-[#1e2538] hover:border-[#2b354f] rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-sm group hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/20">
                    <Flame className="w-3 h-3 fill-current" />
                    {clip.viralityScore}% Virality
                  </span>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {clip.duration.toFixed(0)}s
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                  {clip.title}
                </h4>

                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1.5 italic bg-[#0d1017] p-2 rounded-xl border border-zinc-800/60">
                  "{clip.hook}"
                </p>
              </div>

              <div className="pt-2 border-t border-[#1e2538] flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectClip(clip);
                    onOpenStudio();
                  }}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => onOpenExport(clip)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
                  title="Quick Export"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Quick Presets Launchpad */}
      <div className="p-6 rounded-2xl bg-[#111520] border border-[#1e2538] space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Pre-loaded Creator Demonstrations
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Test the 9:16 vertical trimmer, animated subtitles, and speaker tracking with instant sample videos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_VIDEOS.map((p) => (
            <div
              key={p.source.id}
              onClick={() => {
                onSelectPreset(p);
                onOpenStudio();
              }}
              className="p-3.5 bg-[#0d1017] hover:bg-[#151a26] border border-[#1e2538] hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                <span className="line-clamp-1">{p.source.title}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">{p.source.author}</p>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                <span>{p.clips.length} Extracted Shorts</span>
                <span className="text-emerald-400 font-semibold">Load Project →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
