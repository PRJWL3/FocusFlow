// LocalStorage keys
const STORAGE_KEYS = {
  SETTINGS: 'focusflow_settings_v1',
  SESSIONS: 'focusflow_sessions_v1',
  TASKS: 'focusflow_tasks_v1',
  SUBJECTS: 'focusflow_subjects_v1',
};

export const DEFAULT_SUBJECTS = [
  { id: 'cs', name: 'Computer Science', color: '#06b6d4' }, // Cyan
  { id: 'math', name: 'Mathematics', color: '#6366f1' },    // Indigo
  { id: 'deepwork', name: 'Deep Work', color: '#f59e0b' },   // Amber
  { id: 'reading', name: 'Reading & Notes', color: '#ec4899' }, // Pink
  { id: 'general', name: 'General Study', color: '#10b981' }, // Emerald
];

export const TIMER_PRESETS = [
  { id: '25/5', name: '25 / 5', work: 25, break: 5, label: 'Classic' },
  { id: '50/10', name: '50 / 10', work: 50, break: 10, label: 'Deep Focus' },
  { id: '60/10', name: '60 / 10', work: 60, break: 10, label: '1-Hour' },
  { id: '90/20', name: '90 / 20', work: 90, break: 20, label: 'Ultradian' },
];

export const WALLPAPER_PRESETS = [
  { id: 'rain', name: 'Rainy Mountain Road', desc: 'Live video scene from stream', icon: 'CloudRain' },
  { id: 'nature', name: 'Lush Forest', desc: 'Sunlit canopy & drifting leaves', icon: 'Trees' },
  { id: 'stream', name: 'Forest Stream', desc: 'Serene flowing water & ripple reflections', icon: 'Droplets' },
  { id: 'mountain', name: 'Mountain Mist', desc: 'Peaceful ridges & drifting clouds', icon: 'Mountain' },
  { id: 'fireflies', name: 'Twilight Woods', desc: 'Warm fireflies in evening trees', icon: 'Flame' },
  { id: 'off', name: 'Solid Minimal', desc: 'Clean static dark background', icon: 'EyeOff' },
];

export const DEFAULT_SETTINGS = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  dailyGoalHours: 4,
  soundEnabled: true,
  soundVolume: 0.7,
  theme: 'dark', // 'dark', 'lofi', 'forest'
  activePreset: '25/5',
  notifyOnTabSwitch: true,
  autoPipOnTabSwitch: true,
  wallpaper: 'rain', // 'rain', 'nature', 'stream', 'mountain', 'fireflies', 'off'
};

export const getTodayDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

// --- Storage API ---

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
};

export const getSubjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return raw ? JSON.parse(raw) : DEFAULT_SUBJECTS;
  } catch (e) {
    return DEFAULT_SUBJECTS;
  }
};

export const saveSubjects = (subjects) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Error saving subjects', e);
  }
};

export const getSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving sessions', e);
  }
};

export const addSession = (session) => {
  const current = getSessions();
  const newSession = {
    id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: getTodayDateString(),
    timestamp: Date.now(),
    ...session,
  };
  const updated = [newSession, ...current];
  saveSessions(updated);
  return updated;
};

export const deleteSession = (id) => {
  const current = getSessions();
  const updated = current.filter(s => s.id !== id);
  saveSessions(updated);
  return updated;
};

export const getTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks', e);
  }
};

// --- Analytics Calculations ---

export const getTodayAnalytics = (sessions = getSessions(), dailyGoalHours = 4) => {
  const today = getTodayDateString();
  const todaySessions = sessions.filter(s => s.date === today && s.mode === 'pomodoro');
  
  const totalMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = totalMinutes / 60;
  const goalMinutes = dailyGoalHours * 60;
  const goalProgress = goalMinutes > 0 ? Math.min(100, Math.round((totalMinutes / goalMinutes) * 100)) : 0;
  const completedPomodoros = todaySessions.length;

  return {
    today,
    totalMinutes,
    totalHours,
    goalMinutes,
    goalProgress,
    completedPomodoros,
    sessionsCount: todaySessions.length,
    todaySessions,
  };
};

export const getWeeklyHistory = (sessions = getSessions()) => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);
    const dayName = dayNames[d.getDay()];
    
    const daySessions = sessions.filter(s => s.date === dateStr && s.mode === 'pomodoro');
    const minutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    
    days.push({
      date: dateStr,
      dayName: i === 0 ? 'Today' : dayName,
      minutes,
      hours: +(minutes / 60).toFixed(1),
      count: daySessions.length,
    });
  }
  
  return days;
};

export const getSubjectBreakdown = (sessions = getSessions(), subjects = getSubjects()) => {
  const today = getTodayDateString();
  const todaySessions = sessions.filter(s => s.date === today && s.mode === 'pomodoro');
  
  const map = {};
  subjects.forEach(sub => {
    map[sub.name] = { ...sub, minutes: 0 };
  });

  todaySessions.forEach(sess => {
    const name = sess.subject || 'General Study';
    if (!map[name]) {
      map[name] = { id: name, name, color: '#94a3b8', minutes: 0 };
    }
    map[name].minutes += (sess.durationMinutes || 0);
  });

  return Object.values(map).filter(s => s.minutes > 0).sort((a, b) => b.minutes - a.minutes);
};
