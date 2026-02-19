import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";

// GET: 予約一覧取得
export async function GET() {
  try {
    const snap = await getDocs(collection(db, "reservations"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    return NextResponse.json(list);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: 予約追加
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const event = String(body?.event ?? "").trim();
    const quantity = Number(body?.quantity ?? 0);

    if (!name || !event || !quantity) {
      return NextResponse.json({ error: "invalid data" }, { status: 400 });
    }

    const ref = await addDoc(collection(db, "reservations"), {
      name,
      event,
      quantity,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: 予約削除
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await deleteDoc(doc(db, "reservations", id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
