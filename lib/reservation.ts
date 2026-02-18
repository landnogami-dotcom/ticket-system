import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const COLLECTION_NAME = "reservations";

// 予約追加
export async function addReservation(data: {
  name: string;
  event: string;
  quantity: number;
}) {

}) {
  await addDoc(collection(db, COLLECTION_NAME), data);
}

// 予約取得
export async function getReservations() {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

// 予約削除
export async function deleteReservation(id: string) {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}




