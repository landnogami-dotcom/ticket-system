"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  event: string; // ← 公演名が入ってる想定
  quantity: number;
  createdAt?: any;
};

export default function AdminPage() {
  // 公演
  const [newEventName, setNewEventName] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventLoading, setEventLoading] = useState(false);

  // 予約
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

  // ---- 公演追加（末尾に追加）
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

  // ---- 並び順入れ替え（↑↓）
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

  // ---- 公演ごとに予約をまとめる（event名でグループ化）
  const reservationsByEvent = useMemo(() => {
    const map = new Map<string, ReservationItem[]>();
    for (const r of reservations) {
      const key = r.event || "（公演名なし）";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [reservations]);

  const totalTicketsAll = useMemo(
    () => reservations.reduce((sum, r) => sum + (r.quantity || 0), 0),
    [reservations]
  );

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
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
                {/* 2行まで表示 */}
                <div style={{ flex: 1, minWidth: 0 }}>
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

                  <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
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

                    {/* この公演の予約合計 */}
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "#f3f4f6",
                        color: "#374151",
                        fontSize: 12,
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      予約合計：{reservationsByEvent.get(ev.name)?.reduce((s, r) => s + r.quantity, 0) ?? 0} 枚
                    </span>
                  </div>
                </div>

                {/* ボタン */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
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

      {/* 予約（公演ごとにまとめて表示） */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2>予約一覧（公演ごと）</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={fetchReservations} style={{ padding: "6px 10px" }}>
              更新
            </button>
            <div style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8 }}>
              全体合計：{totalTicketsAll} 枚
            </div>
          </div>
        </div>

        {resLoading ? (
          <p>読み込み中...</p>
        ) : reservations.length === 0 ? (
          <p style={{ opacity: 0.7 }}>予約がありません</p>
        ) : (
          <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
            {events.map((ev) => {
              const list = reservationsByEvent.get(ev.name) ?? [];
              const sum = list.reduce((s, r) => s + (r.quantity || 0), 0);

              return (
                <div
                  key={ev.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 14,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 800 }}>{ev.name}</div>
                    <div style={{ color: "#374151" }}>
                      合計 <strong>{sum}</strong> 枚 ／ {list.length} 件
                    </div>
                  </div>

                  {list.length === 0 ? (
                    <div style={{ marginTop: 10, opacity: 0.7 }}>この公演の予約はまだありません</div>
                  ) : (
                    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                      {list.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            border: "1px solid #eee",
                            borderRadius: 10,
                            padding: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div>
                            <strong>{r.name}</strong>
                            <span style={{ marginLeft: 8, color: "#374151" }}>／ {r.quantity}枚</span>
                          </div>
                          <button onClick={() => removeReservation(r.id)} style={{ padding: "6px 10px" }}>
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}