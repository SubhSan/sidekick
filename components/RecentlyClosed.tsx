import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';

interface ClosedEntry {
  sessionId?: string;
  lastModified?: number;
  title: string;
  url: string;
  favUrl: string;
}

function getHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

export function RecentlyClosed() {
  const [entries, setEntries] = useState<ClosedEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    chrome.sessions.getRecentlyClosed({ maxResults: 8 }, (sessions) => {
      const items: ClosedEntry[] = [];
      for (const s of sessions) {
        if (s.tab && s.tab.url) {
          const host = getHostname(s.tab.url);
          items.push({
            sessionId: s.tab.sessionId,
            lastModified: s.lastModified,
            title: s.tab.title || host,
            url: s.tab.url,
            favUrl: `https://www.google.com/s2/favicons?domain=${host}&sz=16`,
          });
        }
      }
      setEntries(items);
    });
  }, []);

  if (entries.length === 0) return null;

  function restore(entry: ClosedEntry) {
    if (entry.lastModified) {
      chrome.sessions.restore(String(entry.lastModified));
    } else {
      window.open(entry.url, '_blank');
    }
  }

  return (
    <div className="fixed bottom-12 left-8 z-30">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-[var(--fg)] hover:scale-105 active:scale-95 transition-all"
          style={{
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border)',
          }}
        >
          <History size={12} className="text-[var(--accent)]" />
          <span className="opacity-80">Recently Closed</span>
        </button>
      ) : (
        <div
          className="flex flex-col gap-1.5 p-3 rounded-2xl shadow-xl animate-[sk-panel-in_0.2s_ease-out_forwards]"
          style={{
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <History size={12} className="text-[var(--accent)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Recently Closed</span>
            <button onClick={() => setOpen(false)} className="ml-auto opacity-40 hover:opacity-100 transition-opacity text-[10px]">✕</button>
          </div>
          <div className="flex flex-col gap-1">
            {entries.map((e, i) => (
              <button
                key={i}
                onClick={() => restore(e)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
              >
                <img
                  src={e.favUrl}
                  width={16} height={16}
                  className="shrink-0 rounded-[2px]"
                  onError={ev => { (ev.target as HTMLImageElement).style.display = 'none'; }}
                  alt=""
                />
                <span className="text-[12px] opacity-80 group-hover:opacity-100 transition-opacity truncate" style={{ maxWidth: '160px' }}>
                  {e.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
