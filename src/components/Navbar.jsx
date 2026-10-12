import React, { useState } from 'react';
import { 
  Timer as TimerIcon, 
  Settings, 
  Headphones, 
  BarChart2, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Palette,
  Image as ImageIcon,
  CloudRain,
  Moon,
  EyeOff,
  Trees,
  Droplets,
  Mountain
} from 'lucide-react';
import { AMBIENT_SOUNDS } from '../utils/ambientSynth';
import { WALLPAPER_PRESETS } from '../utils/storage';

export const Navbar = ({ 
  todayMinutes, 
  completedCount, 
  onOpenSettings, 
  ambientSound, 
  onSelectAmbient, 
  ambientVolume, 
  onChangeAmbientVolume,
  theme,
  onChangeTheme,
  wallpaper,
  onChangeWallpaper,
  activeTab,
  setActiveTab
}) => {
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);

  const hours = Math.floor(todayMinutes / 60);
  const mins = Math.round(todayMinutes % 60);
  const timeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const themes = [
    { id: 'dark', name: 'Cosmic Dark', bg: 'bg-slate-900', border: 'border-indigo-500' },
    { id: 'lofi', name: 'Warm Amber', bg: 'bg-amber-950', border: 'border-amber-500' },
    { id: 'forest', name: 'Matcha Green', bg: 'bg-emerald-950', border: 'border-emerald-500' },
    { id: 'cyberpunk', name: 'Neon Violet', bg: 'bg-purple-950', border: 'border-fuchsia-500' },
  ];

  const getWallpaperIcon = (id) => {
    switch (id) {
      case 'nature': return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'stream': return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'rain': return <CloudRain className="w-3.5 h-3.5 text-cyan-400" />;
      case 'mountain': return <Mountain className="w-3.5 h-3.5 text-indigo-400" />;
      case 'fireflies': return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      default: return <EyeOff className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <TimerIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">FocusFlow</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Study Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Deep focus & session analytics</p>
          </div>
        </div>

        {/* Tab Navigation (Timer vs Analytics) */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'timer'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <TimerIcon className="w-4 h-4" />
            <span>Timer</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Today's Mini Stats Chip */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{completedCount} sessions</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-slate-300 font-semibold">{timeDisplay}</span>
          </div>

          {/* Ambient Sound Popover Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAmbientMenu(!showAmbientMenu);
                setShowThemeMenu(false);
                setShowWallpaperMenu(false);
              }}
              title="Ambient Sounds"
              className={`p-2 rounded-xl transition-all border ${
                ambientSound && ambientSound !== 'off'
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 animate-pulse-slow'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Headphones className="w-4 h-4" />
            </button>

            {/* Ambient Sound Dropdown */}
            {showAmbientMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 p-3 rounded-2xl glass-panel border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Focus Soundscapes</span>
                  </div>
                  {ambientSound !== 'off' && (
                    <button
                      onClick={() => onSelectAmbient('off')}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <VolumeX className="w-3 h-3" /> Stop
                    </button>
                  )}
                </div>

                <div className="space-y-1 mb-3">
                  {AMBIENT_SOUNDS.map((sound) => {
                    const isActive = ambientSound === sound.id;
                    return (
                      <button
                        key={sound.id}
                        onClick={() => onSelectAmbient(sound.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{sound.name}</div>
                          {sound.desc && (
                            <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {sound.desc}
                            </div>
                          )}
                        </div>
                        {isActive && <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {ambientSound !== 'off' && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-slate-300" /> Volume
                      </span>
                      <span>{Math.round(ambientVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={ambientVolume}
                      onChange={(e) => onChangeAmbientVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Wallpaper Switcher Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowWallpaperMenu(!showWallpaperMenu);
                setShowThemeMenu(false);
                setShowAmbientMenu(false);
              }}
              title="Calm Live Wallpaper"
              className={`p-2 rounded-xl transition-all border ${
                wallpaper && wallpaper !== 'off'
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {showWallpaperMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 p-3 rounded-2xl glass-panel border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Wallpapers</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Calm Motion</span>
                </div>

                <div className="space-y-1">
                  {WALLPAPER_PRESETS.map((wp) => {
                    const isActive = wallpaper === wp.id;
                    return (
                      <button
                        key={wp.id}
                        onClick={() => {
                          onChangeWallpaper(wp.id);
                          setShowWallpaperMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getWallpaperIcon(wp.id)}
                          <div>
                            <div className="font-medium">{wp.name}</div>
                            <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {wp.desc}
                            </div>
                          </div>
                        </div>
                        {isActive && <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowAmbientMenu(false);
                setShowWallpaperMenu(false);
              }}
              title="Color Palette"
              className="p-2 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-700/60 transition-all"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 p-2 rounded-2xl glass-panel border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
                  Color Theme
                </div>
                <div className="space-y-1">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onChangeTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        theme === t.id
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/40'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{t.name}</span>
                      <span className={`w-3 h-3 rounded-full ${t.bg} border ${t.border}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Timer Settings"
            className="p-2 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
