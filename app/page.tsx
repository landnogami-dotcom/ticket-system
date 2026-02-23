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
  const [success, setSuccess] = useState(false); // ← 追加：完了画面用

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
      await addReservation({
        name,
        event,
        quantity,
      });

      // ✅ 成功したら完了画面へ
      setSuccess(true);
    } catch (e: any) {
      alert("エラー: " + e.message);
    }
    setLoading(false);
  };

  // ✅ 予約完了画面
  if (success) {
    return (
      <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
        <h1>ご予約ありがとうございます！</h1>
        <p style={{ marginTop: 16 }}>
          ご予約を受け付けました。<br />
          当日は受付で <strong>{name}</strong> とお伝えください。
        </p>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa",
            textAlign: "left",
          }}
        >
          <p>公演：{event}</p>
          <p>枚数：{quantity} 枚</p>
        </div>

        <button
          style={{ marginTop: 24, padding: "10px 20px" }}
          onClick={() => {
            // フォームに戻す
            setName("");
            setEvent("");
            setQuantity(1);
            setSuccess(false);
          }}
        >
          もう一件予約する
        </button>
      </div>
    );
  }

  // ✅ 予約フォーム
  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>予約フォーム</h1>

      <p>名前</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <p>公演</p>
      <select
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
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
        style={{ width: "100%", marginBottom: 10 }}
        min={1}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "送信中..." : "予約する"}
      </button>
    </div>
  );
}

