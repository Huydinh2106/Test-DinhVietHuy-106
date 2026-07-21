import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

export type SharedText = {
  content: string;
  updatedAt: number; // mốc thời gian (ms) lần cập nhật gần nhất; 0 nghĩa là chưa có gì.
};

// Toàn bộ trang chỉ dùng chung một ô text, lưu ở một khoá duy nhất.
const KEY = "shared:text";

// --- Chọn backend: có cấu hình Upstash/Vercel KV thì dùng Redis, không thì lưu file ---

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Kiểm tra lúc xử lý request (KHÔNG throw ở cấp module, kẻo build trên Vercel fail).
function backendIsRedis(): boolean {
  if (redis) return true;
  if (process.env.VERCEL) {
    throw new Error(
      "Thiếu cấu hình Upstash Redis. Hãy thêm tích hợp Upstash (Storage) trong Vercel " +
        "để có UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, rồi redeploy.",
    );
  }
  return false;
}

// --- Backend file (chạy local, không cần cấu hình gì) ---

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "shared.json");

const EMPTY: SharedText = { content: "", updatedAt: 0 };

export async function getText(): Promise<SharedText> {
  if (backendIsRedis()) {
    return (await redis!.get<SharedText>(KEY)) ?? EMPTY;
  }
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as SharedText;
  } catch {
    return EMPTY;
  }
}

export async function setText(content: string): Promise<SharedText> {
  const data: SharedText = { content, updatedAt: Date.now() };
  if (backendIsRedis()) {
    await redis!.set(KEY, data);
  } else {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(data), "utf8");
  }
  return data;
}
