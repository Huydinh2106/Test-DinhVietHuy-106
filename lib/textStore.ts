import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

export type SharedText = {
  content: string;
  updatedAt: number; // mốc thời gian (ms) lần cập nhật gần nhất; 0 nghĩa là chưa có gì.
};

// Text lưu ở một khoá duy nhất. Redis được truy cập PHÍA SERVER nên vẫn hoạt động
// kể cả khi mạng công ty chặn domain của Upstash (chặn chỉ ảnh hưởng trình duyệt).
const KEY = "shared:text";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "shared.json");

const EMPTY: SharedText = { content: "", updatedAt: 0 };

// Đọc không bao giờ ném lỗi — thiếu backend thì trả rỗng để trang vẫn render.
export async function getText(): Promise<SharedText> {
  if (redis) {
    try {
      return (await redis.get<SharedText>(KEY)) ?? EMPTY;
    } catch {
      return EMPTY;
    }
  }
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as SharedText;
  } catch {
    return EMPTY;
  }
}

export async function setText(content: string): Promise<SharedText> {
  const data: SharedText = { content, updatedAt: Date.now() };
  if (redis) {
    await redis.set(KEY, data);
    return data;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "Thiếu Upstash Redis. Hãy thêm tích hợp Upstash (Storage) trên Vercel để có " +
        "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, rồi redeploy.",
    );
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data), "utf8");
  return data;
}
