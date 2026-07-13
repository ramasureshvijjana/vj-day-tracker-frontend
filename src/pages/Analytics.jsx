import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import api from "../api";

const MODES = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
];

const CATEGORY_COLORS = { task: "#7c57c9", food: "#3fae83", gym: "#ef7b72" };
const CATEGORY_LABEL = { task: "Daily Task", food: "Food", gym: "Gym" };

function formatBucketLabel(bucket, mode) {
  if (mode === "yearly") {
    const [, m] = bucket.split("-");
    return new Date(2000, Number(m) - 1, 1).toLocaleString("default", { month: "short" });
  }
  const d = new Date(bucket + "T00:00:00");
  if (mode === "quarterly") return `Wk ${d.getDate()}/${d.getMonth() + 1}`;
  return d.toLocaleDateString("default", { weekday: "short" });
}

export default function Analytics() {
  const [mode, setMode] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m) => {
    setLoading(true);
    try {
      const { data } = await api.get("/analytics", { params: { mode: m } });
      setData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(mode);
  }, [mode, load]);

  const pieData = data
    ? Object.entries(data.by_category).map(([cat, v]) => ({ name: CATEGORY_LABEL[cat], value: v.total, cat }))
    : [];

  const barData = data
    ? data.timeseries.map((b) => ({ ...b, label: formatBucketLabel(b.bucket, mode) }))
    : [];

  const radial = data ? [{ name: "rate", value: data.totals.completion_rate, fill: "url(#bloomGradient)" }] : [];

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Analytics</span>
        <h1 className="page-title">See your consistency bloom</h1>
        <p className="page-subtitle">
          Completion rates across your day, week, quarter or year — broken down by task, food and gym.
        </p>
      </div>

      <div className="mode-row">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={"tab-btn" + (mode === m.key ? " active" : "")}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <p className="loading-text">Crunching your numbers…</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Completion rate</div>
              <div className="value">{data.totals.completion_rate}%</div>
            </div>
            <div className="stat-card">
              <div className="label">Done</div>
              <div className="value" style={{ color: "var(--mint-700)" }}>
                {data.totals.done}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Not done</div>
              <div className="value" style={{ color: "var(--coral-600)" }}>
                {data.totals.not_done}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Current streak</div>
              <div className="value">{data.current_streak_days}d</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="card chart-card">
              <div className="chart-title">
                Completion by {mode === "yearly" ? "month" : mode === "quarterly" ? "week" : "day"}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efe9fa" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6d6684" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6d6684" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #efe9fa", fontSize: 13 }}
                    formatter={(value, name) => [value, name === "done" ? "Done" : name === "not_done" ? "Not done" : name]}
                  />
                  <Bar dataKey="done" stackId="a" fill="#3fae83" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="not_done" stackId="a" fill="#ef7b72" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#ded0f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="legend-row">
                <span><span className="legend-dot" style={{ background: "#3fae83" }} />Done</span>
                <span><span className="legend-dot" style={{ background: "#ef7b72" }} />Not done</span>
                <span><span className="legend-dot" style={{ background: "#ded0f7" }} />Pending</span>
              </div>
            </div>

            <div className="card chart-card">
              <div className="chart-title">Activity mix</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.cat} fill={CATEGORY_COLORS[entry.cat]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #efe9fa", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-row">
                {pieData.map((entry) => (
                  <span key={entry.cat}>
                    <span className="legend-dot" style={{ background: CATEGORY_COLORS[entry.cat] }} />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-grid" style={{ marginTop: 20 }}>
            <div className="card chart-card">
              <div className="chart-title">By category completion rate</div>
              {Object.entries(data.by_category).map(([cat, v]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{CATEGORY_LABEL[cat]}</span>
                    <span style={{ color: "var(--ink-400)" }}>{v.completion_rate}%</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: "#f1eef8", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${v.completion_rate}%`,
                        background: CATEGORY_COLORS[cat],
                        borderRadius: 999,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="card chart-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="chart-title" style={{ alignSelf: "flex-start" }}>
                Overall bloom
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={radial}
                  startAngle={90}
                  endAngle={-270}
                >
                  <defs>
                    <linearGradient id="bloomGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7fdbb3" />
                      <stop offset="100%" stopColor="#7c57c9" />
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: -70, fontFamily: "var(--font-display)", fontSize: 28 }}>
                {data.totals.completion_rate}%
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
