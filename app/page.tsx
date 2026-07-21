import SharedText from "@/components/SharedText";
import { getText } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const shared = await getText();
  return (
    <main className="container">
      <section className="hero">
        <h1>Bảng văn bản chung</h1>
        <p>
          Gõ nội dung rồi bấm <strong>Cập nhật</strong>. Ai mở trang này cũng thấy cùng một nội
          dung, và tự cập nhật sau vài giây — không cần đăng nhập, không cần gửi link.
        </p>
      </section>
      <SharedText initialContent={shared.content} initialUpdatedAt={shared.updatedAt} />
    </main>
  );
}
