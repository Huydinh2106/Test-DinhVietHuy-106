import FileShare from "@/components/FileShare";
import { listFiles } from "@/lib/files";

export const dynamic = "force-dynamic";

export default async function Home() {
  const files = await listFiles();
  return (
    <main className="container">
      <section className="hero">
        <h1>Chia sẻ file</h1>
        <p>
          Tải file lên ở máy này, máy khác mở trang là tải xuống được. Không cần đăng nhập, không
          cần gửi link.
        </p>
      </section>
      <FileShare initialFiles={files} />
    </main>
  );
}
