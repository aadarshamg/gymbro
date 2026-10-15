import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { SupportThread } from "../lib/types";

export function Support() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selected, setSelected] = useState<SupportThread | null>(null);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState<"OPEN" | "ALL">("OPEN");

  function loadList() {
    const qs = filter === "OPEN" ? "?status=OPEN" : "";
    api.get<{ threads: SupportThread[] }>(`/support${qs}`).then((r) => setThreads(r.threads));
  }

  useEffect(loadList, [filter]);

  async function openThread(id: string) {
    const r = await api.get<{ thread: SupportThread }>(`/support/${id}`);
    setSelected(r.thread);
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const r = await api.post<{ thread: SupportThread }>(`/support/${selected.id}/messages`, { body: reply });
    setSelected(r.thread);
    setReply("");
    loadList();
  }

  async function setStatus(status: "OPEN" | "RESOLVED") {
    if (!selected) return;
    await api.patch(`/support/${selected.id}`, { status });
    await openThread(selected.id);
    loadList();
  }

  return (
    <div>
      <h1>Support</h1>
      <div className="range-toggle">
        <button className={filter === "OPEN" ? "active" : ""} onClick={() => setFilter("OPEN")}>
          Open
        </button>
        <button className={filter === "ALL" ? "active" : ""} onClick={() => setFilter("ALL")}>
          All
        </button>
      </div>

      <div className="support-layout">
        <ul className="support-list">
          {threads.length === 0 && <li className="hint">No threads.</li>}
          {threads.map((t) => (
            <li
              key={t.id}
              className={selected?.id === t.id ? "active" : ""}
              onClick={() => openThread(t.id)}
            >
              <strong>{t.subject}</strong>
              <span className="hint">
                {t.member?.user.name} · {t.status}
              </span>
              {t.messages[0] && <span className="preview">{t.messages[0].body}</span>}
            </li>
          ))}
        </ul>

        <div className="support-thread">
          {!selected ? (
            <p className="hint">Select a thread.</p>
          ) : (
            <>
              <div className="report-head">
                <h2>{selected.subject}</h2>
                {selected.status === "OPEN" ? (
                  <button onClick={() => setStatus("RESOLVED")}>Mark resolved</button>
                ) : (
                  <button onClick={() => setStatus("OPEN")}>Reopen</button>
                )}
              </div>
              <div className="messages">
                {selected.messages.map((m) => (
                  <div key={m.id} className={`msg ${m.fromRole === "OWNER" ? "mine" : "theirs"}`}>
                    <p>{m.body}</p>
                    <span className="hint">
                      {m.fromRole === "OWNER" ? "You" : selected.member?.user.name} ·{" "}
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  placeholder="Write a reply…"
                  required
                />
                <button type="submit">Send reply</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
