"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Nội dung cần sao chép; bỏ trống để sao chép URL trang hiện tại. */
  text?: string;
  label: string;
  primary?: boolean;
};

export default function CopyButton({ text, label, primary }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const value = text ?? window.location.href;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // navigator.clipboard chỉ có trên HTTPS/localhost; dự phòng cho HTTP thường.
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className={primary ? "btn btnPrimary" : "btn"} onClick={copy}>
      {copied ? "Đã sao chép ✓" : label}
    </button>
  );
}
