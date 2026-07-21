import { promises as fs } from "fs";
import path from "path";
import { list, put, del } from "@vercel/blob";

export type StoredFile = {
  name: string;
  url: string; // đường dẫn để tải xuống
  size: number;
  uploadedAt: number;
  key: string; // dùng để xoá (với Blob là URL, với file là tên)
};

// --- Chọn backend: có Vercel Blob thì dùng Blob, không thì lưu file trên đĩa ---

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Kiểm tra lúc xử lý request (KHÔNG throw ở cấp module, kẻo build trên Vercel fail).
function requireBackend() {
  if (useBlob) return;
  if (process.env.VERCEL) {
    throw new Error(
      "Thiếu Vercel Blob. Hãy vào Storage → Create Database → Blob trên Vercel để có " +
        "BLOB_READ_WRITE_TOKEN, rồi redeploy.",
    );
  }
}

// --- Backend file (chạy local, không cần cấu hình gì) ---

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), ".data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

// Tên file an toàn (chặn path traversal) cho backend file.
const SAFE_NAME = /^[^/\\]+$/;

// Liệt kê KHÔNG ném lỗi — thiếu backend thì trả rỗng để trang vẫn render.
export async function listFiles(): Promise<StoredFile[]> {
  if (useBlob) {
    try {
      const { blobs } = await list();
      return blobs
        .map((b) => ({
          name: b.pathname,
          url: b.url,
          size: b.size,
          uploadedAt: new Date(b.uploadedAt).getTime(),
          key: b.url,
        }))
        .sort((a, b) => b.uploadedAt - a.uploadedAt);
    } catch {
      return [];
    }
  }

  try {
    const names = await fs.readdir(UPLOAD_DIR);
    const items = await Promise.all(
      names.map(async (name) => {
        const st = await fs.stat(path.join(UPLOAD_DIR, name));
        return {
          name,
          url: `/api/files/${encodeURIComponent(name)}`,
          size: st.size,
          uploadedAt: st.mtimeMs,
          key: name,
        };
      }),
    );
    return items.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch {
    return [];
  }
}

export async function saveFile(name: string, data: Buffer): Promise<StoredFile> {
  requireBackend();
  const safe = path.basename(name).trim() || "file";
  if (useBlob) {
    const blob = await put(safe, data, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true, // tải lại cùng tên thì thay thế file cũ
    });
    return {
      name: blob.pathname,
      url: blob.url,
      size: data.byteLength,
      uploadedAt: Date.now(),
      key: blob.url,
    };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, safe), data);
  return {
    name: safe,
    url: `/api/files/${encodeURIComponent(safe)}`,
    size: data.byteLength,
    uploadedAt: Date.now(),
    key: safe,
  };
}

export async function deleteFile(key: string): Promise<void> {
  requireBackend();
  if (useBlob) {
    await del(key); // key = URL của blob
    return;
  }
  if (!SAFE_NAME.test(key)) return;
  await fs.rm(path.join(UPLOAD_DIR, key), { force: true });
}

// Đọc file cho route tải xuống — chỉ dùng ở backend file (Blob tải trực tiếp qua URL).
export async function readLocalFile(name: string): Promise<Buffer | null> {
  if (!SAFE_NAME.test(name)) return null;
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, name));
  } catch {
    return null;
  }
}
