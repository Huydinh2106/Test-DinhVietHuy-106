# ShareText — Chia sẻ văn bản không cần đăng nhập

Trang web chia sẻ văn bản kiểu Pastebin: dán nội dung, nhận liên kết, gửi cho bất kỳ ai. Không cần tài khoản, không cần đăng nhập.

## Tính năng

- **Tạo bản chia sẻ tức thì**: nhập tiêu đề (không bắt buộc) và nội dung (tối đa 100.000 ký tự), nhận ngay liên kết dạng `/p/<id>`.
- **Không cần đăng nhập**: không có tài khoản, không thu thập thông tin cá nhân.
- **Liên kết riêng tư**: mã bản chia sẻ là chuỗi ngẫu nhiên 8 ký tự (48 bit), không có trang liệt kê công khai — chỉ ai có liên kết mới xem được.
- **Tự động hết hạn**: chọn 10 phút, 1 giờ, 1 ngày, 7 ngày hoặc vĩnh viễn. Bản hết hạn bị xoá ngay lần truy cập kế tiếp.
- **Xem dạng thô**: mỗi bản chia sẻ có endpoint `/p/<id>/raw` trả về `text/plain`, tiện dùng với `curl` hoặc tải về.
- **Sao chép nhanh**: nút sao chép liên kết và sao chép nội dung, kèm đếm lượt xem.

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

## Kiến trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `app/page.tsx` | Trang chủ, chứa form tạo bản chia sẻ (`components/PasteForm.tsx`) |
| `app/api/pastes/route.ts` | `POST /api/pastes` — kiểm tra dữ liệu và tạo bản chia sẻ |
| `app/p/[id]/page.tsx` | Trang xem bản chia sẻ (server component, đếm lượt xem) |
| `app/p/[id]/raw/route.ts` | `GET /p/<id>/raw` — trả nội dung dạng văn bản thuần |
| `lib/store.ts` | Lớp lưu trữ: mỗi bản chia sẻ là một file JSON trong `.data/pastes/` |
| `lib/limits.ts` | Giới hạn độ dài và các mốc thời hạn dùng chung cho client + server |

Dữ liệu lưu trên đĩa của máy chủ (thư mục `.data/`, đã đưa vào `.gitignore`) nên không cần database. Khi bản chia sẻ hết hạn, file được xoá ở lần đọc kế tiếp; ID được kiểm tra bằng regex trước khi ghép đường dẫn để chặn path traversal.

## API

Tạo bản chia sẻ:

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"title": "Ghi chú", "content": "Xin chào!", "expiry": "1d"}'
# => {"id":"AbC123xY"}
```

`expiry` nhận một trong: `never`, `10m`, `1h`, `1d`, `7d`.

Đọc nội dung thô:

```bash
curl http://localhost:3000/p/AbC123xY/raw
```
