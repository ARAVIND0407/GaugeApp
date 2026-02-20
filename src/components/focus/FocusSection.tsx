import { Play } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import { useUi } from "@/hooks/useUi";
import ActiveFocus from "./ActiveFocus";
import type { Task } from "@/types/task";

// ── Quick‑start list item ─────────────────────────────────────────────────
const QuickStartItem = ({
  task,
  onStart,
}: {
  task: Task;
  onStart: (id: string) => void;
}) => (
  <button
    onClick={() => onStart(task.id)}
    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-border/80 transition-all cursor-pointer text-left group"
  >
    <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary/20 ring-1 ring-primary/20 flex items-center justify-center text-primary transition-colors">
      <Play size={13} fill="currentColor" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">
        {task.title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {task.tag} · {task.focusGoal}m target · {task.priority}
      </p>
    </div>
  </button>
);

// ── Idle dashed target ring ────────────────────────────────────────────────
const TargetRing = () => (
  <div className="relative mx-auto w-52 h-52 mb-8">
    {/* Outer dashed ring */}
    <div className="absolute inset-0 rounded-full border-2 border-dashed border-border/50" />
    {/* Middle ring */}
    <div className="absolute inset-5 rounded-full border border-border/30 bg-muted/10" />
    {/* Inner ring + icon */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div className="w-14 h-14 rounded-full border border-border/40 bg-muted/20 flex items-center justify-center">
        {/* Concentric circle icon (target look) */}
        <svg
          viewBox="-20 -20 40 40"
          className="w-8 h-8 text-muted-foreground/40"
        >
          <circle
            cx={0}
            cy={0}
            r={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <circle
            cx={0}
            cy={0}
            r={11}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <circle cx={0} cy={0} r={4} fill="currentColor" />
        </svg>
      </div>
      <span className="text-xs text-muted-foreground/50">No task selected</span>
    </div>
  </div>
);

// ── Main FocusSection ──────────────────────────────────────────────────────
const FocusSection = () => {
  const { tasks, activeTaskId, startTask } = useTask();
  const { setMode } = useUi();

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const availableTasks = tasks.filter((t) => !t.completed);
  const topTasks = availableTasks.slice(0, 3);

  // Active session view
  if (activeTask) {
    return (
      <div className="flex items-start justify-center pt-8">
        <ActiveFocus task={activeTask} />
      </div>
    );
  }

  // Idle view
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-sm mx-auto text-center px-4">
      <TargetRing />

      <h2 className="text-2xl font-bold text-foreground mb-2">
        Ready to focus?
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">
        Start a task from your list to begin a focus session. The timer tracks
        your deep work automatically.
      </p>

      {availableTasks.length === 0 ? (
        <button
          onClick={() => setMode("task")}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Go to Tasks to add one →
        </button>
      ) : (
        <div className="w-full">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-4">
            Quick Start
          </p>
          <div className="flex flex-col gap-2">
            {topTasks.map((task) => (
              <QuickStartItem key={task.id} task={task} onStart={startTask} />
            ))}
          </div>

          {availableTasks.length > 3 && (
            <button
              onClick={() => setMode("task")}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-4 w-full text-center"
            >
              View all {availableTasks.length} tasks →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FocusSection;
