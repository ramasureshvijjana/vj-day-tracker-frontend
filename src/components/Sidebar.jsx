import { NavLink } from "react-router-dom";
import { supabase } from "../supabaseClient";

const links = [
  { to: "/set-tasks", label: "Set Tasks", icon: "📝" },
  { to: "/timetable", label: "Timetable", icon: "🗓️" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
];

export default function Sidebar({ userEmail }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <span className="brand-name">Bloomday</span>
      </div>

      <ul className="nav-list">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        {userEmail && <div className="user-email">{userEmail}</div>}
        <button className="signout-btn" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
