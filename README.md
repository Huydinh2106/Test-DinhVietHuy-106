# Share — Chia sẻ text & file

Một trang web gọn nhẹ để chia sẻ nhanh giữa các máy: **một ô văn bản chung** và **kho file dùng chung**. Mở trang, dán text hoặc tải file lên; máy khác mở đúng trang đó là thấy ngay. Không cần đăng nhập, không cần gửi link.

## Tính năng

- **Văn bản chung**: gõ nội dung rồi bấm Cập nhật, ai mở trang cũng thấy; tự đồng bộ sau vài giây (khi tab hiển thị, không đè lên nội dung đang gõ dở).
- **Chia sẻ file**: tải lên bằng kéo-thả hoặc chọn, nhiều file cùng lúc; tải xuống / xoá ngay trên danh sách.
- **File lớn (video…)**: khi bật Vercel Blob, trình duyệt tải trực tiếp lên Blob nên không dính giới hạn 4,5 MB, có thanh tiến trình %.
- **Không cần đăng nhập**: không tài khoản, không thu thập thông tin cá nhân.

> Ghi chú về chặn mạng công ty: phần **văn bản** đi qua máy chủ (trình duyệt → app → Upstash Redis phía server) nên chạy được kể cả khi mạng công ty chặn domain của Upstash. Phần **file lớn** thì trình duyệt tải thẳng lên Blob, nên cần domain Blob không bị chặn.

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

> Với Vercel Blob, file được tải thẳng từ trình duyệt lên Blob nên **không giới hạn 4,5 MB** —
> tải được file lớn như video. Xem thêm ở DEPLOY.md.

## Kiến trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `app/page.tsx` | Trang chủ (server component), đọc text + danh sách file rồi render cả hai mục |
| `components/SharedText.tsx` | Ô văn bản chung + nút Cập nhật + tự đồng bộ (client component) |
| `components/FileShare.tsx` | Vùng kéo-thả + danh sách file + tự làm mới (client component) |
| `app/api/text/route.ts` | `GET` đọc / `POST` ghi đè văn bản chung |
| `app/api/files/route.ts` | `GET` liệt kê, `POST` tải lên (local), `DELETE` xoá file |
| `app/api/blob-upload/route.ts` | Sinh token để trình duyệt tải file lớn trực tiếp lên Vercel Blob |
| `app/api/files/[name]/route.ts` | Tải xuống cho backend file (local); trên Vercel tải trực tiếp qua URL Blob |
| `lib/textStore.ts` | Lưu văn bản: Upstash Redis khi có cấu hình, ngược lại lưu file `.data/shared.json` |
| `lib/files.ts` | Lưu file: Vercel Blob khi có cấu hình, ngược lại lưu trong `.data/uploads/` |
| `lib/constants.ts` | Hằng số + tiện ích dùng chung cho client + server |

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
