// lib/tasks.ts - Task CRUD operations
export { pruneTasks, hasSplitTrigger, splitTasksSimple } from './tasks-pure';

import { store } from './storage';
import type { Task } from './storage';
import { pruneTasks } from './tasks-pure';

/**
 * Adds a single task.
 */
export async function addTask(text: string): Promise<void> {
  const tasks = await store.tasks.getValue();
  const newTask: Task = {
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
  };
  await store.tasks.setValue([...tasks, newTask]);
}

/**
 * Adds multiple tasks.
 */
export async function addTasks(texts: string[]): Promise<void> {
  const tasks = await store.tasks.getValue();
  const newTasks: Task[] = texts.map((text) => ({
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
  }));
  await store.tasks.setValue([...tasks, ...newTasks]);
}

/**
 * Toggles a task's done state.
 */
export async function toggleTask(id: string, done: boolean): Promise<void> {
  const tasks = await store.tasks.getValue();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    const newTasks = [...tasks];
    newTasks[idx] = { ...newTasks[idx], done };
    await store.tasks.setValue(newTasks);
  }
}

/**
 * Deletes a task by ID.
 */
export async function deleteTask(id: string): Promise<void> {
  const tasks = await store.tasks.getValue();
  await store.tasks.setValue(tasks.filter((t) => t.id !== id));
}

/**
 * Gets all tasks.
 */
export async function getTasks(): Promise<Task[]> {
  return await store.tasks.getValue();
}

/**
 * Prunes completed tasks older than 7 days and saves back to storage.
 */
export async function pruneTasksAndSave(): Promise<void> {
  const tasks = await store.tasks.getValue();
  const pruned = pruneTasks(tasks);
  if (pruned.length !== tasks.length) {
    await store.tasks.setValue(pruned);
  }
}
