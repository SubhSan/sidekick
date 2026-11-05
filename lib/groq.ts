// lib/groq.ts - Groq API client
import { store } from './storage';
import { MODELS, AI_ERROR_STRINGS, stripJsonFences } from './groq-pure';
import type { ModelKey, GroqErrorCode, GroqError } from './groq-pure';

export { MODELS, AI_ERROR_STRINGS, stripJsonFences } from './groq-pure';
export type { ModelKey, GroqErrorCode, GroqError } from './groq-pure';

export interface CallGroqOptions {
  task: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: ModelKey;
  json?: boolean;
  maxTokens?: number;
}

export type GroqResult<T = string> =
  | { ok: true; text: string }
  | { ok: true; obj: T }
  | { ok: false; error: GroqError };

export async function callGroq<T = string>(opts: CallGroqOptions): Promise<GroqResult<T>> {
  const settings = await store.settings.getValue();
  if (!settings.aiMode) {
    return { ok: false, error: { code: 'AI_OFF', message: AI_ERROR_STRINGS.AI_OFF } };
  }
  const key = await store.groqKey.getValue();
  if (!key) {
    return { ok: false, error: { code: 'NO_KEY', message: AI_ERROR_STRINGS.NO_KEY } };
  }

  const modelName = MODELS[opts.model || 'quality'];
  const messages = [...opts.messages];
  if (opts.json) {
    messages.push({
      role: 'user',
      content: 'Respond with ONLY valid JSON, no prose, no markdown fences.'
    });
  }

  const requestBody: any = {
    model: modelName,
    messages,
    temperature: 0.3,
  };
  if (opts.json) {
    requestBody.response_format = { type: 'json_object' };
  }
  if (opts.maxTokens) {
    requestBody.max_tokens = opts.maxTokens;
  }

  async function attemptFetch(): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res;
    } catch (e: any) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  let response: Response;
  try {
    response = await attemptFetch();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { ok: false, error: { code: 'TIMEOUT', message: AI_ERROR_STRINGS.TIMEOUT } };
    }
    return { ok: false, error: { code: 'NETWORK', message: AI_ERROR_STRINGS.NETWORK } };
  }

  // Handle Retry Policy
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('retry-after');
    const retryAfter = retryAfterHeader ? parseFloat(retryAfterHeader) : 1;
    const waitMs = Math.min(retryAfter * 1000, 5000);
    await new Promise(resolve => setTimeout(resolve, waitMs));
    try {
      response = await attemptFetch();
    } catch (err: any) {
      if (err.name === 'AbortError') return { ok: false, error: { code: 'TIMEOUT', message: AI_ERROR_STRINGS.TIMEOUT } };
      return { ok: false, error: { code: 'NETWORK', message: AI_ERROR_STRINGS.NETWORK } };
    }
  } else if (response.status >= 500) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      response = await attemptFetch();
    } catch (err: any) {
      if (err.name === 'AbortError') return { ok: false, error: { code: 'TIMEOUT', message: AI_ERROR_STRINGS.TIMEOUT } };
      return { ok: false, error: { code: 'NETWORK', message: AI_ERROR_STRINGS.NETWORK } };
    }
  }

  // Parse response
  if (!response.ok) {
    if (response.status === 401) {
      return { ok: false, error: { code: 'BAD_KEY', message: AI_ERROR_STRINGS.BAD_KEY } };
    }
    if (response.status === 429) {
      return { ok: false, error: { code: 'RATE_LIMIT', message: AI_ERROR_STRINGS.RATE_LIMIT } };
    }
    return { ok: false, error: { code: 'SERVER', message: AI_ERROR_STRINGS.SERVER } };
  }

  let jsonRes: any;
  try {
    jsonRes = await response.json();
  } catch {
    return { ok: false, error: { code: 'BAD_JSON', message: AI_ERROR_STRINGS.BAD_JSON } };
  }

  const choiceText = jsonRes.choices?.[0]?.message?.content;
  if (!choiceText) {
    return { ok: false, error: { code: 'SERVER', message: 'No response content from Groq' } };
  }

  if (opts.json) {
    const cleanedText = stripJsonFences(choiceText);
    try {
      const obj = JSON.parse(cleanedText) as T;
      return { ok: true, obj };
    } catch {
      return { ok: false, error: { code: 'BAD_JSON', message: AI_ERROR_STRINGS.BAD_JSON } };
    }
  }

  return { ok: true, text: choiceText };
}

export async function testGroqKey(key: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
