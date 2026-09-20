import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Type,
  Video,
  Download,
  User,
  ShieldCheck,
  Zap,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Flame,
} from 'lucide-react';
import { CaptionStyle, SpeakerCropMode, AspectRatio, CaptionPosition } from '../types';

interface SettingsViewProps {
  onBackToStudio: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBackToStudio }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'captions' | 'export' | 'account'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [defaultDuration, setDefaultDuration] = useState<'15-30s' | '30-60s' | '60-90s'>('30-60s');
  const [defaultCrop, setDefaultCrop] = useState<SpeakerCropMode>('auto_tracker');
  const [defaultCaptionStyle, setDefaultCaptionStyle] = useState<CaptionStyle>('hormozi');
  const [defaultPosition, setDefaultPosition] = useState<CaptionPosition>('bottom');
  const [defaultAccentColor, setDefaultAccentColor] = useState('#22c55e');
  const [exportResolution, setExportResolution] = useState<'1080p' | '4k'>('1080p');
  const [frameRate, setFrameRate] = useState<'60fps' | '30fps'>('60fps');
  const [burnInSubtitles, setBurnInSubtitles] = useState(true);
  const [autoEmoji, setAutoEmoji] = useState(true);
  const [removeFillers, setRemoveFillers] = useState(true);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2433] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Workspace Preferences</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure automated clip extraction defaults, subtitle themes, and export standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700/60 transition-colors"
          >
            ← Back to Studio
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1e2433] pb-2 overflow-x-auto">
        {[
          { id: 'general', label: 'AI & Extraction', icon: Sliders },
          { id: 'captions', label: 'Subtitles & Branding', icon: Type },
          { id: 'export', label: 'Export Presets', icon: Download },
          { id: 'account', label: 'Plan & Team', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI & Extraction */}
      {activeTab === 'general' && (
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Default Video Ingestion Rules</h3>
            <p className="text-xs text-zinc-400">
              Set standard rules applied whenever you import a new YouTube link or upload.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Target Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200">Default Target Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {(['15-30s', '30-60s', '60-90s'] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDefaultDuration(dur)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      defaultDuration === dur
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#131722] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500">
                Optimal lengths for TikTok (30-45s) and YouTube Shorts (45-60s).
              </p>
            </div>

            {/* Default Speaker Framing */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200">Default Speaker Framing</label>
              <select
                value={defaultCrop}
                onChange={(e) => setDefaultCrop(e.target.value as any)}
                className="w-full bg-[#131722] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="auto_tracker">AI Face Tracking (Recommended)</option>
                <option value="center">Center 9:16 Crop</option>
                <option value="split">Split Screen (Podcast Host + Guest)</option>
                <option value="left">Left Third (Speaker A)</option>
                <option value="right">Right Third (Speaker B)</option>
              </select>
              <p className="text-[11px] text-zinc-500">
                Automated face tracking keeps active speakers centered within the 9:16 mobile frame.
              </p>
            </div>
          </div>

          {/* AI Cleaners */}
          <div className="pt-4 border-t border-[#1e2538] space-y-3">
            <h4 className="text-xs font-bold text-zinc-300">Speech Processing Cleaners</h4>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3 bg-[#131722] border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={removeFillers}
                  onChange={(e) => setRemoveFillers(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500/20"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Auto-Strip Speech Fillers</div>
                  <div className="text-[11px] text-zinc-400">
                    Removes "um", "uh", "you know", and repetitive speech pauses from subtitles.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#131722] border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={autoEmoji}
                  onChange={(e) => setAutoEmoji(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500/20"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Animated Keyword Emojis</div>
                  <div className="text-[11px] text-zinc-400">
                    Automatically injects contextually relevant viral emojis at key high-retention words.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Captions */}
      {activeTab === 'captions' && (
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Subtitle Engine & Typography</h3>
            <p className="text-xs text-zinc-400">
              Customize default animated caption designs across your generated shorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Style Preset */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200">Default Animation Theme</label>
              <select
                value={defaultCaptionStyle}
                onChange={(e) => setDefaultCaptionStyle(e.target.value as any)}
                className="w-full bg-[#131722] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="hormozi">Hormozi Bold (Viral High Energy)</option>
                <option value="mrbeast">MrBeast Pop (Bold Shadow Bounce)</option>
                <option value="parallax_layers">Parallax 3D Cinematic</option>
                <option value="camera_follow">Camera Follow Zoom</option>
                <option value="editorial_emphasis">Editorial Serif (Playfair Elegance)</option>
                <option value="neon_glow">Neon Tube Glow</option>
                <option value="vox_annotate">Vox Explainer (Highlighter)</option>
                <option value="karaoke">Karaoke Word Fill</option>
                <option value="minimal">Minimal Clean White</option>
              </select>
              <p className="text-[11px] text-zinc-500">
                You can also change styles per clip inside the Studio sidebar.
              </p>
            </div>

            {/* Default Position */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200">Vertical Screen Position</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bottom', 'middle', 'top'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setDefaultPosition(pos)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition-all ${
                      defaultPosition === pos
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#131722] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500">
                Bottom position sits above TikTok and Reels interactive UI overlays.
              </p>
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-zinc-200">Keyword Highlight Accent Color</label>
            <div className="flex items-center gap-3">
              {[
                { hex: '#22c55e', name: 'Emerald' },
                { hex: '#eab308', name: 'Gold' },
                { hex: '#06b6d4', name: 'Cyan' },
                { hex: '#a855f7', name: 'Violet' },
                { hex: '#ef4444', name: 'Coral' },
                { hex: '#ffffff', name: 'White' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setDefaultAccentColor(c.hex)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                    defaultAccentColor === c.hex
                      ? 'ring-2 ring-emerald-400 border-white scale-110'
                      : 'border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {defaultAccentColor === c.hex && (
                    <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Export Presets */}
      {activeTab === 'export' && (
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Video Rendering & Codec Quality</h3>
            <p className="text-xs text-zinc-400">
              Hardware acceleration and container standards for exported vertical media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200">Export Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                {(['1080p', '4k'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setExportResolution(res)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      exportResolution === res
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#131722] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {res === '1080p' ? '1080x1920 (FHD)' : '2160x3840 (4K UHD)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200">Frame Rate</label>
              <div className="grid grid-cols-2 gap-2">
                {(['60fps', '30fps'] as const).map((fps) => (
                  <button
                    key={fps}
                    type="button"
                    onClick={() => setFrameRate(fps)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      frameRate === fps
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#131722] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {fps} Smooth
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Account */}
      {activeTab === 'account' && (
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1e2538]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-black text-base shadow-md">
                AM
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Alex Morgan</h3>
                <p className="text-xs text-zinc-400">alex@creatorstudio.io</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Creator Pro Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#131722] border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[11px] text-zinc-400 font-medium">Monthly Clips Quota</span>
              <div className="text-lg font-bold text-white">Unlimited</div>
              <span className="text-[10px] text-emerald-400">Fair use policy</span>
            </div>

            <div className="p-4 bg-[#131722] border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[11px] text-zinc-400 font-medium">Cloud Storage</span>
              <div className="text-lg font-bold text-white">128 GB / 500 GB</div>
              <span className="text-[10px] text-zinc-400">25% capacity</span>
            </div>

            <div className="p-4 bg-[#131722] border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[11px] text-zinc-400 font-medium">AI Multimodal Engine</span>
              <div className="text-lg font-bold text-white">Gemini 2.5 Flash</div>
              <span className="text-[10px] text-emerald-400">Live & connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
