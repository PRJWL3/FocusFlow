import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle, ListTodo } from 'lucide-react';

export const TaskTracker = ({ tasks, onSaveTasks, selectedSubject }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: 'task_' + Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      subject: selectedSubject ? selectedSubject.name : 'General',
      createdAt: Date.now()
    };

    onSaveTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (taskId) => {
    const updated = tasks.map((t) => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onSaveTasks(updated);
  };

  const deleteTask = (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    onSaveTasks(updated);
  };

  const clearCompleted = () => {
    const updated = tasks.filter((t) => !t.completed);
    onSaveTasks(updated);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="w-full max-w-xl mx-auto glass-card p-5 rounded-2xl border border-white/10 mt-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Study Tasks & Goals</h3>
        </div>
        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear completed ({completedCount})
          </button>
        )}
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAddTask} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder={selectedSubject ? `Add task for ${selectedSubject.name}...` : 'What are you focusing on today?'}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Task List */}
      {tasks.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">
          No tasks added yet. Add a focus goal to stay productive!
        </p>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                task.completed
                  ? 'bg-slate-900/30 border-transparent opacity-60'
                  : 'bg-slate-800/40 border-white/5 hover:border-white/10'
              }`}
            >
              <div 
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => toggleTask(task.id)}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={`text-xs sm:text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                  {task.title}
                </span>
                {task.subject && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 shrink-0 hidden sm:inline-block">
                    {task.subject}
                  </span>
                )}
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors ml-2"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
