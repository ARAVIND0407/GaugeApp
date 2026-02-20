import { Square, CheckSquare2, X, Play, Clock, Target } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import { useUi } from "@/hooks/useUi";
import { formatTime, getActiveTime } from "@/utils/helperFunction";
import type { Task, Priority } from "@/types/task";

type Props = { task: Task; dimmed?: boolean };

const priorityBadge: Record<Priority, string> = {
  Low: "bg-muted/80 text-muted-foreground border-border",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  High: "bg-red-500/10   text-red-400   border-red-500/20",
};

const TaskCard = ({ task, dimmed = false }: Props) => {
  const { toggleComplete, removeTask, startTask, activeTaskId } = useTask();
  const { setMode } = useUi();

  const isActive = task.id === activeTaskId;
  const inProgress = task.timeSpent > 0 || task.startedAt !== null;
  const isAnotherActive = activeTaskId !== null && activeTaskId !== task.id;

  const handleStartFocus = () => {
    startTask(task.id);
    setMode("focus");
  };

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-4 rounded-xl border transition-all duration-200
        ${dimmed ? "opacity-50" : ""}
        ${
          isActive
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-card hover:bg-muted/30 hover:border-border/80"
        }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleComplete(task.id)}
        className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer"
        aria-label="Toggle complete"
      >
        {task.completed ? (
          <CheckSquare2 size={18} className="text-primary" />
        ) : (
          <Square size={18} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`font-semibold text-sm leading-snug ${
              task.completed
                ? "line-through text-muted-foreground/40"
                : "text-foreground"
            }`}
          >
            {task.title}
          </h3>

          {!isActive && (
            <button
              onClick={() => removeTask(task.id)}
              className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all cursor-pointer"
              aria-label="Delete task"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Metadata row — priority badge, tag, time, actions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {/* Priority */}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold uppercase tracking-wide ${priorityBadge[task.priority]}`}
          >
            {task.priority}
          </span>

          {/* Tag */}
          <span className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted/60 text-muted-foreground font-medium">
            {task.tag}
          </span>

          {/* Goal */}
          {!task.completed && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 font-medium">
              <Target size={10} className="text-primary/70" />
              {task.focusGoal}m goal
            </span>
          )}

          {/* Time */}
          {(isActive ? getActiveTime(task) : task.timeSpent) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50 border-l border-border pl-2 ml-1">
              <Clock size={10} />
              {formatTime(isActive ? getActiveTime(task) : task.timeSpent)}
            </span>
          )}

          {/* Active pulse */}
          {isActive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium uppercase animate-pulse">
              Active
            </span>
          )}

          {/* Start/Continue */}
          {!task.completed && !isActive && !isAnotherActive && (
            <button
              onClick={handleStartFocus}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-all cursor-pointer ml-auto"
            >
              <Play size={9} fill="currentColor" />
              {inProgress ? "Continue" : "Start focus"}
            </button>
          )}

          {!task.completed && isAnotherActive && (
            <span className="text-[11px] text-muted-foreground/30 italic ml-auto">
              Another session running
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
