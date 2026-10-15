import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { Plan } from "../lib/types";

export function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<{ plans: Plan[] }>("/plans").then((r) => setPlans(r.plans));
  }

  useEffect(load, []);

  async function createPlan(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/plans", { name, price: Number(price), durationDays: Number(durationDays) });
      setName("");
      setPrice("");
      setDurationDays("30");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    }
  }

  async function removePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    await api.delete(`/plans/${id}`);
    load();
  }

  return (
    <div>
      <h1>Plans & Pricing</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Duration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.durationDays} days</td>
              <td>
                <button onClick={() => removePlan(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>New plan</h2>
      <form onSubmit={createPlan}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Price (₹)
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
        <label>
          Duration (days)
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            required
          />
        </label>
        <button type="submit">Add plan</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
