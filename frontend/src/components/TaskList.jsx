import { formatTimeRange12h } from "../utils/time";

const TYPE_LABEL = { activity: "Activity", food: "Food", gym: "Gym" };
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EMPTY_MESSAGE = {
  daily: "No daily tasks yet. Add your first one above.",
  weekly: "No weekly tasks yet. Add one above for the days you want it to repeat on.",
  one_time: "No one-time tasks scheduled yet. Add one above.",
};

export default function TaskList({ section, tasks, onDelete }) {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        <p>{EMPTY_MESSAGE[section]}</p>
      </div>
    );
  }

  return (
    <div className="item-list">
      {tasks
        .slice()
        .sort((a, b) =>
          section === "one_time"
            ? (a.specific_date + a.start_time).localeCompare(b.specific_date + b.start_time)
            : a.start_time.localeCompare(b.start_time)
        )
        .map((t) => (
          <div className="item-row" key={t.id}>
            <span className={`type-badge ${t.type}`}>{TYPE_LABEL[t.type]}</span>
            <span className="item-time">
              {formatTimeRange12h(t.start_time.slice(0, 5), t.end_time.slice(0, 5))}
            </span>
            <div style={{ flex: 1 }}>
              <div className="item-name">{t.item}</div>
              {section === "one_time" && <div className="item-meta">{t.specific_date}</div>}
              {section === "weekly" && (
                <div className="item-meta">{(t.days_of_week || []).map((d) => DAY_LABELS[d]).join(", ")}</div>
              )}
            </div>
            <div className="item-actions">
              <button className="icon-btn danger" title="Delete" onClick={() => onDelete(t.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
