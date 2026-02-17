import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export const addReservation = async (data: {
  name: string;
  tickets: number;
}) => {
  await addDoc(collection(db, "reservations"), {
    name: data.name,
    tickets: data.tickets,
    createdAt: Timestamp.now(),
  });
};




