import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function Settings() {
  const { gym, refreshGym } = useAuth();
  const [name, setName] = useState(gym?.name ?? "");
  const [address, setAddress] = useState(gym?.address ?? "");
  const [timings, setTimings] = useState(gym?.timings ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await api.patch("/gyms/me", { name, address, timings });
      await refreshGym();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  if (!gym) return <p>Loading...</p>;

  const trialEndsAt = gym.trialEndsAt ? new Date(gym.trialEndsAt).toLocaleDateString() : null;

  return (
    <div>
      <h1>Settings</h1>

      <section>
        <h2>GymBro subscription</h2>
        <p>
          Plan: <strong>{gym.subscriptionTier}</strong> · Status:{" "}
          <strong>{gym.subscriptionStatus}</strong>
          {trialEndsAt && gym.subscriptionStatus === "TRIAL" && <> · Trial ends {trialEndsAt}</>}
        </p>
        <p className="hint">
          This is GymBro's own fee for using the platform — separate from the plans you sell your
          members. Billing integration is coming soon.
        </p>
      </section>

      <section>
        <h2>Gym profile</h2>
        <form onSubmit={save}>
          <label>
            Gym name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Address
            <input value={address ?? ""} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label>
            Timings
            <input value={timings ?? ""} onChange={(e) => setTimings(e.target.value)} />
          </label>
          <button type="submit">Save</button>
          {saved && <p className="hint">Saved.</p>}
          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </div>
  );
}
