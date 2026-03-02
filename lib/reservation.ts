// lib/reservation.ts
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

export type AddReservationInput = {
  name: string;
  eventId: string; // 公演ID
  quantity: number;
};

export async function addReservation(input: AddReservationInput) {
  const name = (input.name ?? "").trim();
  const eventId = (input.eventId ?? "").trim();
  const quantity = Number(input.quantity ?? 0);

  if (!name) throw new Error("名前が空です");
  if (!eventId) throw new Error("公演が未選択です");
  if (!Number.isFinite(quantity) || quantity < 1) throw new Error("枚数が不正です");

  // ① 公演名を events から取得（通知＆管理画面表示用）
  let eventName = "";
  try {
    const evRef = doc(db, "events", eventId);
    const evSnap = await getDoc(evRef);
    const data: any = evSnap.exists() ? evSnap.data() : null;
    eventName = String(data?.name ?? "");
  } catch {
    // 取れなくても予約は通す（通知文が少し弱くなるだけ）
    eventName = "";
  }

  // ② 予約を保存（既存のデータは消えない。addDoc=追加）
  await addDoc(collection(db, "reservations"), {
    name,
    eventId,                 // 新方式：IDで紐づけ
    event: eventName || "",  // 旧方式互換：公演名も残しておく（管理画面が壊れにくい）
    quantity,
    createdAt: serverTimestamp(),
  });

  // ③ LINE通知（失敗しても予約自体は成功扱いにする）
  try {
    const text =
      `✅ 予約が入りました\n` +
      `名前：${name}\n` +
      `公演：${eventName || "（公演名取得できず）"}\n` +
      `枚数：${quantity}枚`;

    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      // ここで throw すると予約まで失敗扱いになって体験が悪いので、ログだけ
      const detail = await res.text().catch(() => "");
      console.warn("LINE notify failed:", res.status, detail);
    }
  } catch (err) {
    console.warn("LINE notify error:", err);
  }
}
