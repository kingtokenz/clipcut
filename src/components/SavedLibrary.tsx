import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Play,
  Trash2,
  Download,
  Flame,
  Clock,
  Search,
  Share2,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { ClipItem } from '../types';
import { generateSrtContent, downloadFile } from '../utils/exportHelper';

interface SavedLibraryProps {
  savedClips: ClipItem[];
  onSelectClip: (clip: ClipItem) => void;
  onRemoveClip: (clipId: string) => void;
  onOpenExport: (clip: ClipItem) => void;
  onBackToStudio: () => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  savedClips,
  onSelectClip,
  onRemoveClip,
  onOpenExport,
  onBackToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [viralityFilter, setViralityFilter] = useState<'all' | 'high' | 'ultra'>('all');
  const [sortBy, setSortBy] = useState<'virality' | 'duration' | 'title'>('virality');

  const filteredAndSorted = useMemo(() => {
    let list = savedClips.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (viralityFilter === 'ultra') return c.viralityScore >= 95;
      if (viralityFilter === 'high') return c.viralityScore >= 90;
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'virality') return b.viralityScore - a.viralityScore;
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [savedClips, searchQuery, viralityFilter, sortBy]);

  const handleDownloadSrt = (clip: ClipItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const srt = generateSrtContent(clip);
    downloadFile(`${clip.title.replace(/\s+/g, '_')}.srt`, srt, 'text/plain');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2433] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Saved Shorts & Exports
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Browse, preview, export, and download your bookmarked viral moments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors"
          >
            ← Back to Studio
          </button>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Sort, View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-[#111520] border border-[#1e2538] rounded-2xl">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved clips by title or hook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1017] border border-zinc-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Virality Filter Chips */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setViralityFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viralityFilter === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/60'
              }`}
            >
              All ({savedClips.length})
            </button>
            <button
              onClick={() => setViralityFilter('high')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viralityFilter === 'high'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/60'
              }`}
            >
              &gt;90% Virality
            </button>
            <button
              onClick={() => setViralityFilter('ultra')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viralityFilter === 'ultra'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/60'
              }`}
            >
              &gt;95% Ultra Hook
            </button>
          </div>
        </div>

        {/* Right side: Sort and Grid/Table toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0d1017] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="virality">Highest Virality</option>
              <option value="duration">Longest Duration</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center border border-zinc-800 rounded-xl p-0.5 bg-[#0d1017]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-20 bg-[#111520] border border-[#1e2538] rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-white">No saved clips found</h3>
            <p className="text-xs text-zinc-400">
              {savedClips.length === 0
                ? 'When you generate and discover high-virality moments in the Studio, bookmark them to access here anytime.'
                : 'No clips match your current search and virality filter criteria.'}
            </p>
          </div>
          <button
            onClick={onBackToStudio}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Open Shorts Studio
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((clip) => (
            <div
              key={clip.id}
              className="bg-[#111520] border border-[#1e2538] hover:border-[#2a344d] rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all shadow-sm group hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/20">
                    <Flame className="w-3 h-3 fill-current" />
                    {clip.viralityScore}% Virality
                  </span>

                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {Math.round(clip.duration)}s
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
                    {clip.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 italic line-clamp-2 bg-[#0d1017] p-2.5 rounded-xl border border-zinc-800/60">
                    "{clip.hook}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {clip.aspectRatio} Aspect
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 capitalize">
                    {clip.captionStyle.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1e2538] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectClip(clip)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Preview in Studio</span>
                </button>

                <button
                  onClick={(e) => handleDownloadSrt(clip, e)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
                  title="Download .SRT Subtitles"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenExport(clip)}
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-colors cursor-pointer shadow-sm"
                  title="Export Clip"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => onRemoveClip(clip.id)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#111520] border border-[#1e2538] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0d1017] text-zinc-400 uppercase text-[10px] font-bold border-b border-[#1e2538]">
                <tr>
                  <th className="px-4 py-3">Clip Title & Hook</th>
                  <th className="px-4 py-3">Virality</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2538]">
                {filteredAndSorted.map((clip) => (
                  <tr
                    key={clip.id}
                    onClick={() => onSelectClip(clip)}
                    className="hover:bg-zinc-900/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white max-w-md line-clamp-1">{clip.title}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 italic mt-0.5">
                        "{clip.hook}"
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20 inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        {clip.viralityScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                      {Math.round(clip.duration)}s
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-400 text-[11px]">
                      {clip.aspectRatio} • {clip.captionStyle}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectClip(clip)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => onOpenExport(clip)}
                          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                          title="Export"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveClip(clip.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
