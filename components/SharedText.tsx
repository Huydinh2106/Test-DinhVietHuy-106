"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { MAX_LENGTH } from "@/lib/constants";

const POLL_MS = 5000;

type Props = {
  initialContent: string;
  initialUpdatedAt: number;
};

const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "medium",
});

export default function SharedText({ initialContent, initialUpdatedAt }: Props) {
  const [content, setContent] = useState(initialContent);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nội dung khớp với server ở lần đồng bộ gần nhất; dùng để biết có thay đổi chưa lưu không.
  const syncedRef = useRef(initialContent);
  const dirty = content !== syncedRef.current;

  const applyRemote = useCallback((c: string, t: number) => {
    setContent(c);
    setUpdatedAt(t);
    syncedRef.current = c;
  }, []);

  // Định kỳ kéo nội dung mới từ server — chỉ khi tab đang hiện và người dùng chưa gõ dở,
  // để không đè lên những gì họ đang nhập.
  useEffect(() => {
    const timer = setInterval(async () => {
      if (dirty || document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/text", { cache: "no-store" });
        const data = await res.json();
        if (typeof data.updatedAt === "number" && data.updatedAt > updatedAt) {
          applyRemote(data.content ?? "", data.updatedAt);
        }
      } catch {
        // Mạng chập chờn thì bỏ qua, vòng sau thử lại.
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [dirty, updatedAt, applyRemote]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lưu không thành công, thử lại nhé.");
        return;
      }
      applyRemote(content, data.updatedAt);
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setSaving(false);
    }
  }

  const statusLabel = saving
    ? "Đang lưu…"
    : dirty
      ? "Có thay đổi chưa lưu"
      : updatedAt
        ? `Đã đồng bộ · cập nhật ${timeFormat.format(updatedAt)}`
        : "Chưa có nội dung";

  return (
    <section className="card">
      <div className="boardHead">
        <span className={`syncDot ${dirty || saving ? "pending" : "ok"}`} />
        <span className="syncLabel">{statusLabel}</span>
      </div>

      <textarea
        className="textarea boardArea"
        value={content}
        maxLength={MAX_LENGTH}
        spellCheck={false}
        placeholder="Nhập hoặc dán văn bản cần chia sẻ vào đây, rồi bấm Cập nhật…"
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="boardFooter">
        <span className="counter">
          {content.length.toLocaleString("vi-VN")} / {MAX_LENGTH.toLocaleString("vi-VN")} ký tự
        </span>
        <div className="actionRow">
          <CopyButton text={content} label="Sao chép" />
          <button type="button" className="btn btnPrimary" onClick={save} disabled={saving || !dirty}>
            {saving ? "Đang lưu…" : "Cập nhật"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
    </section>
  );
}
