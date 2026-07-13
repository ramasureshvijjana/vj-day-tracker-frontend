import { useEffect, useState } from "react";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const emptyForm = {
  item: "",
  start_time: "07:00",
  end_time: "08:00",
  recurrence: "daily",
  days_of_week: [],
  specific_date: "",
};

export default function TaskForm({ category, editingTemplate, onSave, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTemplate) {
      setForm({
        item: editingTemplate.item,
        start_time: editingTemplate.start_time.slice(0, 5),
        end_time: editingTemplate.end_time.slice(0, 5),
        recurrence: editingTemplate.recurrence,
        days_of_week: editingTemplate.days_of_week || [],
        specific_date: editingTemplate.specific_date || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingTemplate]);

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
    if (form.recurrence === "weekly" && form.days_of_week.length === 0) {
      setError("Pick at least one day of the week.");
      return;
    }
    if (form.recurrence === "once" && !form.specific_date) {
      setError("Pick a date for a one-time item.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        category,
        item: form.item.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        recurrence: form.recurrence,
        days_of_week: form.recurrence === "weekly" ? form.days_of_week : [],
        specific_date: form.recurrence === "once" ? form.specific_date : null,
        is_active: true,
      });
      setForm(emptyForm);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label>Item</label>
          <input
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            placeholder={
              category === "food" ? "e.g. Grilled chicken salad" : category === "gym" ? "e.g. Leg day" : "e.g. Deep work block"
            }
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
          <label>Series</label>
          <select
            value={form.recurrence}
            onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
          >
            <option value="daily">Every day</option>
            <option value="weekly">Specific days of the week</option>
            <option value="once">One-time (specific date)</option>
          </select>
        </div>

        {form.recurrence === "weekly" && (
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

        {form.recurrence === "once" && (
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
      </div>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : editingTemplate ? "Save changes" : "Add to schedule"}
        </button>
        {editingTemplate && (
          <button type="button" className="btn btn-ghost" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
