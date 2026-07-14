import { formatTimeRange12h } from "../utils/time";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function recurrenceLabel(t) {
  if (t.recurrence === "daily") return "Every day";
  if (t.recurrence === "once") return `Once · ${t.specific_date}`;
  if (t.recurrence === "weekly" || t.recurrence === "custom") {
    if (!t.days_of_week?.length) return "Specific days";
    return t.days_of_week.map((d) => DAY_LABELS[d]).join(", ");
  }
  return t.recurrence;
}

export default function TaskList({ templates, onEdit, onDelete }) {
  if (!templates.length) {
    return (
      <div className="empty-state">
        <p>No items scheduled yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="item-list">
      {templates
        .slice()
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((t) => (
          <div className="item-row" key={t.id}>
            <span className="item-time">{formatTimeRange12h(t.start_time.slice(0, 5), t.end_time.slice(0, 5))}</span>
            <div style={{ flex: 1 }}>
              <div className="item-name">{t.item}</div>
              <div className="item-meta">{recurrenceLabel(t)}</div>
            </div>
            <div className="item-actions">
              <button className="icon-btn" title="Edit" onClick={() => onEdit(t)}>
                ✏️
              </button>
              <button className="icon-btn danger" title="Delete" onClick={() => onDelete(t.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
