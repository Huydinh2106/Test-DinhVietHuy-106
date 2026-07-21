"use client";

import { DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { MAX_FILE_BYTES, formatBytes } from "@/lib/constants";

export type StoredFile = {
  name: string;
  url: string;
  size: number;
  uploadedAt: number;
  key: string;
};

const POLL_MS = 5000;

const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function FileShare({ initialFiles }: { initialFiles: StoredFile[] }) {
  const [files, setFiles] = useState<StoredFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
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

  async function uploadFiles(fileList: FileList | File[]) {
    const items = Array.from(fileList);
    if (items.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      for (const file of items) {
        if (file.size > MAX_FILE_BYTES) {
          setError(`"${file.name}" vượt quá ${formatBytes(MAX_FILE_BYTES)} nên bị bỏ qua.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/files", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? `Tải lên "${file.name}" thất bại.`);
        }
      }
      await refresh();
    } finally {
      setUploading(false);
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
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <span className="dropIcon">⬆️</span>
        <p className="dropTitle">{uploading ? "Đang tải lên…" : "Kéo thả file vào đây, hoặc bấm để chọn"}</p>
        <p className="dropHint">Tối đa {formatBytes(MAX_FILE_BYTES)} mỗi file · chọn được nhiều file</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

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
