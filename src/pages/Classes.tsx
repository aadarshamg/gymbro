import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { ClassBooking, ClassSession, Trainer } from "../lib/types";

export function Classes() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [roster, setRoster] = useState<{ id: string; bookings: ClassBooking[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [durationMins, setDurationMins] = useState("60");
  const [capacity, setCapacity] = useState("15");

  function load() {
    api.get<{ sessions: ClassSession[] }>("/classes").then((r) => setSessions(r.sessions));
    api.get<{ trainers: Trainer[] }>("/trainers").then((r) => setTrainers(r.trainers));
  }

  useEffect(load, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/classes", {
        title,
        description: description || undefined,
        trainerId: trainerId || undefined,
        startsAt: new Date(startsAt).toISOString(),
        durationMins: Number(durationMins),
        capacity: Number(capacity),
      });
      setTitle("");
      setDescription("");
      setStartsAt("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this class? Existing bookings will be removed.")) return;
    await api.delete(`/classes/${id}`);
    if (roster?.id === id) setRoster(null);
    load();
  }

  async function showRoster(id: string) {
    if (roster?.id === id) return setRoster(null);
    const r = await api.get<{ bookings: ClassBooking[] }>(`/classes/${id}/bookings`);
    setRoster({ id, bookings: r.bookings });
  }

  return (
    <div>
      <h1>Class Booking</h1>
      <p className="hint">Members book these slots from the mobile app's Classes tab.</p>

      <h2>Upcoming classes</h2>
      {sessions.length === 0 ? (
        <p>No upcoming classes.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>When</th>
              <th>Trainer</th>
              <th>Booked</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>
                  {new Date(s.startsAt).toLocaleString()} · {s.durationMins}m
                </td>
                <td>{s.trainer?.name ?? "—"}</td>
                <td>
                  <button onClick={() => showRoster(s.id)}>
                    {s._count?.bookings ?? 0} / {s.capacity}
                  </button>
                </td>
                <td>
                  <button onClick={() => remove(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {roster && (
        <div className="report-block">
          <h3>Roster</h3>
          {roster.bookings.length === 0 ? (
            <p>Nobody has booked yet.</p>
          ) : (
            <ul>
              {roster.bookings.map((b) => (
                <li key={b.id}>{b.member.user.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h2>New class</h2>
      <form onSubmit={create}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Trainer
          <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
            <option value="">No trainer</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Starts at
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </label>
        <label>
          Duration (minutes)
          <input
            type="number"
            value={durationMins}
            onChange={(e) => setDurationMins(e.target.value)}
            required
          />
        </label>
        <label>
          Capacity
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </label>
        <button type="submit">Create class</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
