/** @type {import('next').NextConfig} */
const nextConfig = {
  // Đóng gói server tự chạy vào .next/standalone để Docker image nhỏ gọn.
  output: "standalone",
};

export default nextConfig;
