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

type EventItem = {
  id: string;
  name: string;
  soldOut?: boolean;
  order?: number;
};

type ReservationItem = {
  id: string;
  name: string;
  event: string;
  quantity: number;
  createdAt?: any;
};

export default function AdminPage() {
  const [newEventName, setNewEventName] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventLoading, setEventLoading] = useState(false);

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [resLoading, setResLoading] = useState(false);

  // ---- 公演一覧取得（order順）
  const fetchEvents = async () => {
    const q = query(collection(db, "events"), orderBy("order", "asc"));
    const snap = await getDocs(q);

    const list = snap.docs.map((d) => {
      const data: any = d.data();
      return {
        id: d.id,
        name: String(data.name ?? ""),
        soldOut: Boolean(data.soldOut ?? false),
        order: Number(data.order ?? 0),
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

  // ---- 公演追加
  const addEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return alert("公演名を入力してください");

    setEventLoading(true);
    try {
      const maxOrder = events.reduce((m, ev) => Math.max(m, ev.order ?? 0), 0);

      await addDoc(collection(db, "events"), {
        name: newEventName.trim(),
        soldOut: false,
        order: maxOrder + 1,
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

  // ---- 並び替え
  const swapOrder = async (a: EventItem, b: EventItem) => {
    try {
      const aOrder = Number(a.order ?? 0);
      const bOrder = Number(b.order ?? 0);

      await updateDoc(doc(db, "events", a.id), { order: bOrder });
      await updateDoc(doc(db, "events", b.id), { order: aOrder });

      await fetchEvents();
    } catch (err: any) {
      alert("並び替えエラー: " + err.message);
    }
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    await swapOrder(events[index], events[index - 1]);
  };

  const moveDown = async (index: number) => {
    if (index >= events.length - 1) return;
    await swapOrder(events[index], events[index + 1]);
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
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h1>管理画面</h1>

      {/* 公演管理 */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>公演管理</h2>

        <form onSubmit={addEvent} style={{ marginTop: 12, marginBottom: 16 }}>
          <input
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
            placeholder="公演名を入力"
          />
          <button type="submit" disabled={eventLoading} style={{ width: "100%", padding: 10 }}>
            {eventLoading ? "追加中..." : "公演を追加"}
          </button>
        </form>

        {events.length === 0 ? (
          <p style={{ opacity: 0.7 }}>まだ公演がありません</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {events.map((ev, idx) => (
              <div
                key={ev.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                {/* 🔥 2行まで表示（縦長防止） */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      lineHeight: 1.4,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-word",
                    }}
                    title={ev.name}
                  >
                    {ev.name}
                  </div>

                  <div style={{ marginTop: 6 }}>
                    {ev.soldOut ? (
                      <span
                        style={{
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

                {/* ボタン群 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <button onClick={() => moveUp(idx)} disabled={idx === 0}>
                    ↑
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === events.length - 1}>
                    ↓
                  </button>
                  <button onClick={() => toggleSoldOut(ev.id, Boolean(ev.soldOut))}>
                    {ev.soldOut ? "販売中に戻す" : "SOLD OUT"}
                  </button>
                  <button onClick={() => removeEvent(ev.id)}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 予約一覧 */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>予約一覧</h2>

        <div style={{ marginBottom: 10 }}>合計枚数：{totalTickets}</div>

        {resLoading ? (
          <p>読み込み中...</p>
        ) : reservations.length === 0 ? (
          <p style={{ opacity: 0.7 }}>予約がありません</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {reservations.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong>{r.name}</strong> ／ {r.quantity}枚
                  <div style={{ fontSize: 14, opacity: 0.8 }}>{r.event}</div>
                </div>
                <button onClick={() => removeReservation(r.id)}>削除</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}