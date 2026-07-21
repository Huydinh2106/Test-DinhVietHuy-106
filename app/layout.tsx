import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShareText — Chia sẻ văn bản không cần đăng nhập",
  description:
    "Dán văn bản, nhận liên kết chia sẻ ngay lập tức. Không cần đăng nhập, hỗ trợ tự xoá theo thời hạn.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0e14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <header className="siteHeader">
          <div className="container headerInner">
            <Link href="/" className="brand">
              <span className="brandMark">📝</span> ShareText
            </Link>
            <span className="headerNote">Chia sẻ văn bản · Không cần đăng nhập</span>
          </div>
        </header>
        {children}
        <footer className="siteFooter">
          <div className="container">
            <p>ShareText — chia sẻ văn bản nhanh, không tài khoản, không rườm rà.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
