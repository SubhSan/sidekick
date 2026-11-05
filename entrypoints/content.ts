

import { sendMsg } from '../lib/messages';

// Common words to skip for jargon tooltips
const COMMON_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as',
  'you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will',
  'my','one','all','would','there','their','what','so','up','out','if','about','who','get','which',
  'go','me','when','make','can','like','time','no','just','him','know','take','people','into',
  'year','your','good','some','could','them','see','other','than','then','now','look','only',
  'come','its','over','think','also','back','after','use','two','how','our','work','first','well',
  'way','even','new','want','because','any','these','give','day','most','us','is','was','are',
  'been','has','had','were','did','does','may','might','shall','should','must','need','am','being',
  'each','every','both','few','more','many','such','here','where','very','much','own','same',
  'still','while','too','before','between','never','under','last','long','great','little','old',
  'right','big','high','small','large','next','early','young','important','public','bad',
  'thing','place','case','point','fact','part','group','number','world','area','question',
]);

let floatingPanel: HTMLDivElement | null = null;
let floatingTab: HTMLDivElement | null = null;
let selectionTooltip: HTMLDivElement | null = null;
let shadowHost: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let collapseTimer: ReturnType<typeof setTimeout> | null = null;
let jargonTimer: ReturnType<typeof setTimeout> | null = null;
let jargonTooltip: HTMLDivElement | null = null;

let isDragging = false;
let currentY = 50; // top percentage
let currentEdge = 'right';

const PANEL_STYLES = `
  .sk-floating-tab {
    position: fixed;
    width: 20px;
    height: 52px;
    z-index: 2147483646;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    user-select: none;
    transition: opacity 200ms ease;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .sk-floating-tab:active {
    cursor: grabbing;
  }
  .sk-tab-left {
    left: 0;
    border-radius: 0 8px 8px 0;
  }
  .sk-tab-right {
    right: 0;
    border-radius: 8px 0 0 8px;
  }
  .sk-floating-panel {
    position: fixed;
    z-index: 2147483646;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    width: 182px;
    box-sizing: border-box;
    border-radius: 14px;
    background: rgba(15, 17, 28, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    opacity: 0;
    transition: opacity 250ms ease, transform 250ms ease;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .sk-floating-panel.sk-visible {
    opacity: 1;
  }
  .sk-panel-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 34px;
    padding: 0 10px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.75);
    cursor: pointer;
    transition: background 200ms, color 200ms, transform 150ms;
    box-sizing: border-box;
  }
  .sk-panel-btn:hover {
    background: rgba(99,102,241,0.25);
    color: #a5b4fc;
    transform: scale(1.02);
  }
  .sk-panel-btn:hover .sk-btn-label {
    color: #a5b4fc;
  }
  .sk-panel-btn:active {
    transform: scale(0.98);
  }
  .sk-btn-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }
  .sk-panel-btn.sk-success {
    color: #34d399 !important;
  }
  .sk-panel-btn.sk-success .sk-btn-label {
    color: #34d399 !important;
  }
  .sk-sel-tooltip {
    position: fixed;
    z-index: 2147483647;
    padding: 5px 10px;
    border-radius: 8px;
    background: rgba(15,17,28,0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(99,102,241,0.3);
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    color: rgba(255,255,255,0.85);
    font-size: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    cursor: pointer;
    transition: opacity 200ms, transform 200ms;
    opacity: 0;
    user-select: none;
  }
  .sk-sel-tooltip.sk-visible {
    opacity: 1;
  }
  .sk-sel-tooltip:hover {
    background: rgba(99,102,241,0.3);
    border-color: rgba(99,102,241,0.5);
  }
  .sk-jargon-tooltip {
    position: fixed;
    z-index: 2147483647;
    max-width: 280px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(15,17,28,0.95);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(99,102,241,0.2);
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    opacity: 0;
    transition: opacity 250ms;
    pointer-events: none;
  }
  .sk-jargon-tooltip.sk-visible {
    opacity: 1;
  }
  .sk-jargon-title {
    font-weight: 600;
    color: #a5b4fc;
    margin-bottom: 2px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .sk-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    padding: 8px 18px;
    border-radius: 10px;
    background: rgba(99,102,241,0.9);
    color: white;
    font-size: 13px;
    font-weight: 500;
    font-family: system-ui, sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    opacity: 0;
    transition: opacity 300ms;
  }
  .sk-toast.sk-visible { opacity: 1; }
`;

// SVG icon helpers (inline to avoid deps inside content script)
const ICONS = {
  readLater: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  reader: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  bookmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>`,
  group: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  dedupe: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="13" height="13" rx="2"/><path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/><line x1="8" y1="8.5" x2="17" y2="8.5"/></svg>`,
  screenshot: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  sparkle: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>`,
  sidekick: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
};

function showToast(text: string) {
  if (!shadowRoot) return;
  const toast = document.createElement('div');
  toast.className = 'sk-toast';
  toast.textContent = text;
  shadowRoot.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('sk-visible'));
  setTimeout(() => {
    toast.classList.remove('sk-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function flashSuccess(btn: HTMLButtonElement) {
  btn.classList.add('sk-success');
  setTimeout(() => btn.classList.remove('sk-success'), 1500);
}

function createPanelButton(icon: string, label: string, onClick: (btn: HTMLButtonElement) => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'sk-panel-btn';
  btn.innerHTML = `${icon}<span class="sk-btn-label">${label}</span>`;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetCollapseTimer();
    onClick(btn);
  });
  return btn;
}

function resetCollapseTimer() {
  if (collapseTimer) clearTimeout(collapseTimer);
  collapseTimer = setTimeout(() => {
    collapsePanel();
  }, 4000);
}

function getExcerpt(): string {
  const text = document.body?.innerText || '';
  return text.split(/\s+/).slice(0, 40).join(' ');
}

function buildFloatingPanel(): HTMLDivElement {
  const panel = document.createElement('div');
  panel.className = 'sk-floating-panel';

  // Read Later
  panel.appendChild(createPanelButton(ICONS.readLater, 'Read Later', async (btn) => {
    const excerpt = getExcerpt();
    const res = await sendMsg({
      type: 'READ_LATER_SAVE',
      payload: {
        url: location.href,
        title: document.title || location.href,
        excerpt,
        favicon: '',
      },
    });
    if (res.ok) { flashSuccess(btn); showToast('Saved to Read Later'); }
    else showToast('Failed to save');
  }));

  // Reading Mode
  panel.appendChild(createPanelButton(ICONS.reader, 'Reading Mode', async (btn) => {
    const res = await sendMsg({ type: 'OPEN_READER', payload: { url: location.href } });
    if (res.ok) flashSuccess(btn);
    else showToast('Could not extract article');
  }));

  // Bookmark Page
  panel.appendChild(createPanelButton(ICONS.bookmark, 'Bookmark', async (btn) => {
    const res = await sendMsg({
      type: 'BOOKMARK_PAGE',
      payload: { url: location.href, title: document.title },
    });
    if (res.ok) { flashSuccess(btn); showToast('Bookmarked!'); }
    else showToast(res.error?.message || 'Already bookmarked');
  }));

  // Group Tabs
  panel.appendChild(createPanelButton(ICONS.group, 'Group Tabs', async (btn) => {
    const res = await sendMsg({ type: 'TABS_GROUP' });
    if (res.ok) { flashSuccess(btn); showToast('Tabs grouped'); }
  }));

  // Close Duplicates
  panel.appendChild(createPanelButton(ICONS.dedupe, 'Dedupe Tabs', async (btn) => {
    const res = await sendMsg({ type: 'TABS_DEDUPE' });
    if (res.ok) { flashSuccess(btn); showToast('Duplicates closed'); }
  }));

  // Screenshot
  panel.appendChild(createPanelButton(ICONS.screenshot, 'Screenshot', async (btn) => {
    const res = await sendMsg({ type: 'SCREENSHOT' });
    if (res.ok) { flashSuccess(btn); showToast('Screenshot saved'); }
    else showToast('Screenshot failed');
  }));

  return panel;
}

function updateLayout() {
  if (!floatingTab || !floatingPanel) return;

  // Position tab
  floatingTab.style.top = `${currentY}%`;
  floatingTab.style.transform = 'translateY(-50%)';
  if (currentEdge === 'left') {
    floatingTab.className = 'sk-floating-tab sk-tab-left';
    floatingTab.textContent = '›';
    floatingTab.style.left = '0';
    floatingTab.style.right = 'auto';
  } else {
    floatingTab.className = 'sk-floating-tab sk-tab-right';
    floatingTab.textContent = '‹';
    floatingTab.style.right = '0';
    floatingTab.style.left = 'auto';
  }

  // Position panel
  floatingPanel.style.top = `${currentY}%`;
  if (currentEdge === 'left') {
    floatingPanel.style.left = '8px';
    floatingPanel.style.right = 'auto';
    floatingPanel.style.transform = 'translateY(-50%)';
  } else {
    floatingPanel.style.right = '8px';
    floatingPanel.style.left = 'auto';
    floatingPanel.style.transform = 'translateY(-50%)';
  }
}

function startDrag(e: MouseEvent) {
  isDragging = true;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
}

function onDrag(e: MouseEvent) {
  if (!isDragging) return;
  const yPct = (e.clientY / window.innerHeight) * 100;
  const boundedY = Math.min(Math.max(yPct, 5), 95);
  if (floatingTab) {
    floatingTab.style.top = `${boundedY}%`;
    floatingTab.style.transform = 'translateY(-50%)';
  }
}

function stopDrag(e: MouseEvent) {
  if (!isDragging) return;
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);

  const x = e.clientX;
  const halfWidth = window.innerWidth / 2;
  const edge = x < halfWidth ? 'left' : 'right';

  const yPct = (e.clientY / window.innerHeight) * 100;
  const boundedY = Math.min(Math.max(yPct, 5), 95);

  currentEdge = edge;
  currentY = boundedY;

  localStorage.setItem('sk-assistant-edge', edge);
  localStorage.setItem('sk-assistant-y', String(boundedY));

  updateLayout();
}

function expandPanel() {
  if (isDragging) return;
  if (floatingTab) floatingTab.style.display = 'none';
  if (floatingPanel) {
    floatingPanel.style.display = 'flex';
    requestAnimationFrame(() => {
      floatingPanel!.classList.add('sk-visible');
    });
  }
  resetCollapseTimer();
}

function collapsePanel() {
  if (floatingPanel) {
    floatingPanel.classList.remove('sk-visible');
    setTimeout(() => {
      if (floatingPanel && !floatingPanel.classList.contains('sk-visible')) {
        floatingPanel.style.display = 'none';
        if (floatingTab) floatingTab.style.display = 'flex';
      }
    }, 250);
  }
}

function showPanel() {
  expandPanel();
}

function initShadowDOM() {
  shadowHost = document.createElement('div');
  shadowHost.id = 'sidekick-host';
  shadowHost.style.cssText = 'all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483646; pointer-events: none;';
  document.documentElement.appendChild(shadowHost);

  shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // Inject styles
  const style = document.createElement('style');
  style.textContent = PANEL_STYLES;
  shadowRoot.appendChild(style);

  // Create peeking tab
  floatingTab = document.createElement('div');
  floatingTab.style.pointerEvents = 'auto';
  shadowRoot.appendChild(floatingTab);

  // Create floating panel
  floatingPanel = buildFloatingPanel();
  floatingPanel.style.pointerEvents = 'auto';
  floatingPanel.style.display = 'none';
  shadowRoot.appendChild(floatingPanel);

  // Load position
  const storedEdge = localStorage.getItem('sk-assistant-edge');
  const storedY = localStorage.getItem('sk-assistant-y');
  if (storedEdge === 'left' || storedEdge === 'right') currentEdge = storedEdge;
  if (storedY) {
    const parsed = parseFloat(storedY);
    if (!isNaN(parsed)) currentY = parsed;
  }

  updateLayout();

  // Tab listeners
  floatingTab.addEventListener('mouseenter', expandPanel);
  floatingTab.addEventListener('click', expandPanel);
  floatingTab.addEventListener('mousedown', startDrag);

  // Panel listeners
  floatingPanel.addEventListener('mouseenter', () => {
    if (collapseTimer) clearTimeout(collapseTimer);
  });
  floatingPanel.addEventListener('mouseleave', resetCollapseTimer);
}


// Selection tooltip for "Explain Selection"
function handleMouseUp(e: MouseEvent) {
  if (!shadowRoot) return;

  // Delay slightly to let selection finalize
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() || '';

    // Remove existing tooltip
    if (selectionTooltip) {
      selectionTooltip.remove();
      selectionTooltip = null;
    }

    if (text.length < 5 || text.length > 2000) {
      // If any text was selected, also show the floating panel
      if (text.length >= 5) showPanel();
      return;
    }

    showPanel();

    // Show "Explain Selection" tooltip near cursor
    selectionTooltip = document.createElement('div');
    selectionTooltip.className = 'sk-sel-tooltip';
    selectionTooltip.innerHTML = `${ICONS.sparkle} Explain Selection`;
    selectionTooltip.style.left = `${Math.min(e.clientX + 8, window.innerWidth - 160)}px`;
    selectionTooltip.style.top = `${Math.max(e.clientY - 40, 8)}px`;
    selectionTooltip.style.pointerEvents = 'auto';
    selectionTooltip.style.display = 'flex';
    selectionTooltip.style.alignItems = 'center';
    selectionTooltip.style.gap = '5px';

    selectionTooltip.addEventListener('click', async () => {
      const res = await sendMsg({
        type: 'AI_EXPLAIN',
        payload: { text, pageTitle: document.title, url: location.href },
      });
      if (res.ok && res.data) {
        showJargonLikeTooltip(
          e.clientX, e.clientY,
          'Explanation',
          String(res.data)
        );
      } else {
        showJargonLikeTooltip(
          e.clientX, e.clientY,
          'AI Mode Required',
          'Enable AI Mode in Settings and add your Groq API key to use this feature.'
        );
      }
      selectionTooltip?.remove();
      selectionTooltip = null;
    });

    shadowRoot!.appendChild(selectionTooltip);
    requestAnimationFrame(() => selectionTooltip?.classList.add('sk-visible'));

    // Auto-remove after 5s
    setTimeout(() => {
      if (selectionTooltip) {
        selectionTooltip.classList.remove('sk-visible');
        setTimeout(() => { selectionTooltip?.remove(); selectionTooltip = null; }, 200);
      }
    }, 5000);
  }, 10);
}

// Jargon tooltip on Alt+Hover
function showJargonLikeTooltip(x: number, y: number, title: string, body: string) {
  if (!shadowRoot) return;
  if (jargonTooltip) { jargonTooltip.remove(); jargonTooltip = null; }

  jargonTooltip = document.createElement('div');
  jargonTooltip.className = 'sk-jargon-tooltip';
  jargonTooltip.style.left = `${Math.min(x + 12, window.innerWidth - 300)}px`;
  jargonTooltip.style.top = `${Math.max(y - 10, 8)}px`;
  jargonTooltip.style.pointerEvents = 'auto';
  jargonTooltip.innerHTML = `<div class="sk-jargon-title">${title}</div><div>${body}</div>`;

  shadowRoot.appendChild(jargonTooltip);
  requestAnimationFrame(() => jargonTooltip?.classList.add('sk-visible'));

  setTimeout(() => {
    if (jargonTooltip) {
      jargonTooltip.classList.remove('sk-visible');
      setTimeout(() => { jargonTooltip?.remove(); jargonTooltip = null; }, 250);
    }
  }, 8000);
}

function handleMouseMove(e: MouseEvent) {
  if (!e.altKey) {
    if (jargonTimer) { clearTimeout(jargonTimer); jargonTimer = null; }
    return;
  }

  if (jargonTimer) clearTimeout(jargonTimer);

  jargonTimer = setTimeout(() => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || !el.textContent) return;

    // Get the word under cursor using caretPositionFromPoint/caretRangeFromPoint
    let word = '';
    let sentenceContext = '';

    // @ts-ignore - caretRangeFromPoint is non-standard
    const range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (range) {
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || '';
        const offset = range.startOffset;
        // Find word boundaries
        let start = offset;
        let end = offset;
        while (start > 0 && /\w/.test(text[start - 1])) start--;
        while (end < text.length && /\w/.test(text[end])) end++;
        word = text.slice(start, end).toLowerCase();

        // Grab surrounding sentence for context
        const sentStart = Math.max(0, text.lastIndexOf('.', start) + 1);
        const sentEnd = text.indexOf('.', end);
        sentenceContext = text.slice(sentStart, sentEnd > 0 ? sentEnd + 1 : text.length).trim().slice(0, 200);
      }
    }

    if (!word || word.length < 3 || COMMON_WORDS.has(word)) return;

    // Request AI jargon definition
    sendMsg({
      type: 'AI_JARGON',
      payload: { term: word, sentenceContext },
    }).then(res => {
      if (res.ok && res.data) {
        showJargonLikeTooltip(e.clientX, e.clientY, word, String(res.data));
      } else {
        showJargonLikeTooltip(
          e.clientX, e.clientY,
          'AI Mode Required',
          'Enable AI Mode in Settings and add your Groq API key to use this feature.'
        );
      }
    });
  }, 600);
}

// Remove jargon tooltip when Alt is released
function handleKeyUp(e: KeyboardEvent) {
  if (e.key === 'Alt') {
    if (jargonTimer) { clearTimeout(jargonTimer); jargonTimer = null; }
    if (jargonTooltip) {
      jargonTooltip.classList.remove('sk-visible');
      setTimeout(() => { jargonTooltip?.remove(); jargonTooltip = null; }, 250);
    }
  }
}

// Handle messages from background requesting extraction
function handleExtractMessages() {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'EXTRACT_ARTICLE') {
      // Try Readability if available, otherwise just extract text
      try {
        // @ts-ignore - Readability from @mozilla/readability
        if (typeof Readability !== 'undefined') {
          const documentClone = document.cloneNode(true) as Document;
          // @ts-ignore
          const article = new Readability(documentClone).parse();
          sendResponse(article);
        } else {
          // Fallback: extract main content
          const article = extractArticleFallback();
          sendResponse(article);
        }
      } catch {
        sendResponse(null);
      }
      return true;
    }

    if (msg.type === 'EXTRACT_TEXT') {
      sendResponse({ text: document.body?.innerText || '' });
      return true;
    }

    if (msg.type === 'GET_EXCERPT') {
      sendResponse({
        excerpt: getExcerpt(),
        title: document.title,
        url: location.href,
      });
      return true;
    }
  });
}

function extractArticleFallback(): { title: string; content: string; textContent: string; length: number } | null {
  const candidates = document.querySelectorAll('article, [role="main"], main, .post-content, .entry-content, .article-body');
  let best: Element | null = null;
  let bestLen = 0;

  for (const el of candidates) {
    const len = (el.textContent || '').length;
    if (len > bestLen) { best = el; bestLen = len; }
  }

  if (!best || bestLen < 500) {
    // Fallback to body
    const bodyText = document.body?.innerText || '';
    if (bodyText.length < 500) return null;
    return {
      title: document.title,
      content: document.body.innerHTML,
      textContent: bodyText,
      length: bodyText.length,
    };
  }

  return {
    title: document.title,
    content: best.innerHTML,
    textContent: best.textContent || '',
    length: bestLen,
  };
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Don't inject into extension pages or chrome:// URLs
    if (location.protocol === 'chrome-extension:' || location.protocol === 'chrome:') return;

    console.log('Sidekick content script loaded.');

    initShadowDOM();
    initPassCountdown();

    // Listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keyup', handleKeyUp);

    // Handle extraction requests from background
    handleExtractMessages();

    // Click outside to dismiss tooltips
    document.addEventListener('mousedown', (e) => {
      if (selectionTooltip) {
        selectionTooltip.classList.remove('sk-visible');
        setTimeout(() => { selectionTooltip?.remove(); selectionTooltip = null; }, 200);
      }
    });
  },
});

async function initPassCountdown() {
  const res = await sendMsg<{ active: boolean; expiresAt: number }>({ type: 'GET_PASS_STATE' });
  if (!res.ok || !res.data || !res.data.active) return;

  const { expiresAt } = res.data;
  if (Date.now() >= expiresAt) return;

  const TOTAL = 5 * 60 * 1000;

  // Use shadow root if available, otherwise body
  const container = shadowRoot || document.body;

  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483645;
    background: rgba(15,15,20,0.92); color: white; font-family: system-ui, sans-serif;
    display: flex; flex-direction: column; pointer-events: auto;
  `;

  const textRow = document.createElement('div');
  textRow.style.cssText = `
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 16px; font-size: 13px; font-weight: 500;
  `;

  const label = document.createElement('span');
  label.textContent = 'Focus pass active';

  const timer = document.createElement('span');
  timer.style.cssText = 'font-family: monospace; color: #60a5fa; font-size: 14px;';

  const track = document.createElement('div');
  track.style.cssText = 'width: 100%; height: 3px; background: rgba(255,255,255,0.1); position: relative;';

  const fill = document.createElement('div');
  fill.style.cssText = `
    position: absolute; top: 0; left: 0; height: 100%; background: #2563eb;
    transition: width 1s linear; width: 0%;
  `;

  textRow.appendChild(label);
  textRow.appendChild(timer);
  track.appendChild(fill);
  bar.appendChild(textRow);
  bar.appendChild(track);
  container.appendChild(bar);

  function update() {
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0) {
      bar.remove();
      clearInterval(interval);
      return;
    }

    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const pct = ((TOTAL - remaining) / TOTAL) * 100;
    fill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  update();
  const interval = setInterval(update, 1000);
}
