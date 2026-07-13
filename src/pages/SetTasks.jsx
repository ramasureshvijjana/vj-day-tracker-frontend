import { useEffect, useState, useCallback } from "react";
import api from "../api";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

const TABS = [
  { key: "task", label: "Daily Task", cls: "task" },
  { key: "food", label: "Food", cls: "food" },
  { key: "gym", label: "Gym", cls: "gym" },
];

export default function SetTasks() {
  const [activeTab, setActiveTab] = useState("task");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const load = useCallback(async (category) => {
    setLoading(true);
    try {
      const { data } = await api.get("/templates", { params: { category } });
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setEditingTemplate(null);
    load(activeTab);
  }, [activeTab, load]);

  const handleSave = async (payload) => {
    if (editingTemplate) {
      await api.put(`/templates/${editingTemplate.id}`, payload);
      setEditingTemplate(null);
    } else {
      await api.post("/templates", payload);
    }
    load(activeTab);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this scheduled item? This also clears its history.")) return;
    await api.delete(`/templates/${id}`);
    load(activeTab);
  };

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Set Tasks</span>
        <h1 className="page-title">Build your three timetables</h1>
        <p className="page-subtitle">
          Set up daily task, food and gym schedules separately. Each item can repeat every day, on
          specific days of the week, or just once.
        </p>
      </div>

      <div className="tab-row">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={"tab-btn " + tab.cls + (activeTab === tab.key ? " active" : "")}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="dot" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        <TaskForm
          category={activeTab}
          editingTemplate={editingTemplate}
          onSave={handleSave}
          onCancelEdit={() => setEditingTemplate(null)}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <p className="loading-text">Loading schedule…</p>
        ) : (
          <TaskList templates={templates} onEdit={setEditingTemplate} onDelete={handleDelete} />
        )}
      </div>
    </>
  );
}
