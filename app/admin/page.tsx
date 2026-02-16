"use client";

import { useEffect, useState } from "react";

type Reservation = {
  id: string;
  name: string;
  email: string;
  address?: string;
  performance: string;
  ticketType: string;
  quantity: number;
};

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetch("/api/reservations")
      .then(res => res.json())
      .then(data => setReservations(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>予約一覧（管理画面）</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>名前</th>
            <th>メール</th>
            <th>住所</th>
            <th>公演</th>
            <th>チケット種類</th>
            <th>枚数</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.address}</td>
              <td>{r.performance}</td>
              <td>{r.ticketType}</td>
              <td>{r.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



