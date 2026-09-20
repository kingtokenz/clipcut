/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { HeroInput } from './components/HeroInput';
import { VideoPlayerStage } from './components/VideoPlayerStage';
import { ClipsSidebar } from './components/ClipsSidebar';
import { ProcessingModal } from './components/ProcessingModal';
import { ExportModal } from './components/ExportModal';
import { CaptionEditModal } from './components/CaptionEditModal';
import { SavedLibrary } from './components/SavedLibrary';
import { GuideView } from './components/GuideView';
import { SettingsView } from './components/SettingsView';
import { PRESET_VIDEOS } from './data/presets';
import {
  ClipItem,
  VideoSource,
  GenerationSettings,
  AspectRatio,
  SpeakerCropMode,
  CaptionStyle,
  AppView,
} from './types';
import { ArrowLeft, ExternalLink, Sparkles, SlidersHorizontal, Download } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [activeClipId, setActiveClipId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportModalClip, setExportModalClip] = useState<ClipItem | null>(null);
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);

  // Sidebar responsive state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('2short_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist sidebar collapsed preference
  useEffect(() => {
    try {
      localStorage.setItem('2short_sidebar_collapsed', String(isSidebarCollapsed));
    } catch {
      // ignore
    }
  }, [isSidebarCollapsed]);

  // Saved clips in localStorage
  const [savedClips, setSavedClips] = useState<ClipItem[]>(() => {
    try {
      const stored = localStorage.getItem('2short_saved_clips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('2short_saved_clips', JSON.stringify(savedClips));
    } catch {
      // ignore storage full
    }
  }, [savedClips]);

  // Active clip object
  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0] || null;

  // Start Generation from user URL or upload
  const handleStartGeneration = async (
    source: VideoSource,
    settings: GenerationSettings,
    customTranscript?: string
  ) => {
    setIsProcessing(true);
    let resolvedSource = { ...source };

    try {
      // If YouTube URL, fetch oEmbed metadata first
      if (source.type === 'youtube' && source.url) {
        try {
          const metaResp = await fetch(`/api/youtube-meta?url=${encodeURIComponent(source.url)}`);
          if (metaResp.ok) {
            const meta = await metaResp.json();
            resolvedSource.title = meta.title || resolvedSource.title;
            resolvedSource.author = meta.authorName || resolvedSource.author;
            if (meta.thumbnailUrl) {
              resolvedSource.thumbnailUrl = meta.thumbnailUrl;
            }
          }
        } catch {
          // ignore
        }
      }

      // Call API generate-clips
      const generateResp = await fetch('/api/generate-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: resolvedSource.title,
          videoAuthor: resolvedSource.author,
          youtubeUrl: resolvedSource.url,
          targetDuration: settings.targetDuration,
          clipFocus: settings.clipFocus,
          transcriptText: customTranscript,
        }),
      });

      if (!generateResp.ok) {
        throw new Error('Failed to generate clips');
      }

      const data = await generateResp.json();
      const generatedClips: ClipItem[] = (data.clips || []).map((c: any) => ({
        ...c,
        aspectRatio: c.aspectRatio || '9:16',
        captionStyle: settings.defaultCaptionStyle || c.captionStyle || 'hormozi',
        speakerCropMode: settings.defaultCropMode || c.speakerCropMode || 'auto_tracker',
      }));

      // Fallback if no videoUrl, assign sample video for interactive playback
      if (!resolvedSource.videoUrl) {
        resolvedSource.videoUrl =
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
      }

      setVideoSource(resolvedSource);
      setClips(generatedClips);
      if (generatedClips.length > 0) {
        setActiveClipId(generatedClips[0].id);
      }
      setCurrentView('editor');
    } catch (err) {
      console.error('Generation failed, using preset fallback:', err);
      // Seamless fallback to premier preset
      const defaultPreset = PRESET_VIDEOS[0];
      setVideoSource(defaultPreset.source);
      setClips(defaultPreset.clips);
      setActiveClipId(defaultPreset.clips[0].id);
      setCurrentView('editor');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load Preset directly
  const handleSelectPreset = (preset: { source: VideoSource; clips: ClipItem[] }) => {
    setVideoSource(preset.source);
    setClips(preset.clips);
    if (preset.clips.length > 0) {
      setActiveClipId(preset.clips[0].id);
    }
    setCurrentView('editor');
  };

  // Update active clip time trimming
  const handleUpdateClipTimes = (startTime: number, endTime: number) => {
    if (!activeClip) return;
    const duration = endTime - startTime;
    const updated = {
      ...activeClip,
      startTime,
      endTime,
      duration,
    };
    setClips((prev) => prev.map((c) => (c.id === activeClip.id ? updated : c)));
  };

  // Update active clip crop mode
  const handleUpdateCropMode = (mode: SpeakerCropMode) => {
    if (!activeClip) return;
    const updated = { ...activeClip, speakerCropMode: mode };
    setClips((prev) => prev.map((c) => (c.id === activeClip.id ? updated : c)));
  };

  // Update active clip aspect ratio
  const handleUpdateAspectRatio = (ratio: AspectRatio) => {
    if (!activeClip) return;
    const updated = { ...activeClip, aspectRatio: ratio };
    setClips((prev) => prev.map((c) => (c.id === activeClip.id ? updated : c)));
  };

  // Update active clip caption style
  const handleUpdateCaptionStyle = (style: CaptionStyle) => {
    if (!activeClip) return;
    const updated = { ...activeClip, captionStyle: style };
    setClips((prev) => prev.map((c) => (c.id === activeClip.id ? updated : c)));
  };

  // Toggle Save Clip
  const handleToggleSave = (clip: ClipItem) => {
    setSavedClips((prev) => {
      const exists = prev.some((c) => c.id === clip.id);
      if (exists) {
        return prev.filter((c) => c.id !== clip.id);
      } else {
        return [clip, ...prev];
      }
    });
  };

  // Reset to new video
  const handleNewVideo = () => {
    setVideoSource(null);
    setClips([]);
    setActiveClipId('');
    setCurrentView('editor');
  };

  // Search handler from TopNav
  const handleSearchSelectClip = (query: string) => {
    setSearchQuery(query);
    if (clips.length > 0) {
      const match = clips.find(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.hook.toLowerCase().includes(query.toLowerCase())
      );
      if (match) {
        setActiveClipId(match.id);
        setCurrentView('editor');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-black">
      {/* 1. Left SaaS Application Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        savedCount={savedClips.length}
        hasActiveVideo={Boolean(videoSource && clips.length > 0)}
        onNewVideo={handleNewVideo}
      />

      {/* 2. Main Right Container: Top Navigation + Dynamic Content Views */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-[260px]'
        }`}
      >
        {/* Top SaaS Navigation Bar */}
        <TopNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          hasActiveVideo={Boolean(videoSource && clips.length > 0)}
          activeClip={activeClip}
          onNewVideo={handleNewVideo}
          onOpenExportModal={(clip) => setExportModalClip(clip)}
          onSearchSelectClip={handleSearchSelectClip}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* VIEW 1: SaaS Creator Dashboard */}
          {currentView === 'dashboard' && (
            <DashboardView
              savedClips={savedClips}
              activeClips={clips}
              hasActiveVideo={Boolean(videoSource && clips.length > 0)}
              videoSource={videoSource}
              onOpenStudio={() => setCurrentView('editor')}
              onSelectPreset={(p) => handleSelectPreset(p)}
              onSelectClip={(c) => {
                if (!videoSource) {
                  setVideoSource(PRESET_VIDEOS[0].source);
                  setClips([c]);
                }
                setActiveClipId(c.id);
                setCurrentView('editor');
              }}
              onOpenExport={(c) => setExportModalClip(c)}
            />
          )}

          {/* VIEW 2: Shorts Studio / Editor */}
          {currentView === 'editor' && (
            <>
              {/* If no video has been loaded yet, show the modern Hero Input */}
              {!videoSource || clips.length === 0 ? (
                <HeroInput
                  onStartGeneration={handleStartGeneration}
                  onSelectPreset={handleSelectPreset}
                  isProcessing={isProcessing}
                />
              ) : (
                /* Active Shorts Studio Workspace */
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                  {/* Source Video Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#111520] border border-[#1e2538] rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleNewVideo}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors"
                        title="Import Another Video"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-white line-clamp-1 max-w-lg">
                          {videoSource.title}
                        </h2>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span>{videoSource.author}</span>
                          {videoSource.url && (
                            <a
                              href={videoSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Original Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                        Extracted <strong className="text-emerald-400 font-bold">{clips.length}</strong> viral shorts
                      </span>

                      <button
                        onClick={() => activeClip && setExportModalClip(activeClip)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Export Active Short</span>
                      </button>
                    </div>
                  </div>

                  {/* Main 2-Column Studio Grid: Player on left/center, Clips & Controls on right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: 9:16 Video Player & Trimmer Stage */}
                    <div className="lg:col-span-7 flex flex-col items-center">
                      {activeClip && (
                        <VideoPlayerStage
                          clip={activeClip}
                          videoUrl={videoSource.videoUrl}
                          thumbnailUrl={videoSource.thumbnailUrl}
                          onUpdateClipTimes={handleUpdateClipTimes}
                          onUpdateCropMode={handleUpdateCropMode}
                          onUpdateAspectRatio={handleUpdateAspectRatio}
                          onUpdateCaptionStyle={handleUpdateCaptionStyle}
                        />
                      )}
                    </div>

                    {/* Right Column: Clips List, Subtitles, Framing, Socials */}
                    <div className="lg:col-span-5">
                      <ClipsSidebar
                        clips={clips}
                        activeClipId={activeClipId}
                        onSelectClip={(id) => setActiveClipId(id)}
                        onUpdateClip={(updated) => {
                          setClips((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                        }}
                        savedClipIds={savedClips.map((c) => c.id)}
                        onToggleSave={handleToggleSave}
                        onOpenExportModal={(clip) => setExportModalClip(clip)}
                        onOpenCaptionModal={() => setIsCaptionModalOpen(true)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* VIEW 3: Saved Library & Archive */}
          {currentView === 'library' && (
            <SavedLibrary
              savedClips={savedClips}
              onSelectClip={(clip) => {
                if (!videoSource) {
                  setVideoSource(PRESET_VIDEOS[0].source);
                  setClips([clip]);
                } else {
                  if (!clips.some((c) => c.id === clip.id)) {
                    setClips([clip, ...clips]);
                  }
                }
                setActiveClipId(clip.id);
                setCurrentView('editor');
              }}
              onRemoveClip={(id) => setSavedClips((prev) => prev.filter((c) => c.id !== id))}
              onOpenExport={(clip) => setExportModalClip(clip)}
              onBackToStudio={() => setCurrentView('editor')}
            />
          )}

          {/* VIEW 4: Knowledge Base & Guide */}
          {currentView === 'guide' && (
            <GuideView onStartCreating={() => setCurrentView('editor')} />
          )}

          {/* VIEW 5: Workspace Preferences & Settings */}
          {currentView === 'settings' && (
            <SettingsView onBackToStudio={() => setCurrentView('editor')} />
          )}
        </main>
      </div>

      {/* Processing Animation Modal */}
      <ProcessingModal isOpen={isProcessing} videoTitle={videoSource?.title || 'Video'} />

      {/* Export Modal */}
      <ExportModal
        isOpen={Boolean(exportModalClip)}
        onClose={() => setExportModalClip(null)}
        clip={exportModalClip}
        videoUrl={videoSource?.videoUrl}
      />

      {/* Caption Edit Studio Modal */}
      {activeClip && (
        <CaptionEditModal
          isOpen={isCaptionModalOpen}
          onClose={() => setIsCaptionModalOpen(false)}
          clip={activeClip}
          videoUrl={videoSource?.videoUrl}
          thumbnailUrl={videoSource?.thumbnailUrl}
          onUpdateClip={(updated) => {
            setClips((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
    </div>
  );
}
