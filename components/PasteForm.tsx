"use client";

import { FormEvent, useState } from "react";
import { EXPIRY_LABELS, MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "@/lib/limits";
import CopyButton from "@/components/CopyButton";

export default function PasteForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiry, setExpiry] = useState("never");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, expiry }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đã xảy ra lỗi, vui lòng thử lại.");
        return;
      }
      setShareUrl(`${window.location.origin}/p/${data.id}`);
    } catch {
      setError("Không kết nối được máy chủ, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setTitle("");
    setContent("");
    setExpiry("never");
    setError(null);
    setShareUrl(null);
  }

  if (shareUrl) {
    return (
      <section className="card successCard">
        <h2>Đã tạo liên kết chia sẻ 🎉</h2>
        <p className="muted">Gửi liên kết này cho bất kỳ ai — họ mở là xem được ngay.</p>
        <div className="shareRow">
          <input className="input shareInput" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
          <CopyButton text={shareUrl} label="Sao chép liên kết" primary />
        </div>
        <div className="actionRow">
          <a className="btn" href={shareUrl}>
            Mở trang chia sẻ
          </a>
          <button type="button" className="btn btnGhost" onClick={reset}>
            Tạo bản chia sẻ khác
          </button>
        </div>
      </section>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="title">
          Tiêu đề <span className="muted">(không bắt buộc)</span>
        </label>
        <input
          id="title"
          className="input"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="Ví dụ: Ghi chú buổi họp, đoạn code lỗi…"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="content">
          Nội dung
        </label>
        <textarea
          id="content"
          className="textarea"
          required
          value={content}
          maxLength={MAX_CONTENT_LENGTH}
          placeholder="Dán hoặc gõ văn bản cần chia sẻ vào đây…"
          onChange={(e) => setContent(e.target.value)}
        />
        <p className="counter">
          {content.length.toLocaleString("vi-VN")} / {MAX_CONTENT_LENGTH.toLocaleString("vi-VN")} ký tự
        </p>
      </div>

      <div className="formFooter">
        <div className="field expiryField">
          <label className="label" htmlFor="expiry">
            Tự xoá sau
          </label>
          <select id="expiry" className="select" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
            {Object.entries(EXPIRY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btnPrimary" disabled={submitting || content.trim().length === 0}>
          {submitting ? "Đang tạo…" : "Tạo liên kết chia sẻ"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </form>
  );
}
