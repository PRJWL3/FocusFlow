import React from 'react';
import { History, Trash2, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { formatDuration } from '../utils/storage';

export const SessionHistory = ({ sessions, onDeleteSession, subjects }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSubjectColor = (subjectName) => {
    const sub = subjects.find(s => s.name === subjectName);
    return sub ? sub.color : '#6366f1';
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card p-6 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm sm:text-base font-semibold text-white">Today's Session Log</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} recorded
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-10 text-slate-500 flex flex-col items-center">
          <Clock className="w-8 h-8 mb-2 stroke-1" />
          <p className="text-sm">No study sessions recorded yet today.</p>
          <p className="text-xs text-slate-600 mt-1">
            Complete a Pomodoro interval above to log your focus time!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto pr-1">
          {sessions.map((sess) => {
            const color = getSubjectColor(sess.subject);
            return (
              <div
                key={sess.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {sess.subject || 'General Study'}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                        {sess.mode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatTime(sess.timestamp)}</span>
                      <span>•</span>
                      <span>Duration: {formatDuration(sess.durationMinutes)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteSession(sess.id)}
                  title="Remove session entry"
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
