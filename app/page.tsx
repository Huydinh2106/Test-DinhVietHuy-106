import PasteForm from "@/components/PasteForm";

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Chia sẻ văn bản trong vài giây</h1>
        <p>
          Dán nội dung, nhận liên kết, gửi cho bất kỳ ai. Không cần đăng nhập, không cần tài khoản.
        </p>
      </section>
      <PasteForm />
      <section className="features">
        <div className="feature">
          <span className="featureIcon">🔗</span>
          <h3>Liên kết riêng tư</h3>
          <p>Mỗi bản chia sẻ có một mã ngẫu nhiên, chỉ ai có liên kết mới xem được.</p>
        </div>
        <div className="feature">
          <span className="featureIcon">⏱️</span>
          <h3>Tự động hết hạn</h3>
          <p>Chọn thời hạn 10 phút đến 7 ngày, hoặc giữ vĩnh viễn — tuỳ bạn.</p>
        </div>
        <div className="feature">
          <span className="featureIcon">📄</span>
          <h3>Xem dạng thô</h3>
          <p>Mỗi bản chia sẻ có kèm liên kết dạng văn bản thuần để tải hoặc dùng với curl.</p>
        </div>
      </section>
    </main>
  );
}
