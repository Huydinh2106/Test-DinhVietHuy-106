import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <div className="card emptyCard">
        <h1>Không tìm thấy nội dung</h1>
        <p className="muted">Liên kết không tồn tại, đã bị xoá hoặc đã hết hạn.</p>
        <Link className="btn btnPrimary" href="/">
          Tạo bản chia sẻ mới
        </Link>
      </div>
    </main>
  );
}
