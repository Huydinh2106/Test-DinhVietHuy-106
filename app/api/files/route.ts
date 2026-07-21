import { NextResponse } from "next/server";
import { listFiles, saveFile, deleteFile } from "@/lib/files";
import { MAX_FORMDATA_BYTES, formatBytes } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const files = await listFiles();
  return NextResponse.json({ files }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không có file nào được gửi lên." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File rỗng." }, { status: 400 });
  }
  if (file.size > MAX_FORMDATA_BYTES) {
    return NextResponse.json(
      { error: `File vượt quá ${formatBytes(MAX_FORMDATA_BYTES)} cho chế độ lưu-file.` },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveFile(file.name, buffer);
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(request: Request) {
  let body: { key?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }
  if (typeof body.key !== "string" || body.key.length === 0) {
    return NextResponse.json({ error: "Thiếu khoá file." }, { status: 400 });
  }
  await deleteFile(body.key);
  return NextResponse.json({ ok: true });
}
