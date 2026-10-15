import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { Notification } from "../lib/types";

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<{ notifications: Notification[] }>("/notifications").then((r) => setNotifications(r.notifications));
  }

  useEffect(load, []);

  async function send(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/notifications", { title, body });
      setTitle("");
      setBody("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await api.delete(`/notifications/${id}`);
    load();
  }

  return (
    <div>
      <h1>Notifications</h1>
      <p className="hint">Announcements are shown to every member of your gym in the mobile app.</p>

      <h2>New announcement</h2>
      <form onSubmit={send}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
        </label>
        <label>
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={4}
            required
          />
        </label>
        <button type="submit">Send to all members</button>
        {error && <p className="error">{error}</p>}
      </form>

      <h2>Sent</h2>
      {notifications.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        <ul className="notif-list">
          {notifications.map((n) => (
            <li key={n.id}>
              <div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <span className="hint">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <button onClick={() => remove(n.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
