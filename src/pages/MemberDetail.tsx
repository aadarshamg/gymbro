import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Attendance, Member, Payment, Plan, Trainer } from "../lib/types";

interface MemberFull extends Member {
  payments: Payment[];
  attendances: Attendance[];
}

export function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<MemberFull | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .get<{ member: MemberFull }>(`/members/${id}`)
      .then((r) => setMember(r.member))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
    api.get<{ plans: Plan[] }>("/plans").then((r) => setPlans(r.plans));
    api.get<{ trainers: Trainer[] }>("/trainers").then((r) => setTrainers(r.trainers));
  }

  useEffect(load, [id]);

  async function changePlan(planId: string) {
    await api.patch(`/members/${id}`, { planId: planId || null });
    load();
  }

  async function changeTrainer(trainerId: string) {
    await api.patch(`/members/${id}`, { trainerId: trainerId || null });
    load();
  }

  if (error) return <p className="error">{error}</p>;
  if (!member) return <p>Loading...</p>;

  return (
    <div>
      <h1>{member.user.name}</h1>
      <p>
        Phone: {member.user.phone} · Status: {member.status}
      </p>

      <label>
        Plan
        <select value={member.planId ?? ""} onChange={(e) => changePlan(e.target.value)}>
          <option value="">No plan</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (₹{p.price}/{p.durationDays}d)
            </option>
          ))}
        </select>
      </label>

      <label>
        Trainer
        <select value={member.trainerId ?? ""} onChange={(e) => changeTrainer(e.target.value)}>
          <option value="">No trainer</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {t.specialty ? ` (${t.specialty})` : ""}
            </option>
          ))}
        </select>
      </label>

      <p>
        <Link to={`/members/${id}/workout`}>Edit workout plan →</Link>
      </p>

      <h2>Payment history</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {member.payments.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.paidOn).toLocaleDateString()}</td>
              <td>₹{p.amount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Attendance history</h2>
      <ul>
        {member.attendances.map((a) => (
          <li key={a.id}>
            {new Date(a.checkedInAt).toLocaleString()} ({a.method})
          </li>
        ))}
      </ul>
    </div>
  );
}
