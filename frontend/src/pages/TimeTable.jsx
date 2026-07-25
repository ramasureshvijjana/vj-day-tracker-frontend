import { useEffect, useState, useCallback } from "react";
import api from "../api";
import { formatTimeRange12h } from "../utils/time";
import { groupOverlapping } from "../utils/overlap";

const TYPE_ICON = { activity: "📝", food: "🍽️", gym: "🏋️" };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TimeTable() {
  const [date, setDate] = useState(todayISO());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPast = date < todayISO();

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

  const saveEdit = async (logId, form) => {
    const { data } = await api.patch(`/timetable/${logId}`, {
      item: form.item,
      start_time: form.start_time,
      end_time: form.end_time,
    });
    setLogs((prev) => prev.map((l) => (l.id === logId ? data : l)));
  };

  const deleteOccurrence = async (logId) => {
    if (!confirm("Remove this item for this day only? Your daily/one-time schedule won't be affected.")) return;
    await api.delete(`/timetable/${logId}`);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const done = logs.filter((l) => l.status === "done").length;
  const notDone = logs.filter((l) => l.status === "not_done").length;

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Timetable</span>
        <h1 className="page-title">Today, all in one flow</h1>
        <p className="page-subtitle">
          Your daily and one-time tasks merged into a single timeline. Mark each item done or not
          done, or edit/remove just this day's entry — your recurring schedule stays untouched.
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

      {isPast && (
        <div className="past-day-banner">
          📜 This is a past day — it's showing frozen history, exactly as it happened, even if your
          schedule has changed since.
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading timetable…</p>
      ) : logs.length === 0 ? (
        <div className="card empty-state">
          <p>
            {isPast
              ? "No history recorded for this day."
              : "Nothing scheduled for this day yet. Add items on the Set Tasks page."}
          </p>
        </div>
      ) : (
        groupOverlapping(
          logs.slice().sort((a, b) => a.start_time.localeCompare(b.start_time))
        ).map((group, idx) =>
          group.length > 1 ? (
            <div className="overlap-group" key={`group-${idx}`}>
              <span className="overlap-badge">⏱ Overlapping timing</span>
              {group.map((log) => (
                <TimetableRow
                  key={log.id}
                  log={log}
                  setStatus={setStatus}
                  onSaveEdit={saveEdit}
                  onDelete={deleteOccurrence}
                />
              ))}
            </div>
          ) : (
            <TimetableRow
              key={group[0].id}
              log={group[0]}
              setStatus={setStatus}
              onSaveEdit={saveEdit}
              onDelete={deleteOccurrence}
            />
          )
        )
      )}
    </>
  );
}

function TimetableRow({ log, setStatus, onSaveEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    item: log.item,
    start_time: log.start_time.slice(0, 5),
    end_time: log.end_time.slice(0, 5),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setForm({ item: log.item, start_time: log.start_time.slice(0, 5), end_time: log.end_time.slice(0, 5) });
    setError("");
    setEditing(true);
  };

  const save = async () => {
    if (!form.item.trim()) {
      setError("Item name can't be empty.");
      return;
    }
    if (form.end_time <= form.start_time) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    try {
      await onSaveEdit(log.id, { ...form, item: form.item.trim() });
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className={`timetable-row ${log.type} editing`}>
        <div className="edit-header">
          <span className={`category-badge ${log.type}`}>{TYPE_ICON[log.type]}</span>
          <input
            className="edit-item-input"
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            placeholder="Item name"
          />
        </div>
        <div className="edit-time-row">
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
          <span>to</span>
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          />
        </div>
        {error && (
          <p className="error-text" style={{ marginLeft: 52 }}>
            {error}
          </p>
        )}
        <p className="edit-note">This only changes this day — your recurring schedule stays the same.</p>
        <div className="edit-actions">
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`timetable-row ${log.type} status-${log.status}`}>
      <div className={`category-badge ${log.type}`}>{TYPE_ICON[log.type]}</div>
      <div className="row-info">
        <span className="item-name">{log.item}</span>
        <span className="item-time">
          {formatTimeRange12h(log.start_time.slice(0, 5), log.end_time.slice(0, 5))}
        </span>
      </div>
      <div className="row-controls">
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
        <div className="row-icon-actions">
          <button className="icon-btn" title="Edit just this day" onClick={startEditing}>
            ✏️
          </button>
          <button className="icon-btn danger" title="Remove just this day" onClick={() => onDelete(log.id)}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
