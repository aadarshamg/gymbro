import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api } from "../lib/api";
import type { MemberGrowthReport, RetentionReport, RevenueReport } from "../lib/types";

const SERIES = "#ccff00";
const GRID = "#2e2e38";
const AXIS = "#9e9ea8";
const TOOLTIP_STYLE = {
  background: "#1a1a1e",
  border: "1px solid #2e2e38",
  borderRadius: 12,
  color: "#f4f4f6",
};
const TOOLTIP_LABEL_STYLE = { color: "#f4f4f6", fontWeight: 700 };
const TOOLTIP_ITEM_STYLE = { color: "#ccff00" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(period: string) {
  const [, m] = period.split("-");
  return m ? MONTHS[Number(m) - 1] : period;
}

const axisTick = { fill: AXIS, fontSize: 12 };

export function Reports() {
  const [range, setRange] = useState<"monthly" | "yearly">("monthly");
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [growth, setGrowth] = useState<MemberGrowthReport | null>(null);
  const [retention, setRetention] = useState<RetentionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<RevenueReport>(`/reports/revenue?range=${range}`)
      .then(setRevenue)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [range]);

  useEffect(() => {
    api.get<MemberGrowthReport>("/reports/member-growth").then(setGrowth).catch(() => {});
    api.get<RetentionReport>("/reports/retention").then(setRetention).catch(() => {});
  }, []);

  if (error) return <p className="error">{error}</p>;

  const revenueData =
    revenue?.points.map((p) => ({
      label: range === "monthly" ? monthLabel(p.period) : p.period,
      total: p.total,
    })) ?? [];
  const growthData =
    growth?.points.map((p) => ({ label: monthLabel(p.period), count: p.count })) ?? [];

  return (
    <div>
      <h1>Reports &amp; Analytics</h1>

      <section className="report-block">
        <div className="report-head">
          <h2>Revenue ({range === "monthly" ? "last 12 months" : "last 5 years"})</h2>
          <div className="range-toggle">
            <button className={range === "monthly" ? "active" : ""} onClick={() => setRange("monthly")}>
              Monthly
            </button>
            <button className={range === "yearly" ? "active" : ""} onClick={() => setRange("yearly")}>
              Yearly
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
            <YAxis
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(v) => `₹${v.toLocaleString()}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(204,255,0,0.08)" }}
              contentStyle={TOOLTIP_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="total" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="report-block">
        <h2>New members per month (last 12 months)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={growthData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
            <YAxis
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: AXIS, strokeDasharray: "3 3" }}
              contentStyle={TOOLTIP_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(v) => [String(v), "New members"]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={SERIES}
              strokeWidth={2}
              dot={{ r: 4, fill: SERIES }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="report-block">
        <h2>Retention</h2>
        {retention && (
          <div className="stat-card">
            <span className="stat-value">{Math.round(retention.rate * 100)}%</span>
            <span className="stat-label">
              {retention.renewed} of {retention.withAnyPayment} paying members renewed at least once
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
