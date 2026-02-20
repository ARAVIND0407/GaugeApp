import { useEffect, useCallback } from "react";
import { Square, Pause, Check } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import { useUi } from "@/hooks/useUi";
import { getSessionTime } from "@/utils/helperFunction";
import type { Task } from "@/types/task";

// ── Tick mark precomputation ───────────────────────────────────────────────
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
  const isMajor = i % 5 === 0;
  const outerR = 108;
  const innerR = isMajor ? 93 : 101;
  return {
    x1: Math.cos(angle) * outerR,
    y1: Math.sin(angle) * outerR,
    x2: Math.cos(angle) * innerR,
    y2: Math.sin(angle) * innerR,
    isMajor,
  };
});

type Props = { task: Task };

const ActiveFocus = ({ task }: Props) => {
  const { pauseTask, toggleComplete } = useTask();
  const { setMode } = useUi();

  const goalSeconds = task.focusGoal * 60;
  const sessionTime = getSessionTime(task);
  const pct = Math.min(100, Math.round((sessionTime / goalSeconds) * 100));
  const mm = String(Math.floor(sessionTime / 60)).padStart(2, "0");
  const ss = String(sessionTime % 60).padStart(2, "0");

  const handleStop = useCallback(() => {
    pauseTask();
  }, [pauseTask]);

  const handleDone = useCallback(() => {
    pauseTask();
    toggleComplete(task.id);
    setMode("task");
  }, [pauseTask, toggleComplete, task.id, setMode]);

  // Space → pause
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        handleStop();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleStop]);

  return (
    <div className="flex flex-col items-center text-center max-w-sm mx-auto pb-24">
      {/* ── Badges ── */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary/40 text-secondary-foreground border border-border">
          {task.tag}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* ── Task title + description ── */}
      <h2 className="text-3xl font-bold text-foreground leading-tight mb-3">
        {task.title}
      </h2>
      {task.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          {task.description}
        </p>
      )}

      {/* ── Circular timer ── */}
      <div className="relative w-72 h-72 my-6">
        {/* SVG tick ring */}
        <svg
          viewBox="-120 -120 240 240"
          className="absolute inset-0 w-full h-full text-foreground"
        >
          {/* Outer faint circle */}
          <circle
            cx={0}
            cy={0}
            r={110}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.05}
            strokeWidth={1}
          />
          {/* Progress Ring */}
          <circle
            cx={0}
            cy={0}
            r={108}
            fill="none"
            stroke="#A7D129"
            strokeWidth={2}
            strokeDasharray={2 * Math.PI * 108}
            strokeDashoffset={2 * Math.PI * 108 * (1 - pct / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 opacity-20"
            transform="rotate(-90)"
          />
          {/* Tick marks */}
          {TICKS.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="currentColor"
              strokeOpacity={t.isMajor ? 0.3 : 0.1}
              strokeWidth={t.isMajor ? 2.5 : 1}
              strokeLinecap="round"
            />
          ))}
          {/* Brand dot that rotates with seconds */}
          <circle
            cx={
              Math.cos(((sessionTime % 60) / 60) * Math.PI * 2 - Math.PI / 2) *
              108
            }
            cy={
              Math.sin(((sessionTime % 60) / 60) * Math.PI * 2 - Math.PI / 2) *
              108
            }
            r={5}
            fill="#A7D129"
            className="transition-all duration-500 ease-linear"
          />
        </svg>

        {/* Inner circle — timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-card border border-border/50 flex flex-col items-center justify-center gap-1 shadow-inner">
            {/* Split MM : SS so it never wraps */}
            <div className="flex items-center gap-1 tabular-nums">
              <span className="text-4xl font-mono font-light text-foreground">
                {mm}
              </span>
              <span className="text-3xl font-mono font-light text-muted-foreground/50 leading-none pb-0.5">
                :
              </span>
              <span className="text-4xl font-mono font-light text-foreground">
                {ss}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground/50 mt-0.5">
              {pct}% of session
            </span>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-end justify-center gap-8 mb-2">
        {/* Stop */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleStop}
            className="w-12 h-12 rounded-full bg-muted/60 hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <Square size={16} fill="currentColor" />
          </button>
          <span className="text-xs text-muted-foreground">Stop</span>
        </div>

        {/* Pause (large, primary) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleStop}
            className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 transition-all cursor-pointer"
          >
            <Pause size={22} />
          </button>
          <span className="text-xs text-muted-foreground">Pause</span>
        </div>

        {/* Done */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleDone}
            className="w-12 h-12 rounded-full bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 flex items-center justify-center text-green-500 hover:text-green-400 transition-all cursor-pointer"
          >
            <Check size={16} />
          </button>
          <span className="text-xs text-muted-foreground">Done</span>
        </div>
      </div>

      {/* ── Keyboard hint ── */}
      <p className="text-xs text-muted-foreground/40 mt-5">
        Press{" "}
        <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground/70 font-mono text-[10px]">
          Space
        </kbd>{" "}
        to pause ·{" "}
        <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground/70 font-mono text-[10px]">
          T
        </kbd>{" "}
        for tasks
      </p>
    </div>
  );
};

export default ActiveFocus;
