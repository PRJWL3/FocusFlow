import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Timer } from './components/Timer';
import { StatsDashboard } from './components/StatsDashboard';
import { TaskTracker } from './components/TaskTracker';
import { SessionHistory } from './components/SessionHistory';
import { SettingsModal } from './components/SettingsModal';
import { LiveWallpaper } from './components/LiveWallpaper';
import { 
  getSettings, 
  saveSettings, 
  getSubjects, 
  saveSubjects, 
  getSessions, 
  addSession, 
  deleteSession, 
  saveSessions,
  getTasks, 
  saveTasks, 
  getTodayAnalytics 
} from './utils/storage';
import { playAmbient, setAmbientVolume, stopAmbient } from './utils/ambientSynth';

export function App() {
  const [settings, setSettings] = useState(getSettings);
  const [subjects, setSubjects] = useState(getSubjects);
  const [sessions, setSessions] = useState(getSessions);
  const [tasks, setTasks] = useState(getTasks);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || null);

  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'analytics'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Ambient Sound State
  const [ambientSound, setAmbientSound] = useState('off');
  const [ambientVolumeVal, setAmbientVolumeVal] = useState(0.5);

  // Compute live today's analytics
  const todayAnalytics = getTodayAnalytics(sessions, settings.dailyGoalHours);

  // Apply theme background class to body / html wrapper
  const themeClasses = {
    dark: 'bg-slate-950 text-slate-100',
    lofi: 'bg-[#1a120c] text-[#fef3c7]',
    forest: 'bg-[#091711] text-[#ecfdf5]',
    cyberpunk: 'bg-[#150a21] text-[#fdf4ff]',
  };

  const currentThemeClass = themeClasses[settings.theme] || themeClasses.dark;

  // Sound-to-Nature-Wallpaper mapping: background adapts to selected ambient sound
  const SOUND_WALLPAPER_MAP = {
    rain: 'rain',         // Video scene from https://www.youtube.com/live/QiYEvhjLRWU
    stream: 'stream',     // Forest Stream with water ripples
    brown: 'mountain',    // Mountain Mist & twilight ridges
    white: 'nature',      // Lush Forest & sunbeams
    off: 'rain',          // Default video scene
  };

  // Handle ambient sound changes & sync background wallpaper
  const handleSelectAmbient = (soundId) => {
    setAmbientSound(soundId);
    playAmbient(soundId, ambientVolumeVal);

    // Automatically adapt the nature wallpaper according to the music selected
    const matchedWallpaper = SOUND_WALLPAPER_MAP[soundId] || 'nature';
    const updated = { ...settings, wallpaper: matchedWallpaper };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleChangeAmbientVolume = (vol) => {
    setAmbientVolumeVal(vol);
    setAmbientVolume(vol);
  };

  // Clean up ambient sound on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  // Handlers for subject, sessions, settings
  const handleAddSubject = (newSubject) => {
    const created = {
      id: 'sub_' + Date.now(),
      name: newSubject.name,
      color: newSubject.color,
    };
    const updated = [...subjects, created];
    setSubjects(updated);
    saveSubjects(updated);
    return created;
  };

  const handleSessionComplete = (sessionData) => {
    const updated = addSession(sessionData);
    setSessions(updated);
  };

  const handleDeleteSession = (sessionId) => {
    const updated = deleteSession(sessionId);
    setSessions(updated);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClearAllData = () => {
    setSessions([]);
    saveSessions([]);
    setTasks([]);
    saveTasks([]);
  };

  const handleChangeTheme = (themeId) => {
    const updated = { ...settings, theme: themeId };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleChangeWallpaper = (wallpaperId) => {
    const updated = { ...settings, wallpaper: wallpaperId };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 relative ${currentThemeClass}`}>
      {/* Calm Animated Live Wallpaper */}
      <LiveWallpaper type={settings.wallpaper || 'rain'} />

      {/* Top Navigation */}
      <Navbar
        todayMinutes={todayAnalytics.totalMinutes}
        completedCount={todayAnalytics.completedPomodoros}
        onOpenSettings={() => setIsSettingsOpen(true)}
        ambientSound={ambientSound}
        onSelectAmbient={handleSelectAmbient}
        ambientVolume={ambientVolumeVal}
        onChangeAmbientVolume={handleChangeAmbientVolume}
        theme={settings.theme}
        onChangeTheme={handleChangeTheme}
        wallpaper={settings.wallpaper || 'rain'}
        onChangeWallpaper={handleChangeWallpaper}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 sm:py-10 flex flex-col relative z-10">
        {/* Timer View - always mounted so timer never resets or pauses */}
        <div className={`flex flex-col items-center gap-8 w-full ${activeTab === 'timer' ? '' : 'hidden'}`}>
          {/* Circular Timer & Controls */}
          <Timer
            settings={settings}
            onSaveSettings={handleSaveSettings}
            subjects={subjects}
            onAddSubject={handleAddSubject}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            onSessionComplete={handleSessionComplete}
          />

          {/* Session Focus Tasks Tracker */}
          <div className="w-full flex justify-center">
            <TaskTracker
              tasks={tasks}
              onSaveTasks={(newTasks) => {
                setTasks(newTasks);
                saveTasks(newTasks);
              }}
              selectedSubject={selectedSubject}
            />
          </div>
        </div>

        {/* Analytics View - preserved without unmounting */}
        <div className={`space-y-8 w-full ${activeTab === 'analytics' ? '' : 'hidden'}`}>
          {/* Detailed Analytics Dashboard */}
          <StatsDashboard
            sessions={sessions}
            settings={settings}
            subjects={subjects}
            todayAnalytics={todayAnalytics}
          />

          {/* Chronological Session History */}
          <SessionHistory
            sessions={todayAnalytics.todaySessions}
            onDeleteSession={handleDeleteSession}
            subjects={subjects}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-4 text-center text-xs text-slate-500 relative z-10">
        <p>FocusFlow • Master your study sessions with Pomodoro & intentional focus.</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}

export default App;
