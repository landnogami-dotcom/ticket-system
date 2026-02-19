import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("✅ LINE WEBHOOK HIT");
  console.log(JSON.stringify(body, null, 2));

  const event = body?.events?.[0];
  const replyToken = event?.replyToken;
  const text = event?.message?.text;

  if (!replyToken) {
    console.log("No replyToken (maybe verification ping).");
    return NextResponse.json({ ok: true });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error("❌ Missing env: LINE_CHANNEL_ACCESS_TOKEN");
    return NextResponse.json({ ok: false, error: "Missing env" }, { status: 500 });
  }

  // 返信する（replyTokenは短時間で失効するので即返す）
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text: `受信したよ：${text ?? ""}` }],
    }),
  });

  const resText = await res.text();
  console.log("📮 LINE reply status:", res.status);
  console.log("📮 LINE reply body:", resText);

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, status: res.status, body: resText },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
