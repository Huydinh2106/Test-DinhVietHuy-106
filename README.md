# ShareFile — Chia sẻ file đơn giản

Một trang web gọn nhẹ để **tải file lên và tải xuống**: mở trang, kéo thả (hoặc chọn) file để tải lên; máy khác mở đúng trang đó là thấy danh sách và tải về được. Hợp để chuyển nhanh file giữa các máy, không cần đăng nhập, không cần gửi link.

## Tính năng

- **Tải lên bằng kéo-thả hoặc chọn file**, hỗ trợ nhiều file cùng lúc.
- **Danh sách file dùng chung**: ai mở trang cũng thấy cùng danh sách; tự làm mới sau vài giây (khi tab đang hiển thị) nên máy kia không cần reload.
- **Tải xuống một chạm** và **xoá** file ngay trên danh sách.
- **Không cần đăng nhập**: không tài khoản, không thu thập thông tin cá nhân.

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
```

Bản production:

```bash
npm run build
npm start
```

Chạy local không cần cấu hình gì — file lưu vào thư mục `.data/uploads/`.

## Deploy

Xem [DEPLOY.md](./DEPLOY.md). Nhanh nhất: import repo vào Vercel rồi thêm **Vercel Blob**
trong tab **Storage** (gói miễn phí). App tự dùng Blob khi có `BLOB_READ_WRITE_TOKEN`,
và tự lưu ra thư mục khi không có — nên vừa deploy được serverless, vừa chạy local dễ dàng.

> Tải file qua máy chủ giới hạn **4,5 MB/file** trên Vercel. Cần file lớn hơn thì chuyển sang
> tải trực tiếp lên Blob từ trình duyệt (xem DEPLOY.md).

## Kiến trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `app/page.tsx` | Trang chủ (server component), đọc danh sách file rồi render |
| `components/FileShare.tsx` | Vùng kéo-thả + danh sách file + tự làm mới (client component) |
| `app/api/files/route.ts` | `GET` liệt kê, `POST` tải lên, `DELETE` xoá file |
| `app/api/files/[name]/route.ts` | Tải xuống cho backend file (local); trên Vercel tải trực tiếp qua URL Blob |
| `lib/files.ts` | Lớp lưu trữ: Vercel Blob khi có cấu hình, ngược lại lưu file trong `.data/uploads/` |
| `lib/constants.ts` | Hằng số + tiện ích dùng chung cho client + server (giới hạn dung lượng, định dạng KB/MB) |

## API

Liệt kê file:

```bash
curl http://localhost:3000/api/files
# => {"files":[{"name":"...","url":"...","size":123,"uploadedAt":...,"key":"..."}]}
```

Tải lên (multipart form, field tên `file`):

```bash
curl -F "file=@duong-dan/toi-file.pdf" http://localhost:3000/api/files
```

Xoá:

```bash
curl -X DELETE http://localhost:3000/api/files \
  -H "Content-Type: application/json" -d '{"key":"toi-file.pdf"}'
```
