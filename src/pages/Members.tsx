import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Member } from "../lib/types";

export function Members() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .get<{ members: Member[] }>("/members")
      .then((r) => setMembers(r.members))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }

  useEffect(load, []);

  async function removeMember(id: string) {
    if (!confirm("Remove this member?")) return;
    await api.delete(`/members/${id}`);
    load();
  }

  if (error) return <p className="error">{error}</p>;
  if (!members) return <p>Loading...</p>;

  return (
    <div>
      <h1>Members</h1>
      <p className="hint">
        New members join from the mobile app using your gym's join code/QR (see Attendance page).
      </p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>
                <Link to={`/members/${m.id}`}>{m.user.name ?? "—"}</Link>
              </td>
              <td>{m.user.phone ?? "—"}</td>
              <td>{m.plan?.name ?? "No plan"}</td>
              <td>{m.status}</td>
              <td>{new Date(m.joiningDate).toLocaleDateString()}</td>
              <td>
                <button onClick={() => removeMember(m.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
