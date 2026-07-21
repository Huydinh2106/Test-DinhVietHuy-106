import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Sinh token để trình duyệt tải file TRỰC TIẾP lên Vercel Blob (không đi qua máy chủ),
// nhờ đó bỏ giới hạn 4,5 MB và tải được file lớn như video.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true, // tải lại cùng tên thì thay thế file cũ
      }),
      // Vercel gọi callback này sau khi tải xong; danh sách lấy qua list() nên không cần xử lý.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
