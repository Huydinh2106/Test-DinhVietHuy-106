# Hướng dẫn deploy ShareText

App tự chọn nơi lưu dữ liệu:

- **Có biến môi trường Upstash Redis** → lưu vào Redis (dùng cho Vercel / serverless).
- **Không có** → lưu ra file trong thư mục `.data/` (dùng khi chạy local, không cần cấu hình gì).

## Cách 1: Vercel + Upstash Redis (khuyên dùng — miễn phí, ~5 phút)

### Bước 1 — Import repo vào Vercel

1. Vào <https://vercel.com/new>, đăng nhập bằng GitHub.
2. Chọn repo này. Vercel tự nhận diện Next.js, không cần chỉnh gì.
3. Nếu code đang ở nhánh `claude/text-sharing-website-ioyqpv` (chưa merge vào `main`):
   Vercel sẽ deploy `main` cho bản chính. Hãy vào **Settings → Git → Production Branch**
   đổi sang nhánh đó, **hoặc** merge nhánh vào `main` trước cho gọn.

### Bước 2 — Thêm Upstash Redis (nơi lưu dữ liệu)

1. Trong project trên Vercel, mở tab **Storage** → **Create Database** → chọn **Upstash for Redis**.
2. Đặt tên, chọn region gần bạn → **Create**. Vercel tự gắn database vào project và
   tự thêm các biến môi trường (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, …) — code đọc được luôn.
3. Vào tab **Deployments** → **Redeploy** để bản chạy nhận biến môi trường mới.

Xong — mở domain `*.vercel.app` là dùng được, dữ liệu văn bản được lưu bền trên Upstash.

> Cách thủ công (nếu không dùng tab Storage): tạo Redis tại
> <https://console.upstash.com>, vào tab **REST API**, copy `UPSTASH_REDIS_REST_URL` và
> `UPSTASH_REDIS_REST_TOKEN`, rồi dán vào **Settings → Environment Variables** trên Vercel.

## Cách 2: Chạy Docker (VPS / máy chủ riêng)

App vẫn chạy được kiểu lưu file, không cần Redis:

```bash
docker build -t sharetext .
docker run -d --name sharetext -p 80:3000 \
  -v sharetext-data:/data --restart unless-stopped sharetext
```

Muốn dùng Redis thay vì file, truyền thêm:
`-e UPSTASH_REDIS_REST_URL=... -e UPSTASH_REDIS_REST_TOKEN=...`

## Cách 3: Railway / Render

Cả hai tự nhận `Dockerfile`. Nhớ gắn volume mount vào `/data` để giữ dữ liệu (kiểu lưu file),
hoặc đặt biến môi trường Upstash để dùng Redis. Xem chi tiết trong lịch sử commit / phần trên.

## Biến môi trường

| Biến | Bắt buộc? | Ý nghĩa |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | Có, khi deploy serverless (Vercel) | URL REST của Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Có, khi deploy serverless (Vercel) | Token REST của Upstash Redis |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | — | Tên biến Vercel tự đặt khi thêm Upstash qua tab Storage (code đọc được thay cho hai biến trên) |
| `DATA_DIR` | Không | Thư mục lưu file khi *không* dùng Redis (mặc định `.data`, Docker là `/data`) |

> Nếu deploy lên Vercel mà **quên** thêm Redis, app sẽ báo lỗi rõ ràng thay vì lưu hụt dữ liệu.
