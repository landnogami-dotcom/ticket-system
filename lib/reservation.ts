import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

const RESERVATIONS = "reservations";

// 予約追加
export async function addReservation(data: {
  name: string;
  event: string;
  quantity: number;
}) {
  await addDoc(collection(db, RESERVATIONS), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

// 予約取得（一覧表示用）
export async function getReservations() {
  const snapshot = await getDocs(collection(db, RESERVATIONS));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
}

// 予約削除
export async function deleteReservation(id: string) {
  await deleteDoc(doc(db, RESERVATIONS, id));
}
