import { useContext } from "react";
import { TaskContext } from "@/contexts/TaskProviderContext";
import type { TaskContextState } from "@/types/task";

export const useTask = (): TaskContextState => {
  const context = useContext(TaskContext);

  if (!context)
    throw new Error("useTask must be used within a TaskProvider");

  return context;
};
