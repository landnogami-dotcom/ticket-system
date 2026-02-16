import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export const addReservation = async ({
  name,
  email,
  address,
  event,
  ticketType,
  quantity,
}: {
  name: string;
  email: string;
  address?: string;
  event: string;
  ticketType: string;
  quantity: number;
}) => {
  const colRef = collection(db, "reservations");
  const docRef = await addDoc(colRef, {
    name,
    email,
    address,
    performance: event,
    ticketType,
    quantity,
    createdAt: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
};





