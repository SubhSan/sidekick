import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bookmark, X, ExternalLink, Sparkles } from 'lucide-react';
import { store } from '../lib/storage';
import { markReadLaterRead, removeReadLater } from '../lib/readlater';
import type { ReadLaterItem } from '../lib/storage';

dayjs.extend(relativeTime);

const MAX_VISIBLE = 6;

export function ReadLaterSection() {
  const [items, setItems] = useState<ReadLaterItem[]>([]);

  useEffect(() => {
    store.readLater.getValue().then(setItems);
    const unwatch = store.readLater.watch(val => {
      if (val) setItems(val);
    });
    return () => { unwatch(); };
  }, []);

  if (items.length === 0) return null;

  const unreadCount = items.filter(i => i.addedAt > 0).length;
  const visibleItems = items.slice(0, MAX_VISIBLE);

  async function handleOpen(item: ReadLaterItem) {
    if (item.addedAt > 0) {
      await markReadLaterRead(item.id);
    }
    window.open(item.url, '_blank');
  }

  async function handleRemove(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await removeReadLater(id);
  }

  return (
    <div className="w-full max-w-lg mt-8 flex flex-col gap-2">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Bookmark size={14} className="text-[var(--accent)]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg)] opacity-80">Read Later</span>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {visibleItems.map(item => {
          const isRead = item.addedAt < 0;
          return (
            <div
              key={item.id}
              onClick={() => handleOpen(item)}
              className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10 cursor-pointer group transition-colors"
            >
              <img
                src={item.favicon || `https://www.google.com/s2/favicons?sz=14&domain_url=${encodeURIComponent(item.url)}`}
                width={16}
                height={16}
                className={`shrink-0 rounded-[2px] ${isRead ? 'opacity-40' : 'opacity-90'}`}
                onError={ev => { (ev.target as HTMLImageElement).style.display = 'none'; }}
                alt=""
              />
              
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-medium truncate ${isRead ? 'opacity-50 line-through' : 'text-[var(--fg)]'}`}>
                    {item.title}
                  </span>
                  {item.source === 'ai' && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] uppercase font-bold tracking-wider shrink-0">
                      <Sparkles size={8} /> AI
                    </span>
                  )}
                </div>
                <span className={`text-[11px] truncate mt-0.5 ${isRead ? 'opacity-30' : 'opacity-50'}`}>
                  {item.excerpt || (item.url ? new URL(item.url).hostname : '')}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] opacity-40">
                  {dayjs(Math.abs(item.addedAt)).fromNow()}
                </span>
                <button
                  onClick={(e) => handleRemove(e, item.id)}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-red-400 transition-opacity p-1"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
