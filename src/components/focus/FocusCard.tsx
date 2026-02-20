import { Play, AlertTriangle, Clock } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import { formatTime } from "@/utils/helperFunction";
import type { Task } from "@/types/task";

type Props = { task: Task };

const FocusCard = ({ task }: Props) => {
  const { startTask, activeTaskId } = useTask();

  const isReadyToStart = task.timeSpent === 0 && task.startedAt === null;
  const inProgress = task.timeSpent > 0 || task.startedAt !== null;
  const isActive = task.id === activeTaskId;
  const isAnotherRunning = activeTaskId !== null && activeTaskId !== task.id;

  return (
    <li
      className={`group flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200
        ${
          isActive
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-card hover:bg-muted/30 hover:border-border/80"
        }`}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}
        >
          {task.title}
        </span>
        {task.description && (
          <span className="text-xs text-muted-foreground truncate">
            {task.description}
          </span>
        )}
        {inProgress && !isActive && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 mt-1">
            <Clock size={10} /> {formatTime(task.timeSpent)} logged
          </span>
        )}
      </div>

      <div className="shrink-0">
        {isActive ? (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary font-medium animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Focusing
          </span>
        ) : isAnotherRunning ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <AlertTriangle size={12} className="text-amber-500/70" />
            Busy
          </span>
        ) : (
          <button
            onClick={() => startTask(task.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
              ${
                !isReadyToStart
                  ? "bg-secondary/30 text-secondary-foreground ring-1 ring-secondary/30 hover:bg-secondary/50"
                  : "bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/20"
              }`}
          >
            <Play size={10} fill="currentColor" />
            {!isReadyToStart ? "Continue" : "Start"}
          </button>
        )}
      </div>
    </li>
  );
};

export default FocusCard;
