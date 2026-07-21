// Hằng số/tiện ích dùng chung cho cả client lẫn server (không import module chỉ-chạy-server).

// Vercel Serverless giới hạn body request 4,5 MB khi tải file qua máy chủ.
export const MAX_FILE_BYTES = Math.floor(4.5 * 1024 * 1024);

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
