import { createContext } from "react";
import type { TaskContextState } from "@/types/task";

export const TaskContext = createContext<TaskContextState | null>(null);
