import type { Task } from "@/types/task";

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

// ── "6s" / "14m" / "1h 32m" — human readable ───────────────────────────────
export const formatHuman = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};

export const getActiveTime = (task: Task): number =>
  task.startedAt !== null
    ? task.timeSpent + Math.floor((Date.now() - task.startedAt) / 1000)
    : task.timeSpent;

export const getSessionTime = (task: Task): number =>
  task.startedAt !== null
    ? Math.floor((Date.now() - task.startedAt) / 1000)
    : 0;

// ── Focus data for charts ──────────────────────────────────────────────────
export const getTaskWeekdayKey = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
  });
};

export const buildFocusActivityData = (tasks: Task[]) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map((day) => ({ day, minutes: 0 }));

  tasks.forEach((task) => {
    if (task.lastWorkedAt) {
      const day = getTaskWeekdayKey(task.lastWorkedAt);
      const entry = data.find((d) => d.day === day);
      if (entry) {
        entry.minutes += Math.floor(getActiveTime(task) / 60);
      }
    }
  });

  return data;
};

export const buildTasksCompletedData = (tasks: Task[]) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map((day) => ({ day, count: 0 }));

  tasks
    .filter((t) => t.completed)
    .forEach((task) => {
      const day = getTaskWeekdayKey(task.lastWorkedAt || task.createdAt);
      const entry = data.find((d) => d.day === day);
      if (entry) {
        entry.count += 1;
      }
    });

  return data;
};

export const calculateStreak = (history: Record<string, number>): number => {
  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));
  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const key = checkDate.toISOString().split("T")[0];

    if (history[key] && history[key] > 0) {
      streak++;
    } else if (i === 0) {
      // If today is empty, streak might still be active from yesterday
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
    const key = d.toISOString().split("T")[0];
    const seconds = history[key] || 0;

    // Intensity mapping (0 to 3) based on minutes
    const minutes = seconds / 60;
    let intensity = 0;
    if (minutes > 120) intensity = 3;
    else if (minutes > 60) intensity = 2;
    else if (minutes > 5) intensity = 1;

    data.push({
      intensity,
      active: seconds > 0,
      date: key,
    });
  }
  return data;
};
