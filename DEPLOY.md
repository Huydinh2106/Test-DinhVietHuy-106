# Hướng dẫn deploy ShareText

App lưu dữ liệu ra file trên đĩa (`DATA_DIR`, mặc định trong Docker là `/data/pastes`), vì vậy cần nền tảng chạy **server thật** (không phải serverless). Repo đã có sẵn `Dockerfile` nên các nền tảng bên dưới đều tự nhận diện và build được ngay.

## Cách 1: Railway (khuyên dùng — nhanh nhất, ~5 phút)

1. Vào <https://railway.app>, đăng nhập bằng GitHub.
2. Bấm **New Project** → **Deploy from GitHub repo** → chọn repo này (cấp quyền truy cập repo nếu được hỏi).
3. Railway tự phát hiện `Dockerfile` và build — không cần cấu hình gì thêm.
4. Gắn ổ đĩa bền để paste không mất khi redeploy: vào service → tab **Volumes** (hoặc chuột phải vào service → **Attach Volume**) → mount path nhập `/data`.
5. Vào tab **Settings** → **Networking** → bấm **Generate Domain** → nhận link dạng `https://<tên>.up.railway.app`.

Xong — mở link là dùng được. (Railway cho gói trial miễn phí; sau đó gói Hobby ~5 USD/tháng.)

## Cách 2: Render

1. Vào <https://render.com>, đăng nhập bằng GitHub.
2. **New** → **Web Service** → chọn repo này. Render tự nhận `Dockerfile`.
3. Chọn gói và bấm **Deploy Web Service**.

Lưu ý: gói **Free** của Render không có đĩa bền — mỗi lần service khởi động lại (hoặc ngủ do không có truy cập) các paste sẽ mất. Muốn giữ dữ liệu: dùng gói Starter và thêm **Disk** với mount path `/data`.

## Cách 3: VPS / máy chủ riêng có Docker

```bash
git clone <repo-url> sharetext && cd sharetext
docker build -t sharetext .
docker run -d --name sharetext \
  -p 80:3000 \
  -v sharetext-data:/data \
  --restart unless-stopped \
  sharetext
```

Mở `http://<ip-máy-chủ>` là chạy. Muốn có HTTPS, đặt Nginx/Caddy làm reverse proxy phía trước (Caddy tự lo chứng chỉ SSL chỉ với 2 dòng cấu hình).

## Vì sao chưa deploy được lên Vercel?

Vercel chạy dạng serverless: hệ thống file chỉ đọc và không giữ lại giữa các request, nên kiểu lưu file JSON hiện tại sẽ lỗi/mất dữ liệu. Muốn dùng Vercel cần chuyển lớp lưu trữ (`lib/store.ts`) sang database như Upstash Redis hoặc Vercel Postgres — thay đổi nhỏ, gói gọn trong một file, có thể bổ sung sau nếu cần.

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `DATA_DIR` | `.data/pastes` (local) / `/data/pastes` (Docker) | Thư mục lưu các bản chia sẻ |
| `PORT` | `3000` | Cổng server lắng nghe |
