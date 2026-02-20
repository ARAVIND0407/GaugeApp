import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyFocusEntry } from "@/types/task";

type Props = { data: DailyFocusEntry[] };

const StatsChart = ({ data }: Props) => {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex items-center justify-center min-h-52">
        <p className="text-sm text-muted-foreground/40">
          No daily focus data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-6">
        Daily Focus (seconds)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            stroke="currentColor"
            strokeOpacity={0.06}
            strokeDasharray="4 8"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(var(--popover))",
              borderRadius: "10px",
              border: "1px solid oklch(var(--border))",
              padding: "8px 14px",
              fontSize: 12,
            }}
            cursor={{ stroke: "oklch(var(--primary) / 30%)", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="focusTime"
            stroke="#A7D129"
            strokeWidth={2}
            dot={{ fill: "#A7D129", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#A7D129" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
