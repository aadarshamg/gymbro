import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { Trainer } from "../lib/types";

export function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<{ trainers: Trainer[] }>("/trainers").then((r) => setTrainers(r.trainers));
  }

  useEffect(load, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/trainers", { name, phone: phone || undefined, specialty: specialty || undefined });
      setName("");
      setPhone("");
      setSpecialty("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add trainer");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this trainer? Members assigned to them will be unassigned.")) return;
    await api.delete(`/trainers/${id}`);
    load();
  }

  return (
    <div>
      <h1>Trainers</h1>
      <p className="hint">Assign a trainer to a member from that member's detail page.</p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialty</th>
            <th>Phone</th>
            <th>Members</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.specialty ?? "—"}</td>
              <td>{t.phone ?? "—"}</td>
              <td>{t._count?.members ?? 0}</td>
              <td>
                <button onClick={() => remove(t.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add trainer</h2>
      <form onSubmit={create}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Specialty
          <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Strength, Yoga…" />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <button type="submit">Add trainer</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
