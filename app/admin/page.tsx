"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [shows, setShows] = useState<any[]>([]);

  const showsRef = collection(db, "shows");

  const fetchShows = async () => {
    const snapshot = await getDocs(showsRef);
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setShows(list);
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const addShow = async () => {
    if (!title || !date) {
      alert("入力してください");
      return;
    }

    await addDoc(showsRef, {
      title,
      date,
    });

    setTitle("");
    setDate("");

    fetchShows();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>管理ページ</h1>

      <h2>公演追加</h2>

      <input
        placeholder="公演名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <br /><br />

      <button onClick={addShow}>
        公演追加
      </button>

      <hr />

      <h2>登録済み公演</h2>

      {shows.map((show) => (
        <div key={show.id}>
          {show.title} / {show.date}
        </div>
      ))}
    </div>
  );
}
