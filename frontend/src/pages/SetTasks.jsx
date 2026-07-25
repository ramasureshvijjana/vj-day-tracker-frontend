import { useEffect, useState, useCallback } from "react";
import api from "../api";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

const SECTIONS = [
  { key: "daily", label: "Daily Tasks", endpoint: "/daily-tasks" },
  { key: "weekly", label: "Weekly Tasks", endpoint: "/weekly-tasks" },
  { key: "one_time", label: "One-time Tasks", endpoint: "/one-time-tasks" },
];

export default function SetTasks() {
  const [activeSection, setActiveSection] = useState("daily");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const endpoint = SECTIONS.find((s) => s.key === activeSection).endpoint;

  const load = useCallback(async (ep) => {
    setLoading(true);
    try {
      const { data } = await api.get(ep);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(endpoint);
  }, [endpoint, load]);

  const switchSection = (key) => {
    setActiveSection(key);
    setTasks([]);
    setLoading(true);
  };

  const handleSave = async (payload) => {
    await api.post(endpoint, payload);
    load(endpoint);
  };

  const handleDelete = async (id) => {
    const warning =
      activeSection === "one_time"
        ? "Delete this one-time task?"
        : "Delete this task? It stops appearing from today onward. Any day you've already marked done/not_done — including today — stays exactly as recorded.";
    if (!confirm(warning)) return;
    await api.delete(`${endpoint}/${id}`);
    load(endpoint);
  };

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Set Tasks</span>
        <h1 className="page-title">Build your schedule</h1>
        <p className="page-subtitle">
          Daily tasks repeat every day, weekly tasks repeat only on the days you pick, and
          one-time tasks apply to a single date. Give each item a type — Activity, Food or Gym —
          so it's easy to spot on your Timetable and Analytics.
        </p>
      </div>

      <div className="tab-row">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            className={"tab-btn" + (activeSection === section.key ? " active" : "")}
            onClick={() => switchSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="card">
        <TaskForm key={activeSection} section={activeSection} onSave={handleSave} />
      </div>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <p className="loading-text">Loading schedule…</p>
        ) : (
          <TaskList section={activeSection} tasks={tasks} onDelete={handleDelete} />
        )}
      </div>
    </>
  );
}
