import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShareFile — Chia sẻ file đơn giản",
  description:
    "Tải file lên, máy khác mở trang là tải xuống được. Không cần đăng nhập, không cần gửi link.",
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
              <span className="brandMark">📁</span> ShareFile
            </Link>
            <span className="headerNote">Chia sẻ file · Không cần đăng nhập</span>
          </div>
        </header>
        {children}
        <footer className="siteFooter">
          <div className="container">
            <p>ShareFile — chia sẻ file nhanh, không tài khoản, không rườm rà.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
