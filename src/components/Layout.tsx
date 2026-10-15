import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", end: true },
  { to: "/members", label: "Members" },
  { to: "/attendance", label: "Attendance" },
  { to: "/plans", label: "Plans & Pricing" },
  { to: "/trainers", label: "Trainers" },
  { to: "/classes", label: "Classes" },
  { to: "/payments", label: "Payments" },
  { to: "/reports", label: "Reports" },
  { to: "/notifications", label: "Notifications" },
  { to: "/support", label: "Support" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  const { gym, signOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2 className="brand">
          <span className="brand-mark">⚡</span> GymBro
        </h2>
        <p className="gym-name">{gym?.name}</p>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="signout" onClick={signOut}>
          Sign out
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
