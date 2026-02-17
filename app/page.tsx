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

      alert("予約完了！");
      setName("");
      setEvent("");
      setQuantity(1);
    } catch (e: any) {
      alert("エラー: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>予約フォーム</h1>

      <p>名前</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <p>公演</p>
      <select
        value={event}
        onChange={e => setEvent(e.target.value)}
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
        onChange={e => setQuantity(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "送信中..." : "予約する"}
      </button>
    </div>
  );
}

