"use client";

import { useEffect, useState } from "react";
import { getReservations, deleteReservation } from "@/lib/reservation";

export default function AdminPage() {
  const [reservations, setReservations] = useState<any[]>([]);

  const loadReservations = async () => {
    const data = await getReservations();
    setReservations(data);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteReservation(id);
    loadReservations();
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h1>予約一覧（管理者）</h1>

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
