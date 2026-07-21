import { readLocalFile } from "@/lib/files";

export const dynamic = "force-dynamic";

// Tải xuống cho backend file (chạy local). Trên Vercel, file tải trực tiếp qua URL của Blob.
export async function GET(_request: Request, { params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const data = await readLocalFile(name);
  if (!data) {
    return new Response("Không tìm thấy file.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
}
