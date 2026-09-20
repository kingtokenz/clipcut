import React, { useState, useRef } from 'react';
import {
  Youtube,
  UploadCloud,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Play,
  Clock,
  Zap,
  CheckCircle2,
  FileVideo,
  Flame,
  ArrowRight,
  Layers,
  Video,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { GenerationSettings, VideoSource, ClipItem } from '../types';
import { PRESET_VIDEOS } from '../data/presets';

interface HeroInputProps {
  onStartGeneration: (source: VideoSource, settings: GenerationSettings, customTranscript?: string) => void;
  onSelectPreset: (preset: { source: VideoSource; clips: ClipItem[] }) => void;
  isProcessing: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  onStartGeneration,
  onSelectPreset,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload' | 'preset'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [customTranscript, setCustomTranscript] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<GenerationSettings>({
    targetDuration: '30-60s',
    clipFocus: 'viral_hooks',
    defaultCaptionStyle: 'hormozi',
    defaultCropMode: 'auto_tracker',
  });

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setYoutubeUrl(text.trim());
      }
    } catch {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.includes('video') || file.name.match(/\.(mp4|webm|mov|mkv)$/i))) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (activeTab === 'upload' && uploadedFile && uploadedVideoUrl) {
      const source: VideoSource = {
        id: 'uploaded-' + Date.now(),
        type: 'upload',
        title: customTitle || uploadedFile.name,
        author: 'Uploaded Video',
        videoUrl: uploadedVideoUrl,
        duration: 180,
      };
      onStartGeneration(source, settings, customTranscript);
      return;
    }

    if (activeTab === 'youtube' && youtubeUrl.trim()) {
      const source: VideoSource = {
        id: 'yt-' + Date.now(),
        type: 'youtube',
        title: customTitle || 'YouTube Video Highlight',
        author: 'YouTube Creator',
        url: youtubeUrl.trim(),
        duration: 300,
      };
      onStartGeneration(source, settings, customTranscript);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* SaaS Hero Heading */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
          <Zap className="w-3.5 h-3.5 fill-emerald-400" />
          <span>Multimodal Speech & Face-Tracking AI</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-sans">
          Turn Long Videos Into Viral{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Shorts & Reels
          </span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Extract high-retention moments, auto-crop speakers into 9:16 vertical, and add Hormozi-style animated captions in seconds.
        </p>
      </div>

      {/* Main Studio Ingestion Container */}
      <div className="bg-[#111520] border border-[#1e2538] rounded-2xl shadow-xl overflow-hidden">
        {/* Ingestion Source Tabs */}
        <div className="flex border-b border-[#1e2538] bg-[#0d1017]">
          <button
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'youtube'
                ? 'border-emerald-500 text-emerald-300 bg-[#111520]'
                : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <Youtube className={`w-4 h-4 ${activeTab === 'youtube' ? 'text-red-500 fill-red-500' : ''}`} />
            <span>YouTube URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-emerald-500 text-emerald-300 bg-[#111520]'
                : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <UploadCloud className={`w-4 h-4 ${activeTab === 'upload' ? 'text-emerald-400' : ''}`} />
            <span>Upload Local Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'preset'
                ? 'border-emerald-500 text-emerald-300 bg-[#111520]'
                : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'preset' ? 'text-amber-400' : ''}`} />
            <span>Sample Projects</span>
          </button>
        </div>

        {/* Tab 1: YouTube Link Input */}
        {activeTab === 'youtube' && (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-200 block">YouTube Video Link</label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
                    <Youtube className="w-5 h-5 fill-red-500" />
                  </div>
                  <input
                    id="youtube-url-input"
                    type="url"
                    placeholder="Paste link: https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full pl-11 pr-20 py-3 bg-[#0d1017] border border-[#232a3d] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 text-xs sm:text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    id="paste-btn"
                    onClick={handlePasteClipboard}
                    className="absolute inset-y-1.5 right-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    Paste
                  </button>
                </div>

                <button
                  type="submit"
                  id="generate-shorts-btn"
                  disabled={isProcessing || !youtubeUrl.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 fill-zinc-950" />
                  <span>{isProcessing ? 'Analyzing Moments...' : 'Generate Shorts'}</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Supports podcasts, interviews, keynote speeches, tutorials, and YouTube webinars.
              </p>
            </div>

            {/* Ingestion Preferences Toggle */}
            <div className="pt-3 border-t border-[#1e2538] flex items-center justify-between">
              <button
                type="button"
                id="advanced-settings-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Extraction Preferences</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Preset: 30-60s • Auto Face Tracking • Hormozi Captions
              </span>
            </div>

            {/* Advanced Settings Drawer */}
            {showAdvanced && (
              <div className="pt-4 border-t border-[#1e2538] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left animate-in fade-in duration-150">
                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">Target Length</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['15-30s', '30-60s', '60-90s'] as const).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setSettings({ ...settings, targetDuration: dur })}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          settings.targetDuration === dur
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-[#0d1017] border-[#22293b] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">Moment Focus</label>
                  <select
                    value={settings.clipFocus}
                    onChange={(e) => setSettings({ ...settings, clipFocus: e.target.value as any })}
                    className="w-full bg-[#0d1017] border border-[#22293b] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="viral_hooks">⚡ Strong Hooks & Retention</option>
                    <option value="educational">💡 Actionable Insights</option>
                    <option value="funny">😂 Funny & High Energy</option>
                    <option value="controversial">🔥 Debated Opinions</option>
                  </select>
                </div>

                {/* Caption Style */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">Caption Theme</label>
                  <select
                    value={settings.defaultCaptionStyle}
                    onChange={(e) => setSettings({ ...settings, defaultCaptionStyle: e.target.value as any })}
                    className="w-full bg-[#0d1017] border border-[#22293b] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="hormozi">🔥 Alex Hormozi (Bold Highlight)</option>
                    <option value="mrbeast">💥 MrBeast Pop (Shadow Bounce)</option>
                    <option value="parallax_layers">🔴 Parallax 3D Cinematic</option>
                    <option value="camera_follow">🎥 Camera Follow Zoom</option>
                    <option value="editorial_emphasis">📰 Editorial Serif</option>
                    <option value="neon_glow">💫 Cyber Neon Glow</option>
                    <option value="vox_annotate">✏️ Vox Marker Annotate</option>
                    <option value="karaoke">🎤 Smooth Karaoke Fill</option>
                    <option value="minimal">✨ Clean Minimal</option>
                  </select>
                </div>

                {/* Framing */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">Speaker Framing</label>
                  <select
                    value={settings.defaultCropMode}
                    onChange={(e) => setSettings({ ...settings, defaultCropMode: e.target.value as any })}
                    className="w-full bg-[#0d1017] border border-[#22293b] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="auto_tracker">🎯 AI Smart Face Tracker</option>
                    <option value="split">📱 Split Screen (2 Speakers)</option>
                    <option value="center">↕ Center 9:16 Crop</option>
                    <option value="left">👈 Left Speaker (Host)</option>
                    <option value="right">👉 Right Speaker (Guest)</option>
                  </select>
                </div>

                {/* Transcript notes */}
                <div className="col-span-full pt-2">
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Custom Prompt or Transcript Focus (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prioritize the segment where they debate AI agents and future jobs..."
                    value={customTranscript}
                    onChange={(e) => setCustomTranscript(e.target.value)}
                    className="w-full bg-[#0d1017] border border-[#22293b] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Upload Local Video */}
        {activeTab === 'upload' && (
          <div className="p-5 sm:p-7 space-y-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/mkv"
              onChange={handleFileUpload}
              className="hidden"
              id="video-upload-input"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-[#22293b] hover:border-emerald-500/40 bg-[#0d1017]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                {uploadedFile ? uploadedFile.name : 'Drop your video file here, or browse'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Supports MP4, WebM, MOV up to 4K resolution
              </p>
              {uploadedFile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB ready for AI extraction</span>
                </div>
              )}
            </div>

            {uploadedFile && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadedVideoUrl(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Clear File
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isProcessing ? 'Processing Video...' : 'Analyze Uploaded Video'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sample Presets */}
        {activeTab === 'preset' && (
          <div className="p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Demonstration Video Library
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Launch the Studio immediately with pre-calculated hooks and subtitles.
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Instant Ingestion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {PRESET_VIDEOS.map((item) => (
                <div
                  key={item.source.id}
                  onClick={() => onSelectPreset(item)}
                  className="bg-[#0d1017] hover:bg-[#151a26] border border-[#22293b] hover:border-emerald-500/40 rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950">
                    <img
                      src={item.source.thumbnailUrl}
                      alt={item.source.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-semibold text-zinc-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.clips.length} Clips</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                      {item.source.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{item.source.author}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      {Math.max(...item.clips.map((c) => c.viralityScore))}% Virality
                    </span>
                    <span className="text-zinc-400 group-hover:text-white font-medium">Load →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature Value Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 bg-[#111520] border border-[#1e2538] rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-emerald-400" />
          </div>
          <h3 className="text-xs font-bold text-white">AI Hook Detection</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Detects curiosity gaps, emotional peaks, and retention-tested narrative hooks for TikTok and Shorts.
          </p>
        </div>

        <div className="p-4 bg-[#111520] border border-[#1e2538] rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">Auto 9:16 Face Tracking</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Re-frames wide 16:9 videos into portrait shorts, following active speakers and supporting podcast split-screen.
          </p>
        </div>

        <div className="p-4 bg-[#111520] border border-[#1e2538] rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">12 Kinetic Caption Themes</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Word-synced subtitles with Hormozi pop, MrBeast glow, Parallax 3D, and customizable highlight colors.
          </p>
        </div>
      </div>
    </div>
  );
};
