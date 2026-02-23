"use client";

import { useState, useEffect } from "react";
import { addReservation } from "@/lib/reservation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [name, setName] = useState("");
  const [event, setEvent] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [events, setEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🔥 公演取得
  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(collection(db, "events"));
      const list = snap.docs.map((doc) => String(doc.data().name));
      setEvents(list);
    };
    fetchEvents();
  }, []);

  const handleSubmit = async () => {
    if (!name) return alert("名前を入力してください");
    if (!event) return alert("公演を選択してください");

    setLoading(true);
    try {
      await addReservation({ name, event, quantity });
      setSuccess(true); // ✅ ここで完了画面へ
    } catch (e: any) {
      alert("エラー: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 予約完了画面（おしゃれ版）
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

          <h1
  style={{
    margin: 0,
    fontSize: 22,
    color: "#111",      // ← 濃い黒に近い色
    fontWeight: "bold", // ← 太字
  }}
>
  ご予約を受け付けました
</h1>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              color: "#374151",
              lineHeight: 1.7,
            }}
          >
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
              <span style={{ fontWeight: 600, color: "#111827" }}>{event}</span>
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
              <span style={{ fontWeight: 600, color: "#111827" }}>{quantity} 枚</span>
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
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => {
              setName("");
              setEvent("");
              setQuantity(1);
              setSuccess(false); // ✅ フォームに戻る
            }}
          >
            別のライブも予約する
          </button>
        </div>
      </div>
    );
  }

  // ✅ 予約フォーム
  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>予約フォーム</h1>

      <p>名前</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />

      <p>公演</p>
      <select
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      >
        <option value="">選択してください</option>
        {events.map((ev, i) => (
          <option key={i} value={ev}>
            {ev}
          </option>
        ))}
      </select>

      <p>枚数</p>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
        min={1}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          background: "#3182ce",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "送信中..." : "予約する"}
      </button>
    </div>
  );
}