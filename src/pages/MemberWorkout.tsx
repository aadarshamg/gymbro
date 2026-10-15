import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Member, WorkoutDay, WorkoutPlan } from "../lib/types";

export function MemberWorkout() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [hasPlan, setHasPlan] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ member: Member }>(`/members/${id}`).then((r) => setMember(r.member));
    api.get<{ plan: WorkoutPlan | null }>(`/workouts/member/${id}`).then((r) => {
      if (r.plan) {
        setTitle(r.plan.title);
        setDays(r.plan.days);
        setHasPlan(true);
      }
    });
  }, [id]);

  function updateDay(di: number, patch: Partial<WorkoutDay>) {
    setDays((d) => d.map((day, i) => (i === di ? { ...day, ...patch } : day)));
  }

  function updateExercise(di: number, ei: number, patch: Partial<WorkoutDay["exercises"][number]>) {
    setDays((d) =>
      d.map((day, i) =>
        i === di
          ? { ...day, exercises: day.exercises.map((ex, j) => (j === ei ? { ...ex, ...patch } : ex)) }
          : day,
      ),
    );
  }

  async function save() {
    setStatus(null);
    setError(null);
    try {
      await api.put(`/workouts/member/${id}`, { title, days });
      setHasPlan(true);
      setStatus("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function deletePlan() {
    if (!confirm("Delete this member's workout plan?")) return;
    await api.delete(`/workouts/member/${id}`);
    setTitle("");
    setDays([]);
    setHasPlan(false);
    setStatus("Plan deleted.");
  }

  return (
    <div>
      <p>
        <Link to={`/members/${id}`}>← Back to member</Link>
      </p>
      <h1>Workout plan{member ? ` — ${member.user.name}` : ""}</h1>

      <label>
        Plan title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Beginner 3-day split" />
      </label>

      {days.map((day, di) => (
        <div key={di} className="report-block">
          <div className="report-head">
            <input
              value={day.day}
              onChange={(e) => updateDay(di, { day: e.target.value })}
              placeholder="Day (e.g. Monday)"
            />
            <button onClick={() => setDays((d) => d.filter((_, i) => i !== di))}>Remove day</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex, ei) => (
                <tr key={ei}>
                  <td>
                    <input value={ex.name} onChange={(e) => updateExercise(di, ei, { name: e.target.value })} />
                  </td>
                  <td>
                    <input
                      value={ex.sets ?? ""}
                      onChange={(e) => updateExercise(di, ei, { sets: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={ex.reps ?? ""}
                      onChange={(e) => updateExercise(di, ei, { reps: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={ex.notes ?? ""}
                      onChange={(e) => updateExercise(di, ei, { notes: e.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        updateDay(di, { exercises: day.exercises.filter((_, j) => j !== ei) })
                      }
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => updateDay(di, { exercises: [...day.exercises, { name: "" }] })}
          >
            Add exercise
          </button>
        </div>
      ))}

      <p>
        <button onClick={() => setDays((d) => [...d, { day: "", exercises: [] }])}>Add day</button>
      </p>

      <button className="btn-primary" onClick={save} disabled={!title || days.length === 0}>
        Save plan
      </button>
      {hasPlan && (
        <button onClick={deletePlan} style={{ marginLeft: 8, borderColor: "#ff5e36", color: "#ff5e36" }}>
          Delete plan
        </button>
      )}
      {status && <p className="hint">{status}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
