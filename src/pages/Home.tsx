import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Overview } from "../lib/types";

export function Home() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Overview>("/gyms/me/overview")
      .then(setOverview)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!overview) return <p>Loading...</p>;

  return (
    <div>
      <h1>Overview</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{overview.activeMembers}</span>
          <span className="stat-label">Active members</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{overview.todaysCheckins}</span>
          <span className="stat-label">Checked in today</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">₹{overview.monthlyRevenue}</span>
          <span className="stat-label">Revenue this month</span>
        </div>
      </div>

      <h2>Expiring soon</h2>
      {overview.expiringSoon.length === 0 ? (
        <p>No memberships expiring in the next 7 days.</p>
      ) : (
        <ul>
          {overview.expiringSoon.map((m) => (
            <li key={m.memberId}>{m.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
