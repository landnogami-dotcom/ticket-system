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
  eventId?: string;   // ✅ 新：公演ID
  event?: string;     // ✅ 旧：公演名（古い予約のため残す）
  quantity: number;
  createdAt?: any;
};

export default function AdminPage() {
  // ===== ボタン見た目 =====
  const btnBase: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const btnGhost: React.CSSProperties = {
    ...btnBase,
    background: "#f9fafb",
  };

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
  };

  const btnDanger: React.CSSProperties = {
    ...btnBase,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#b91c1c",
  };

  const btnDisabled: React.CSSProperties = {
    opacity: 0.5,
    cursor: "not-allowed",
  };

  // ===== state =====
  const [newEventName, setNewEventName] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventLoading, setEventLoading] = useState(false);

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [resLoading, setResLoading] = useState(false);

  // ---- 編集用
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventName, setEditingEventName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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
          eventId: data.eventId ? String(data.eventId) : undefined,
          event: data.event ? String(data.event) : undefined,
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

  // ---- 公演追加（末尾）
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

  // ---- 公演名編集
  const startEditEvent = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEditingEventName(ev.name);
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEditingEventName("");
  };

  const saveEditEvent = async () => {
    if (!editingEventId) return;
    if (!editingEventName.trim()) return alert("公演名を入力してください");

    setEditSaving(true);
    try {
      await updateDoc(doc(db, "events", editingEventId), { name: editingEventName.trim() });
      await fetchEvents();
      cancelEditEvent();
    } catch (err: any) {
      alert("更新エラー: " + err.message);
    } finally {
      setEditSaving(false);
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

  // ✅ eventId → event 情報
  const eventMap = useMemo(() => {
    const m = new Map<string, EventItem>();
    for (const ev of events) m.set(ev.id, ev);
    return m;
  }, [events]);

  // ✅ eventIdごとに予約をまとめる（新方式）
  const reservationsByEventId = useMemo(() => {
    const map = new Map<string, ReservationItem[]>();
    for (const r of reservations) {
      if (!r.eventId) continue;
      if (!map.has(r.eventId)) map.set(r.eventId, []);
      map.get(r.eventId)!.push(r);
    }
    return map;
  }, [reservations]);

  // ✅ 古い予約（eventId無し）を拾う
  const legacyReservations = useMemo(() => {
    return reservations.filter((r) => !r.eventId);
  }, [reservations]);

  const totalTicketsAll = useMemo(
    () => reservations.reduce((sum, r) => sum + (r.quantity || 0), 0),
    [reservations]
  );

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>管理画面</h1>

      {/* 公演管理 */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>公演管理</h2>

        <form onSubmit={addEvent} style={{ marginTop: 12, marginBottom: 16 }}>
          <input
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 10,
              borderRadius: 10,
              border: "1px solid #d1d5db",
            }}
            placeholder="公演名を入力"
          />
          <button
            type="submit"
            disabled={eventLoading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #bfdbfe",
              background: "#2563eb",
              color: "white",
              fontWeight: 900,
              cursor: eventLoading ? "not-allowed" : "pointer",
              opacity: eventLoading ? 0.7 : 1,
            }}
          >
            {eventLoading ? "追加中..." : "公演を追加"}
          </button>
        </form>

        {events.length === 0 ? (
          <p style={{ opacity: 0.7 }}>まだ公演がありません</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {events.map((ev, idx) => {
              const sum = reservationsByEventId.get(ev.id)?.reduce((s, r) => s + r.quantity, 0) ?? 0;

              return (
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
                    background: "#fff",
                  }}
                >
                  {/* 左側 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 公演名（通常/編集） */}
                    {editingEventId === ev.id ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        <input
                          value={editingEventName}
                          onChange={(e) => setEditingEventName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                          }}
                        />
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            onClick={saveEditEvent}
                            disabled={editSaving}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 10,
                              border: "1px solid #bfdbfe",
                              background: "#2563eb",
                              color: "white",
                              fontWeight: 900,
                              cursor: editSaving ? "not-allowed" : "pointer",
                              opacity: editSaving ? 0.7 : 1,
                            }}
                          >
                            {editSaving ? "保存中..." : "保存"}
                          </button>
                          <button onClick={cancelEditEvent} style={btnGhost}>
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontWeight: 900,
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
                    )}

                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {ev.soldOut ? (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: "#ffe5e5",
                            color: "#b00020",
                            fontSize: 12,
                            border: "1px solid #ffb3b3",
                            fontWeight: 800,
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
                            fontWeight: 800,
                          }}
                        >
                          販売中
                        </span>
                      )}

                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#f3f4f6",
                          color: "#374151",
                          fontSize: 12,
                          border: "1px solid #e5e7eb",
                          fontWeight: 800,
                        }}
                      >
                        予約合計：{sum} 枚
                      </span>
                    </div>
                  </div>

                  {/* 右側ボタン */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      style={{ ...btnGhost, ...(idx === 0 ? btnDisabled : {}) }}
                    >
                      ↑ 上へ
                    </button>

                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === events.length - 1}
                      style={{ ...btnGhost, ...(idx === events.length - 1 ? btnDisabled : {}) }}
                    >
                      ↓ 下へ
                    </button>

                    <button onClick={() => startEditEvent(ev)} style={btnBase}>
                      編集
                    </button>

                    <button onClick={() => toggleSoldOut(ev.id, Boolean(ev.soldOut))} style={ev.soldOut ? btnGhost : btnPrimary}>
                      {ev.soldOut ? "販売中に戻す" : "SOLD OUTにする"}
                    </button>

                    <button onClick={() => removeEvent(ev.id)} style={btnDanger}>
                      削除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 予約（公演ごと：eventIdで追従） */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2>予約一覧（公演ごと）</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={fetchReservations} style={btnGhost}>
              更新
            </button>
            <div style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 10 }}>
              全体合計：<strong>{totalTicketsAll}</strong> 枚
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
              const list = reservationsByEventId.get(ev.id) ?? [];
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
                    <div style={{ fontWeight: 900 }}>{eventMap.get(ev.id)?.name ?? ev.name}</div>
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
                            borderRadius: 12,
                            padding: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            background: "#fafafa",
                          }}
                        >
                          <div>
                            <strong>{r.name}</strong>
                            <span style={{ marginLeft: 8, color: "#374151", fontWeight: 700 }}>
                              ／ {r.quantity}枚
                            </span>
                          </div>
                          <button onClick={() => removeReservation(r.id)} style={btnDanger}>
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 古い予約（eventIdなし） */}
            {legacyReservations.length > 0 && (
              <div
                style={{
                  border: "1px solid #fde68a",
                  borderRadius: 12,
                  padding: 14,
                  background: "#fffbeb",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 8 }}>未紐づけ予約（古い予約データ）</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {legacyReservations.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        border: "1px solid #f3f4f6",
                        borderRadius: 12,
                        padding: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        background: "#fff",
                      }}
                    >
                      <div>
                        <strong>{r.name}</strong>
                        <span style={{ marginLeft: 8, color: "#374151", fontWeight: 700 }}>
                          ／ {r.quantity}枚
                        </span>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                          公演（旧）：{r.event ?? "（不明）"}
                        </div>
                      </div>
                      <button onClick={() => removeReservation(r.id)} style={btnDanger}>
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}