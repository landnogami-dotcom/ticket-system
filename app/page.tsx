"use client";

import { useState, useEffect } from "react";
import { addReservation, getReservations, deleteReservation } from "@/lib/reservation";

export default function Home() {
  const [name, setName] = useState("");
  const [event, setEvent] = useState("");
  const [tickets, setTickets] = useState(1);
  const [reservations, setReservations] = useState<any[]>([]);

  // 🔄 予約一覧取得
  const loadReservations = async () => {
    const data = await getReservations();
    setReservations(data);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // 📨 送信
  const handleSubmit = async () => {
    if (!name) return alert("名前を入力してください");
    if (!event) return alert("公演を選択してください");

    await addReservation({
      name,
      event,
      tickets,
    });

    setName("");
    setEvent("");
    setTickets(1);
    loadReservations();
  };

  // 🗑 削除
  const handleDelete = async (id: string) => {
    await deleteReservation(id);
    loadReservations();
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>予約フォーム</h1>

      <div>
        <p>名前</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
      </div>

      <div>
        <p>公演</p>
        <select
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        >
          <option value="">公演を選択</option>
          <option value="広島ライブ">広島ライブ</option>
          <option value="大阪ライブ">大阪ライブ</option>
          <option value="東京ライブ">東京ライブ</option>
        </select>
      </div>

      <div>
        <p>枚数</p>
        <input
          type="number"
          value={tickets}
          onChange={(e) => setTickets(Number(e.target.value))}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
      </div>

      <button onClick={handleSubmit} style={{ width: "100%", padding: 10 }}>
        予約する
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>予約一覧</h2>
      {reservations.map((r) => (
        <div key={r.id} style={{ marginBottom: 10 }}>
          {r.name} / {r.event} / {r.tickets}枚
          <button
            onClick={() => handleDelete(r.id)}
            style={{ marginLeft: 10 }}
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
}


