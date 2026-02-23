import type { Task } from "@/types/task";

// ── "HH:MM:SS" — used in task cards ───────────────────────────────────────
export const formatTime = (timeInSec: number): string => {
  const safe = Math.max(0, Math.floor(timeInSec));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

// ── "MM:SS" — used in focus timer ─────────────────────────────────────────
export const formatMinSec = (timeInSec: number): string => {
  const safe = Math.max(0, Math.floor(timeInSec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
};

// ── "6s" / "14m" / "1h 32m" — human readable ───────────────────────────────
export const formatHuman = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  if (safe < 60) return `${safe}s`;
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};

export const getActiveTime = (task: Task): number => {
  const elapsed =
    task.startedAt !== null
      ? Math.floor((Date.now() - task.startedAt) / 1000)
      : 0;
  return task.timeSpent + elapsed;
};

export const getSessionTime = (task: Task): number =>
  task.startedAt !== null
    ? Math.floor((Date.now() - task.startedAt) / 1000)
    : 0;

// ── Focus data for charts ──────────────────────────────────────────────────

/** Maps a timestamp to the short weekday name the locale uses (Mon/Tue/…). */
const getWeekdayLabel = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString("en-US", { weekday: "short" });

/**
 * Builds per-weekday focus minutes for the current week only.
 * Uses focusHistory (YYYY-MM-DD → seconds) for accuracy instead of
 * attributing all cumulative task time to the last-worked day.
 */
export const buildFocusActivityData = (
  focusHistory: Record<string, number>,
) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map((day) => ({ day, minutes: 0 }));

  // Get Monday of the current week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0 = Sun
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const seconds = focusHistory[key] || 0;
    const label = getWeekdayLabel(d.getTime());
    const entry = data.find((e) => e.day === label);
    if (entry) {
      entry.minutes = Math.floor(seconds / 60);
    }
  }

  return data;
};

/**
 * Builds per-weekday completed-task counts, attributed to the day each
 * task was last worked (or created if never worked).
 */
export const buildTasksCompletedData = (tasks: Task[]) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map((day) => ({ day, count: 0 }));

  tasks
    .filter((t) => t.completed)
    .forEach((task) => {
      const day = getWeekdayLabel(task.lastWorkedAt || task.createdAt);
      const entry = data.find((d) => d.day === day);
      if (entry) entry.count += 1;
    });

  return data;
};

export const calculateStreak = (history: Record<string, number>): number => {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

    if (history[key] && history[key] > 0) {
      streak++;
    } else if (i === 0) {
      // Today has no focus yet — streak could still be alive from yesterday
      continue;
    } else {
      break;
    }
  }
  return streak;
};

export const getMostFocusedTask = (tasks: Task[]): Task | null => {
  if (tasks.length === 0) return null;
  return tasks.reduce(
    (max, task) => (getActiveTime(task) > getActiveTime(max) ? task : max),
    tasks[0],
  );
};

export const getRealHeatmapData = (history: Record<string, number>) => {
  const data = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const seconds = history[key] || 0;

    // Intensity: 0 = none, 1 = >5 min, 2 = >60 min, 3 = >120 min
    const minutes = seconds / 60;
    const intensity =
      minutes > 120 ? 3 : minutes > 60 ? 2 : minutes > 5 ? 1 : 0;

    data.push({ intensity, active: seconds > 0, date: key });
  }
  return data;
};

/** Returns total focus seconds logged today (from the persisted history). */
export const getTodayFocusTime = (
  focusHistory: Record<string, number>,
): number => {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return focusHistory[key] || 0;
};

/**
 * Builds the last 8 weeks of total focus minutes, each week starting Monday.
 * Returns array of { week: "Feb 10", minutes: number } (oldest → newest).
 */
export const buildWeeklyFocusData = (focusHistory: Record<string, number>) => {
  const result = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find this week's Monday
  const dayOfWeek = today.getDay(); // 0 = Sun
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMon = new Date(today);
  thisMon.setDate(today.getDate() + diffToMon);

  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(thisMon);
    weekStart.setDate(thisMon.getDate() - w * 7);

    let totalSeconds = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      totalSeconds += focusHistory[key] || 0;
    }

    const label = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    result.push({ week: label, minutes: Math.floor(totalSeconds / 60) });
  }

  return result;
};
