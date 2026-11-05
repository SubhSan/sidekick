// lib/groq-pure.ts - Pure AI functions (no storage, safe for tests)

export const MODELS = {
  quality: 'llama-3.3-70b-versatile',
  fast: 'llama-3.1-8b-instant',
};

export const AI_ERROR_STRINGS: Record<string, string> = {
  AI_OFF: 'This needs AI Mode - turn it on in Settings.',
  NO_KEY: 'Add your Groq key in Settings to use this.',
  BAD_KEY: 'Your Groq key was rejected - re-check it in Settings.',
  RATE_LIMIT: "Groq's free limit hit - try again in a minute.",
  NETWORK: "Couldn't reach the AI - check your connection.",
  TIMEOUT: "Couldn't reach the AI - check your connection.",
  BAD_JSON: 'AI returned invalid data - try again.',
  SERVER: 'AI service error - try again.',
};

/**
 * Strips markdown fences from a JSON string.
 */
export function stripJsonFences(text: string): string {
  return text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
}
