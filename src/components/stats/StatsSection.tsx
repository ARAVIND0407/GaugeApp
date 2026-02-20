import { useTask } from "@/hooks/useTask";
import {
  formatTime,
  getActiveTime,
  buildDailyFocusData,
} from "@/utils/helperFunction";
import StatsChart from "./StatsChart";
import { Clock, CheckCircle, Zap, Trophy } from "lucide-react";
import type { ReactNode } from "react";

const StatsSection = () => {
  const { tasks, activeTaskId } = useTask();

  const dailyFocusData = buildDailyFocusData(tasks);
  const totalFocusTime = tasks.reduce((sum, t) => sum + getActiveTime(t), 0);
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const longestTask = tasks.reduce<(typeof tasks)[0] | null>((max, t) => {
    if (!max) return t;
    return getActiveTime(t) > getActiveTime(max) ? t : max;
  }, null);

  if (tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground/40 text-sm">
        No data yet — start working on tasks to see stats.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock size={16} className="text-primary" />}
          label="Total Focus"
          value={formatTime(totalFocusTime)}
          ring="ring-primary/20"
          glow="bg-primary/5"
        />
        <StatCard
          icon={<CheckCircle size={16} className="text-cyan-500" />}
          label="Completed"
          value={String(totalCompleted)}
          ring="ring-cyan-500/20"
          glow="bg-cyan-500/5"
        />
        <StatCard
          icon={<Zap size={16} className="text-amber-500" />}
          label="Active Task"
          value={activeTask ? activeTask.title : "—"}
          small
          ring="ring-amber-500/20"
          glow="bg-amber-500/5"
        />
        <StatCard
          icon={<Trophy size={16} className="text-rose-500" />}
          label="Longest Session"
          value={
            longestTask ? formatTime(getActiveTime(longestTask)) : "00:00:00"
          }
          ring="ring-rose-500/20"
          glow="bg-rose-500/5"
        />
      </div>

      <StatsChart data={dailyFocusData} />
    </div>
  );
};

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  small?: boolean;
  ring: string;
  glow: string;
};

const StatCard = ({
  icon,
  label,
  value,
  small = false,
  ring,
  glow,
}: StatCardProps) => (
  <div className={`rounded-xl border border-border ${glow} ring-1 ${ring} p-5`}>
    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
      {icon}
      <span className="text-xs uppercase tracking-wider">{label}</span>
    </div>
    <p
      className={`font-semibold tabular-nums truncate text-foreground ${small ? "text-lg" : "text-3xl"}`}
    >
      {value}
    </p>
  </div>
);

export default StatsSection;
