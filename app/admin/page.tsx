"use client";

import { useEffect, useState, type FormEvent } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

type EventItem = { id: string; name: string; soldOut?: boolean };

type ReservationItem = {
  id: string;
  name: string;
  event: string;
  quantity: number;
  createdAt?: any; // Timestampの型は雑でOK（表示だけ）
};

export default function AdminPage() {
  // 公演
  const [newEventName, setNewEventName] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventLoading, setEventLoading] = useState(false);

  // 予約
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [resLoading, setResLoading] = useState(false);

  // ---- 公演一覧取得
  const fetchEvents = async () => {
    const snap = await getDocs(collection(db, "events"));
    const list = snap.docs.map((d) => {
      const data: any = d.data();
      return {
        id: d.id,
        name: String(data.name ?? ""),
        soldOut: Boolean(data.soldOut ?? false),
      };
    });
    setEvents(list);
  };

  // ---- 予約一覧取得
  const fetchReservations = async () => {
    setResLoading(true);
    try {
      const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          name: String(data.name ?? ""),
          event: String(data.event ?? ""),
          quantity: Number(data.quantity ?? 0),
          createdAt: data.createdAt,
        };
      });
      setReservations(list);
    } finally {
      setResLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchReservations();
  }, []);

  // ---- 公演追加（soldOutは必ずfalseで作る）
  const addEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return alert("公演名を入力してください");

    setEventLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        name: newEventName.trim(),
        soldOut: false,
      });
      setNewEventName("");
      await fetchEvents();
      alert("公演を追加しました！");
    } catch (err: any) {
      alert("追加エラー: " + err.message);
    } finally {
      setEventLoading(false);
    }
  };

  // ---- SOLD OUT切替
  const toggleSoldOut = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "events", id), { soldOut: !current });
      await fetchEvents();
    } catch (err: any) {
      alert("更新エラー: " + err.message);
    }
  };

  // ---- 公演削除
  const removeEvent = async (id: string) => {
    if (!confirm("この公演を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      await fetchEvents();
    } catch (err: any) {
      alert("削除エラー: " + err.message);
    }
  };

  // ---- 予約削除
  const removeReservation = async (id: string) => {
    if (!confirm("この予約を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "reservations", id));
      await fetchReservations();
    } catch (err: any) {
      alert("削除エラー: " + err.message);
    }
  };

  const totalTickets = reservations.reduce((sum, r) => sum + (r.quantity || 0), 0);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>管理画面</h1>

      {/* 公演管理 */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 10 }}>
        <h2>公演管理</h2>

        <form onSubmit={addEvent} style={{ marginTop: 12, marginBottom: 16 }}>
          <p>公演名</p>
          <input
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
            placeholder="例：大阪ライブ 2026/03/20"
          />
          <button type="submit" disabled={eventLoading} style={{ width: "100%", padding: 10 }}>
            {eventLoading ? "追加中..." : "公演を追加"}
          </button>
        </form>

        {events.length === 0 ? (
          <p style={{ opacity: 0.7 }}>まだ公演がありません</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {events.map((ev) => (
              <div
                key={ev.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, wordBreak: "break-word" }}>{ev.name}</div>
                  <div style={{ marginTop: 6 }}>
                    {ev.soldOut ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#ffe5e5",
                          color: "#b00020",
                          fontSize: 12,
                          border: "1px solid #ffb3b3",
                        }}
                      >
                        SOLD OUT
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#e7fff1",
                          color: "#0a7a3d",
                          fontSize: 12,
                          border: "1px solid #b7f3cf",
                        }}
                      >
                        販売中
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleSoldOut(ev.id, Boolean(ev.soldOut))}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      background: ev.soldOut ? "#fff" : "#111",
                      color: ev.soldOut ? "#111" : "#fff",
                    }}
                  >
                    {ev.soldOut ? "販売中に戻す" : "SOLD OUTにする"}
                  </button>

                  <button onClick={() => removeEvent(ev.id)} style={{ padding: "6px 10px" }}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 予約一覧 */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2>予約一覧</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchReservations} style={{ padding: "6px 10px" }}>
              更新
            </button>
            <div style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8 }}>
              合計枚数：{totalTickets}
            </div>
          </div>
        </div>

        {resLoading ? (
          <p>読み込み中...</p>
        ) : reservations.length === 0 ? (
          <p style={{ opacity: 0.7 }}>予約がありません</p>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {reservations.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div>
                    <strong>{r.name}</strong> ／ {r.quantity}枚
                  </div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>{r.event}</div>
                </div>
                <button onClick={() => removeReservation(r.id)} style={{ padding: "6px 10px" }}>
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
