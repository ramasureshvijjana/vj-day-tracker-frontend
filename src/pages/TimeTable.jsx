import { useEffect, useState, useCallback } from "react";
import api from "../api";

const CATEGORY_ICON = { task: "📝", food: "🍽️", gym: "🏋️" };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TimeTable() {
  const [date, setDate] = useState(todayISO());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (d) => {
    setLoading(true);
    try {
      const { data } = await api.get("/timetable", { params: { date: d } });
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  const setStatus = async (log, status) => {
    const nextStatus = log.status === status ? "pending" : status;
    setLogs((prev) => prev.map((l) => (l.id === log.id ? { ...l, status: nextStatus } : l)));
    await api.patch(`/timetable/${log.id}`, { status: nextStatus });
  };

  const done = logs.filter((l) => l.status === "done").length;
  const notDone = logs.filter((l) => l.status === "not_done").length;

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Timetable</span>
        <h1 className="page-title">Today, all in one flow</h1>
        <p className="page-subtitle">
          Your task, food and gym schedules merged into a single timeline. Mark each item done or
          not done as your day goes.
        </p>
      </div>

      <div className="date-bar">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn btn-ghost btn-sm" onClick={() => setDate(todayISO())}>
          Today
        </button>
        <div className="progress-summary">
          <span>
            Total: <strong>{logs.length}</strong>
          </span>
          <span style={{ color: "var(--mint-700)" }}>
            Done: <strong>{done}</strong>
          </span>
          <span style={{ color: "var(--coral-600)" }}>
            Not done: <strong>{notDone}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading timetable…</p>
      ) : logs.length === 0 ? (
        <div className="card empty-state">
          <p>Nothing scheduled for this day yet. Add items on the Set Tasks page.</p>
        </div>
      ) : (
        logs
          .slice()
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map((log) => (
            <div key={log.id} className={`timetable-row ${log.category} status-${log.status}`}>
              <div className={`category-badge ${log.category}`}>{CATEGORY_ICON[log.category]}</div>
              <div className="row-info">
                <span className="item-name">{log.item}</span>
                <span className="item-time">
                  {log.start_time.slice(0, 5)}–{log.end_time.slice(0, 5)}
                </span>
              </div>
              <div className="status-toggle">
                <button
                  className={"status-btn done" + (log.status === "done" ? " active" : "")}
                  onClick={() => setStatus(log, "done")}
                >
                  <span className="status-dot" /> Done
                </button>
                <button
                  className={"status-btn not_done" + (log.status === "not_done" ? " active" : "")}
                  onClick={() => setStatus(log, "not_done")}
                >
                  <span className="status-dot" /> Not done
                </button>
              </div>
            </div>
          ))
      )}
    </>
  );
}
