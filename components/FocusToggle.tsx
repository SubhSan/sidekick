import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { store } from '../lib/storage';
import { sendMsg } from '../lib/messages';

export function FocusToggle() {
  const [focusMode, setFocusMode] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    store.focusModeOn.getValue().then(setFocusMode);
    const unwatch = store.focusModeOn.watch(val => {
      if (val !== undefined) setFocusMode(val);
    });
    return () => { unwatch(); };
  }, []);

  async function handleToggle() {
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    const next = !focusMode;
    setFocusMode(next);
    await store.focusModeOn.setValue(next);
    sendMsg({ type: 'FOCUS_APPLY' });
  }

  return (
    <>
      {flash && <div className="fixed inset-0 bg-white z-[9999] animate-[sk-focus-flash_0.35s_forwards] pointer-events-none" />}
      <button
        onClick={handleToggle}
        className="fixed top-[12px] z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-white transition-all hover:scale-105 active:scale-95"
        style={{
          right: focusMode ? '20px' : '56px',
          background: focusMode ? 'rgba(99,102,241,0.5)' : 'rgba(10,12,22,0.52)',
          border: focusMode ? '1px solid rgba(99,102,241,0.7)' : '1px solid rgba(255,255,255,0.09)',
          boxShadow: focusMode ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <Target size={14} />
        {focusMode ? "Exit Focus" : "Focus"}
      </button>
    </>
  );
}
