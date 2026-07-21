# Hướng dẫn deploy Share

App có hai tính năng, mỗi tính năng tự chọn nơi lưu:

- **Văn bản chung** → Upstash Redis (`UPSTASH_REDIS_REST_URL`/`TOKEN` hoặc `KV_REST_API_*`); không có thì lưu file `.data/shared.json` (local).
- **Chia sẻ file** → Vercel Blob (`BLOB_READ_WRITE_TOKEN`); không có thì lưu vào `.data/uploads/` (local).

> Redis được truy cập **phía server**, nên phần văn bản chạy được kể cả khi mạng công ty chặn
> domain của Upstash. Còn file lớn thì trình duyệt tải **trực tiếp** lên Blob, nên cần domain Blob
> không bị chặn.

## Trên Vercel cần bật gì

| Tính năng | Tích hợp Storage | Biến môi trường Vercel tự thêm |
| --- | --- | --- |
| Văn bản chung | **Upstash for Redis** | `KV_REST_API_URL`, `KV_REST_API_TOKEN` |
| Chia sẻ file | **Blob** | `BLOB_READ_WRITE_TOKEN` |

Thêm cái nào thì tính năng đó chạy; thiếu thì phần đó báo lỗi rõ ràng khi dùng, không làm hỏng
phần còn lại. Sau khi thêm, nhớ **Deployments → Redeploy**.

## Cách 1: Vercel + Vercel Blob (khuyên dùng — miễn phí, ~5 phút)

### Bước 1 — Import repo vào Vercel

1. Vào <https://vercel.com/new>, đăng nhập bằng GitHub.
2. Chọn repo này. Vercel tự nhận diện Next.js, không cần chỉnh gì → **Deploy**.

### Bước 2 — Thêm Vercel Blob (nơi lưu file)

1. Trong project trên Vercel, mở tab **Storage** → **Create Database** → chọn **Blob**.
2. Đặt tên → **Create**. Vercel tự gắn vào project và thêm biến `BLOB_READ_WRITE_TOKEN`.
3. Vào tab **Deployments** → **Redeploy** để bản chạy nhận biến môi trường mới.

Xong — mở domain `*.vercel.app`, tải file lên là dùng được; file lưu bền trên Vercel Blob.

> Lưu ý: nếu bạn từng thêm **Upstash Redis** ở bước trước (cho phiên bản chia sẻ text),
> giờ không cần nữa — có thể để đó (không tốn gì) hoặc xoá trong tab Storage.

### Kích thước file

Khi đã bật Vercel Blob, trình duyệt **tải file trực tiếp lên Blob** (không qua máy chủ), nên
**không bị giới hạn 4,5 MB** — tải được file lớn như video (Blob hỗ trợ tới hàng GB), kèm thanh
tiến trình %. Chỉ khi chạy *local chưa có Blob* thì mới dùng luồng tải-qua-máy-chủ.

Lưu ý: Vercel Blob tính theo dung lượng lưu trữ và băng thông (có mức miễn phí). Chia sẻ nhiều
video sẽ tiêu tốn phần này — kiểm tra usage trong tab **Storage** của project.

## Cách 2: Chạy Docker (VPS / máy chủ riêng)

App lưu file vào thư mục, không cần Blob:

```bash
docker build -t sharefile .
docker run -d --name sharefile -p 80:3000 \
  -v sharefile-data:/data --restart unless-stopped sharefile
```

File nằm trong volume `/data/uploads`, không mất khi khởi động lại container.

## Biến môi trường

| Biến | Bắt buộc? | Ý nghĩa |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Có, khi deploy serverless (Vercel) | Token đọc/ghi của Vercel Blob (Vercel tự thêm khi tạo Blob) |
| `DATA_DIR` | Không | Thư mục lưu file khi *không* dùng Blob (mặc định `.data`, Docker là `/data`) |

> Nếu deploy lên Vercel mà **quên** thêm Blob, app sẽ báo lỗi rõ ràng thay vì lưu hụt file.
