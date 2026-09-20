import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Download,
  Flame,
  ChevronDown,
  Check,
  ExternalLink,
  User,
  Settings,
  HelpCircle,
  Film,
  Plus,
  X,
} from 'lucide-react';
import { AppView } from './Sidebar';
import { ClipItem } from '../types';

interface TopNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenMobileSidebar: () => void;
  hasActiveVideo: boolean;
  activeClip: ClipItem | null;
  onNewVideo: () => void;
  onOpenExportModal?: (clip: ClipItem) => void;
  onSearchSelectClip?: (query: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  setCurrentView,
  onOpenMobileSidebar,
  hasActiveVideo,
  activeClip,
  onNewVideo,
  onOpenExportModal,
  onSearchSelectClip,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'AI Processing Engine Ready',
      desc: 'Gemini 2.5 Flash initialized with multimodal speech analysis.',
      time: 'Just now',
      read: false,
    },
    {
      id: 2,
      title: 'Viral Hook Identified',
      desc: 'Top short scored 98% virality with 8.4s optimal mobile hook.',
      time: '5m ago',
      read: false,
    },
    {
      id: 3,
      title: 'Export Preset Updated',
      desc: 'Auto-framing 9:16 vertical presets loaded successfully.',
      time: '1h ago',
      read: true,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return { category: 'Workspace', title: 'Dashboard Overview' };
      case 'editor':
        return {
          category: 'Shorts Studio',
          title: hasActiveVideo ? 'Video Editor & Framing' : 'Video Ingestion',
        };
      case 'library':
        return { category: 'Assets', title: 'Saved Clips & Exports' };
      case 'guide':
        return { category: 'Documentation', title: 'Feature Knowledge Base' };
      case 'settings':
        return { category: 'Preferences', title: 'Workspace Settings' };
      default:
        return { category: 'Workspace', title: 'Shorts Studio' };
    }
  };

  const breadcrumb = getViewTitle();

  return (
    <header className="h-16 bg-[#0c0f16]/95 backdrop-blur-md border-b border-[#1e2433] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium hidden sm:inline">{breadcrumb.category}</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="text-white font-bold tracking-tight text-sm sm:text-base">
            {breadcrumb.title}
          </span>
          {currentView === 'editor' && hasActiveVideo && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              Live Session
            </span>
          )}
        </div>
      </div>

      {/* Center Search (Hidden on small screens) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick search or jump..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearchSelectClip) onSearchSelectClip(e.target.value);
            }}
            className="w-full bg-[#121622] border border-[#22293b] rounded-xl pl-9 pr-12 py-1.5 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Notifications, Status, Actions, User */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Gemini Engine Latency Badge */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#121622] border border-[#22293b] text-[11px] text-zinc-300">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Gemini AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c0f16]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121622] border border-[#252d40] rounded-2xl shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 px-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-emerald-400 hover:underline font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl text-left text-xs transition-colors ${
                      item.read
                        ? 'bg-zinc-900/40 text-zinc-400'
                        : 'bg-emerald-500/5 border border-emerald-500/20 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[11px] text-white">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Context Action Button */}
        {currentView === 'editor' && hasActiveVideo && activeClip && onOpenExportModal ? (
          <button
            onClick={() => onOpenExportModal(activeClip)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Export Short</span>
          </button>
        ) : (
          <button
            onClick={() => {
              onNewVideo();
              setCurrentView('editor');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Video</span>
          </button>
        )}

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-800/80 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold text-xs shadow-sm">
              AM
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#121622] border border-[#252d40] rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-zinc-800">
                <div className="text-xs font-bold text-white">Alex Morgan</div>
                <div className="text-[10px] text-zinc-400 truncate">alex@creatorstudio.io</div>
                <div className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Pro Creator Plan
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentView('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                Workspace Settings
              </button>

              <button
                onClick={() => {
                  setCurrentView('guide');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-zinc-400" />
                Help & Documentation
              </button>

              <button
                onClick={() => {
                  setCurrentView('library');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors text-left"
              >
                <Film className="w-4 h-4 text-zinc-400" />
                Exported Library
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
