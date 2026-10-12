import React from 'react';
import { 
  Clock, 
  Flame, 
  Target, 
  Award, 
  Calendar, 
  PieChart, 
  TrendingUp,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { formatDuration, getWeeklyHistory, getSubjectBreakdown } from '../utils/storage';

export const StatsDashboard = ({ 
  sessions, 
  settings, 
  subjects, 
  todayAnalytics 
}) => {
  const weeklyData = getWeeklyHistory(sessions);
  const subjectBreakdown = getSubjectBreakdown(sessions, subjects);

  // Find max minutes in weekly data for relative chart scaling
  const maxWeeklyMinutes = Math.max(...weeklyData.map(d => d.minutes), 60); // minimum 60 min scale

  const remainingGoalMinutes = Math.max(0, todayAnalytics.goalMinutes - todayAnalytics.totalMinutes);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Time Studied Today */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Focus</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
            {formatDuration(todayAnalytics.totalMinutes)}
          </div>
          <p className="text-xs text-slate-400">
            {todayAnalytics.totalMinutes > 0 
              ? `${Math.round(todayAnalytics.goalProgress)}% of daily target reached`
              : 'Start a session to begin logging'
            }
          </p>
        </div>

        {/* Sessions Completed Today */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sessions Done</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
            {todayAnalytics.completedPomodoros}
          </div>
          <p className="text-xs text-slate-400">
            Completed Pomodoros today
          </p>
        </div>

        {/* Daily Target Progress */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Goal</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
            {settings.dailyGoalHours}h
          </div>
          <p className="text-xs text-slate-400">
            {remainingGoalMinutes > 0 
              ? `${formatDuration(remainingGoalMinutes)} remaining`
              : '🎉 Daily goal achieved!'}
          </p>
        </div>

        {/* Quality / Consistency Badge */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consistency</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
            {weeklyData.filter(d => d.minutes > 0).length} / 7
          </div>
          <p className="text-xs text-slate-400">
            Active days this week
          </p>
        </div>
      </div>

      {/* Daily Target Progress Bar */}
      <div className="glass-card p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Daily Goal Progress
          </span>
          <span className="text-indigo-400 font-mono font-medium">
            {Math.round(todayAnalytics.totalMinutes)} / {todayAnalytics.goalMinutes} mins ({todayAnalytics.goalProgress}%)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, todayAnalytics.goalProgress)}%` }}
          />
        </div>
      </div>

      {/* Grid: 7-Day Chart & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7-Day Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Last 7 Days Study Hours</h3>
            </div>
            <span className="text-xs text-slate-400">Hours / day</span>
          </div>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-between gap-3 h-44 pt-4 px-2">
            {weeklyData.map((day, idx) => {
              const heightPercent = Math.max(6, Math.round((day.minutes / maxWeeklyMinutes) * 100));
              const isToday = day.dayName === 'Today';

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on Hover */}
                  <div className="text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded-md border border-white/10 whitespace-nowrap">
                    {day.hours}h ({day.count} sess)
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-xl overflow-hidden flex items-end h-full">
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday 
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/25' 
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-[11px] font-medium ${isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Subject Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">Today</span>
          </div>

          {subjectBreakdown.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <BookOpen className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs">No study sessions logged yet today.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {subjectBreakdown.map((item) => {
                const percent = todayAnalytics.totalMinutes > 0 
                  ? Math.round((item.minutes / todayAnalytics.totalMinutes) * 100) 
                  : 0;

                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-200">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        {formatDuration(item.minutes)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${percent}%`, 
                          backgroundColor: item.color 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
