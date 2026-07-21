# Hướng dẫn deploy ShareFile

App tự chọn nơi lưu file:

- **Có Vercel Blob** (`BLOB_READ_WRITE_TOKEN`) → lưu file vào Blob (dùng cho Vercel / serverless).
- **Không có** → lưu file vào thư mục `.data/uploads/` (dùng khi chạy local, không cần cấu hình gì).

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

### Giới hạn kích thước file

Tải file qua máy chủ bị giới hạn **4,5 MB/file** (giới hạn body request của Vercel Serverless).
Nếu cần chia sẻ file lớn hơn, có thể chuyển sang **tải trực tiếp lên Blob từ trình duyệt**
(`@vercel/blob/client`) để bỏ giới hạn này — nói với tôi khi cần.

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
