// lib/command.ts - Command search parser

export type CommandPrefix = 'task' | 'focus' | 'bookmark' | 'url' | 'search';

export interface ParsedCommand {
  kind: CommandPrefix;
  value: string;
}

const URL_REGEX = /^((https?|ftp):\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;

/**
 * Parses user input into a recognized command kind.
 */
export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  
  if (trimmed.startsWith('t ') || trimmed.startsWith('todo ')) {
    return { kind: 'task', value: trimmed.replace(/^(t|todo)\s+/, '').trim() };
  }
  
  if (trimmed.startsWith('f ')) {
    return { kind: 'focus', value: trimmed.replace(/^f\s+/, '').trim() };
  }
  
  if (trimmed.startsWith('b ') || input === 'b') {
    return { kind: 'bookmark', value: trimmed.startsWith('b ') ? trimmed.substring(2).trim() : '' };
  }

  // Check if it's a direct URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('ftp://') || URL_REGEX.test(trimmed)) {
    let url = trimmed;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ftp://')) {
      url = 'https://' + url;
    }
    return { kind: 'url', value: url };
  }

  return { kind: 'search', value: trimmed };
}

/**
 * Builds a search URL for a given query and engine.
 */
export function buildSearchUrl(query: string, engine: 'google' | 'duckduckgo' | 'bing'): string {
  const q = encodeURIComponent(query).replace(/%20/g, '+');
  switch (engine) {
    case 'duckduckgo':
      return `https://duckduckgo.com/?q=${q}`;
    case 'bing':
      return `https://www.bing.com/search?q=${q}`;
    case 'google':
    default:
      return `https://www.google.com/search?q=${q}`;
  }
}
