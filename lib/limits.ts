export const MAX_TITLE_LENGTH = 120;
export const MAX_CONTENT_LENGTH = 100_000;

export const EXPIRY_MS: Record<string, number | null> = {
  never: null,
  "10m": 10 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export const EXPIRY_LABELS: Record<string, string> = {
  never: "Không hết hạn",
  "10m": "10 phút",
  "1h": "1 giờ",
  "1d": "1 ngày",
  "7d": "7 ngày",
};
