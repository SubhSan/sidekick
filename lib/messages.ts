// lib/messages.ts - Typed messaging contract for Sidekick extension
// UI surfaces NEVER call fetch or privileged Chrome APIs directly.
// Every operation goes through chrome.runtime.sendMessage.

export type Msg =
  | { type: 'PING'; payload?: undefined }
  | { type: 'FOCUS_APPLY'; payload?: undefined }
  | { type: 'FOCUS_PASS'; payload: { domain: string; returnUrl: string } }
  | { type: 'GET_LAST_URL'; payload?: undefined }
  | { type: 'GET_PASS_STATE'; payload?: undefined }
  | { type: 'WEATHER_GET'; payload?: undefined }
  | { type: 'TABS_GROUP'; payload?: undefined }
  | { type: 'TABS_DEDUPE'; payload?: undefined }
  | { type: 'SESSION_SAVE'; payload: { name: string } }
  | { type: 'SESSION_RESTORE'; payload: { id: string } }
  | { type: 'READ_LATER_SAVE'; payload: { url: string; title: string; excerpt: string; favicon?: string } }
  | { type: 'OPEN_READER'; payload: { url: string } }
  | { type: 'BOOKMARK_PAGE'; payload: { url: string; title: string } }
  | { type: 'SCREENSHOT'; payload?: undefined }
  | { type: 'AI_EXPLAIN'; payload: { text: string; pageTitle?: string; url?: string } }
  | { type: 'AI_JARGON'; payload: { term: string; sentenceContext: string } }
  | { type: 'AI_SPLIT'; payload: { raw: string } }
  | { type: 'AI_TAG'; payload: { title: string; url: string; metaDescription?: string } }
  | { type: 'AI_GROUP'; payload: { tabs: Array<{ i: number; title: string; host: string }> } }
  | { type: 'AI_ASK_TABS'; payload: { question: string; tabIds: number[] } }
  | { type: 'AI_SUMMARIZE'; payload: { articleText: string } }
  | { type: 'AI_QUERY_EXPAND'; payload: { query: string } }
  | { type: 'KEY_TEST'; payload: { key: string } }
  | { type: 'TABS_FIND'; payload: { query: string } }
  | { type: 'POMODORO_START'; payload?: undefined }
  | { type: 'POMODORO_PAUSE'; payload?: undefined }
  | { type: 'POMODORO_STOP'; payload?: undefined }
  | { type: 'POMODORO_SET_MODE'; payload: { mode: 'work' | 'break' | 'longBreak' } }
  | { type: 'POMODORO_UPDATE_SETTINGS'; payload: { workDuration: number; breakDuration: number; longBreakDuration?: number } };

export type Ok<D> = { ok: true; data: D };
export type Err = { ok: false; error: { code: string; message: string } };
export type Envelope<D> = Ok<D> | Err;

// sendMsg - typed wrapper for chrome.runtime.sendMessage
// Call from any UI surface (newtab, popup, options, content script)
export function sendMsg<D = unknown>(msg: Msg): Promise<Envelope<D>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response: Envelope<D>) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          error: { code: 'RUNTIME_ERROR', message: chrome.runtime.lastError.message ?? 'Unknown error' },
        });
      } else {
        resolve(response ?? { ok: false, error: { code: 'NO_RESPONSE', message: 'No response from background' } });
      }
    });
  });
}

type Handler<P, D> = (payload: P) => Promise<D>;
type MsgType = Msg['type'];

// Map of type -> handler registered in background
const _handlers = new Map<MsgType, Handler<unknown, unknown>>();

// registerHandler - called from background.ts to register handlers
export function registerHandler<T extends MsgType>(
  type: T,
  handler: (payload: Extract<Msg, { type: T }>['payload']) => Promise<unknown>
): void {
  _handlers.set(type, handler as Handler<unknown, unknown>);
}

// installRouter - call once in background.ts defineBackground
export function installRouter(): void {
  chrome.runtime.onMessage.addListener((msg: Msg, _sender, sendResponse) => {
    const handler = _handlers.get(msg.type);
    if (!handler) {
      sendResponse({ ok: false, error: { code: 'UNKNOWN_TYPE', message: `No handler for ${msg.type}` } });
      return false;
    }
    handler(msg.payload)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err: Error) =>
        sendResponse({ ok: false, error: { code: 'HANDLER_ERROR', message: err?.message ?? String(err) } })
      );
    return true; // keep the channel open for async response
  });
}
