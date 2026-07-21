"use client";

import { DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { formatBytes } from "@/lib/constants";

export type StoredFile = {
  name: string;
  url: string;
  size: number;
  uploadedAt: number;
  key: string;
};

type Props = {
  initialFiles: StoredFile[];
  blobEnabled: boolean;
};

type Progress = { name: string; percent: number };

const POLL_MS = 5000;

const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function FileShare({ initialFiles, blobEnabled }: Props) {
  const [files, setFiles] = useState<StoredFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/files", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.files)) setFiles(data.files);
    } catch {
      // Bỏ qua, vòng sau thử lại.
    }
  }, []);

  // Tự làm mới danh sách để máy khác thấy file mới — chỉ khi tab đang hiện và không đang tải.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !uploading) refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh, uploading]);

  async function uploadOne(file: File) {
    if (blobEnabled) {
      // Trình duyệt tải TRỰC TIẾP lên Blob — không qua máy chủ, không giới hạn 4,5 MB.
      await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        multipart: true,
        onUploadProgress: ({ percentage }) =>
          setProgress({ name: file.name, percent: Math.round(percentage) }),
      });
    } else {
      // Local: tải qua máy chủ, lưu ra thư mục.
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/files", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Tải lên "${file.name}" thất bại.`);
      }
    }
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const items = Array.from(fileList);
    if (items.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      for (const file of items) {
        setProgress({ name: file.name, percent: 0 });
        try {
          await uploadOne(file);
        } catch (e) {
          setError((e as Error).message || `Tải lên "${file.name}" thất bại.`);
        }
      }
      await refresh();
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(file: StoredFile) {
    if (busyKey) return;
    setBusyKey(file.key);
    try {
      await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: file.key }),
      });
      await refresh();
    } finally {
      setBusyKey(null);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }

  return (
    <div className="card">
      <div
        className={`dropZone${dragOver ? " dragOver" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <span className="dropIcon">⬆️</span>
        <p className="dropTitle">
          {uploading ? "Đang tải lên…" : "Kéo thả file vào đây, hoặc bấm để chọn"}
        </p>
        <p className="dropHint">
          {blobEnabled ? "Tải được cả file lớn như video" : "Chế độ lưu-file (local)"} · chọn được
          nhiều file
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {progress && (
        <div className="progressWrap">
          <div className="progressInfo">
            <span className="progressName" title={progress.name}>
              {progress.name}
            </span>
            <span className="muted">{progress.percent}%</span>
          </div>
          <div className="progressBar">
            <div className="progressFill" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="fileListHead">
        <h2>File đã tải lên</h2>
        <span className="muted">{files.length} file</span>
      </div>

      {files.length === 0 ? (
        <p className="emptyList">Chưa có file nào. Tải lên một file để bắt đầu.</p>
      ) : (
        <ul className="fileList">
          {files.map((file) => (
            <li key={file.key} className="fileRow">
              <span className="fileIcon">📄</span>
              <div className="fileInfo">
                <span className="fileName" title={file.name}>
                  {file.name}
                </span>
                <span className="fileMeta">
                  {formatBytes(file.size)} · {timeFormat.format(file.uploadedAt)}
                </span>
              </div>
              <div className="fileActions">
                <a className="btn btnSmall" href={file.url} target="_blank" rel="noreferrer" download>
                  Tải xuống
                </a>
                <button
                  type="button"
                  className="btn btnSmall btnDanger"
                  onClick={() => remove(file)}
                  disabled={busyKey === file.key}
                >
                  {busyKey === file.key ? "Đang xoá…" : "Xoá"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
