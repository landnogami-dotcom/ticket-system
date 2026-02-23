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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔥 公演取得
  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(collection(db, "events"));
      const list = snap.docs.map(doc => doc.data().name);
      setEvents(list);
    };
    fetchEvents();
  }, []);

  const handleSubmit = async () => {
    if (!name) return alert("名前を入力してください");
    if (!event) return alert("公演を選択してください");

    setLoading(true);
    try {
      await addReservation({
        name,
        event,
        quantity,
      });

      // ✅ 成功メッセージ表示
      setSuccessMessage(
        "ご予約を受け付けました。\n当日は受付にてご予約されたお名前をお伝えください。"
      );

      // フォームリセット
      setName("");
      setEvent("");
      setQuantity(1);
    } catch (e: any) {
      alert("エラー: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>予約フォーム ✅更新テスト</h1>

      {/* ✅ 成功メッセージ表示エリア */}
      {successMessage && (
        <div
          style={{
            background: "#e6fffa",
            border: "1px solid #38b2ac",
            color: "#065f5b",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            whiteSpace: "pre-line",
          }}
        >
          {successMessage}
        </div>
      )}

      <p>名前</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />

      <p>公演</p>
      <select
        value={event}
        onChange={e => setEvent(e.target.value)}
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
        onChange={e => setQuantity(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
        min={1}
      />

      <button
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

