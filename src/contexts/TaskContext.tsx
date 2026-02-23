import { useEffect, useState, useCallback, type ReactNode } from "react";
import { TaskContext } from "@/contexts/TaskProviderContext";
import type { Task, Priority } from "@/types/task";

const TASKS_STORAGE_KEY = "gauge_tasks";
const HISTORY_STORAGE_KEY = "gauge_focus_history";

function hydrateTask(raw: Partial<Task>): Task {
  return {
    id: raw.id ?? crypto.randomUUID(),
    title: raw.title ?? "",
    description: raw.description ?? "",
    priority: raw.priority ?? "Medium",
    tag: raw.tag ?? "General",
    focusGoal: raw.focusGoal ?? 25,
    completed: raw.completed ?? false,
    timeSpent: raw.timeSpent ?? 0,
    startedAt: raw.startedAt ?? null,
    createdAt: raw.createdAt ?? Date.now(),
    lastWorkedAt: raw.lastWorkedAt ?? null,
  };
}

function loadTasksFromStorage(): Task[] {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Partial<Task>[]).map(hydrateTask);
  } catch {
    return [];
  }
}

function loadHistoryFromStorage(): Record<string, number> {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function loadActiveTaskIdFromStorage(): string | null {
  const tasks = loadTasksFromStorage();
  return tasks.find((t) => t.startedAt !== null)?.id ?? null;
}

const getDateKey = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);
  const [focusHistory, setFocusHistory] = useState<Record<string, number>>(
    loadHistoryFromStorage,
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    loadActiveTaskIdFromStorage,
  );

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(focusHistory));
  }, [focusHistory]);

  // Tick: update focusHistory every second while a task is active.
  // We do NOT touch `tasks` here — the timer display derives elapsed time
  // from `startedAt` directly in getSessionTime(), so no state mutation needed.
  useEffect(() => {
    if (!activeTaskId) return;
    const id = setInterval(() => {
      const dateKey = getDateKey(Date.now());
      setFocusHistory((prev) => ({
        ...prev,
        [dateKey]: (prev[dateKey] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [activeTaskId]);

  // --- pauseTask defined before removeTask/toggleComplete so they can call it safely ---
  const pauseTask = useCallback((): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.startedAt !== null
          ? {
              ...task,
              timeSpent:
                task.timeSpent +
                Math.floor((Date.now() - task.startedAt) / 1000),
              startedAt: null,
              lastWorkedAt: Date.now(),
            }
          : task,
      ),
    );
    setActiveTaskId(null);
  }, []);

  const addTask = (
    title: string,
    description: string,
    priority: Priority,
    tag: string,
    focusGoal: number,
  ): void => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        description,
        priority,
        tag,
        focusGoal,
        completed: false,
        timeSpent: 0,
        startedAt: null,
        createdAt: Date.now(),
        lastWorkedAt: null,
      },
    ]);
  };

  const removeTask = (id: string): void => {
    // Pause first if this is the active task, then remove
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target?.startedAt !== null && target) {
        // Commit the pending time before deletion
        setActiveTaskId(null);
      }
      return prev.filter((task) => task.id !== id);
    });
  };

  const toggleComplete = (id: string): void => {
    // Only pause if this is the currently active task
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const isActive =
        target?.id === activeTaskId && target?.startedAt !== null;

      if (isActive) {
        setActiveTaskId(null);
        return prev.map((task) =>
          task.id === id
            ? {
                ...task,
                timeSpent:
                  task.timeSpent +
                  Math.floor((Date.now() - (task.startedAt ?? 0)) / 1000),
                startedAt: null,
                lastWorkedAt: Date.now(),
                completed: !task.completed,
              }
            : task,
        );
      }

      return prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      );
    });
  };

  const startTask = (id: string): void => {
    // Commit any currently running task first, then start the new one
    setTasks((prev) =>
      prev.map((task) => {
        if (task.startedAt !== null && task.id !== id) {
          // Pause the previously running task
          return {
            ...task,
            timeSpent:
              task.timeSpent + Math.floor((Date.now() - task.startedAt) / 1000),
            startedAt: null,
            lastWorkedAt: Date.now(),
          };
        }
        if (task.id === id) {
          return { ...task, startedAt: Date.now() };
        }
        return task;
      }),
    );
    setActiveTaskId(id);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activeTaskId,
        focusHistory,
        addTask,
        removeTask,
        startTask,
        pauseTask,
        toggleComplete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
