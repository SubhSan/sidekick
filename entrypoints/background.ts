
import { installRouter, registerHandler } from '../lib/messages';
import { store } from '../lib/storage';
import { groupTabsSimple, findDuplicateTabs, closeDuplicateTabs, saveSession, restoreSession, defaultSessionName } from '../lib/tabs';
import { saveReadLater } from '../lib/readlater';
import { callGroq } from '../lib/groq';
import { PROMPTS } from '../lib/prompts';
import { splitTasksSimple } from '../lib/tasks-pure';
import dayjs from 'dayjs';

// Domain -> unix ms expiry time
const passExpiry = new Map<string, number>();
const lastTabUrl = new Map<number, string>();

async function applyFocusRules() {
  const [focusOn, blocklist] = await Promise.all([
    store.focusModeOn.getValue(),
    store.blocklist.getValue()
  ]);

  // Clear existing dynamic rules first
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIds = existingRules.map(r => r.id);
  
  if (ruleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds });
  }

  if (focusOn && blocklist.length > 0) {
    const blockedBase = chrome.runtime.getURL('blocked.html');
    const newRules: chrome.declarativeNetRequest.Rule[] = [];

    for (const domain of blocklist) {
      if (passExpiry.has(domain)) continue; // skip blocked rules for passes

      let hash = 0;
      for (let i = 0; i < domain.length; i++) hash = Math.imul(31, hash) + domain.charCodeAt(i) | 0;
      const ruleId = Math.abs(hash % 4000) + 1;

      newRules.push({
        id: ruleId,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: { url: `${blockedBase}?domain=${domain}` }
        },
        condition: {
          urlFilter: `||${domain}^`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      });
    }

    if (newRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules });
    }

    // Redirect any currently open tabs
    const tabs = await chrome.tabs.query({ windowType: 'normal' });
    for (const tab of tabs) {
      if (tab.id && tab.url) {
        try {
          const urlObj = new URL(tab.url);
          for (const domain of blocklist) {
            if (urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)) {
              if (!passExpiry.has(domain)) {
                await chrome.tabs.update(tab.id, { url: `${blockedBase}?domain=${domain}` });
                break;
              }
            }
          }
        } catch (e) {
          // ignore invalid URLs
        }
      }
    }
  }
}

// ─── Tab Nudge ──────────────────────────────────────
async function checkTabNudge() {
  const tabs = await chrome.tabs.query({});
  const tabCount = tabs.length;
  const settings = await store.settings.getValue();
  const threshold = settings.tabNudgeThreshold || 20;

  if (tabCount < threshold) {
    // Reset nudge state if count drops below threshold
    await chrome.storage.local.set({ nudgeState: { firedAt: 0, threshold: 0 } });
    return;
  }

  // Check if we already fired for this threshold
  const result = await chrome.storage.local.get('nudgeState');
  const nudgeState = result.nudgeState || { firedAt: 0, threshold: 0 };
  if (nudgeState.threshold === threshold && nudgeState.firedAt > 0) {
    return; // already notified
  }

  // Fire notification
  chrome.notifications.create('tab-nudge', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon/128.png'),
    title: 'Too many tabs!',
    message: `You have ${tabCount} tabs open. Want to group them?`,
    buttons: [{ title: 'Group them' }],
    priority: 1,
  });

  await chrome.storage.local.set({ nudgeState: { firedAt: Date.now(), threshold } });
}

export default defineBackground(() => {
  installRouter();

  // Track destination URLs (bypassing the fact that tab.url becomes blocked.html after redirect)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url && !changeInfo.url.startsWith('chrome-extension://') && !changeInfo.url.includes('blocked.html')) {
      lastTabUrl.set(tabId, changeInfo.url);
    }
  });

  // Re-arm focus blocks after passes expire
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name.startsWith('focus-pass-rearm-')) {
      const domain = alarm.name.replace('focus-pass-rearm-', '');
      passExpiry.delete(domain);
      applyFocusRules();
    } else if (alarm.name === 'pomodoro-end') {
      const state = await store.pomodoro.getValue();
      if (state && state.status === 'running') {
        const isWork = state.mode === 'work';
        const today = dayjs().format('YYYY-MM-DD');
        
        const nextMode = isWork ? 'break' : 'work';
        const updatedCompleted = isWork ? (state.lastDate === today ? state.completedToday + 1 : 1) : state.completedToday;
        
        const monthHistory = { ...(state.monthHistory || {}) };
        if (isWork) {
          monthHistory[today] = (monthHistory[today] || 0) + 1;
        }
        
        await store.pomodoro.setValue({
          ...state,
          status: 'idle',
          mode: nextMode,
          timeLeft: isWork ? state.breakDuration : state.workDuration,
          endTime: undefined,
          completedToday: updatedCompleted,
          lastDate: today,
          monthHistory,
        });

        // Notify user
        chrome.notifications.create('pomodoro-notify', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon/128.png'),
          title: isWork ? 'Work session complete!' : "Break's over!",
          message: isWork ? 'Great job! Time to take a well-deserved break.' : 'Let\'s get back to work!',
          priority: 1,
        });
      }
    }
  });

  // ─── Tab Nudge listeners ───────────────────────────
  chrome.tabs.onCreated.addListener(() => checkTabNudge());
  chrome.tabs.onRemoved.addListener(() => checkTabNudge());
  checkTabNudge(); // run once on startup

  chrome.notifications.onButtonClicked.addListener((notifId, buttonIdx) => {
    if (notifId === 'tab-nudge' && buttonIdx === 0) {
      groupTabsSimple();
    }
  });

  // ─── Core Handlers ────────────────────────────────

  registerHandler('FOCUS_APPLY', async () => {
    await applyFocusRules();
    return true;
  });

  registerHandler('FOCUS_PASS', async (payload) => {
    if (!payload) return false;
    const { domain } = payload;
    passExpiry.set(domain, Date.now() + 5 * 60 * 1000);
    chrome.alarms.create(`focus-pass-rearm-${domain}`, { delayInMinutes: 5 });
    await applyFocusRules();
    return true;
  });

  registerHandler('GET_LAST_URL', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0 && tabs[0].id) {
      return lastTabUrl.get(tabs[0].id);
    }
    return undefined;
  });

  registerHandler('GET_PASS_STATE', async () => {
    // Check if any pass is currently active
    const now = Date.now();
    let maxExpiry = 0;
    for (const expiry of passExpiry.values()) {
      if (expiry > now && expiry > maxExpiry) {
        maxExpiry = expiry;
      }
    }
    if (maxExpiry > 0) {
      return { active: true, expiresAt: maxExpiry };
    }
    return { active: false, expiresAt: 0 };
  });

  registerHandler('TABS_GROUP', async () => {
    await groupTabsSimple();
    return true;
  });

  registerHandler('TABS_DEDUPE', async () => {
    const dupes = await findDuplicateTabs();
    const closeIds = dupes.flatMap(d => d.closeIds);
    await closeDuplicateTabs(closeIds);
    return { closed: closeIds.length };
  });

  registerHandler('SESSION_SAVE', async (payload) => {
    const name = payload?.name || defaultSessionName();
    await saveSession(name);
    return true;
  });

  registerHandler('SESSION_RESTORE', async (payload) => {
    if (!payload?.id) return false;
    await restoreSession(payload.id);
    return true;
  });

  registerHandler('KEY_TEST', async (payload) => {
    if (!payload?.key) return false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${payload.key}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  });

  // ─── Pomodoro Handlers ────────────────────────────────
  registerHandler('POMODORO_START', async () => {
    const state = await store.pomodoro.getValue();
    if (!state) return false;
    
    // Check if we need to reset completed count (new day)
    const today = dayjs().format('YYYY-MM-DD');
    let completedToday = state.completedToday;
    if (state.lastDate !== today) {
      completedToday = 0;
    }

    const defaultDuration = state.mode === 'work' 
      ? state.workDuration 
      : (state.mode === 'longBreak' ? (state.longBreakDuration || 15 * 60) : state.breakDuration);
    const duration = state.timeLeft ?? defaultDuration;
    const endTime = Date.now() + duration * 1000;
    
    await store.pomodoro.setValue({
      ...state,
      status: 'running',
      endTime,
      timeLeft: undefined,
      completedToday,
      lastDate: today,
    });
    
    chrome.alarms.create('pomodoro-end', { when: endTime });
    return true;
  });

  registerHandler('POMODORO_PAUSE', async () => {
    const state = await store.pomodoro.getValue();
    if (!state || state.status !== 'running' || !state.endTime) return false;
    
    const timeLeft = Math.max(0, Math.floor((state.endTime - Date.now()) / 1000));
    await store.pomodoro.setValue({
      ...state,
      status: 'paused',
      timeLeft,
      endTime: undefined,
    });
    
    chrome.alarms.clear('pomodoro-end');
    return true;
  });

  registerHandler('POMODORO_STOP', async () => {
    const state = await store.pomodoro.getValue();
    if (!state) return false;
    
    const defaultDuration = state.mode === 'work' 
      ? state.workDuration 
      : (state.mode === 'longBreak' ? (state.longBreakDuration || 15 * 60) : state.breakDuration);

    await store.pomodoro.setValue({
      ...state,
      status: 'idle',
      timeLeft: defaultDuration,
      endTime: undefined,
    });
    
    chrome.alarms.clear('pomodoro-end');
    return true;
  });

  registerHandler('POMODORO_SET_MODE', async (payload) => {
    const state = await store.pomodoro.getValue();
    if (!state || !payload?.mode) return false;

    chrome.alarms.clear('pomodoro-end');
    const mode = payload.mode;
    const defaultDuration = mode === 'work' 
      ? state.workDuration 
      : (mode === 'longBreak' ? (state.longBreakDuration || 15 * 60) : state.breakDuration);

    await store.pomodoro.setValue({
      ...state,
      mode,
      status: 'idle',
      timeLeft: defaultDuration,
      endTime: undefined,
    });
    return true;
  });

  registerHandler('POMODORO_UPDATE_SETTINGS', async (payload) => {
    const state = await store.pomodoro.getValue();
    if (!state || !payload) return false;
    
    const wasIdle = state.status === 'idle';
    const longBreakDuration = payload.longBreakDuration ?? state.longBreakDuration ?? 15 * 60;
    
    let nextTimeLeft = state.timeLeft;
    if (wasIdle) {
      if (state.mode === 'work') nextTimeLeft = payload.workDuration;
      else if (state.mode === 'longBreak') nextTimeLeft = longBreakDuration;
      else nextTimeLeft = payload.breakDuration;
    }
    
    await store.pomodoro.setValue({
      ...state,
      workDuration: payload.workDuration,
      breakDuration: payload.breakDuration,
      longBreakDuration,
      timeLeft: nextTimeLeft,
    });
    return true;
  });

  // ─── Read Later ──────────────────────────────────────
  registerHandler('READ_LATER_SAVE', async (payload) => {
    if (!payload) return false;
    await saveReadLater({
      url: payload.url,
      title: payload.title,
      favicon: payload.favicon || '',
      excerpt: payload.excerpt || '',
      source: 'simple',
    });
    return true;
  });

  // ─── Open Reader Mode ──────────────────────────────────
  let readerSlotCounter = 0;
  registerHandler('OPEN_READER', async (payload) => {
    if (!payload?.url) return false;
    // Find the tab with this URL to extract article content
    const tabs = await chrome.tabs.query({});
    const tab = tabs.find(t => t.url === payload.url) || tabs.find(t => t.active);

    if (!tab?.id) return false;

    try {
      // Ask content script to extract article
      const article = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_ARTICLE' });
      if (!article || !article.textContent || article.textContent.length < 500) {
        return false;
      }

      // Save to a storage slot
      const slotKey = `reader-slot-${readerSlotCounter++}`;
      const articleData = {
        title: article.title || tab.title || 'Untitled',
        content: article.content,
        textContent: article.textContent,
        length: article.length || article.textContent.length,
        sourceUrl: payload.url,
      };

      await chrome.storage.local.set({ [slotKey]: articleData });

      // Open reader page
      const readerUrl = chrome.runtime.getURL(`reader.html?slot=${slotKey}`);
      await chrome.tabs.create({ url: readerUrl });

      return true;
    } catch (e) {
      console.error('Reader extraction failed:', e);
      return false;
    }
  });

  // ─── Bookmark Page (with duplicate check) ──────────────
  registerHandler('BOOKMARK_PAGE', async (payload) => {
    if (!payload?.url) return false;
    // Check for existing bookmark
    const existing = await chrome.bookmarks.search({ url: payload.url });
    if (existing.length > 0) {
      throw new Error('Already bookmarked');
    }
    await chrome.bookmarks.create({
      title: payload.title || payload.url,
      url: payload.url,
    });
    return true;
  });

  // ─── Screenshot ────────────────────────────────────────
  registerHandler('SCREENSHOT', async () => {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(undefined!, { format: 'png' });
      const filename = `sidekick-screenshot-${dayjs().format('YYYY-MM-DD-HH-mm')}.png`;
      await chrome.downloads.download({
        url: dataUrl,
        filename,
        saveAs: false,
      });
      return true;
    } catch (e) {
      console.error('Screenshot failed:', e);
      return false;
    }
  });

  // ─── AI Handlers ───────────────────────────────────────

  registerHandler('AI_SPLIT', async (payload) => {
    if (!payload?.raw) return [];
    const result = await callGroq<{ tasks: string[] }>({
      task: 'split',
      model: 'fast',
      json: true,
      messages: [
        { role: 'system', content: PROMPTS.split.system },
        { role: 'user', content: PROMPTS.split.user(payload.raw) },
      ],
    });
    if (result.ok && 'obj' in result && result.obj?.tasks?.length) {
      return result.obj.tasks;
    }
    // Fallback to simple split
    return splitTasksSimple(payload.raw);
  });

  registerHandler('AI_GROUP', async (payload) => {
    if (!payload?.tabs?.length) return [];
    const tabSlice = payload.tabs.slice(0, 60);
    const result = await callGroq<{ groups: Array<{ label: string; indices: number[] }> }>({
      task: 'group',
      model: 'fast',
      json: true,
      messages: [
        { role: 'system', content: PROMPTS.group.system },
        { role: 'user', content: PROMPTS.group.user(tabSlice) },
      ],
    });
    if (result.ok && 'obj' in result && result.obj?.groups?.length) {
      // Verify index coverage
      const allIndices = new Set(tabSlice.map(t => t.i));
      const usedIndices = new Set(result.obj.groups.flatMap(g => g.indices));
      const missing = [...allIndices].filter(i => !usedIndices.has(i));
      if (missing.length > 0) {
        // Add missing to an "Other" group
        result.obj.groups.push({ label: 'Other', indices: missing });
      }
      return result.obj.groups;
    }
    throw new Error('AI grouping failed');
  });

  registerHandler('AI_TAG', async (payload) => {
    if (!payload) return [];
    const result = await callGroq<{ tags: string[] }>({
      task: 'tag',
      model: 'fast',
      json: true,
      messages: [
        { role: 'system', content: PROMPTS.tag.system },
        { role: 'user', content: PROMPTS.tag.user(payload.title, payload.url, payload.metaDescription) },
      ],
    });
    if (result.ok && 'obj' in result && result.obj?.tags?.length) {
      return result.obj.tags;
    }
    return [];
  });

  registerHandler('AI_QUERY_EXPAND', async (payload) => {
    if (!payload?.query) return { terms: [payload?.query || ''] };
    const result = await callGroq<{ terms: string[] }>({
      task: 'queryExpand',
      model: 'fast',
      json: true,
      messages: [
        { role: 'system', content: PROMPTS.queryExpand.system },
        { role: 'user', content: PROMPTS.queryExpand.user(payload.query) },
      ],
    });
    if (result.ok && 'obj' in result && result.obj?.terms?.length) {
      return { terms: [payload.query, ...result.obj.terms] };
    }
    return { terms: [payload.query] };
  });

  registerHandler('AI_EXPLAIN', async (payload) => {
    if (!payload?.text) throw new Error('No text provided');
    const result = await callGroq({
      task: 'explain',
      model: 'quality',
      messages: [
        { role: 'system', content: PROMPTS.explain.system },
        { role: 'user', content: PROMPTS.explain.user(payload.text, payload.pageTitle) },
      ],
    });
    if (result.ok && 'text' in result) {
      return result.text;
    }
    if (!result.ok) throw new Error(result.error.message);
    return '';
  });

  registerHandler('AI_JARGON', async (payload) => {
    if (!payload?.term) throw new Error('No term provided');

    // Check LRU cache first (500 items, 30-day TTL)
    const cache = await store.jargonCache.getValue();
    const cacheKey = payload.term.toLowerCase().trim();
    const cached = cache[cacheKey];
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    if (cached && (Date.now() - cached.at) < THIRTY_DAYS) {
      return cached.def;
    }

    const result = await callGroq({
      task: 'jargon',
      model: 'fast',
      messages: [
        { role: 'system', content: PROMPTS.jargon.system },
        { role: 'user', content: PROMPTS.jargon.user(payload.term, payload.sentenceContext) },
      ],
    });
    if (result.ok && 'text' in result) {
      // Update cache with LRU eviction
      const updated = { ...cache, [cacheKey]: { def: result.text, at: Date.now() } };
      const keys = Object.keys(updated);
      if (keys.length > 500) {
        // Evict oldest entries
        const sorted = keys.sort((a, b) => updated[a].at - updated[b].at);
        const toRemove = sorted.slice(0, keys.length - 500);
        for (const k of toRemove) delete updated[k];
      }
      await store.jargonCache.setValue(updated);
      return result.text;
    }
    if (!result.ok) throw new Error(result.error.message);
    return '';
  });

  registerHandler('AI_SUMMARIZE', async (payload) => {
    if (!payload?.articleText) throw new Error('No article text provided');
    const result = await callGroq({
      task: 'summarize',
      model: 'fast',
      messages: [
        { role: 'system', content: PROMPTS.summarize.system },
        { role: 'user', content: PROMPTS.summarize.user(payload.articleText) },
      ],
    });
    if (result.ok && 'text' in result) {
      return result.text;
    }
    if (!result.ok) throw new Error(result.error.message);
    return '';
  });

  registerHandler('AI_ASK_TABS', async (payload) => {
    if (!payload?.question || !payload?.tabIds?.length) throw new Error('No question or tabs provided');

    // Extract text from each tab via scripting API
    const tabContents: Array<{ title: string; text: string; url: string }> = [];

    for (const tabId of payload.tabIds) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => ({ title: document.title, text: document.body?.innerText?.slice(0, 3500) || '', url: location.href }),
        });
        if (results?.[0]?.result?.text) {
          tabContents.push(results[0].result);
        }
      } catch {
        // Silently skip tabs that cannot be scripted (chrome://, PDF, discarded)
      }
    }

    if (tabContents.length === 0) {
      return "Couldn't read any of the selected tabs.";
    }

    const totalChars = tabContents.reduce((sum, t) => sum + t.text.length, 0);

    if (totalChars <= 12000) {
      // Single call with quality model
      const combined = tabContents.map(t => `--- Tab: ${t.title} (${t.url}) ---\n${t.text}`).join('\n\n');
      const result = await callGroq({
        task: 'askTabs',
        model: 'quality',
        messages: [
          { role: 'system', content: PROMPTS.askTabs.system },
          { role: 'user', content: PROMPTS.askTabs.userSingle(payload.question, combined) },
        ],
      });
      if (result.ok && 'text' in result) return result.text;
      if (!result.ok) throw new Error(result.error.message);
      return '';
    }

    // Map-reduce for large content
    // Map phase: fast model, per-tab
    const summaries: string[] = [];
    for (const tab of tabContents) {
      const mapResult = await callGroq({
        task: 'askTabs-map',
        model: 'fast',
        maxTokens: 200,
        messages: [
          { role: 'system', content: PROMPTS.askTabs.system },
          { role: 'user', content: PROMPTS.askTabs.userMap(payload.question, tab.title, tab.text) },
        ],
      });
      if (mapResult.ok && 'text' in mapResult && mapResult.text !== 'IRRELEVANT') {
        summaries.push(`[${tab.title}]: ${mapResult.text}`);
      }
    }

    if (summaries.length === 0) {
      return "The selected tabs don't contain relevant information about your question.";
    }

    // Reduce phase: quality model
    const reduceResult = await callGroq({
      task: 'askTabs-reduce',
      model: 'quality',
      messages: [
        { role: 'system', content: PROMPTS.askTabs.system },
        { role: 'user', content: PROMPTS.askTabs.userReduce(payload.question, summaries.join('\n\n---\n\n')) },
      ],
    });
    if (reduceResult.ok && 'text' in reduceResult) return reduceResult.text;
    if (!reduceResult.ok) throw new Error(reduceResult.error.message);
    return '';
  });

  // ─── Context menus -- register once on install ──────────
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: 'save-read-later', title: 'Save to Read Later', contexts: ['page'] });
    chrome.contextMenus.create({ id: 'open-reader', title: 'Open in Reading Mode', contexts: ['page'] });
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;
    if (info.menuItemId === 'save-read-later') {
      const url = tab.url || '';
      const title = tab.title || url;
      // Try to get an excerpt from the content script
      let excerpt = title.slice(0, 200);
      try {
        const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_EXCERPT' });
        if (res?.excerpt) excerpt = res.excerpt;
      } catch { /* ignore */ }
      
      await saveReadLater({
        url,
        title,
        favicon: tab.favIconUrl || '',
        excerpt,
        source: 'simple',
      });
    }

    if (info.menuItemId === 'open-reader') {
      // Reuse the OPEN_READER handler logic
      try {
        const article = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_ARTICLE' });
        if (article && article.textContent && article.textContent.length >= 500) {
          const slotKey = `reader-slot-${readerSlotCounter++}`;
          await chrome.storage.local.set({
            [slotKey]: {
              title: article.title || tab.title || 'Untitled',
              content: article.content,
              textContent: article.textContent,
              length: article.length || article.textContent.length,
              sourceUrl: tab.url || '',
            },
          });
          const readerUrl = chrome.runtime.getURL(`reader.html?slot=${slotKey}`);
          await chrome.tabs.create({ url: readerUrl });
        }
      } catch (e) {
        console.error('Reader from context menu failed:', e);
      }
    }
  });
});
