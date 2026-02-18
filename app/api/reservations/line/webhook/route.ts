export async function POST(req: Request) {
  const body = await req.json();
  console.log("LINE webhook:", JSON.stringify(body, null, 2));
  return new Response("OK");
}
