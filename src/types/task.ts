export type Priority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tag: string;
  focusGoal: number; // minutes
  completed: boolean;
  timeSpent: number;
  startedAt: number | null;
  createdAt: number;
  lastWorkedAt: number | null;
};

export type TaskContextState = {
  tasks: Task[];
  activeTaskId: string | null;
  focusHistory: Record<string, number>; // dateString (YYYY-MM-DD) -> seconds
  addTask: (
    title: string,
    description: string,
    priority: Priority,
    tag: string,
    focusGoal: number,
  ) => void;
  removeTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  startTask: (id: string) => void;
  pauseTask: () => void;
};

export type DailyFocusEntry = {
  date: string;
  focusTime: number;
};
