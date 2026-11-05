import React, { useState, useEffect, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Bookmark, Globe, ChevronRight, ChevronDown, Search, X } from 'lucide-react';
import { store } from '../lib/storage';

interface BNode {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  children?: BNode[];
}

function mapNode(node: chrome.bookmarks.BookmarkTreeNode): BNode {
  return {
    id: node.id,
    title: node.title,
    url: node.url,
    parentId: node.parentId,
    children: node.children ? node.children.map(mapNode) : undefined,
  };
}

function flatLeaves(node: BNode): BNode[] {
  if (!node.children) return node.url ? [node] : [];
  return node.children.flatMap(flatLeaves);
}

function countLeaves(node: BNode): number {
  if (!node.children) return node.url ? 1 : 0;
  return node.children.reduce((sum, c) => sum + countLeaves(c), 0);
}

function getOrderedChildren(folder: BNode, order: Record<string, string[]>): BNode[] {
  const children = folder.children ?? [];
  const stored = order[folder.id] ?? [];
  if (stored.length === 0) return children;
  const map = new Map(children.map(c => [c.id, c]));
  const ordered = stored.flatMap(id => map.has(id) ? [map.get(id)!] : []);
  const remaining = children.filter(c => !stored.includes(c.id));
  return [...ordered, ...remaining];
}

function FaviconImg({ url }: { url: string }) {
  const [error, setError] = useState(false);
  if (error) return <Globe size={12} className="opacity-40 shrink-0" />;
  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=14&domain_url=${encodeURIComponent(url)}`}
      width={14} height={14}
      className="shrink-0 rounded-[2px]"
      onError={() => setError(true)}
      alt=""
    />
  );
}

interface NodeRowProps {
  node: BNode;
  depth: number;
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
  order: Record<string, string[]>;
  onReorder: (folderId: string, newOrder: string[]) => void;
  dragState: React.MutableRefObject<{ draggingId: string | null; overFolderId: string | null }>;
  setDropIndicator: (key: string | null) => void;
  dropIndicator: string | null;
}

function NodeRow({
  node, depth, expanded, toggleExpanded, order, onReorder,
  dragState, setDropIndicator, dropIndicator
}: NodeRowProps) {
  const isFolder = !!node.children;
  const isExpanded = expanded.has(node.id);
  const indentPx = depth * 12;
  const children = isFolder ? getOrderedChildren(node, order) : [];

  function handleDragStart(e: React.DragEvent) {
    dragState.current.draggingId = node.id;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, siblingId: string, position: 'before' | 'after') {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndicator(`${siblingId}-${position}`);
    dragState.current.overFolderId = node.parentId ?? null;
  }

  function handleDrop(e: React.DragEvent, targetId: string, position: 'before' | 'after', folderId: string) {
    e.preventDefault();
    const draggingId = dragState.current.draggingId;
    if (!draggingId || draggingId === targetId) return;

    const folder = { id: folderId, children: order[folderId] ? undefined : undefined };
    // Get the current sibling list from the parent. We need access to parent context.
    // This is handled at the folder level in the parent; emit an event upward.
    const ev = new CustomEvent('sk-reorder', {
      detail: { draggingId, targetId, position, folderId },
      bubbles: true
    });
    (e.target as HTMLElement).dispatchEvent(ev);
    setDropIndicator(null);
    dragState.current.draggingId = null;
  }

  if (isFolder) {
    return (
      <>
        <div
          className="flex items-center gap-1.5 px-2 py-[5px] rounded-md hover:bg-white/5 cursor-pointer select-none transition-colors group"
          style={{ paddingLeft: `${8 + indentPx}px` }}
          onClick={() => toggleExpanded(node.id)}
        >
          <span className="text-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <Bookmark size={12} className="opacity-40 shrink-0" />
          <span className="text-[13px] opacity-80 truncate flex-1">{node.title || 'Folder'}</span>
        </div>
        {isExpanded && children.map((child, i) => (
          <React.Fragment key={child.id}>
            {dropIndicator === `${child.id}-before` && (
              <div className="h-[2px] bg-indigo-500 mx-2 rounded-full" style={{ marginLeft: `${8 + (depth + 1) * 12}px` }} />
            )}
            <NodeRow
              node={child} depth={depth + 1} expanded={expanded}
              toggleExpanded={toggleExpanded} order={order} onReorder={onReorder}
              dragState={dragState} setDropIndicator={setDropIndicator} dropIndicator={dropIndicator}
            />
            {dropIndicator === `${child.id}-after` && i === children.length - 1 && (
              <div className="h-[2px] bg-indigo-500 mx-2 rounded-full" style={{ marginLeft: `${8 + (depth + 1) * 12}px` }} />
            )}
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={e => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const pos = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
        handleDragOver(e, node.id, pos);
      }}
      onDrop={e => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const pos = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
        handleDrop(e, node.id, pos, node.parentId ?? '');
      }}
      onDragEnd={() => { setDropIndicator(null); dragState.current.draggingId = null; }}
      className="flex items-center gap-1.5 px-2 py-[5px] rounded-md hover:bg-white/5 cursor-pointer transition-colors group"
      style={{ paddingLeft: `${8 + indentPx}px` }}
      onClick={() => window.open(node.url!, '_blank')}
    >
      <FaviconImg url={node.url!} />
      <span className="text-[13px] opacity-80 truncate flex-1 group-hover:opacity-100">{node.title || node.url}</span>
    </div>
  );
}

export function BookmarksPanel() {
  const [open, setOpen] = useState(false);
  const [roots, setRoots] = useState<BNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1']));
  const [order, setOrder] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [dropIndicator, setDropIndicator] = useState<string | null>(null);
  const dragState = useRef<{ draggingId: string | null; overFolderId: string | null }>({
    draggingId: null, overFolderId: null
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    const tree = await chrome.bookmarks.getTree();
    const root = tree[0];
    const topChildren = root.children ?? [];
    // id "1" = Bookmarks Bar, "2" = Other Bookmarks, "3" = Mobile (skip Mobile if empty)
    const mapped: BNode[] = topChildren
      .map(mapNode)
      .filter(n => n.id !== '3' || (n.children && n.children.length > 0));
    setRoots(mapped);
    const total = mapped.reduce((s, n) => s + countLeaves(n), 0);
    setTotalCount(total);
  }, []);

  useEffect(() => {
    reload();
    store.bookmarkOrder.getValue().then(setOrder);

    // Live updates
    chrome.bookmarks.onCreated.addListener(reload);
    chrome.bookmarks.onRemoved.addListener(reload);
    chrome.bookmarks.onChanged.addListener(reload);
    chrome.bookmarks.onMoved.addListener(reload);

    return () => {
      chrome.bookmarks.onCreated.removeListener(reload);
      chrome.bookmarks.onRemoved.removeListener(reload);
      chrome.bookmarks.onChanged.removeListener(reload);
      chrome.bookmarks.onMoved.removeListener(reload);
    };
  }, [reload]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        if (query) setQuery('');
        else setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, query]);

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Reorder handler via custom event bubbled from NodeRow
  useEffect(() => {
    const handler = (e: Event) => {
      const { draggingId, targetId, position, folderId } = (e as CustomEvent).detail;
      // Rebuild order for that folder
      store.bookmarkOrder.getValue().then(currentOrder => {
        const parentNode = findNode(roots, folderId);
        if (!parentNode || !parentNode.children) return;
        const siblings = getOrderedChildren(parentNode, currentOrder);
        const ids = siblings.map(s => s.id).filter(id => id !== draggingId);
        const targetIdx = ids.indexOf(targetId);
        const insertAt = position === 'before' ? targetIdx : targetIdx + 1;
        ids.splice(insertAt, 0, draggingId);
        const newOrder = { ...currentOrder, [folderId]: ids };
        setOrder(newOrder);
        store.bookmarkOrder.setValue(newOrder);
      });
    };
    panelRef.current?.addEventListener('sk-reorder', handler);
    return () => panelRef.current?.removeEventListener('sk-reorder', handler);
  }, [roots]);

  function findNode(nodes: BNode[], id: string): BNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNode(n.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Fuse.js search
  const allLeaves = roots.flatMap(flatLeaves);
  const fuse = new Fuse(allLeaves, {
    keys: [{ name: 'title', weight: 0.6 }, { name: 'url', weight: 0.4 }],
    threshold: 0.4,
  });
  const searchResults = query.trim() ? fuse.search(query).map(r => r.item) : [];

  const pillStyle: React.CSSProperties = {
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    border: '1px solid var(--border)',
  };

  return (
    <div className="fixed top-[6px] left-5 z-40" ref={panelRef}>
      {/* Collapsed pill */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-[var(--fg)] hover:scale-105 active:scale-95 transition-all"
          style={pillStyle}
        >
          <Bookmark size={13} className="text-[var(--accent)]" />
          <span className="opacity-80">Bookmarks</span>
          {totalCount > 0 && (
            <span className="ml-0.5 bg-[var(--accent)]/20 text-[var(--accent)] px-1.5 py-0.5 rounded-full text-[9px] font-bold">
              {totalCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div
          className="w-[260px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[sk-bm-panel-in_250ms_ease-out_forwards]"
          style={{
            maxHeight: 'calc(100vh - 80px)',
            ...pillStyle,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <Bookmark size={14} className="text-[var(--accent)] shrink-0" />
            <span className="text-[12px] font-bold uppercase tracking-wider opacity-80 flex-1">Bookmarks</span>
            <button onClick={() => setOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity p-0.5">
              <X size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="px-2 pb-2 relative">
            <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full bg-black/20 border border-[var(--border)] rounded-lg pl-7 pr-3 py-1.5 text-[12px] text-[var(--fg)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Content */}
          <div
            className="overflow-y-auto flex-1 px-1 pb-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          >
            {query.trim() ? (
              /* Flat search results */
              searchResults.length === 0 ? (
                <p className="text-[12px] opacity-40 text-center py-6">No results</p>
              ) : searchResults.map(node => (
                <div
                  key={node.id}
                  className="flex items-center gap-1.5 px-2 py-[5px] rounded-md hover:bg-white/5 cursor-pointer transition-colors group"
                  onClick={() => window.open(node.url!, '_blank')}
                >
                  <FaviconImg url={node.url!} />
                  <span className="text-[13px] opacity-80 truncate flex-1 group-hover:opacity-100">{node.title || node.url}</span>
                </div>
              ))
            ) : (
              /* Tree view */
              roots.map(rootFolder => (
                <NodeRow
                  key={rootFolder.id}
                  node={rootFolder}
                  depth={0}
                  expanded={expanded}
                  toggleExpanded={toggleExpanded}
                  order={order}
                  onReorder={async (folderId, newOrder) => {
                    const updated = { ...order, [folderId]: newOrder };
                    setOrder(updated);
                    await store.bookmarkOrder.setValue(updated);
                  }}
                  dragState={dragState}
                  setDropIndicator={setDropIndicator}
                  dropIndicator={dropIndicator}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
