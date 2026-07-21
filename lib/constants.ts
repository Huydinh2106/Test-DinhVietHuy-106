// Hằng số/tiện ích dùng chung cho cả client lẫn server (không import module chỉ-chạy-server).

// Giới hạn cho luồng tải-qua-máy-chủ (backend file, chủ yếu chạy local). File được đọc trọn
// vào bộ nhớ nên đặt mức vừa phải. Khi bật Vercel Blob, trình duyệt tải thẳng lên Blob và
// KHÔNG bị giới hạn này — hỗ trợ file lớn như video.
export const MAX_FORMDATA_BYTES = 100 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
