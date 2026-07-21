import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShareText — Bảng văn bản chung",
  description:
    "Một ô văn bản chung: gõ nội dung, bấm Cập nhật, ai mở trang cũng thấy. Không cần đăng nhập.",
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
            <span className="headerNote">Bảng văn bản chung · Không cần đăng nhập</span>
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
