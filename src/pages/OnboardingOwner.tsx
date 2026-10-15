import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function OnboardingOwner() {
  const { refreshGym } = useAuth();
  const [gymName, setGymName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [timings, setTimings] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/auth/bootstrap-owner", { gymName, ownerName, address, timings });
      await refreshGym();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <h1>Set up your gym</h1>
      <p>This creates your own independent gym workspace on GymBro.</p>
      <form onSubmit={submit}>
        <label>
          Gym name
          <input value={gymName} onChange={(e) => setGymName(e.target.value)} required />
        </label>
        <label>
          Your name
          <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
        </label>
        <label>
          Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Timings
          <input
            value={timings}
            onChange={(e) => setTimings(e.target.value)}
            placeholder="6am - 10pm"
          />
        </label>
        <button type="submit" disabled={busy}>
          Create gym workspace
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
