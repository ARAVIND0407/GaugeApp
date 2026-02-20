export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeSpent: number;
  startedAt: number | null;
  createdAt: number;
  lastWorkedAt: number | null;
};

export type TaskContextState = {
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (title: string, description: string) => void;
  removeTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  startTask: (id: string) => void;
  pauseTask: () => void;
};
