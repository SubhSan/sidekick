import { describe, it, expect } from 'vitest';
import { parseCommand, buildSearchUrl } from '../lib/command';

describe('command parser', () => {
  it('parses tasks', () => {
    expect(parseCommand('t buy milk')).toEqual({ kind: 'task', value: 'buy milk' });
    expect(parseCommand('todo write code')).toEqual({ kind: 'task', value: 'write code' });
  });

  it('parses focus', () => {
    expect(parseCommand('f deep work')).toEqual({ kind: 'focus', value: 'deep work' });
  });

  it('parses bookmarks', () => {
    expect(parseCommand('b react')).toEqual({ kind: 'bookmark', value: 'react' });
    expect(parseCommand('b')).toEqual({ kind: 'bookmark', value: '' });
  });

  it('parses bare domains', () => {
    expect(parseCommand('reddit.com')).toEqual({ kind: 'url', value: 'https://reddit.com' });
    expect(parseCommand('news.ycombinator.com')).toEqual({ kind: 'url', value: 'https://news.ycombinator.com' });
  });

  it('parses full URLs', () => {
    expect(parseCommand('https://github.com')).toEqual({ kind: 'url', value: 'https://github.com' });
    expect(parseCommand('http://localhost:3000')).toEqual({ kind: 'url', value: 'http://localhost:3000' });
  });

  it('falls back to search', () => {
    expect(parseCommand('how to center a div')).toEqual({ kind: 'search', value: 'how to center a div' });
    expect(parseCommand('cat pictures')).toEqual({ kind: 'search', value: 'cat pictures' });
  });
});

describe('search URL builder', () => {
  it('builds google search URL', () => {
    expect(buildSearchUrl('hello world', 'google')).toBe('https://www.google.com/search?q=hello+world');
  });

  it('builds duckduckgo search URL', () => {
    expect(buildSearchUrl('hello world', 'duckduckgo')).toBe('https://duckduckgo.com/?q=hello+world');
  });

  it('builds bing search URL', () => {
    expect(buildSearchUrl('hello world', 'bing')).toBe('https://www.bing.com/search?q=hello+world');
  });
});
