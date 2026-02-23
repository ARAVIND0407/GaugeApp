import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { buildWeeklyFocusData } from "@/utils/helperFunction";

type DailyEntry = { day: string; minutes: number };
type WeeklyEntry = { week: string; minutes: number };

type Props = {
  /** Pre-built Mon–Sun data for the current week */
  data: DailyEntry[];
  /** Raw history so we can build weekly aggregation ourselves */
  focusHistory: Record<string, number>;
};

type View = "daily" | "weekly";

const StatsChart = ({ data: dailyData, focusHistory }: Props) => {
  const [view, setView] = useState<View>("daily");

  const weeklyData = buildWeeklyFocusData(focusHistory);

  const chartData: (DailyEntry | WeeklyEntry)[] =
    view === "daily" ? dailyData : weeklyData;

  const xKey = view === "daily" ? "day" : "week";
  const subtitle =
    view === "daily"
      ? "Minutes per day (this week)"
      : "Minutes per week (last 8 weeks)";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Focus Activity
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex bg-muted/50 rounded-lg p-1 gap-1">
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              view === "daily"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              view === "weekly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="oklch(var(--border) / 0.3)"
            />
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, "auto"]}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(var(--card))",
                border: "1px solid oklch(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(val: number | undefined) => [
                `${val ?? 0} min`,
                "Focus",
              ]}
              labelFormatter={(label) =>
                view === "weekly" ? `Week of ${label}` : label
              }
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#2DD4BF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMinutes)"
              dot={{
                r: 4,
                fill: "#2DD4BF",
                strokeWidth: 2,
                stroke: "oklch(var(--card))",
              }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;
