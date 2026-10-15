import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Attendance as AttendanceRow, Member } from "../lib/types";

export function Attendance() {
  const { gym } = useAuth();
  const [attendances, setAttendances] = useState<AttendanceRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  function load() {
    api.get<{ attendances: AttendanceRow[] }>("/attendance/today").then((r) => setAttendances(r.attendances));
    api.get<{ members: Member[] }>("/members").then((r) => setMembers(r.members));
  }

  useEffect(load, []);

  async function manualCheckin() {
    if (!selectedMemberId) return;
    await api.post("/attendance/manual", { memberId: selectedMemberId });
    setSelectedMemberId("");
    load();
  }

  return (
    <div>
      <h1>Attendance</h1>

      <section>
        <h2>Gym check-in QR code</h2>
        <p className="hint">Members scan this from the mobile app to check in.</p>
        {gym && <QRCodeSVG value={gym.checkinToken} size={180} />}
        <p className="hint">Join code: {gym?.checkinToken}</p>
      </section>

      <section>
        <h2>Manual check-in</h2>
        <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
          <option value="" disabled>
            Select a member
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.user.name}
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={manualCheckin} disabled={!selectedMemberId}>
          Mark present
        </button>
      </section>

      <h2>Today's check-ins ({attendances.length})</h2>
      <ul>
        {attendances.map((a) => (
          <li key={a.id}>
            {a.member?.user.name} — {new Date(a.checkedInAt).toLocaleTimeString()} ({a.method})
          </li>
        ))}
      </ul>
    </div>
  );
}
