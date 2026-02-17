"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Home() {
  const [name, setName] = useState("");
  const [show, setShow] = useState("");
  const [count, setCount] = useState(1);
  const [shows, setShows] = useState<any[]>([]);

  // 🔥 公演一覧をFirestoreから取得
  useEffect(() => {
    const fetchShows = async () => {
      const snapshot = await getDocs(collection(db, "shows"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShows(list);
    };

    fetchShows();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await addDoc(collection(db, "reservations"), {
      name,
      show,
      count,
      createdAt: new Date(),
    });

    alert("予約完了しました！");
    setName("");
    setShow("");
    setCount(1);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>予約フォーム</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="お名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <select
            value={show}
            onChange={(e) => setShow(e.target.value)}
            required
          >
            <option value="">公演を選択</option>

            {shows.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min={1}
          />
        </div>

        <button type="submit">予約する</button>
      </form>
    </main>
  );
}
