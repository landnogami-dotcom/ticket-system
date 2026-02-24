"use client";

import { useState, useEffect } from "react";
import { addReservation } from "@/lib/reservation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type EventItem = { id: string; name: string; soldOut?: boolean };

export default function Home() {
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(collection(db, "events"));
      const list: EventItem[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          name: String(data.name ?? ""),
          soldOut: Boolean(data.soldOut ?? false),
        };
      });
      setEvents(list);
    };
    fetchEvents();
  }, []);

  const selectedEvent = events.find((e) => e.id === eventId);

  const handleSubmit = async () => {
    if (!name) return alert("名前を入力してください");
    if (!selectedEvent) return alert("公演を選択してください");
    if (selectedEvent.soldOut) return alert("申し訳ありません。この公演はソールドアウトです。");

    setLoading(true);
    try {
      await addReservation({ name, event: selectedEvent.name, quantity });
      setSuccess(true);
    } catch (e: any) {
      alert("エラー: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 完了画面（そのまま）
  if (success) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "56px auto",
          padding: 20,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 22,
            background: "white",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 14px",
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              background: "#ecfeff",
              border: "1px solid #a5f3fc",
              fontSize: 28,
            }}
          >
            ✅
          </div>

          <h1 style={{ margin: 0, fontSize: 22, color: "#111", fontWeight: 800 }}>
            ご予約を受け付けました
          </h1>

          <p style={{ marginTop: 12, marginBottom: 0, color: "#374151", lineHeight: 1.7 }}>
            ありがとうございます。<br />
            当日は受付にてご予約のお名前をお伝えください。お待ちしております！
          </p>

          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 14,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ color: "#6b7280" }}>公演</span>
              <span style={{ fontWeight: 700, color: "#111827" }}>{selectedEvent?.name ?? ""}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 10,
              }}
            >
              <span style={{ color: "#6b7280" }}>枚数</span>
              <span style={{ fontWeight: 700, color: "#111827" }}>{quantity} 枚</span>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
              ※ 受付でお名前を確認できればOKです
            </div>
          </div>

          <button
            style={{
              marginTop: 18,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              background: "#111827",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
            onClick={() => {
              setName("");
              setEventId("");
              setQuantity(1);
              setSuccess(false);
            }}
          >
            別のライブも予約する
          </button>
        </div>
      </div>
    );
  }

  // ✅ フォーム（おしゃれ＆スマホ見やすい）
  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#374151",
    fontWeight: 700,
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#f9fafb",
  outline: "none",
  fontSize: 16,
  color: "#111827",   // ← これを追加（濃い文字色）
};

  const helpStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  };

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "30px auto",
        padding: 16,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#111827" }}>
            チケット取り置き
          </h1>
          <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
            必要事項を入力して送信してください
          </div>
        </div>

        {/* 名前 */}
        <div style={{ marginTop: 14 }}>
          <div style={labelStyle}>お名前</div>
          <input
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder=""
  style={inputStyle}
/>
          <div style={helpStyle}>※ フルネームがおすすめ</div>
        </div>

        {/* 公演 */}
        <div style={{ marginTop: 14 }}>
          <div style={labelStyle}>公演</div>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={inputStyle}
          >
            <option value="">選択してください</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id} disabled={Boolean(ev.soldOut)}>
                {ev.name}
                {ev.soldOut ? "（SOLD OUT）" : ""}
              </option>
            ))}
          </select>

          {selectedEvent?.soldOut ? (
            <div style={{ ...helpStyle, color: "#b00020", fontWeight: 700 }}>
              この公演はソールドアウトです
            </div>
          ) : (
            <div style={helpStyle}>※ SOLD OUT の公演は選択できません</div>
          )}
        </div>

        {/* 枚数 */}
        <div style={{ marginTop: 14 }}>
          <div style={labelStyle}>枚数</div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={inputStyle}
            min={1}
          />
          <div style={helpStyle}>※ 1〜で入力</div>
        </div>

        {/* 送信 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || Boolean(selectedEvent?.soldOut)}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "14px 14px",
            borderRadius: 12,
            border: "none",
            background: loading || Boolean(selectedEvent?.soldOut) ? "#9ca3af" : "#2563eb",
            color: "white",
            fontWeight: 900,
            fontSize: 16,
            cursor: loading || Boolean(selectedEvent?.soldOut) ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "送信中..." : "予約する"}
        </button>

        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
          送信後、完了画面が表示されます。<br />
          当日は受付にてお名前をお伝えください。
        </div>
      </div>

      {/* フォーカス時に枠をくっきりさせる小技（CSSを使わずinlineで） */}
      <div style={{ display: "none" }} />
    </div>
  );
}