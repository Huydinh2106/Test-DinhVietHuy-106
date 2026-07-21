import { NextResponse } from "next/server";
import { getText, setText } from "@/lib/textStore";
import { MAX_TEXT_LENGTH } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getText();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : "";
  if (content.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Nội dung vượt quá ${MAX_TEXT_LENGTH.toLocaleString("vi-VN")} ký tự.` },
      { status: 400 },
    );
  }

  try {
    const data = await setText(content);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }
}
