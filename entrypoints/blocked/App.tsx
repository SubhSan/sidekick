import React, { useEffect, useState } from 'react';
import { store, Task } from '../../lib/storage';
import { sendMsg } from '../../lib/messages';
import { DailyFocus } from '../../components/DailyFocus';
import { Clock } from 'lucide-react';

export default function App() {
  const [domain, setDomain] = useState('');
  const [returnUrl, setReturnUrl] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [passActive, setPassActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDomain(params.get('domain') || 'this site');

    sendMsg<string>({ type: 'GET_LAST_URL' }).then(res => {
      if (res.ok && res.data) {
        setReturnUrl(res.data);
      } else {
        setReturnUrl(chrome.runtime.getURL('newtab.html'));
      }
    });

    store.tasks.getValue().then(setTasks);
    const unwatch = store.tasks.watch(val => {
      if (val) setTasks(val);
    });
    return () => { unwatch(); };
  }, []);

  async function handlePass() {
    setPassActive(true);
    await sendMsg({ type: 'FOCUS_PASS', payload: { domain, returnUrl } });
    window.location.href = returnUrl;
  }

  async function handleTurnOff() {
    await store.focusModeOn.setValue(false);
    await sendMsg({ type: 'FOCUS_APPLY' });
    window.location.href = returnUrl;
  }

  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="min-h-screen w-full bg-[#0a0c16] text-[var(--fg)] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* Background flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full p-8 rounded-3xl z-10 flex flex-col items-center text-center gap-6"
           style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))', WebkitBackdropFilter: 'blur(var(--glass-blur))', border: '1px solid var(--border)' }}>
        
        <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(248,113,113,0.3)]">
          <Clock size={28} />
        </div>

        <h1 className="text-2xl font-medium leading-tight opacity-90">
          <span className="text-red-400 font-bold">{domain}</span> is blocked
        </h1>

        <div className="w-full h-[1px] bg-[var(--border)] my-1" />

        <div className="w-full transform scale-110 my-2">
          <DailyFocus />
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold opacity-60">
          Tasks completed: {doneCount} / {tasks.length}
        </div>

        <div className="w-full h-[1px] bg-[var(--border)] my-1" />

        <div className="flex flex-col gap-3 w-full mt-2">
          {passActive ? (
            <div className="w-full py-3 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-medium border border-indigo-500/30">
              Pass active... Redirecting...
            </div>
          ) : (
            <button 
              onClick={handlePass}
              className="w-full py-3 rounded-xl bg-black/20 hover:bg-black/30 transition-colors text-sm font-medium border border-[var(--border)] opacity-80 hover:opacity-100"
            >
              Take a 5-min pass
            </button>
          )}

          <button 
            onClick={handleTurnOff}
            className="w-full py-3 rounded-xl bg-red-500/80 hover:bg-red-500 transition-colors text-sm font-medium text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            Turn off Focus Mode
          </button>
        </div>

      </div>
    </div>
  );
}
