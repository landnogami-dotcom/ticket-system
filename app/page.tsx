"use client";

import { useState, useEffect } from "react";
import { addReservation } from "@/lib/reservation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [event, setEvent] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [ticketType, setTicketType] = useState("一般");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Firebaseから公演取得
  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const list = snapshot.docs.map((doc) => doc.data().name);
      setEvents(list);
    };
    fetchEvents();
  }, []);

  const handleSubmit = async () => {
    if (!name) return alert("お名前を入力してください");
    if (!event) return alert("公演を選択してください");

    setLoading(true);
    try {
      await addReservation({ name, email, address, event, ticketType, quantity });
      alert("予約を受け付けました！");
      setName("");
      setEmail("");
      setAddress("");
      setEvent("");
      setTicketType("一般");
      setQuantity(1);
    } catch (e: any) {
      console.error(e);
      alert("エラーが発生しました: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>チケット予約</h1>

      <div>
        <p>お名前</p>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
      </div>

      <div>
        <p>メール</p>
        <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
      </div>

      <div>
        <p>住所（任意）</p>
        <input value={address} onChange={e => setAddress(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
      </div>

      <div>
        <p>公演</p>
        <select value={event} onChange={e => setEvent(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8 }}>
          <option value="">公演を選択</option>
          {events.map((ev, index) => (
            <option key={index} value={ev}>
              {ev}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p>チケット種類</p>
        <select value={ticketType} onChange={e => setTicketType(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8 }}>
          <option value="一般">一般</option>
          <option value="先行">先行</option>
        </select>
      </div>

      <div>
        <p>枚数</p>
        <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={{ width: "100%", padding: 8, marginBottom: 8 }} />
      </div>

      <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: 10 }}>
        {loading ? "送信中..." : "予約する"}
      </button>
    </div>
  );
}
