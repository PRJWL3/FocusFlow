import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  BookOpen, 
  Coffee, 
  Sun, 
  CheckCircle2, 
  Plus, 
  Tag,
  Volume2,
  VolumeX,
  ExternalLink,
  BellRing,
  Sparkles,
  Layers,
  Clock,
  Activity,
  TimerReset,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playZenBell, playMarimbaChime, playClick } from '../utils/audio';
import { TIMER_PRESETS } from '../utils/storage';
import { 
  openFloatingTimerWindow, 
  updateFloatingWindow, 
  showDesktopNotification, 
  requestNotificationPermission, 
  hasNotificationPermission,
  isPipSupported,
  isPipActive
} from '../utils/notifications';

export const Timer = ({ 
  settings, 
  onSaveSettings,
  subjects, 
  onAddSubject, 
  selectedSubject, 
  setSelectedSubject,
  onSessionComplete 
}) => {
  // Modes: 'pomodoro' | 'shortBreak' | 'longBreak'
  const [mode, setMode] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoroMinutes * 60);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isMuted, setIsMuted] = useState(!settings.soundEnabled);
  const [hasNotifPermission, setHasNotifPermission] = useState(hasNotificationPermission());
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1');

  // Total Time Elapsed Stopwatch state (persisted in localStorage)
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem('focusflow_elapsed_v1');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  });

  const timerRef = useRef(null);
  const initialSecondsRef = useRef(settings.pomodoroMinutes * 60);
  const lastTickRef = useRef(Date.now());

  // Determine total seconds based on mode
  const getTotalSeconds = (targetMode = mode) => {
    switch (targetMode) {
      case 'pomodoro':
        return settings.pomodoroMinutes * 60;
      case 'shortBreak':
        return settings.shortBreakMinutes * 60;
      case 'longBreak':
        return settings.longBreakMinutes * 60;
      default:
        return 25 * 60;
    }
  };

  // Sync timer when settings change and timer is not currently running
  useEffect(() => {
    if (!isRunning) {
      const total = getTotalSeconds(mode);
      setSecondsLeft(total);
      initialSecondsRef.current = total;
    }
  }, [settings.pomodoroMinutes, settings.shortBreakMinutes, settings.longBreakMinutes, mode]);

  // Switch timer preset (e.g., 25/5, 50/10, 60/10, 90/20)
  const handleSelectPreset = (preset) => {
    playClick(0.2);
    setIsRunning(false);
    const updated = {
      ...settings,
      pomodoroMinutes: preset.work,
      shortBreakMinutes: preset.break,
      activePreset: preset.id
    };
    onSaveSettings(updated);

    const newSeconds = mode === 'pomodoro' 
      ? preset.work * 60 
      : mode === 'shortBreak' 
      ? preset.break * 60 
      : settings.longBreakMinutes * 60;
      
    setSecondsLeft(newSeconds);
    initialSecondsRef.current = newSeconds;
  };

  // Handle Mode Change
  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    const total = getTotalSeconds(newMode);
    setSecondsLeft(total);
    initialSecondsRef.current = total;
  };

  // Switch to next mode automatically or manually
  const handleNextMode = (wasCompleted = false) => {
    if (mode === 'pomodoro') {
      if (wasCompleted) {
        onSessionComplete({
          mode: 'pomodoro',
          durationMinutes: settings.pomodoroMinutes,
          subject: selectedSubject ? selectedSubject.name : 'General Study',
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981']
        });

        // Desktop alert if user was on another tab
        if (document.hidden) {
          showDesktopNotification(
            'Focus Session Completed! 🎉',
            `Well done! You completed ${settings.pomodoroMinutes}m of ${selectedSubject?.name || 'Study'}. Time for a break!`,
            'session-done'
          );
        }
      }

      if (currentCycle >= settings.longBreakInterval) {
        switchMode('longBreak');
        setCurrentCycle(1);
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        switchMode('shortBreak');
        setCurrentCycle((prev) => prev + 1);
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      switchMode('pomodoro');
      if (document.hidden && wasCompleted) {
        showDesktopNotification(
          'Break Finished! 🔔',
          'Ready to jump back into focus?',
          'break-done'
        );
      }
      if (settings.autoStartPomodoros) setIsRunning(true);
    }
  };

  // Format helper: seconds to HH:MM:SS
  const formatSecondsToHMS = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const elapsedFormatted = formatSecondsToHMS(totalElapsedSeconds);

  // Timer Tick Effect with timestamp accuracy (survives background tabs & throttling)
  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = Date.now();

      const processTick = () => {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);

        if (delta >= 1) {
          lastTickRef.current += delta * 1000;

          // Increment total elapsed time if in pomodoro study mode
          if (mode === 'pomodoro') {
            setTotalElapsedSeconds((prev) => {
              const next = prev + delta;
              try {
                localStorage.setItem('focusflow_elapsed_v1', next.toString());
              } catch (e) {}
              return next;
            });
          }

          setSecondsLeft((prev) => {
            const next = prev - delta;
            if (next <= 0) {
              clearInterval(timerRef.current);
              setIsRunning(false);

              if (!isMuted) {
                if (mode === 'pomodoro') {
                  playMarimbaChime(settings.soundVolume);
                } else {
                  playZenBell(settings.soundVolume);
                }
              }

              handleNextMode(true);
              return 0;
            }
            return next;
          });
        }
      };

      timerRef.current = setInterval(processTick, 500);

      // Immediately catch up when tab regains focus or visibility
      const handleTabFocus = () => {
        if (!document.hidden) {
          processTick();
        }
      };

      document.addEventListener('visibilitychange', handleTabFocus);
      window.addEventListener('focus', handleTabFocus);

      return () => {
        clearInterval(timerRef.current);
        document.removeEventListener('visibilitychange', handleTabFocus);
        window.removeEventListener('focus', handleTabFocus);
      };
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, currentCycle, settings, isMuted, selectedSubject]);

  // Format time MM:SS for countdown
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Sync document title with timer countdown & total elapsed
  useEffect(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeLabel = mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    
    document.title = `${formatted} (${elapsedFormatted}) - ${modeLabel} | FocusFlow`;

    return () => {
      document.title = 'FocusFlow | Study Pomodoro & Daily Tracking';
    };
  }, [secondsLeft, mode, elapsedFormatted]);

  // Keep floating PiP window updated with BOTH countdown and total elapsed timer
  useEffect(() => {
    if (isPipActive()) {
      updateFloatingWindow({
        timeFormatted,
        elapsedFormatted,
        mode,
        isRunning,
        subjectName: selectedSubject?.name,
        onToggleTimer: () => toggleTimer(),
        onSkip: () => handleNextMode(false)
      });
    }
  }, [timeFormatted, elapsedFormatted, mode, isRunning, selectedSubject]);

  // Handle switching to other tabs or applications
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        if (settings.notifyOnTabSwitch) {
          showDesktopNotification(
            'Study in Progress ⏳',
            `${timeFormatted} left (${elapsedFormatted} elapsed) on ${selectedSubject?.name || 'Session'}. Stay focused!`,
            'tab-switch-alert'
          );
        }

        if (settings.autoPipOnTabSwitch && isPipSupported() && !isPipActive()) {
          openFloatingTimerWindow({
            timeFormatted,
            elapsedFormatted,
            mode,
            isRunning,
            subjectName: selectedSubject?.name,
            onToggleTimer: () => toggleTimer(),
            onSkip: () => handleNextMode(false)
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, timeFormatted, elapsedFormatted, mode, selectedSubject, settings.notifyOnTabSwitch, settings.autoPipOnTabSwitch]);

  // SVG Progress calculation
  const totalSeconds = initialSecondsRef.current || getTotalSeconds(mode);
  const currentSessionElapsed = Math.max(0, totalSeconds - secondsLeft);
  const progressFraction = Math.max(0, Math.min(1, (totalSeconds - secondsLeft) / totalSeconds));
  const strokeRadius = 135;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - (circumference * progressFraction);

  const toggleTimer = () => {
    playClick(0.2);
    lastTickRef.current = Date.now();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playClick(0.2);
    setIsRunning(false);
    const total = getTotalSeconds(mode);
    setSecondsLeft(total);
  };

  const handleResetElapsed = () => {
    playClick(0.2);
    setTotalElapsedSeconds(0);
    try {
      localStorage.setItem('focusflow_elapsed_v1', '0');
    } catch (e) {}
  };

  const handleLaunchFloatingWindow = async () => {
    playClick(0.2);
    await openFloatingTimerWindow({
      timeFormatted,
      elapsedFormatted,
      mode,
      isRunning,
      subjectName: selectedSubject?.name,
      onToggleTimer: () => toggleTimer(),
      onSkip: () => handleNextMode(false)
    });
  };

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setHasNotifPermission(res === 'granted');
    if (res === 'granted') {
      showDesktopNotification('Notifications Enabled! 🎯', 'You will receive study popups when switching tabs.');
    }
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const newSub = onAddSubject({
      name: newSubjectName.trim(),
      color: newSubjectColor
    });
    setSelectedSubject(newSub);
    setNewSubjectName('');
    setShowSubjectModal(false);
  };

  // Color theme per mode
  const modeColors = {
    pomodoro: {
      accent: 'text-indigo-400',
      stroke: 'stroke-indigo-500',
      glow: 'shadow-indigo-500/20',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40',
      badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
    },
    shortBreak: {
      accent: 'text-emerald-400',
      stroke: 'stroke-emerald-500',
      glow: 'shadow-emerald-500/20',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    longBreak: {
      accent: 'text-sky-400',
      stroke: 'stroke-sky-500',
      glow: 'shadow-sky-500/20',
      buttonBg: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/40',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
    }
  };

  const activeColor = modeColors[mode];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* Timer Presets Bar (25/5, 50/10, 60/10, 90/20) */}
      <div className="w-full flex items-center justify-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Presets:
        </span>
        {TIMER_PRESETS.map((p) => {
          const isPresetActive = 
            settings.pomodoroMinutes === p.work && 
            settings.shortBreakMinutes === p.break;

          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isPresetActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25 scale-105'
                  : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-white/20'
              }`}
              title={`${p.label}: ${p.work}m study / ${p.break}m break`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="glass-card p-1.5 rounded-2xl flex items-center gap-1.5 mb-5 border border-white/10 shadow-lg">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            mode === 'pomodoro'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Pomodoro ({settings.pomodoroMinutes}m)</span>
        </button>

        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            mode === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Short Break ({settings.shortBreakMinutes}m)</span>
        </button>

        <button
          onClick={() => switchMode('longBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            mode === 'longBreak'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Long Break ({settings.longBreakMinutes}m)</span>
        </button>
      </div>

      {/* Notification Permission Pill */}
      {!hasNotifPermission && (
        <button
          onClick={handleEnableNotifications}
          className="mb-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/20 transition-all cursor-pointer"
          title="Click to allow desktop popup alerts when leaving this tab"
        >
          <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Enable Pop-ups on Tab Switch</span>
        </button>
      )}

      {/* Main Display Area: Main Circular Timer + Separate Elapsed Timer Beside It */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 my-1">
        
        {/* LEFT COLUMN: Main Circular Countdown Timer */}
        <div className="flex flex-col items-center">
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
            
            {/* Soft Background Radial Glow */}
            <div className={`absolute inset-4 rounded-full filter blur-3xl opacity-20 transition-colors duration-700 ${
              mode === 'pomodoro' ? 'bg-indigo-600' : mode === 'shortBreak' ? 'bg-emerald-600' : 'bg-sky-600'
            }`} />

            <svg className="w-full h-full -rotate-90 transform drop-shadow-2xl" viewBox="0 0 320 320">
              <circle
                cx="160"
                cy="160"
                r={strokeRadius}
                className="stroke-slate-800/80"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="160"
                cy="160"
                r={strokeRadius}
                className={`${activeColor.stroke} transition-[stroke-dashoffset] duration-700 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content Inside Ring */}
            <div className="absolute flex flex-col items-center justify-center text-center select-none">
              
              {/* Subject Badge */}
              {mode === 'pomodoro' && (
                <div className="mb-2">
                  <button
                    onClick={() => setShowSubjectModal(true)}
                    className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
                    title="Change active study subject"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: selectedSubject?.color || '#6366f1' }}
                    />
                    <span className="font-medium max-w-[130px] truncate">
                      {selectedSubject ? selectedSubject.name : 'Select Subject'}
                    </span>
                    <Tag className="w-3 h-3 text-slate-400 group-hover:text-white" />
                  </button>
                </div>
              )}

              {/* Large Time Display */}
              <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-white mb-2 drop-shadow-sm">
                {timeFormatted}
              </div>

              {/* Mode Subtitle / Status */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                {mode === 'pomodoro' ? (
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-indigo-400 animate-ping' : 'bg-indigo-400'}`} />
                    {isRunning ? 'Focus Active' : 'Ready to Focus'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Coffee className="w-3.5 h-3.5" />
                    {mode === 'shortBreak' ? 'Short Recharge' : 'Long Recharge'}
                  </span>
                )}
              </div>

              {/* Cycle dots indicator */}
              <div className="flex items-center gap-1.5 mt-2.5" title={`Cycle ${currentCycle} of ${settings.longBreakInterval}`}>
                {Array.from({ length: settings.longBreakInterval }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index < currentCycle - 1
                        ? 'bg-indigo-400 ring-2 ring-indigo-400/20'
                        : index === currentCycle - 1 && mode === 'pomodoro'
                        ? 'bg-indigo-500 scale-125 ring-2 ring-white/40'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Timer Action Controls */}
          <div className="flex items-center gap-3 mt-5 flex-wrap justify-center">
            
            {/* Reset Button */}
            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Start / Pause Main CTA */}
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold transition-all shadow-xl active:scale-95 ${activeColor.buttonBg}`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>{secondsLeft === totalSeconds ? 'Start Focus' : 'Resume'}</span>
                </>
              )}
            </button>

            {/* Skip / Next Mode Button */}
            <button
              onClick={() => handleNextMode(false)}
              title="Skip to next session"
              className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Pop-out Always-on-Top Floating Mini Window (Picture-in-Picture) */}
            <button
              onClick={handleLaunchFloatingWindow}
              title="Pop out Always-On-Top Mini Window (Floats over other apps!)"
              className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/50 text-indigo-300 hover:text-white transition-all shadow-md active:scale-95"
            >
              <ExternalLink className="w-5 h-5" />
            </button>

            {/* Audio Mute / Unmute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute Chimes' : 'Mute Chimes'}
              className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-slate-500" /> : <Volume2 className="w-5 h-5 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Separate Total Time Elapsed Timer Card */}
        <div className="w-full max-w-sm lg:w-80 glass-card p-6 rounded-3xl border border-white/15 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Total Time Elapsed</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Study Stopwatch</p>
                </div>
              </div>

              {/* Active Pulse Pill */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                isRunning && mode === 'pomodoro'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-white/5'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isRunning && mode === 'pomodoro' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`} />
                <span>{isRunning && mode === 'pomodoro' ? 'Tracking' : 'Paused'}</span>
              </div>
            </div>

            {/* Giant Elapsed Stopwatch Number */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 mb-4 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" /> Total Active Focus Time
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-sky-400 drop-shadow-md">
                {elapsedFormatted}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Accumulated across study sessions
              </p>
            </div>

            {/* Breakdown Sub-metrics */}
            <div className="space-y-2.5 mb-5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Current Block Elapsed
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {Math.floor(currentSessionElapsed / 60)}m {currentSessionElapsed % 60}s
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" /> Active Subject
                </span>
                <span className="font-semibold text-indigo-300 truncate max-w-[120px]">
                  {selectedSubject?.name || 'General Study'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row for Elapsed Timer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={handleResetElapsed}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10"
              title="Reset Total Elapsed Stopwatch to 00:00:00"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Elapsed</span>
            </button>

            <button
              onClick={handleLaunchFloatingWindow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 hover:text-white text-xs font-semibold transition-all border border-sky-500/40"
              title="Open dual-timer floating window that stays on top of all desktop apps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pop-Up Window</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating window tip */}
      <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5 text-center">
        <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Click the pop-out button <span className="font-semibold text-slate-300">↗</span> to see both the countdown and total elapsed timer in an always-on-top floating window!</span>
      </p>

      {/* Subject Picker Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                Select Focus Subject
              </h3>
              <button 
                onClick={() => setShowSubjectModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* List of existing subjects */}
            <div className="space-y-2 mb-5 max-h-56 overflow-y-auto pr-1">
              {subjects.map((sub) => {
                const isSelected = selectedSubject?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(sub);
                      setShowSubjectModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/60 text-white'
                        : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="font-medium">{sub.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            {/* Create New Subject Form */}
            <form onSubmit={handleCreateSubject} className="pt-3 border-t border-white/10">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Or create a new subject:
              </label>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry, Algorithms..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="color"
                  value={newSubjectColor}
                  onChange={(e) => setNewSubjectColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-white/10 cursor-pointer bg-transparent"
                  title="Choose tag color"
                />
              </div>
              <button
                type="submit"
                disabled={!newSubjectName.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Add & Select Subject
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
