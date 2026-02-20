import type { ReactNode } from "react";
import { useTask } from "@/hooks/useTask";
import {
  buildFocusActivityData,
  buildTasksCompletedData,
  calculateStreak,
  getActiveTime,
  formatHuman,
  getMostFocusedTask,
  getRealHeatmapData,
} from "@/utils/helperFunction";
import StatsChart from "./StatsChart";
import TasksCompletedChart from "./TasksCompletedChart";
import { Clock, CheckCircle, Flame, TrendingUp, Target } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  label: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

const StatsSection = () => {
  const { tasks, focusHistory } = useTask();

  const focusActivityData = buildFocusActivityData(tasks);
  const tasksCompletedData = buildTasksCompletedData(tasks);

  const totalFocusSec = tasks.reduce((sum, t) => sum + getActiveTime(t), 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const streak = calculateStreak(focusHistory);
  const dailyAvgMin = Math.round(totalFocusSec / (tasks.length || 1) / 60);
  const mostFocused = getMostFocusedTask(tasks);
  const heatmapData = getRealHeatmapData(focusHistory);

  // Dynamic Week Range
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  // Adjust to Monday-start week (1: Mon, ..., 0: Sun)
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekRange = `${formatDate(monday)}–${formatDate(sunday)}, ${today.getFullYear()}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Your Stats
        </h1>
        <p className="text-sm text-muted-foreground tracking-tight flex items-center gap-2">
          Week of {weekRange}
        </p>
      </div>

      {/* Top Metrics Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Focus Time (Big Card - Spans 2 rows) */}
        <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-500/10">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Focus Time
              </span>
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-12">
              <h2 className="text-5xl font-bold flex items-baseline gap-2">
                {Math.floor(totalFocusSec / 3600)}
                <span className="text-2xl opacity-60 font-medium">h</span>{" "}
                {Math.floor((totalFocusSec % 3600) / 60)}
                <span className="text-2xl opacity-60 font-medium">m</span>
              </h2>
              <p className="text-xs font-medium opacity-60 mt-2 tracking-wide flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-white opacity-40"></span>
                Total this week
              </p>
            </div>
          </div>
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>

        {/* 2. Completed (Small Card) */}
        <div className="md:col-span-1">
          <StatCardCompact
            title="Completed"
            value={String(completedCount)}
            label={`${tasks.length} total tasks`}
            icon={<CheckCircle size={18} strokeWidth={2.5} />}
            iconBg="bg-teal-500/10"
            iconColor="text-teal-500"
          />
        </div>

        {/* 4. Streak (Tall Card - Spans 2 rows) */}
        <div className="md:col-span-1 md:row-span-2">
          <StatCardTall
            title="Streak"
            value={`${streak}`}
            unit="days"
            label="Personal best: 14 days"
            icon={<Flame size={18} strokeWidth={2.5} />}
            iconBg="bg-orange-500/10"
            iconColor="text-orange-500"
          />
        </div>

        {/* 3. Daily Avg (Small Card) */}
        <div className="md:col-span-1">
          <StatCardCompact
            title="Daily Avg"
            value={`${dailyAvgMin}m`}
            label="Focus per day"
            icon={<TrendingUp size={18} strokeWidth={2.5} />}
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-500"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        <StatsChart data={focusActivityData} />
        <TasksCompletedChart data={tasksCompletedData} />
      </div>

      {/* Bottom Section - Missing Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {/* Most Focused Task */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-5">
            Most Focused Task
          </h3>
          {mostFocused ? (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                  <Target size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {mostFocused.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {mostFocused.tag} ·{" "}
                    {formatHuman(getActiveTime(mostFocused))} total focus
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 font-bold text-sm">
                {formatHuman(getActiveTime(mostFocused))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No tasks tracked yet
            </p>
          )}
        </div>

        {/* Focus Streak Heatmap */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-5 flex items-center gap-2">
            Focus Streak <Flame size={14} className="text-orange-500" />
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {heatmapData.map((day, i) => (
                <div
                  key={i}
                  title={day.date}
                  className={`w-6 h-6 rounded-md transition-all duration-300 ${
                    day.active
                      ? i % 3 === 0
                        ? "bg-orange-500 shadow-sm"
                        : "bg-orange-400"
                      : day.intensity === 0
                        ? "bg-muted/30"
                        : day.intensity === 1
                          ? "bg-orange-500/20"
                          : day.intensity === 2
                            ? "bg-orange-500/40"
                            : "bg-orange-500/60"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
              Last 28 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCardCompact = ({
  title,
  value,
  label,
  icon,
  iconBg,
  iconColor,
}: StatCardProps) => (
  <div className="h-full rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-border/80 transition-all group shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
        {title}
      </span>
      <div
        className={`${iconBg} ${iconColor} p-2 rounded-xl group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold text-foreground tracking-tight">
        {value}
      </h3>
      <p className="text-[10px] font-medium text-muted-foreground mt-1 tracking-wide">
        {label}
      </p>
    </div>
  </div>
);

const StatCardTall = ({
  title,
  value,
  unit,
  label,
  icon,
  iconBg,
  iconColor,
}: StatCardProps) => (
  <div className="h-full rounded-2xl border border-border bg-card p-6 flex flex-col justify-between hover:border-border/80 transition-all group shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
        {title}
      </span>
      <div
        className={`${iconBg} ${iconColor} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>
    <div className="mt-auto pt-10">
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-4xl font-bold text-foreground tracking-tighter">
          {value}
        </h3>
        <span className="text-sm font-semibold text-muted-foreground/80">
          {unit}
        </span>
      </div>
      <p className="text-[10px] font-medium text-muted-foreground mt-2 tracking-wide">
        {label}
      </p>
    </div>
  </div>
);

export default StatsSection;
