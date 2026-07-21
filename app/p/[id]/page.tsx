import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaste } from "@/lib/store";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paste = await getPaste(params.id);
  return {
    title: paste ? `${paste.title || "Văn bản không tiêu đề"} — ShareText` : "Không tìm thấy — ShareText",
  };
}

export default async function PastePage({ params }: Props) {
  const paste = await getPaste(params.id, { countView: true });
  if (!paste) {
    notFound();
  }

  return (
    <main className="container">
      <article className="card pasteCard">
        <header className="pasteHeader">
          <h1>{paste.title || "Văn bản không tiêu đề"}</h1>
          <p className="pasteMeta">
            Tạo lúc {dateFormat.format(paste.createdAt)} · {paste.views.toLocaleString("vi-VN")} lượt xem
            {paste.expiresAt !== null && <> · Tự xoá lúc {dateFormat.format(paste.expiresAt)}</>}
          </p>
        </header>
        <div className="actionRow">
          <CopyButton label="Sao chép liên kết" primary />
          <CopyButton text={paste.content} label="Sao chép nội dung" />
          <a className="btn" href={`/p/${paste.id}/raw`}>
            Xem dạng thô
          </a>
        </div>
        <pre className="pasteContent">{paste.content}</pre>
      </article>
      <p className="backRow">
        <Link href="/">← Tạo bản chia sẻ mới</Link>
      </p>
    </main>
  );
}
