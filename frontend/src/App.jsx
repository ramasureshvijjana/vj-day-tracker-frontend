import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import SetTasks from "./pages/SetTasks";
import TimeTable from "./pages/TimeTable";
import Analytics from "./pages/Analytics";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="loading-text">Loading Bloomday…</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <Sidebar userEmail={session.user.email} />
      <main className="main-area">
        <Routes>
          <Route path="/" element={<Navigate to="/timetable" replace />} />
          <Route path="/set-tasks" element={<SetTasks />} />
          <Route path="/timetable" element={<TimeTable />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/timetable" replace />} />
        </Routes>
      </main>
    </div>
  );
}
