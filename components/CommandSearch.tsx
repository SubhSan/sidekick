import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { parseCommand, buildSearchUrl } from '../lib/command';
import { addTask } from '../lib/tasks';
import { store } from '../lib/storage';
import { searchBookmarks } from '../lib/bookmarks';

const HINT_EXAMPLES = [
  't Buy groceries',
  'f Ship the feature',
  'b react hooks',
  'reddit.com',
  't Review pull requests',
  'f Deep work session',
  'b typescript docs',
  'https://github.com',
  't Call team standup',
  'f Finish the PRD',
];

interface Props {
  onTaskAdded?: () => void;
}

interface BookmarkResult {
  id: string;
  title: string;
  url: string;
}

export function CommandSearch({ onTaskAdded }: Props) {
  const [value, setValue] = useState('');
  const [hintIdx, setHintIdx] = useState(0);
  const [bookmarkResults, setBookmarkResults] = useState<BookmarkResult[]>([]);
  const [focusedBm, setFocusedBm] = useState(-1);
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    store.settings.getValue().then(s => setSearchEngine(s.searchEngine ?? 'google'));
    const timer = setInterval(() => setHintIdx(i => (i + 1) % HINT_EXAMPLES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cmd = parseCommand(value);
    if (cmd.kind === 'bookmark') {
      searchBookmarks(cmd.value || '').then(results => {
        setBookmarkResults(results.slice(0, 6) as BookmarkResult[]);
      });
    } else {
      setBookmarkResults([]);
      setFocusedBm(-1);
    }
  }, [value]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    // If bookmark dropdown is open and something focused, navigate to it
    if (bookmarkResults.length > 0 && focusedBm >= 0) {
      const bm = bookmarkResults[focusedBm];
      if (bm) { window.open(bm.url, '_blank'); setValue(''); return; }
    }

    const cmd = parseCommand(value);
    if (!value.trim()) return;

    switch (cmd.kind) {
      case 'task':
        if (cmd.value) { await addTask(cmd.value); onTaskAdded?.(); }
        break;
      case 'focus': {
        const dayjs = (await import('dayjs')).default;
        const settings = await store.settings.getValue();
        await store.focus.setValue({ text: cmd.value, dateISO: dayjs().format('YYYY-MM-DD') });
        break;
      }
      case 'bookmark':
        // Open first result
        if (bookmarkResults[0]) window.open(bookmarkResults[0].url, '_blank');
        break;
      case 'url':
        window.location.href = cmd.value;
        break;
      case 'search':
        window.location.href = buildSearchUrl(cmd.value, searchEngine);
        break;
    }
    setValue('');
    setBookmarkResults([]);
    setFocusedBm(-1);
  }

  const showBmDropdown = bookmarkResults.length > 0;

  return (
    <div className="relative w-full max-w-lg mt-6">
      <form onSubmit={handleSubmit} className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none text-[var(--fg)]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={HINT_EXAMPLES[hintIdx]}
          onKeyDown={e => {
            if (showBmDropdown) {
              if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedBm(i => Math.min(i + 1, bookmarkResults.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedBm(i => Math.max(i - 1, 0)); }
              else if (e.key === 'Escape') { setValue(''); setBookmarkResults([]); }
            }
          }}
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition-all"
          style={{
            backgroundColor: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: showBmDropdown ? '12px 12px 0 0' : '12px',
          }}
        />
      </form>

      {/* Bookmark dropdown */}
      {showBmDropdown && (
        <div
          className="absolute left-0 right-0 z-30 rounded-b-xl overflow-hidden border border-t-0 border-[var(--border)] shadow-xl"
          style={{ backgroundColor: 'rgba(10,12,22,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          {bookmarkResults.map((bm, i) => (
            <button
              key={bm.id}
              onMouseEnter={() => setFocusedBm(i)}
              onClick={() => { window.open(bm.url, '_blank'); setValue(''); setBookmarkResults([]); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors text-sm ${focusedBm === i ? 'bg-[var(--accent)]/20 text-[var(--fg)]' : 'text-[var(--fg)] opacity-80 hover:bg-white/5'}`}
            >
              <img
                src={`https://www.google.com/s2/favicons?sz=14&domain_url=${encodeURIComponent(bm.url)}`}
                width={14} height={14} className="shrink-0 rounded-[2px]" alt=""
                onError={ev => { (ev.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="truncate flex-1">{bm.title}</span>
              <span className="text-[11px] opacity-40 shrink-0 truncate max-w-[120px]">{bm.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
