import { NextResponse } from "next/server";
import { createPaste } from "@/lib/store";
import { EXPIRY_MS, MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "@/lib/limits";

export async function POST(request: Request) {
  let body: { title?: unknown; content?: unknown; expiry?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const expiry = typeof body.expiry === "string" ? body.expiry : "never";

  if (content.trim().length === 0) {
    return NextResponse.json({ error: "Nội dung không được để trống." }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Nội dung vượt quá giới hạn ${MAX_CONTENT_LENGTH.toLocaleString("vi-VN")} ký tự.` },
      { status: 400 },
    );
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `Tiêu đề vượt quá giới hạn ${MAX_TITLE_LENGTH} ký tự.` },
      { status: 400 },
    );
  }
  if (!(expiry in EXPIRY_MS)) {
    return NextResponse.json({ error: "Thời hạn không hợp lệ." }, { status: 400 });
  }

  const ttl = EXPIRY_MS[expiry];
  const paste = await createPaste({
    title,
    content,
    expiresAt: ttl === null ? null : Date.now() + ttl,
  });

  return NextResponse.json({ id: paste.id }, { status: 201 });
}
