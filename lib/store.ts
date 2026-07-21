import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

export type Paste = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  expiresAt: number | null;
  views: number;
};

// ID sinh từ base64url nên chỉ chứa các ký tự này; đồng thời chặn path traversal.
const ID_PATTERN = /^[A-Za-z0-9_-]{4,32}$/;

function newId() {
  return crypto.randomBytes(6).toString("base64url");
}

function ttlSeconds(expiresAt: number | null): number | null {
  if (expiresAt === null) return null;
  return Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
}

// --- Chọn backend: có cấu hình Upstash/Vercel KV thì dùng Redis, không thì lưu file ---

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Chọn backend lúc xử lý request (KHÔNG kiểm tra ở cấp module — nếu throw lúc import,
// bước "collect page data" khi build trên Vercel sẽ fail dù chỉ đang build).
// Trên Vercel mà thiếu Redis thì lưu file sẽ mất dữ liệu âm thầm, nên báo lỗi rõ ràng.
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

// --- Backend Redis (dùng cho Vercel) ---

function pasteKey(id: string) {
  return `paste:${id}`;
}
function viewsKey(id: string) {
  return `paste:${id}:views`;
}

async function createPasteRedis(paste: Paste): Promise<Paste> {
  const ttl = ttlSeconds(paste.expiresAt);
  const opts = ttl === null ? undefined : { ex: ttl };
  await Promise.all([
    redis!.set(pasteKey(paste.id), paste, opts),
    redis!.set(viewsKey(paste.id), 0, opts),
  ]);
  return paste;
}

async function getPasteRedis(id: string, countView: boolean): Promise<Paste | null> {
  const paste = await redis!.get<Paste>(pasteKey(id));
  if (!paste) return null; // Redis tự xoá khi hết TTL.
  paste.views = countView
    ? await redis!.incr(viewsKey(id)) // incr giữ nguyên TTL đã đặt lúc tạo.
    : Number(await redis!.get<number>(viewsKey(id))) || 0;
  return paste;
}

// --- Backend file (dùng khi chạy local, không cần cấu hình gì) ---

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), ".data", "pastes");

function fileFor(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

async function createPasteFile(paste: Paste): Promise<Paste> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(fileFor(paste.id), JSON.stringify(paste), "utf8");
  return paste;
}

async function getPasteFile(id: string, countView: boolean): Promise<Paste | null> {
  let raw: string;
  try {
    raw = await fs.readFile(fileFor(id), "utf8");
  } catch {
    return null;
  }

  const paste = JSON.parse(raw) as Paste;
  if (paste.expiresAt !== null && paste.expiresAt <= Date.now()) {
    await fs.rm(fileFor(id), { force: true });
    return null;
  }

  if (countView) {
    paste.views += 1;
    try {
      await fs.writeFile(fileFor(id), JSON.stringify(paste), "utf8");
    } catch {
      // Không ghi được lượt xem thì vẫn trả nội dung bình thường.
    }
  }

  return paste;
}

// --- API công khai ---

export async function createPaste(input: {
  title: string;
  content: string;
  expiresAt: number | null;
}): Promise<Paste> {
  const paste: Paste = {
    id: newId(),
    title: input.title,
    content: input.content,
    createdAt: Date.now(),
    expiresAt: input.expiresAt,
    views: 0,
  };
  return backendIsRedis() ? createPasteRedis(paste) : createPasteFile(paste);
}

export async function getPaste(
  id: string,
  opts: { countView?: boolean } = {},
): Promise<Paste | null> {
  if (!ID_PATTERN.test(id)) return null;
  const countView = opts.countView ?? false;
  return backendIsRedis() ? getPasteRedis(id, countView) : getPasteFile(id, countView);
}
