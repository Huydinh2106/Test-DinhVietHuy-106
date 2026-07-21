import { getPaste } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const paste = await getPaste(params.id);
  if (!paste) {
    return new Response("Không tìm thấy nội dung hoặc đã hết hạn.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(paste.content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
