import React, { useState, useEffect } from 'react';
import { store, Task } from '../lib/storage';
import { addTask, addTasks, toggleTask, deleteTask, pruneTasksAndSave } from '../lib/tasks';
import { hasSplitTrigger, splitTasksSimple } from '../lib/tasks-pure';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';

export function TaskPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    store.tasks.getValue().then(setTasks);
    const unwatch = store.tasks.watch((newTasks) => {
      if (newTasks) setTasks(newTasks);
    });
    // Prune on load
    pruneTasksAndSave();
    return () => { unwatch(); };
  }, []);

  if (tasks.length === 0) return null;

  const doneCount = tasks.filter(t => t.done).length;
  const progress = Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="fixed top-2 right-[148px] w-[220px] p-3 rounded-xl text-[var(--fg)] shadow-lg animate-[sk-panel-in_0.3s_ease-out_forwards] border border-[var(--border)]"
         style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))', WebkitBackdropFilter: 'blur(var(--glass-blur))' }}>
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Tasks</span>
        <span className="text-[10px] font-medium opacity-60">{doneCount}/{tasks.length}</span>
      </div>
      <div className="w-full h-[3px] bg-black/20 rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto pr-1">
        {tasks.map(task => (
          <div key={task.id} className="flex items-start gap-2 group p-1.5 hover:bg-black/10 rounded-lg transition-colors">
            <button onClick={() => toggleTask(task.id, !task.done)} className="mt-0.5 shrink-0 opacity-60 hover:opacity-100 transition-opacity text-[var(--accent)]">
              {task.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            </button>
            <span className={`text-[13px] leading-snug flex-1 break-words transition-all ${task.done ? 'line-through opacity-40' : 'opacity-90'}`}>
              {task.text}
            </span>
            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-0.5">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskInput() {
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const parsed = hasSplitTrigger(input) ? splitTasksSimple(input) : [input.trim()].filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (parsed.length > 1) {
      await addTasks(parsed);
    } else {
      await addTask(parsed[0]);
    }
    setInput('');
    setShowPreview(false);
  }

  return (
    <div className="w-full max-w-lg mt-4 relative">
      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text"
          className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--fg)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors shadow-inner text-sm"
          placeholder="Add a task... (use commas to add multiple)"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowPreview(hasSplitTrigger(e.target.value));
          }}
        />
      </form>
      {showPreview && parsed.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--border)] backdrop-blur-md shadow-xl z-20 animate-[sk-panel-in_0.2s_ease-out_forwards]">
          <p className="text-[10px] font-bold opacity-70 mb-2 uppercase tracking-wider">Will add {parsed.length} tasks:</p>
          <ul className="flex flex-col gap-1 text-[13px] opacity-90 pl-1">
            {parsed.slice(0, 5).map((t, i) => (
              <li key={i} className="truncate">• {t}</li>
            ))}
            {parsed.length > 5 && <li className="text-[11px] opacity-60 italic mt-1">+ {parsed.length - 5} more</li>}
          </ul>
          <div className="text-[10px] opacity-50 mt-2 text-right uppercase tracking-wide">Press Enter to confirm</div>
        </div>
      )}
    </div>
  );
}
