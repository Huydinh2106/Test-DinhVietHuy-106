import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Share — Chia sẻ text & file",
  description:
    "Dán văn bản hoặc tải file lên, máy khác mở trang là thấy ngay. Không cần đăng nhập.",
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
              <span className="brandMark">🔗</span> Share
            </Link>
            <span className="headerNote">Chia sẻ text &amp; file · Không cần đăng nhập</span>
          </div>
        </header>
        {children}
        <footer className="siteFooter">
          <div className="container">
            <p>Share — chia sẻ text &amp; file nhanh, không tài khoản, không rườm rà.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
