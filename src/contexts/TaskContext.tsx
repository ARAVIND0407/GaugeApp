import { useEffect, useState, type ReactNode } from "react";
import { TaskContext } from "@/contexts/TaskProviderContext";
import type { Task } from "@/types/task";

const STORAGE_KEY = "gauge_tasks";

function loadTasksFromStorage(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed as Task[];
  } catch {
    return [];
  }
}

function loadActiveTaskIdFromStorage(): string | null {
  const tasks = loadTasksFromStorage();
  return tasks.find((t) => t.startedAt !== null)?.id ?? null;
}

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    loadActiveTaskIdFromStorage,
  );

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Tick every second while a task is running (triggers re-renders for elapsed time)
  useEffect(() => {
    if (!activeTaskId) return;
    const id = setInterval(() => {
      setTasks((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(id);
  }, [activeTaskId]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const addTask = (title: string, description: string): void => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        description,
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
