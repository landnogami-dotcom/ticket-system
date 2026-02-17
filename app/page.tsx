"use client";

import { useState, useEffect } from "react";
import { addReservation } from "@/lib/reservation";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [name, setName] = useState("");
  const [tickets, setTickets] = useState(1);
  const [reservations, setReservations] = useState<any[]>([]);

  const fetchReservations = async () => {
    const snapshot = await getDocs(collection(db, "reservations"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReservations(list);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await addReservation({
      name,
      tickets,
    });

    setName("");
    setTickets(1);

    fetchReservations();
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>予約フォーム</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <input
            type="number"
            value={tickets}
            onChange={(e) => setTickets(Number(e.target.value))}
          />
        </div>

        <button type="submit">予約する</button>
      </form>

      <h2>予約一覧</h2>

      <ul>
        {reservations.map((r) => (
          <li key={r.id}>
            {r.name} / {r.tickets}枚
          </li>
        ))}
      </ul>
    </main>
  );
}

