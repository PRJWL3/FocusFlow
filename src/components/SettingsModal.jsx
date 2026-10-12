import React, { useState } from 'react';
import { Settings, X, Volume2, Bell, Clock, Target, Trash2, Check, Sparkles, BellRing, ExternalLink } from 'lucide-react';
import { playMarimbaChime } from '../utils/audio';
import { TIMER_PRESETS, WALLPAPER_PRESETS } from '../utils/storage';
import { requestNotificationPermission } from '../utils/notifications';

export const SettingsModal = ({ isOpen, onClose, settings, onSaveSettings, onClearAllData }) => {
  const [formData, setFormData] = useState({ ...settings });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyPreset = (p) => {
    setFormData(prev => ({
      ...prev,
      pomodoroMinutes: p.work,
      shortBreakMinutes: p.break,
      activePreset: p.id
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const testChime = () => {
    playMarimbaChime(formData.soundVolume);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Timer & Focus Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section: Presets & Timer Durations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Time Durations (Minutes)
              </label>
              <span className="text-[11px] text-slate-400">Choose preset or custom</span>
            </div>

            {/* Quick Presets Row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {TIMER_PRESETS.map((p) => {
                const isSelected = 
                  formData.pomodoroMinutes === p.work && 
                  formData.shortBreakMinutes === p.break;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2 rounded-xl text-center text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>{p.name}</div>
                    <div className="text-[9px] font-normal opacity-80">{p.label}</div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="block text-xs text-slate-400 mb-1 font-medium">Pomodoro (Focus)</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.pomodoroMinutes}
                  onChange={(e) => handleChange('pomodoroMinutes', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1 font-medium">Short Break</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.shortBreakMinutes}
                  onChange={(e) => handleChange('shortBreakMinutes', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1 font-medium">Long Break</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={formData.longBreakMinutes}
                  onChange={(e) => handleChange('longBreakMinutes', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Intervals & Daily Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Long Break Interval (cycles)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.longBreakInterval}
                onChange={(e) => handleChange('longBreakInterval', parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Daily Target (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="18"
                value={formData.dailyGoalHours}
                onChange={(e) => handleChange('dailyGoalHours', parseFloat(e.target.value) || 4)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section: Tab Switch & Pop-Up Notifications */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5" /> Pop-ups & Tab Switch Alerts
            </label>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-medium text-slate-200">
                  Tab-Switch Desktop Pop-up
                </div>
                <div className="text-[11px] text-slate-400">
                  Notify you to stay focused when switching to other tabs or applications
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyOnTabSwitch}
                onChange={(e) => {
                  handleChange('notifyOnTabSwitch', e.target.checked);
                  if (e.target.checked) requestNotificationPermission();
                }}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/10 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-medium text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  Auto-Launch Floating Mini Window (PiP)
                </div>
                <div className="text-[11px] text-slate-400">
                  Automatically pop up always-on-top mini window when leaving the tab
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoPipOnTabSwitch}
                onChange={(e) => handleChange('autoPipOnTabSwitch', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/10 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-medium text-slate-200">Auto-start Breaks</div>
                <div className="text-[11px] text-slate-400">Start countdown when Pomodoro completes</div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoStartBreaks}
                onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/10 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-medium text-slate-200">Auto-start Pomodoros</div>
                <div className="text-[11px] text-slate-400">Start focus timer when breaks end</div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoStartPomodoros}
                onChange={(e) => handleChange('autoStartPomodoros', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/10 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Sound Controls */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Audio Chimes
              </span>
              <button
                type="button"
                onClick={testChime}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test Sound
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.soundVolume}
                onChange={(e) => handleChange('soundVolume', parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs font-mono text-slate-300 w-8 text-right">
                {Math.round(formData.soundVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Section: Live Wallpaper */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Calm Live Wallpaper
              </span>
              <span className="text-[11px] text-slate-400">Background ambiance</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WALLPAPER_PRESETS.map((wp) => {
                const isSelected = formData.wallpaper === wp.id;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => handleChange('wallpaper', wp.id)}
                    className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{wp.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{wp.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setShowClearConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset History
              </button>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
