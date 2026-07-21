import SharedText from "@/components/SharedText";
import FileShare from "@/components/FileShare";
import { getText } from "@/lib/textStore";
import { listFiles } from "@/lib/files";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [shared, files] = await Promise.all([
    getText().catch(() => ({ content: "", updatedAt: 0 })),
    listFiles().catch(() => []),
  ]);
  // Có Vercel Blob thì trình duyệt tải thẳng lên Blob (file lớn); không thì tải qua máy chủ.
  const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <main className="container">
      <section className="hero">
        <h1>Chia sẻ nhanh giữa các máy</h1>
        <p>
          Dán văn bản hoặc tải file lên; máy khác mở trang là thấy ngay. Không cần đăng nhập, không
          cần gửi link.
        </p>
      </section>

      <h2 className="sectionLabel">
        <span>📝</span> Văn bản chung
      </h2>
      <SharedText initialContent={shared.content} initialUpdatedAt={shared.updatedAt} />

      <h2 className="sectionLabel">
        <span>📁</span> Chia sẻ file
      </h2>
      <FileShare initialFiles={files} blobEnabled={blobEnabled} />
    </main>
  );
}
