import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { Member, Payment, Plan } from "../lib/types";

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"PAID" | "PENDING">("PAID");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<{ payments: Payment[] }>("/payments").then((r) => setPayments(r.payments));
    api.get<{ members: Member[] }>("/members").then((r) => setMembers(r.members));
    api.get<{ plans: Plan[] }>("/plans").then((r) => setPlans(r.plans));
  }

  useEffect(load, []);

  async function recordPayment(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/payments", {
        memberId,
        planId: planId || undefined,
        amount: Number(amount),
        status,
      });
      setAmount("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    }
  }

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  return (
    <div>
      <h1>Payments & Billing</h1>
      <p className="hint">{pendingCount} pending payment(s)</p>

      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.member?.user.name ?? "—"}</td>
              <td>₹{p.amount}</td>
              <td>{p.status}</td>
              <td>{new Date(p.paidOn).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Record a payment</h2>
      <form onSubmit={recordPayment}>
        <label>
          Member
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
            <option value="" disabled>
              Select a member
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Plan
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">No plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount (₹)
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as "PAID" | "PENDING")}>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </label>
        <button type="submit">Record payment</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
