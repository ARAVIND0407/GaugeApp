import type { Task, DailyFocusEntry } from "@/types/task";
export type { DailyFocusEntry } from "@/types/task";

// ── "HH:MM:SS" — used in task cards ───────────────────────────────────────
export const formatTime = (timeInSec: number): string => {
  const h = Math.floor(timeInSec / 3600);
  const m = Math.floor((timeInSec % 3600) / 60);
  const s = Math.floor(timeInSec % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

// ── "MM:SS" — used in focus timer ─────────────────────────────────────────
export const formatMinSec = (timeInSec: number): string => {
  const m = Math.floor(timeInSec / 60);
  const s = timeInSec % 60;
  return `${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
};

// ── "6s" / "14m" / "1h 32m" — used in stats bar ──────────────────────────
export const formatHuman = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};

// ── Total running time (past + current live session) ──────────────────────
export const getActiveTime = (task: Task): number =>
  task.startedAt !== null
    ? task.timeSpent + Math.floor((Date.now() - task.startedAt) / 1000)
    : task.timeSpent;

// ── Current session elapsed only ──────────────────────────────────────────
export const getSessionTime = (task: Task): number =>
  task.startedAt !== null
    ? Math.floor((Date.now() - task.startedAt) / 1000)
    : 0;

// ── Date key for a task's last-worked date ────────────────────────────────
export const getTaskDateKey = (task: Task): string | null => {
  if (!task.lastWorkedAt) return null;
  return new Date(task.lastWorkedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// ── Aggregate focus time per day ──────────────────────────────────────────
export const buildDailyFocusData = (tasks: Task[]): DailyFocusEntry[] => {
  const map: Record<string, number> = {};
  tasks.forEach((task) => {
    const key = getTaskDateKey(task);
    if (!key) return;
    map[key] = (map[key] ?? 0) + getActiveTime(task);
  });
  return Object.entries(map).map(([date, focusTime]) => ({ date, focusTime }));
};

// ── Sum of all focus time that was logged today ───────────────────────────
export const getTodayFocusTime = (tasks: Task[]): number => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  return tasks.reduce((sum, task) => {
    const workedToday =
      (task.lastWorkedAt && task.lastWorkedAt >= todayMs) ||
      (task.startedAt && task.startedAt >= todayMs);
    return workedToday ? sum + getActiveTime(task) : sum;
  }, 0);
};
