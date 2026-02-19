// app/api/notify/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const to = process.env.LINE_NOTIFY_USER_ID; // あなたのuserIdを入れる

    if (!token) {
      console.error("LINE_CHANNEL_ACCESS_TOKEN is missing");
      return NextResponse.json({ error: "token missing" }, { status: 500 });
    }
    if (!to) {
      console.error("LINE_NOTIFY_USER_ID is missing");
      return NextResponse.json({ error: "userId missing" }, { status: 500 });
    }
    if (!text) {
      return NextResponse.json({ error: "text missing" }, { status: 400 });
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text }],
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error("LINE push failed:", res.status, body);
      return NextResponse.json(
        { error: "LINE push failed", status: res.status, body },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("notify error:", e);
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
