// lib/tasks-pure.ts - Pure task manipulation functions (no storage, safe for tests)
import type { Task } from './storage';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Removes tasks that are done AND were created more than 7 days ago.
 */
export function pruneTasks(tasks: Task[]): Task[] {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  return tasks.filter((t) => !(t.done && t.createdAt < cutoff));
}

/**
 * Returns true if the input should trigger the split preview.
 * Triggers on: newlines, semicolons, commas, or length > 80 chars.
 */
export function hasSplitTrigger(input: string): boolean {
  if (input.length > 80) return true;
  return /[;\n,]/.test(input);
}

/**
 * Splits raw text into individual task strings.
 * Splits on newlines, semicolons, commas.
 * Also splits on " and " for fragments longer than 25 chars.
 */
export function splitTasksSimple(raw: string): string[] {
  // First split on newlines, semicolons, commas
  let parts = raw.split(/[\n;,]+/);

  // For long fragments, also split on " and "
  const result: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.length > 25 && / and /i.test(trimmed)) {
      const subparts = trimmed.split(/ and /i).map((s) => s.trim()).filter(Boolean);
      result.push(...subparts);
    } else {
      result.push(trimmed);
    }
  }

  return result.filter(Boolean);
}
