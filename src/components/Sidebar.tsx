import React from 'react';
import {
  LayoutDashboard,
  Film,
  Bookmark,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Plus,
  Layers,
  Sliders,
  User,
  LogOut,
  X,
} from 'lucide-react';

export type AppView = 'dashboard' | 'editor' | 'library' | 'guide' | 'settings';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  savedCount: number;
  hasActiveVideo: boolean;
  onNewVideo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  savedCount,
  hasActiveVideo,
  onNewVideo,
}) => {
  const navMainItems = [
    {
      id: 'dashboard' as AppView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'editor' as AppView,
      label: 'Shorts Studio',
      icon: Film,
      badge: hasActiveVideo ? 'Active' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'library' as AppView,
      label: 'Saved Clips',
      icon: Bookmark,
      badge: savedCount > 0 ? String(savedCount) : null,
      badgeColor: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    },
  ];

  const navResourceItems = [
    {
      id: 'guide' as AppView,
      label: 'Knowledge Base',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'settings' as AppView,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0d1017] border-r border-[#1e2433] transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e2433]">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Film className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white font-sans">
                    2short<span className="text-emerald-400">.ai</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Pro
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 truncate">Video Repurposing</span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Button in Sidebar */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewVideo();
              handleNavClick('editor');
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all ${
              isCollapsed && !isMobileOpen ? 'px-0' : ''
            }`}
            title="Create New Short"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Create New Short</span>}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Main Section */}
          <div className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Workspace
              </div>
            )}
            {navMainItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold leading-none ${
                            item.badgeColor || 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Resources Section */}
          <div className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                System & Help
              </div>
            )}
            {navResourceItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* AI Engine Status Card */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="mx-1 p-3 rounded-2xl bg-[#131722] border border-[#232a3b] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Gemini 2.5 Flash
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Multimodal speech-to-hook detection & automated speaker tracking engine.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                <span>Plan Quota:</span>
                <span className="font-semibold text-emerald-400">Unlimited Clips</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Collapse Toggle */}
        <div className="p-3 border-t border-[#1e2433] space-y-2">
          {/* User Card */}
          <div
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/60 cursor-pointer transition-colors ${
              isCollapsed && !isMobileOpen ? 'justify-center' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold text-xs shadow-sm">
                AM
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d1017]" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">Alex Morgan</div>
                <div className="text-[10px] text-zinc-400 truncate">Creator Pro • Studio</div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded-lg text-xs transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
