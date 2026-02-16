import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export async function GET(req: NextRequest) {
  try {
    const snapshot = await getDocs(collection(db, "reservations"));
    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(reservations);
  } catch (err) {
    console.error("Failed to fetch reservations:", err);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

