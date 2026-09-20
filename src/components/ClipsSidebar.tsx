import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  Check,
  Copy,
  Download,
  Bookmark,
  BookmarkCheck,
  Type,
  Share2,
  Layers,
  FileText,
  Video,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Maximize2,
} from 'lucide-react';
import { ClipItem, CaptionStyle, SpeakerCropMode } from '../types';
import { generateSrtContent, generateVttContent, downloadFile, copyToClipboard } from '../utils/exportHelper';
import { CaptionEditor } from './CaptionEditor';

interface ClipsSidebarProps {
  clips: ClipItem[];
  activeClipId: string;
  onSelectClip: (id: string) => void;
  onUpdateClip: (updated: ClipItem) => void;
  savedClipIds: string[];
  onToggleSave: (clip: ClipItem) => void;
  onOpenExportModal: (clip: ClipItem) => void;
  currentTime?: number;
  onSeekToTime?: (time: number) => void;
  onOpenCaptionModal?: () => void;
}

export const ClipsSidebar: React.FC<ClipsSidebarProps> = ({
  clips,
  activeClipId,
  onSelectClip,
  onUpdateClip,
  savedClipIds,
  onToggleSave,
  onOpenExportModal,
  currentTime,
  onSeekToTime,
  onOpenCaptionModal,
}) => {
  const [activeTab, setActiveTab] = useState<'clips' | 'captions' | 'framing' | 'socials'>('clips');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0];

  const handleCopy = async (text: string, fieldKey: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="w-full bg-[#11141c] border border-zinc-800/90 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="flex items-center border-b border-zinc-800 bg-zinc-950/60 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('clips')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'clips'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-emerald-400" />
          <span>Clips ({clips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('captions')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'captions'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-yellow-400" />
          <span>Captions</span>
        </button>

        <button
          onClick={() => setActiveTab('framing')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'framing'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Framing</span>
        </button>

        <button
          onClick={() => setActiveTab('socials')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'socials'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Socials</span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {/* TAB 1: ALL CLIPS LIST */}
        {activeTab === 'clips' && (
          <div className="space-y-2.5">
            {clips.map((clip, index) => {
              const isActive = clip.id === activeClipId;
              const isSaved = savedClipIds.includes(clip.id);

              return (
                <div
                  key={clip.id}
                  id={`clip-card-${clip.id}`}
                  onClick={() => onSelectClip(clip.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{clip.title}</h4>
                    </div>

                    {/* Virality Score Badge */}
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        clip.viralityScore >= 95
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{clip.viralityScore}%</span>
                    </div>
                  </div>

                  {/* Hook preview */}
                  <p className="text-[11px] text-zinc-400 mt-1.5 italic line-clamp-2">
                    "{clip.hook}"
                  </p>

                  {/* Virality Reason */}
                  <div className="mt-2 text-[10px] text-zinc-500 bg-zinc-950/50 p-1.5 rounded-lg border border-zinc-800/60">
                    <span className="font-semibold text-zinc-400">Retention Factor: </span>
                    {clip.viralityReason}
                  </div>

                  {/* Card Footer: Timestamps & Quick Buttons */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {Math.round(clip.duration)}s
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Save Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(clip);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-emerald-400 bg-emerald-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                        title={isSaved ? 'Saved to Library' : 'Save Clip'}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      {/* Export Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenExportModal(clip);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] shadow-sm transition-colors"
                      >
                        <Download className="w-3 h-3 stroke-[2.5]" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: CAPTIONS & SUBTITLES EDITOR */}
        {activeTab === 'captions' && activeClip && (
          <div className="space-y-3">
            <CaptionEditor
              clip={activeClip}
              onUpdateClip={onUpdateClip}
              currentTime={currentTime}
              onSeekToTime={onSeekToTime}
              onOpenExpandModal={onOpenCaptionModal}
            />
          </div>
        )}

        {/* TAB 3: FRAMING & SPEAKER CROP */}
        {activeTab === 'framing' && activeClip && (
          <div className="space-y-4">
            <div className="bg-zinc-950/60 border border-zinc-800 p-3 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-200">
                Active Speaker 9:16 Framing Crop
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                2Short AI dynamically crops horizontal 16:9 video into full-screen 9:16 mobile feeds without black bars.
              </p>

              <div className="space-y-2">
                {(
                  [
                    {
                      id: 'auto_tracker',
                      name: '🎯 AI Smart Face Tracking',
                      desc: 'Automatically tracks active speaker and smoothly pans between faces.',
                    },
                    {
                      id: 'split',
                      name: '📱 Dynamic Split Screen',
                      desc: 'Stacks two angles (host & guest) vertically on top of each other.',
                    },
                    {
                      id: 'center',
                      name: '↕ Center 9:16 Crop',
                      desc: 'Locks to the visual center of the original frame.',
                    },
                    {
                      id: 'left',
                      name: '👈 Focus Left Side',
                      desc: 'Locks on left speaker / interviewer position.',
                    },
                    {
                      id: 'right',
                      name: '👉 Focus Right Side',
                      desc: 'Locks on right guest / interviewee position.',
                    },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() =>
                      onUpdateClip({ ...activeClip, speakerCropMode: mode.id as SpeakerCropMode })
                    }
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      activeClip.speakerCropMode === mode.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{mode.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIALS & VIRAL METADATA */}
        {activeTab === 'socials' && activeClip && (
          <div className="space-y-3.5">
            {/* YouTube Shorts Title */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">Viral Short Title</span>
                <button
                  onClick={() => handleCopy(activeClip.title, 'title')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  {copiedField === 'title' ? (
                    <>
                      <Check className="w-3 h-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-white">{activeClip.title}</p>
            </div>

            {/* Hook Text */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">Opening Hook (First 2s)</span>
                <button
                  onClick={() => handleCopy(activeClip.hook, 'hook')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  {copiedField === 'hook' ? (
                    <>
                      <Check className="w-3 h-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-200 italic">"{activeClip.hook}"</p>
            </div>

            {/* Description */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">Caption / Description</span>
                <button
                  onClick={() => handleCopy(activeClip.description, 'description')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  {copiedField === 'description' ? (
                    <>
                      <Check className="w-3 h-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{activeClip.description}</p>
            </div>

            {/* Hashtags */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">Hashtags</span>
                <button
                  onClick={() => handleCopy(activeClip.suggestedHashtags.join(' '), 'tags')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  {copiedField === 'tags' ? (
                    <>
                      <Check className="w-3 h-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy All
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeClip.suggestedHashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-emerald-400 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Full Post Bundle Copy */}
            <button
              onClick={() => {
                const bundle = `${activeClip.title}\n\n${activeClip.description}\n\n${activeClip.suggestedHashtags.join(' ')}`;
                handleCopy(bundle, 'bundle');
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/10"
            >
              {copiedField === 'bundle' ? (
                <>
                  <Check className="w-4 h-4" /> Copied Full Post Package!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Complete Post Package
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Persistent Bottom Action Bar */}
      {activeClip && (
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white truncate max-w-[130px]">
              {activeClip.title}
            </span>
          </div>

          <button
            onClick={() => onOpenExportModal(activeClip)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export Clip</span>
          </button>
        </div>
      )}
    </div>
  );
};
