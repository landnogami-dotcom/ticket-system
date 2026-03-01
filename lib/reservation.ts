// lib/reservation.ts
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type AddReservationInput = {
  name: string;
  eventId: string;     // ✅ 追加：公演ID
  quantity: number;
};

export async function addReservation(input: AddReservationInput) {
  const name = (input.name ?? "").trim();
  const eventId = (input.eventId ?? "").trim();
  const quantity = Number(input.quantity ?? 0);

  if (!name) throw new Error("名前が空です");
  if (!eventId) throw new Error("公演が未選択です");
  if (!Number.isFinite(quantity) || quantity < 1) throw new Error("枚数が不正です");

  await addDoc(collection(db, "reservations"), {
    name,
    eventId,               // ✅ 予約は eventId で紐づけ
    quantity,
    createdAt: serverTimestamp(),
  });
}
