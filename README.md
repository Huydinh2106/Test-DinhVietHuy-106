# ShareText — Bảng văn bản chung

Một trang web đơn giản chỉ có **một ô văn bản dùng chung**: mở trang, gõ nội dung, bấm **Cập nhật** — ai truy cập cũng thấy đúng nội dung đó. Hợp để chia sẻ nhanh vài dòng text giữa các máy với nhau, không cần đăng nhập, không cần gửi link.

## Tính năng

- **Một nội dung chung cho mọi người**: không có nhiều bản chia sẻ, không có link riêng — chỉ một ô text.
- **Tự đồng bộ**: các máy đang mở trang tự kéo nội dung mới sau vài giây (chỉ khi tab đang hiển thị và bạn không gõ dở), nên máy kia không cần bấm reload.
- **Không đè lên nội dung đang gõ**: khi bạn có thay đổi chưa lưu, việc tự đồng bộ tạm dừng để khỏi mất chữ.
- **Không cần đăng nhập**: không tài khoản, không thu thập thông tin cá nhân.
- **Sao chép nhanh**: nút sao chép toàn bộ nội dung.

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

Chạy local không cần cấu hình gì — dữ liệu lưu ra file `.data/shared.json`.

## Deploy

Xem [DEPLOY.md](./DEPLOY.md). Nhanh nhất: import repo vào Vercel rồi thêm Upstash Redis
trong tab **Storage** (gói miễn phí). App tự dùng Redis khi có biến môi trường Upstash,
và tự lưu ra file khi không có — nên vừa deploy được serverless, vừa chạy local dễ dàng.

## Kiến trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `app/page.tsx` | Trang chủ (server component), đọc nội dung hiện tại rồi render |
| `components/SharedText.tsx` | Ô văn bản + nút Cập nhật + tự đồng bộ (client component) |
| `app/api/text/route.ts` | `GET` đọc nội dung chung, `POST` ghi đè nội dung chung |
| `lib/store.ts` | Lớp lưu trữ: Redis (Upstash) khi có cấu hình, ngược lại lưu file JSON |
| `lib/constants.ts` | Hằng số dùng chung cho client + server (giới hạn độ dài) |

Toàn bộ trang chỉ dùng **một khoá lưu trữ duy nhất** (`shared:text` trong Redis, hoặc file
`.data/shared.json`), chứa nội dung và mốc thời gian cập nhật gần nhất. Mỗi lần bấm Cập nhật là
ghi đè giá trị đó — ai mở trang sau sẽ thấy nội dung mới nhất.

## API

Đọc nội dung hiện tại:

```bash
curl http://localhost:3000/api/text
# => {"content":"...","updatedAt":1700000000000}
```

Ghi đè nội dung:

```bash
curl -X POST http://localhost:3000/api/text \
  -H "Content-Type: application/json" \
  -d '{"content":"Nội dung mới"}'
```
