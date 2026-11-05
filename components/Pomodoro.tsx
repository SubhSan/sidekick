import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2, Volume2, VolumeX, Moon, Sun, CloudRain, Coffee, Waves, Volume1 } from 'lucide-react';
import { store } from '../lib/storage';
import { sendMsg } from '../lib/messages';
import type { PomodoroState } from '../lib/storage';
import dayjs from 'dayjs';

type AmbientSoundType = 'none' | 'rain' | 'whitenoise' | 'cafe';

/**
 * Procedural ambient noise generators using Web Audio API (Rain, White Noise, Cafe)
 */
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentType: AmbientSoundType = 'none';

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: AmbientSoundType, volume = 0.25) {
    this.stop();
    if (type === 'none') return;
    this.initCtx();
    if (!this.ctx) return;

    this.currentType = type;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'whitenoise') {
      // Standard gentle white noise with soft low-pass filter
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
    } else if (type === 'rain') {
      // Pink / brown noise with bandpass modulation to simulate soothing rain patter
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      rainSource.connect(filter);
      filter.connect(this.gainNode);
      rainSource.start();
      this.noiseNode = rainSource;
    } else if (type === 'cafe') {
      // Warm brown noise with resonance simulation for cozy ambient cafe rumble
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      const cafeSource = this.ctx.createBufferSource();
      cafeSource.buffer = noiseBuffer;
      cafeSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      cafeSource.connect(filter);
      filter.connect(this.gainNode);
      cafeSource.start();
      this.noiseNode = cafeSource;
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch { /* ignore */ }
      this.noiseNode = null;
    }
    this.currentType = 'none';
  }
}

const ambientEngine = new AmbientSoundEngine();

/**
 * End-of-session Chime Sound
 */
function playEndChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const chords = [
      { freq: 523.25, time: 0.00, dur: 1.0 }, // C5
      { freq: 659.25, time: 0.18, dur: 1.2 }, // E5
      { freq: 783.99, time: 0.36, dur: 1.5 }, // G5
      { freq: 1046.5, time: 0.54, dur: 2.0 }, // C6
    ];

    chords.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.2, now + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (e) {
    console.error('Failed to play completion chime:', e);
  }
}

export function Pomodoro() {
  const [state, setState] = useState<PomodoroState | null>(null);
  const [displayTime, setDisplayTime] = useState<number>(25 * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.25);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [workInput, setWorkInput] = useState(25);
  const [breakInput, setBreakInput] = useState(5);
  const [longBreakInput, setLongBreakInput] = useState(15);

  const originalTitleRef = useRef<string>(document.title);
  const lastStatusRef = useRef<string>('idle');

  // Load initial state & storage listeners
  useEffect(() => {
    originalTitleRef.current = document.title || 'New Tab';

    store.pomodoro.getValue().then(s => {
      if (s) {
        setState(s);
        setWorkInput(Math.round(s.workDuration / 60));
        setBreakInput(Math.round(s.breakDuration / 60));
        setLongBreakInput(Math.round((s.longBreakDuration || 15 * 60) / 60));
        updateDisplayTime(s);
        lastStatusRef.current = s.status;
      }
    });

    const unwatch = store.pomodoro.watch(s => {
      if (s) {
        // Detect transition to completion
        if (lastStatusRef.current === 'running' && s.status === 'idle') {
          if (soundEnabled) playEndChime();
        }
        lastStatusRef.current = s.status;
        setState(s);
        updateDisplayTime(s);
      }
    });

    return () => {
      unwatch();
      document.title = originalTitleRef.current;
      ambientEngine.stop();
    };
  }, [soundEnabled]);

  // Real-time tick for display countdown
  useEffect(() => {
    if (state?.status === 'running' && state.endTime) {
      const interval = setInterval(() => {
        const left = Math.max(0, Math.floor((state.endTime! - Date.now()) / 1000));
        setDisplayTime(left);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [state]);

  // Dynamic Tab Title updater
  useEffect(() => {
    if (!state) return;
    const m = Math.floor(displayTime / 60).toString().padStart(2, '0');
    const s = (displayTime % 60).toString().padStart(2, '0');
    const modeLabel = state.mode === 'work' ? 'Focus' : (state.mode === 'longBreak' ? 'Long Break' : 'Break');

    if (state.status === 'running') {
      document.title = `(${m}:${s}) ${modeLabel} • Sidekick`;
    } else if (state.status === 'paused') {
      document.title = `[Paused ${m}:${s}] ${modeLabel} • Sidekick`;
    } else {
      document.title = 'Sidekick';
    }
  }, [displayTime, state?.status, state?.mode]);

  // Ambient sound play/pause trigger
  useEffect(() => {
    if (state?.status === 'running' && ambientSound !== 'none') {
      ambientEngine.play(ambientSound, ambientVolume);
    } else {
      ambientEngine.stop();
    }
  }, [state?.status, ambientSound, ambientVolume]);

  function updateDisplayTime(s: PomodoroState) {
    if (s.status === 'running' && s.endTime) {
      setDisplayTime(Math.max(0, Math.floor((s.endTime - Date.now()) / 1000)));
    } else if (s.timeLeft !== undefined) {
      setDisplayTime(s.timeLeft);
    } else {
      const duration = s.mode === 'work' 
        ? s.workDuration 
        : (s.mode === 'longBreak' ? (s.longBreakDuration || 15 * 60) : s.breakDuration);
      setDisplayTime(duration);
    }
  }

  if (!state) return null;

  const totalDuration = state.mode === 'work' 
    ? state.workDuration 
    : (state.mode === 'longBreak' ? (state.longBreakDuration || 15 * 60) : state.breakDuration);
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - displayTime) / totalDuration) * 100));

  const mins = Math.floor(displayTime / 60).toString().padStart(2, '0');
  const secs = (displayTime % 60).toString().padStart(2, '0');
  const isRunning = state.status === 'running';

  // SVG Circular Progress values (r=74, circumference=465)
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  async function handleToggleStart() {
    if (isRunning) {
      await sendMsg({ type: 'POMODORO_PAUSE' });
    } else {
      await sendMsg({ type: 'POMODORO_START' });
    }
  }

  async function handleReset() {
    await sendMsg({ type: 'POMODORO_STOP' });
  }

  async function handleSetMode(mode: 'work' | 'break' | 'longBreak') {
    await sendMsg({ type: 'POMODORO_SET_MODE', payload: { mode } });
  }

  async function handleSaveSettings() {
    await sendMsg({
      type: 'POMODORO_UPDATE_SETTINGS',
      payload: {
        workDuration: Math.max(1, workInput) * 60,
        breakDuration: Math.max(1, breakInput) * 60,
        longBreakDuration: Math.max(1, longBreakInput) * 60,
      }
    });
    setShowSettings(false);
  }

  // Accent & theme colors based on mode and dark theme toggle
  const modeTheme = state.mode === 'work'
    ? { text: 'text-indigo-400', border: 'border-indigo-500/40', fill: '#818cf8', ring: 'rgba(99,102,241,0.25)', bg: 'bg-indigo-500/20' }
    : state.mode === 'longBreak'
      ? { text: 'text-cyan-400', border: 'border-cyan-500/40', fill: '#22d3ee', ring: 'rgba(6,182,212,0.25)', bg: 'bg-cyan-500/20' }
      : { text: 'text-emerald-400', border: 'border-emerald-500/40', fill: '#34d399', ring: 'rgba(16,185,129,0.25)', bg: 'bg-emerald-500/20' };

  return (
    <div 
      className="w-full max-w-md mt-6 p-6 rounded-3xl flex flex-col items-center gap-5 transition-all duration-300 select-none"
      style={{
        backgroundColor: isDarkMode ? 'rgba(10, 12, 22, 0.45)' : 'rgba(255, 255, 255, 0.20)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: isRunning 
          ? `0 12px 40px rgba(0, 0, 0, 0.35), 0 0 30px ${modeTheme.ring}`
          : '0 8px 32px rgba(0, 0, 0, 0.25)',
        color: isDarkMode ? '#f1f5f9' : '#0f172a'
      }}
    >
      {/* Top Bar: Mode Switcher & Utility Actions */}
      <div className="w-full flex items-center justify-between gap-2">
        {/* Preset Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 border border-white/5">
          <button
            onClick={() => handleSetMode('work')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              state.mode === 'work' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Work (25m)
          </button>
          <button
            onClick={() => handleSetMode('break')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              state.mode === 'break' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Short (5m)
          </button>
          <button
            onClick={() => handleSetMode('longBreak')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              state.mode === 'longBreak' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Long (15m)
          </button>
        </div>

        {/* Action icons (Ambient sound, Dark mode, Chime, Settings) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAmbient(!showAmbient)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${ambientSound !== 'none' ? 'text-indigo-400 bg-indigo-500/20' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
            title="Ambient Sounds"
          >
            <Volume1 size={15} />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/5 transition-all cursor-pointer"
            title={isDarkMode ? 'Dark Theme (Active)' : 'Light Theme (Active)'}
          >
            {isDarkMode ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/5 transition-all cursor-pointer"
            title={soundEnabled ? 'Completion Chime: ON' : 'Completion Chime: Muted'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${showSettings ? 'text-indigo-400 bg-indigo-500/20' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
            title="Custom Timer Durations"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* Ambient Noise Selector Popover */}
      {showAmbient && (
        <div className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-semibold opacity-70">
            <span>Ambient Background Noise</span>
            <span>{ambientSound === 'none' ? 'Off' : `${Math.round(ambientVolume * 100)}%`}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'Off', icon: <VolumeX size={13} /> },
              { id: 'rain', label: 'Rain', icon: <CloudRain size={13} /> },
              { id: 'whitenoise', label: 'White', icon: <Waves size={13} /> },
              { id: 'cafe', label: 'Cafe', icon: <Coffee size={13} /> },
            ].map(snd => (
              <button
                key={snd.id}
                onClick={() => setAmbientSound(snd.id as AmbientSoundType)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  ambientSound === snd.id 
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' 
                    : 'bg-white/5 hover:bg-white/10 opacity-70'
                }`}
              >
                {snd.icon}
                <span>{snd.label}</span>
              </button>
            ))}
          </div>
          {ambientSound !== 'none' && (
            <input
              type="range" min="0.05" max="0.8" step="0.05"
              value={ambientVolume}
              onChange={e => {
                const vol = parseFloat(e.target.value);
                setAmbientVolume(vol);
                ambientEngine.setVolume(vol);
              }}
              className="w-full accent-indigo-400 h-1 rounded-lg bg-white/20 cursor-pointer mt-1"
            />
          )}
        </div>
      )}

      {/* Custom Duration Settings Panel */}
      {showSettings && (
        <div className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3 animate-fadeIn">
          <span className="text-xs uppercase tracking-wider font-bold opacity-60">Custom Durations (Minutes)</span>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold opacity-50">Work</label>
              <input
                type="number" min="1" max="120"
                value={workInput} onChange={e => setWorkInput(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs font-semibold text-center outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold opacity-50">Short Break</label>
              <input
                type="number" min="1" max="60"
                value={breakInput} onChange={e => setBreakInput(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs font-semibold text-center outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold opacity-50">Long Break</label>
              <input
                type="number" min="1" max="60"
                value={longBreakInput} onChange={e => setLongBreakInput(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs font-semibold text-center outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            className="w-full py-2 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-indigo-500/50 text-xs font-bold text-indigo-200 transition-colors cursor-pointer"
          >
            Apply Durations
          </button>
        </div>
      )}

      {/* Main Circular Countdown Display */}
      <div className="relative flex items-center justify-center my-1">
        <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active Animated Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={modeTheme.fill}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.35s ease' }}
          />
        </svg>

        {/* Center Clock & Mode Indicator */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-[11px] uppercase tracking-[0.25em] font-bold ${modeTheme.text}`}>
            {state.mode === 'work' ? 'FOCUS' : (state.mode === 'longBreak' ? 'LONG BREAK' : 'SHORT BREAK')}
          </span>
          <span 
            className="text-[44px] font-bold tracking-tight my-0.5 tabular-nums"
            style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
          >
            {mins}:{secs}
          </span>
          <span className="text-[10px] opacity-40 font-semibold tracking-wider uppercase">
            {isRunning ? 'RUNNING' : (state.status === 'paused' ? 'PAUSED' : 'READY')}
          </span>
        </div>
      </div>

      {/* Action Controls: Start / Pause & Reset */}
      <div className="flex items-center gap-4 mt-1">
        <button
          onClick={handleToggleStart}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 cursor-pointer ${
            isRunning 
              ? 'bg-amber-500/80 hover:bg-amber-500 shadow-amber-500/20' 
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30'
          }`}
        >
          {isRunning ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
          <span>{isRunning ? 'Pause' : (state.status === 'paused' ? 'Resume' : 'Start')}</span>
        </button>

        <button
          onClick={handleReset}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-90 border border-white/10 transition-all cursor-pointer opacity-80 hover:opacity-100"
          title="Reset Timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Session Streak Counter */}
      <div className="flex items-center gap-2 text-xs opacity-60 pt-1">
        <span>Today's Sessions:</span>
        <span className="font-bold text-indigo-400">{state.completedToday || 0}</span>
      </div>
    </div>
  );
}
