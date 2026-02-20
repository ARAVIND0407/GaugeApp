import { useEffect, useState, type ReactNode } from "react";
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
    return JSON.parse(stored);
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

  useEffect(() => {
    if (!activeTaskId) return;
    const id = setInterval(() => {
      // Update the live task tick and also the daily history
      const now = Date.now();
      const dateKey = getDateKey(now);

      setFocusHistory((prev) => ({
        ...prev,
        [dateKey]: (prev[dateKey] || 0) + 1,
      }));

      setTasks((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(id);
  }, [activeTaskId]);

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
    if (activeTaskId === id) pauseTask();
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleComplete = (id: string): void => {
    pauseTask();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const startTask = (id: string): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, startedAt: Date.now() }
          : { ...task, startedAt: null },
      ),
    );
    setActiveTaskId(id);
  };

  const pauseTask = (): void => {
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
