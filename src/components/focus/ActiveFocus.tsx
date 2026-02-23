import { useEffect, useCallback, useRef, useState } from "react";
import { Square, Pause, Check } from "lucide-react";
import { toast } from "sonner";
import { useTask } from "@/hooks/useTask";
import { useUi } from "@/hooks/useUi";
import {
  getActiveTime,
  formatHuman,
  getTodayFocusTime,
} from "@/utils/helperFunction";
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

const StatCell = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center py-4 px-2">
    <span className="text-base font-semibold tabular-nums text-foreground">
      {value}
    </span>
    <span className="text-[11px] text-muted-foreground mt-0.5">{label}</span>
  </div>
);

const ActiveFocus = ({ task }: Props) => {
  const { pauseTask, toggleComplete, focusHistory } = useTask();
  const { setMode } = useUi();

  // ── Smooth live time via requestAnimationFrame ─────────────────────────
  // liveSession = seconds elapsed in this specific run (resets on pause)
  // liveTotal   = all accumulated time including previous sessions (continues after resume)
  const [liveSession, setLiveSession] = useState<number>(() =>
    task.startedAt !== null ? (Date.now() - task.startedAt) / 1000 : 0,
  );
  const [liveTotal, setLiveTotal] = useState<number>(() =>
    task.startedAt !== null
      ? task.timeSpent + (Date.now() - task.startedAt) / 1000
      : task.timeSpent,
  );
  const rafRef = useRef<number>(0);
  // goalSeconds declared here for use by both the RAF loop and the suppression check
  const goalSeconds = Math.max(1, task.focusGoal * 60);
  // Seed as true if the session was already past goal when mounted,
  // so we don't immediately toast when resuming an overtime session.
  // Must be initialised to false here (pure); the actual check runs in a mount effect.
  const hasWarnedRef = useRef<boolean>(false);

  // On mount: if the session was already past goal (e.g. app refreshed mid-overtime),
  // mark as warned so we don't fire an immediate toast.
  useEffect(() => {
    if (task.startedAt !== null) {
      const elapsed = (Date.now() - task.startedAt) / 1000;
      if (elapsed >= goalSeconds) hasWarnedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runs once on mount only

  useEffect(() => {
    const tick = () => {
      const sessionElapsed =
        task.startedAt !== null ? (Date.now() - task.startedAt) / 1000 : 0;
      const totalElapsed = task.timeSpent + sessionElapsed;

      setLiveSession(sessionElapsed);
      setLiveTotal(totalElapsed);

      // One-shot overtime toast — uses total time vs goal
      if (!hasWarnedRef.current && totalElapsed / goalSeconds >= 1) {
        hasWarnedRef.current = true;
        toast.warning(
          `⏱ Goal reached! ${task.focusGoal}m target passed. Keep going or wrap up.`,
          { duration: 6000, id: "overtime" },
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [task.startedAt, task.timeSpent, task.focusGoal, goalSeconds]);

  // Clock display uses the TOTAL (cumulative) time — so it continues after pause/resume
  const totalTimeSec = Math.floor(liveTotal);
  const sessionTimeSec = Math.floor(liveSession);

  // Progress and display based on total accumulated time vs goal
  const pct = Math.min(200, Math.round((totalTimeSec / goalSeconds) * 100));
  const mm = String(Math.floor(totalTimeSec / 60)).padStart(2, "0");
  const ss = String(totalTimeSec % 60).padStart(2, "0");

  // Smooth angle for the dot — also uses total time for continuity
  const smoothAngle = (liveTotal / 60) * Math.PI * 2 - Math.PI / 2;
  const dotX = Math.cos(smoothAngle) * 108;
  const dotY = Math.sin(smoothAngle) * 108;

  // ── Ring color: green → amber → orange → red as pct approaches 100 ──
  // Hue travels from 90° (lime-green) down to 0° (red) over 0–100%
  const clampedPct = Math.min(pct, 100);
  const hue = Math.round(90 - clampedPct * 0.9); // 90 → 0
  const sat = Math.round(75 + clampedPct * 0.2); // 75% → 95%
  const lit = pct >= 100 ? 55 : 50;
  const ringColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
  const isOvertime = pct >= 100;

  // Stats
  const totalOnTask = getActiveTime(task);
  const todayFocus = getTodayFocusTime(focusHistory);

  const handleStop = useCallback(() => {
    pauseTask();
  }, [pauseTask]);

  const handleDone = useCallback(() => {
    toggleComplete(task.id);
    setMode("task");
  }, [toggleComplete, task.id, setMode]);

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
          {/* Progress Ring - color shifts green→amber→red with pct */}
          <circle
            cx={0}
            cy={0}
            r={108}
            fill="none"
            stroke={ringColor}
            strokeWidth={isOvertime ? 3 : 2}
            strokeDasharray={2 * Math.PI * 108}
            strokeDashoffset={2 * Math.PI * 108 * (1 - clampedPct / 100)}
            strokeLinecap="round"
            className={`${isOvertime ? "opacity-60" : "opacity-25"}`}
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
          {/* Brand dot — color matches ring */}
          <circle cx={dotX} cy={dotY} r={5} fill={ringColor} />
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

      {/* ── Stats bar ── */}
      <div className="w-full grid grid-cols-3 divide-x divide-border border border-border rounded-xl bg-muted/20 mt-6">
        <StatCell label="This session" value={formatHuman(sessionTimeSec)} />
        <StatCell label="Total on task" value={formatHuman(totalOnTask)} />
        <StatCell label="Today's focus" value={formatHuman(todayFocus)} />
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
