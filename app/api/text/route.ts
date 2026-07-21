import { NextResponse } from "next/server";
import { getText, setText } from "@/lib/store";
import { MAX_LENGTH } from "@/lib/constants";

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
  if (content.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Nội dung vượt quá giới hạn ${MAX_LENGTH.toLocaleString("vi-VN")} ký tự.` },
      { status: 400 },
    );
  }

  const data = await setText(content);
  return NextResponse.json(data);
}
