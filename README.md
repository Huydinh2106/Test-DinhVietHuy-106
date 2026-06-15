# Vertical Video Feed

## Logic Play/Pause khi cuộn trang

Component chính nằm ở `components/VideoFeed.tsx`. Mỗi video được lưu vào `videoRefs` theo `video.id`, nhờ đó code có thể gọi trực tiếp `play()` hoặc `pause()` trên đúng thẻ `<video>`.

Khi trang ở tab `Trang chủ`, component tạo một `IntersectionObserver` với `threshold: 0.72`. Điều này có nghĩa là một video chỉ được xem là đang active khi khoảng 72% card của nó nằm trong viewport.

Luồng xử lý:

1. Khi một video card đi vào viewport đủ ngưỡng, code lấy `video.id` từ `data-video-id`.
2. Nếu video đó không nằm trong `manualPausedIds`, code gọi `video.play()`.
3. Khi video card rời viewport, code gọi `video.pause()`.
4. Sau khi observer được gắn, `requestAnimationFrame(playMostVisibleVideo)` chạy thêm một lần để phát video đang hiển thị rõ nhất ngay khi màn hình render xong.

Người dùng vẫn có thể bấm trực tiếp vào video để play/pause. Nếu người dùng pause thủ công, `video.id` sẽ được thêm vào `manualPausedIds`; vì vậy khi cuộn tới video đó, hệ thống không tự phát lại cho đến khi người dùng bấm play lại.

Khi chuyển sang các tab khác như `Khám phá` hoặc `Hồ sơ`, toàn bộ video hiện có sẽ được pause để tránh phát âm thanh/hình nền ngoài ý muốn.
