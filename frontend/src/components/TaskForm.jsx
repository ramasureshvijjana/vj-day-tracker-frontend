import { useState } from "react";

const TYPE_OPTIONS = [
  { value: "activity", label: "Activity" },
  { value: "food", label: "Food" },
  { value: "gym", label: "Gym" },
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const emptyForm = {
  type: "activity",
  item: "",
  start_time: "07:00",
  end_time: "08:00",
  specific_date: new Date().toISOString().slice(0, 10),
  days_of_week: [],
};

export default function TaskForm({ section, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter((d) => d !== day)
        : [...f.days_of_week, day].sort(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.end_time <= form.start_time) {
      setError("End time must be after start time.");
      return;
    }
    if (section === "one_time" && !form.specific_date) {
      setError("Pick a date for this one-time task.");
      return;
    }
    if (section === "weekly" && form.days_of_week.length === 0) {
      setError("Pick at least one day of the week.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        item: form.item.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
      };
      if (section === "one_time") {
        payload.specific_date = form.specific_date;
      }
      if (section === "weekly") {
        payload.days_of_week = form.days_of_week;
      }
      await onSave(payload);
      setForm({ ...emptyForm, specific_date: form.specific_date, days_of_week: form.days_of_week });
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const submitLabel = { daily: "Add to daily schedule", weekly: "Add weekly task", one_time: "Add one-time task" }[
    section
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label>Item</label>
          <input
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            placeholder="e.g. Deep work block"
            required
          />
        </div>
        <div className="field">
          <label>Start time</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>End time</label>
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-grid" style={{ marginTop: 14 }}>
        <div className="field">
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {section === "one_time" && (
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              value={form.specific_date}
              onChange={(e) => setForm({ ...form, specific_date: e.target.value })}
              required
            />
          </div>
        )}

        {section === "weekly" && (
          <div className="field" style={{ gridColumn: "span 2" }}>
            <label>Days</label>
            <div className="day-picker">
              {DAY_LABELS.map((label, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={"day-chip" + (form.days_of_week.includes(idx) ? " selected" : "")}
                  onClick={() => toggleDay(idx)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      <div style={{ marginTop: 18 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
