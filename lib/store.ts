import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type Paste = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  expiresAt: number | null;
  views: number;
};

const DATA_DIR = path.join(process.cwd(), ".data", "pastes");

// ID sinh từ base64url nên chỉ chứa các ký tự này; đồng thời chặn path traversal.
const ID_PATTERN = /^[A-Za-z0-9_-]{4,32}$/;

function fileFor(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function createPaste(input: {
  title: string;
  content: string;
  expiresAt: number | null;
}): Promise<Paste> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const paste: Paste = {
    id: crypto.randomBytes(6).toString("base64url"),
    title: input.title,
    content: input.content,
    createdAt: Date.now(),
    expiresAt: input.expiresAt,
    views: 0,
  };
  await fs.writeFile(fileFor(paste.id), JSON.stringify(paste), "utf8");
  return paste;
}

export async function getPaste(
  id: string,
  opts: { countView?: boolean } = {},
): Promise<Paste | null> {
  if (!ID_PATTERN.test(id)) {
    return null;
  }

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

  if (opts.countView) {
    paste.views += 1;
    try {
      await fs.writeFile(fileFor(id), JSON.stringify(paste), "utf8");
    } catch {
      // Không ghi được lượt xem thì vẫn trả nội dung bình thường.
    }
  }

  return paste;
}
