// app/api/line/webhook/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "LINE webhook endpoint alive" });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  console.log("✅ LINE WEBHOOK HIT");
  console.log(JSON.stringify(body, null, 2));

  return NextResponse.json({ ok: true });
}

