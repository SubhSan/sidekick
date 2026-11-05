import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import dayjs from 'dayjs';
import {
  Layers, Bookmark, Sparkles, Target, Settings,
  Search, X, Trash2, Plus, ExternalLink, Copy, CheckCircle2,
  Globe, RotateCcw
} from 'lucide-react';
import { store, SavedSession } from '../../lib/storage';
import { sendMsg } from '../../lib/messages';
import { findDuplicateTabs, defaultSessionName, deleteSession, restoreSession } from '../../lib/tabs';
import { searchBookmarks } from '../../lib/bookmarks';
import { saveCustomWallpaper, validateWallpaperFile } from '../../lib/wallpaper';
import { WALLPAPER_PRESETS } from '../../components/Wallpaper';

type Tab = 'tabs' | 'bookmarks' | 'ask' | 'focus' | 'settings';

/* ─── Toast helper ──────────────────────────────────── */
function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  function toast(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(null), 3000);
  }
  return { msg, toast };
}

/* ─── Tabs Page ─────────────────────────────────────── */
function TabsPage({ toast }: { toast: (m: string) => void }) {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [query, setQuery] = useState('');
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [dupes, setDupes] = useState<Array<{ url: string; closeIds: number[] }> | null>(null);
  const [sessionName, setSessionName] = useState(defaultSessionName());

  useEffect(() => {
    chrome.tabs.query({}, setTabs);
    store.sessionsSaved.getValue().then(setSessions);
    const unwatch = store.sessionsSaved.watch(val => { if (val) setSessions(val); });
    return () => { unwatch(); };
  }, []);

  const fuse = new Fuse(tabs, { keys: [{ name: 'title', weight: 0.7 }, { name: 'url', weight: 0.3 }], threshold: 0.4 });
  const filtered = query ? fuse.search(query).map(r => r.item) : tabs;

  async function handleGroupTabs() {
    const res = await sendMsg({ type: 'TABS_GROUP' });
    toast(res.ok ? 'Tabs grouped!' : 'Failed to group tabs');
  }

  async function handleFindDupes() {
    const found = await findDuplicateTabs();
    if (found.length === 0) toast('No duplicates found');
    else setDupes(found);
  }

  async function handleCloseDupes() {
    if (!dupes) return;
    const closeIds = dupes.flatMap(d => d.closeIds);
    const res = await sendMsg({ type: 'TABS_DEDUPE' });
    toast(res.ok ? `Closed ${closeIds.length} duplicate tabs` : 'Failed');
    setDupes(null);
    chrome.tabs.query({}, setTabs);
  }

  async function handleSaveSession() {
    await sendMsg({ type: 'SESSION_SAVE', payload: { name: sessionName } });
    toast(`Session "${sessionName}" saved!`);
    setSessionName(defaultSessionName());
  }

  async function handleDeleteSession(id: string) {
    await deleteSession(id);
  }

  async function handleRestoreSession(id: string) {
    await sendMsg({ type: 'SESSION_RESTORE', payload: { id } });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
        <input
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm outline-none focus:border-indigo-500/50 placeholder-white/30"
          placeholder="Search tabs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Tab count */}
      <div className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">{tabs.length} open tabs</div>

      {/* Tab list */}
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {filtered.slice(0, 20).map(tab => (
          <button
            key={tab.id}
            onClick={() => chrome.tabs.update(tab.id!, { active: true })}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-left group transition-colors"
          >
            <img src={tab.favIconUrl || `https://www.google.com/s2/favicons?sz=14&domain=${new URL(tab.url || 'https://example.com').hostname}`} width={14} height={14} className="shrink-0" alt="" onError={ev => { (ev.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-[12px] truncate flex-1 opacity-80 group-hover:opacity-100">{tab.title}</span>
            <ExternalLink size={11} className="opacity-0 group-hover:opacity-40 shrink-0" />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleGroupTabs} className="flex-1 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-[11px] font-semibold transition-colors">Group Tabs</button>
        <button onClick={handleFindDupes} className="flex-1 py-1.5 rounded-lg bg-black/20 hover:bg-white/5 border border-white/10 text-[11px] font-semibold transition-colors">Close Dupes</button>
      </div>

      {/* Dupe modal */}
      {dupes && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-red-400">Found {dupes.length} duplicate group{dupes.length !== 1 ? 's' : ''}:</p>
          <div className="max-h-24 overflow-y-auto flex flex-col gap-0.5">
            {dupes.map((d, i) => <p key={i} className="text-[11px] opacity-70 truncate">{d.url}</p>)}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCloseDupes} className="flex-1 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-[11px] font-semibold text-white transition-colors">Confirm Close</button>
            <button onClick={() => setDupes(null)} className="px-3 py-1.5 rounded-lg bg-black/20 hover:bg-white/5 text-[11px] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Save session */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 text-[11px] outline-none focus:border-indigo-500/50"
          value={sessionName}
          onChange={e => setSessionName(e.target.value)}
        />
        <button onClick={handleSaveSession} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-[11px] font-semibold transition-colors">Save</button>
      </div>

      {/* Saved sessions */}
      {sessions.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Saved Sessions</p>
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group">
              <span className="text-[12px] truncate flex-1 opacity-80">{s.name}</span>
              <span className="text-[10px] opacity-40 shrink-0">{s.tabs.length} tabs</span>
              <button onClick={() => handleRestoreSession(s.id)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"><RotateCcw size={12} /></button>
              <button onClick={() => handleDeleteSession(s.id)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-400 transition-opacity"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Bookmarks Page ────────────────────────────────── */
function BookmarksPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    searchBookmarks('').then(r => setResults(r.slice(0, 20)));
  }, []);

  useEffect(() => {
    searchBookmarks(query).then(r => setResults(r.slice(0, 20)));
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
        <input
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm outline-none focus:border-indigo-500/50 placeholder-white/30"
          placeholder="Search bookmarks..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {results.map((bm: any) => (
          <a
            key={bm.id}
            href={bm.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-colors"
          >
            <img src={`https://www.google.com/s2/favicons?sz=14&domain_url=${encodeURIComponent(bm.url)}`} width={14} height={14} className="shrink-0" alt="" onError={ev => { (ev.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-[12px] opacity-80 group-hover:opacity-100 truncate flex-1">{bm.title}</span>
          </a>
        ))}
        {results.length === 0 && query && <p className="text-[12px] opacity-40 text-center py-4">No results found</p>}
      </div>
    </div>
  );
}

/* ─── Ask Page ──────────────────────────────────────── */
function AskPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <Sparkles size={32} className="text-indigo-400 opacity-80" />
      <p className="text-sm font-semibold opacity-80">Ask Across Tabs</p>
      <p className="text-[12px] opacity-50 max-w-[240px] leading-relaxed">Enable AI Mode in Settings and add your Groq API key to use this feature.</p>
    </div>
  );
}

/* ─── Focus Page ────────────────────────────────────── */
const BLOCKLIST_SUGGESTIONS = ['twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'reddit.com', 'youtube.com', 'tiktok.com'];
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/;

function FocusPage({ toast }: { toast: (m: string) => void }) {
  const [focusOn, setFocusOn] = useState(false);
  const [blocklist, setBlocklist] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    store.focusModeOn.getValue().then(setFocusOn);
    store.blocklist.getValue().then(setBlocklist);
  }, []);

  function sanitizeDomain(raw: string): string {
    return raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }

  async function addDomain() {
    const domain = sanitizeDomain(input);
    if (!DOMAIN_RE.test(domain)) { setError("Enter a valid domain like 'reddit.com'"); return; }
    if (blocklist.includes(domain)) { setError('Already in list'); return; }
    setError('');
    const newList = [...blocklist, domain];
    setBlocklist(newList);
    setInput('');
    await store.blocklist.setValue(newList);
    if (focusOn) sendMsg({ type: 'FOCUS_APPLY' });
  }

  async function removeDomain(domain: string) {
    const newList = blocklist.filter(d => d !== domain);
    setBlocklist(newList);
    await store.blocklist.setValue(newList);
    if (focusOn) sendMsg({ type: 'FOCUS_APPLY' });
  }

  async function toggleFocus() {
    const next = !focusOn;
    setFocusOn(next);
    await store.focusModeOn.setValue(next);
    sendMsg({ type: 'FOCUS_APPLY' });
    toast(next ? 'Focus Mode enabled' : 'Focus Mode disabled');
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={toggleFocus}
        className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
        style={{ background: focusOn ? '#dc2626' : 'rgba(99,102,241,0.7)' }}
      >
        {focusOn ? '⏹ Exit Focus Mode' : '▶ Start Focus Mode'}
      </button>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-[12px] outline-none focus:border-indigo-500/50 placeholder-white/30"
          placeholder="e.g. reddit.com"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && addDomain()}
        />
        <button onClick={addDomain} className="px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors">
          <Plus size={14} />
        </button>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5">
        {BLOCKLIST_SUGGESTIONS.filter(s => !blocklist.includes(s)).slice(0, 5).map(s => (
          <button key={s} onClick={() => { setInput(s); setError(''); }} className="text-[11px] px-2 py-0.5 rounded-full bg-black/20 border border-white/10 hover:border-indigo-500/40 transition-colors opacity-70 hover:opacity-100">
            {s}
          </button>
        ))}
      </div>

      {/* Blocklist */}
      {blocklist.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Blocked Sites ({blocklist.length})</p>
          {blocklist.map(d => (
            <div key={d} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/10 hover:bg-black/20 group">
              <Globe size={12} className="opacity-40 shrink-0" />
              <span className="text-[12px] flex-1 opacity-80">{d}</span>
              <button onClick={() => removeDomain(d)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-400 transition-opacity"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Settings Page ─────────────────────────────────── */
function SettingsPage({ toast }: { toast: (m: string) => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [groqKey, setGroqKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [editingKey, setEditingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    store.settings.getValue().then(s => { setSettings(s); });
    store.groqKey.getValue().then(k => setGroqKey(k));
  }, []);

  async function save(patch: any) {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    await store.settings.setValue(updated);
  }

  async function handleWallpaperUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateWallpaperFile(file);
    if (err) { toast(err); return; }
    
    const id = crypto.randomUUID();
    try {
      toast('Uploading wallpaper...');
      await saveCustomWallpaper(id, file);
      await save({ wallpaper: { ...settings.wallpaper, mode: 'custom', customId: id } });
      toast('Wallpaper saved!');
    } catch (e: any) {
      toast('Failed to save wallpaper');
    }
  }

  async function handleSaveKey() {
    await store.groqKey.setValue(keyInput);
    setGroqKey(keyInput);
    setKeyInput('');
    setEditingKey(false);
    toast('API key saved');
  }

  async function handleRemoveKey() {
    await store.groqKey.setValue('');
    await save({ aiMode: false });
    setGroqKey('');
    setKeyInput('');
    toast('API key removed');
  }

  async function handleTestKey() {
    const key = editingKey ? keyInput : groqKey;
    const res = await sendMsg<boolean>({ type: 'KEY_TEST', payload: { key } });
    setKeyStatus(res.ok && res.data ? 'valid' : 'invalid');
    setTimeout(() => setKeyStatus('idle'), 4000);
  }

  async function handleAiToggle(val: boolean) {
    if (val && !groqKey) { setAiError('Add your Groq key first'); return; }
    setAiError('');
    await save({ aiMode: val });
  }

  if (!settings) return null;

  const maskedKey = groqKey.length > 8 ? `${groqKey.slice(0, 4)}••••••••${groqKey.slice(-4)}` : '••••••••';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Your Name</label>
        <input className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm outline-none focus:border-indigo-500/50" value={settings.name} onChange={e => save({ name: e.target.value })} placeholder="Your name" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Theme</label>
        <select className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm outline-none focus:border-indigo-500/50" value={settings.theme} onChange={e => save({ theme: e.target.value })}>
          {['auto', 'dark', 'light'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Search Engine</label>
        <select className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm outline-none focus:border-indigo-500/50" value={settings.searchEngine ?? 'google'} onChange={e => save({ searchEngine: e.target.value })}>
          <option value="google">Google</option>
          <option value="duckduckgo">DuckDuckGo</option>
          <option value="bing">Bing</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Weather Unit</label>
        <div className="flex gap-2">
          {['c', 'f'].map(u => (
            <button key={u} onClick={() => save({ weather: { ...settings.weather, unit: u } })} className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${settings.weather?.unit === u ? 'bg-indigo-500/30 border-indigo-500/50' : 'bg-black/20 border-white/10'}`}>
              °{u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/20 border border-white/10">
        <label className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Wallpaper</label>
        <select className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm outline-none focus:border-indigo-500/50" value={settings.wallpaper?.mode ?? 'weather'} onChange={e => save({ wallpaper: { ...settings.wallpaper, mode: e.target.value } })}>
          <option value="weather">Weather (Live)</option>
          <option value="daily">Daily Photo (Bing / Unsplash)</option>
          <option value="fixed">Fixed Preset</option>
          <option value="custom">Custom Upload</option>
        </select>
        
        {settings.wallpaper?.mode === 'fixed' && (
          <select className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm outline-none focus:border-indigo-500/50" value={settings.wallpaper?.fixedId ?? 'starfield'} onChange={e => save({ wallpaper: { ...settings.wallpaper, fixedId: e.target.value } })}>
            {WALLPAPER_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        )}
        
        {settings.wallpaper?.mode === 'custom' && (
          <div className="flex flex-col gap-1">
            <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={handleWallpaperUpload} className="text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30" />
            <span className="text-[9px] opacity-40">Images (8MB max), Video (50MB max)</span>
          </div>
        )}
      </div>

      {/* Groq API Key */}
      <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/20 border border-white/10">
        <label className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Groq API Key</label>
        {groqKey && !editingKey ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono opacity-70 flex-1">{maskedKey}</span>
            <button onClick={() => setEditingKey(true)} className="text-[11px] opacity-60 hover:opacity-100 transition-opacity">Change</button>
            <button onClick={handleRemoveKey} className="text-[11px] text-red-400 opacity-60 hover:opacity-100 transition-opacity">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input className="flex-1 px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 text-[12px] font-mono outline-none focus:border-indigo-500/50 placeholder-white/30" value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="gsk_..." type="password" />
            <button onClick={handleSaveKey} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-[11px] font-semibold transition-colors">Save</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={handleTestKey} className="text-[11px] opacity-60 hover:opacity-100 transition-opacity">Test key</button>
          {keyStatus === 'valid' && <span className="text-[11px] text-green-400 font-semibold">✓ Valid</span>}
          {keyStatus === 'invalid' && <span className="text-[11px] text-red-400 font-semibold">✗ Invalid</span>}
        </div>
      </div>

      {/* AI Mode */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-semibold">AI Mode</span>
          {aiError && <span className="text-[11px] text-red-400">{aiError}</span>}
        </div>
        <button
          onClick={() => handleAiToggle(!settings.aiMode)}
          className={`w-10 h-6 rounded-full transition-all relative ${settings.aiMode ? 'bg-indigo-500' : 'bg-white/20'}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.aiMode ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Popup App ─────────────────────────────────── */
const NAV: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: 'tabs', icon: <Layers size={15} />, label: 'Tabs' },
  { id: 'bookmarks', icon: <Bookmark size={15} />, label: 'Bookmarks' },
  { id: 'ask', icon: <Sparkles size={15} />, label: 'Ask' },
  { id: 'focus', icon: <Target size={15} />, label: 'Focus' },
  { id: 'settings', icon: <Settings size={15} />, label: 'Settings' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('tabs');
  const { msg, toast } = useToast();

  return (
    <div
      className="flex flex-col font-sans text-white"
      style={{
        minWidth: 340, maxWidth: 400, maxHeight: 580,
        background: 'linear-gradient(160deg, #0f111a 0%, #131620 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-white/5">
        <span className="text-base font-bold tracking-tight">Sidekick</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider opacity-30 font-semibold">{tab}</span>
      </div>

      {/* Nav */}
      <div className="flex border-b border-white/5">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-semibold uppercase tracking-wider transition-colors ${tab === n.id ? 'text-indigo-400 border-b-2 border-indigo-400' : 'opacity-40 hover:opacity-70'}`}
          >
            {n.icon}
            {n.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
        {tab === 'tabs' && <TabsPage toast={toast} />}
        {tab === 'bookmarks' && <BookmarksPage />}
        {tab === 'ask' && <AskPage />}
        {tab === 'focus' && <FocusPage toast={toast} />}
        {tab === 'settings' && <SettingsPage toast={toast} />}
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-3 left-3 right-3 py-2 px-4 rounded-xl bg-indigo-600/90 text-sm font-medium text-white text-center shadow-lg backdrop-blur-md">
          {msg}
        </div>
      )}
    </div>
  );
}
