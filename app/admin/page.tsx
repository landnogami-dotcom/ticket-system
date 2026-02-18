"use client";

import { useEffect, useState, type FormEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

type EventItem = { id: string; name: string };

export default function AdminPage() {
  const [newEventName, setNewEventName] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    const snapshot = await getDocs(collection(db, "events"));
    const list = snapshot.docs.map((d) => ({
      id: d.id,
      name: String(d.data().name ?? ""),
    }));
    setEvents(list);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return alert("公演名を入力してください");

    setLoading(true);
    try {
      await addDoc(collection(db, "events"), { name: newEventName.trim() });
      setNewEventName("");
      await fetchEvents();
      alert("公演を追加しました！");
    } catch (err: any) {
      alert("追加エラー: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeEvent = async (id: string) => {
    if (!confirm("この公演を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      await fetchEvents();
    } catch (err: any) {
      alert("削除エラー: " + err.message);
    }
  };

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1>管理画面（公演管理）</h1>

      <form onSubmit={addEvent} style={{ marginTop: 16, marginBottom: 24 }}>
        <p>公演名</p>
        <input
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
          placeholder="例：大阪ライブ 2026/03/20"
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "追加中..." : "公演を追加"}
        </button>
      </form>

      <h2>登録済み公演</h2>
      {events.length === 0 ? (
        <p style={{ opacity: 0.7 }}>まだ公演がありません</p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>{ev.name}</div>
              <button onClick={() => removeEvent(ev.id)} style={{ padding: "6px 10px" }}>
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
