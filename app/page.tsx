"use client";

import { useState } from "react";
import { addReservation } from "@/lib/reservation";

export default function Home() {
  const [name, setName] = useState("");
  const [event, setEvent] = useState("");
  const [tickets, setTickets] = useState(1);

  const handleSubmit = async () => {
    if (!name) return alert("名前を入力してください");
    if (!event) return alert("公演を選択してください");

    await addReservation({
      name,
      event,
      tickets,
    });

    alert("予約を受け付けました！");
    setName("");
    setEvent("");
    setTickets(1);
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
    </div>
  );
}


