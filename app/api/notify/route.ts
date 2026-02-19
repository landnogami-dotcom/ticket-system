// app/api/notify/route.ts
import { NextResponse } from "next/server";

type NotifyBody = {
  text: string;
};

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as NotifyBody;

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const to = process.env.LINE_USER_ID;

    if (!token || !to) {
      return NextResponse.json(
        { error: "Missing LINE env vars (LINE_CHANNEL_ACCESS_TOKEN / LINE_USER_ID)" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text: text ?? "通知テスト" }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("LINE push failed:", res.status, detail);
      return NextResponse.json(
        { error: "LINE push failed", status: res.status, detail },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
