"use client";

import {
  Bookmark,
  Clapperboard,
  Compass,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Search,
  Send,
  SquarePlus,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type VideoItem = {
  id: string;
  videoUrl: string;
  authorName: string;
  description: string;
  likesCount: number;
};

const mockVideos: VideoItem[] = [
  {
    id: "big-buck-bunny",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    authorName: "Big Bunny Studio",
    description: "Một lát cắt vui nhộn với nhịp dựng nhanh, phù hợp để test video card.",
    likesCount: 1240,
  },
  {
    id: "friday",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    authorName: "MDN Cinema",
    description: "Khung hình thiên nhiên nhẹ nhàng cho trải nghiệm cuộn dọc mượt.",
    likesCount: 873,
  },
  {
    id: "sintel",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    authorName: "Sintel Trailer",
    description: "Trailer điện ảnh ngắn, màu sắc mạnh và âm thanh rõ để kiểm thử player.",
    likesCount: 2184,
  },
  {
    id: "flower",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    authorName: "Open Garden",
    description: "Macro hoa nở với chuyển động chậm, tạo cảm giác giống short video thật.",
    likesCount: 1567,
  },
];

const navItems = [
  { label: "Trang chủ", icon: Home },
  { label: "Tìm kiếm", icon: Search },
  { label: "Khám phá", icon: Compass },
  { label: "Reels", icon: Clapperboard },
  { label: "Tạo mới", icon: SquarePlus },
  { label: "Hồ sơ", icon: UserRound },
];

const mobileNavItems = [
  { label: "Trang chủ", icon: Home },
  { label: "Khám phá", icon: Compass },
  { label: "Tạo mới", icon: SquarePlus },
  { label: "Reels", icon: Clapperboard },
  { label: "Hồ sơ", icon: UserRound },
];

function formatCount(count: number) {
  return new Intl.NumberFormat("vi-VN").format(count);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function VideoFeed() {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [activeId, setActiveId] = useState(mockVideos[0].id);
  const [manualPausedIds, setManualPausedIds] = useState<Set<string>>(() => new Set());
  const [muted, setMuted] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());

  const likesById = useMemo(() => {
    return mockVideos.reduce<Record<string, number>>((acc, video) => {
      acc[video.id] = video.likesCount + (likedIds.has(video.id) ? 1 : 0);
      return acc;
    }, {});
  }, [likedIds]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-video-id");
          const video = entry.target.querySelector("video");

          if (!id || !video) {
            return;
          }

          if (entry.isIntersecting) {
            setActiveId(id);

            if (!manualPausedIds.has(id)) {
              void video.play().catch(() => undefined);
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.72 }
    );

    const cards = document.querySelectorAll<HTMLElement>("[data-video-id]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [manualPausedIds]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = muted;
      }
    });
  }, [muted]);

  function togglePlay(videoId: string) {
    const video = videoRefs.current[videoId];

    if (!video) {
      return;
    }

    if (video.paused) {
      setManualPausedIds((current) => {
        const next = new Set(current);
        next.delete(videoId);
        return next;
      });
      void video.play().catch(() => undefined);
    } else {
      setManualPausedIds((current) => new Set(current).add(videoId));
      video.pause();
    }
  }

  function toggleLike(videoId: string) {
    setLikedIds((current) => {
      const next = new Set(current);

      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }

      return next;
    });
  }

  return (
    <main className="appShell">
      <aside className="sideNav" aria-label="Điều hướng chính">
        <div className="brandLockup">
          <span className="brandMark">V</span>
          <span className="brandText">V-Feed</span>
        </div>
        <nav className="navList">
          {navItems.map(({ label, icon: Icon }, index) => (
            <button className={index === 0 ? "navItem navItemActive" : "navItem"} key={label}>
              <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="sidebarProfile" type="button">
          <span className="sidebarAvatar">BB</span>
          <span>
            <strong>Creator mode</strong>
            <small>Đang online</small>
          </span>
        </button>
      </aside>

      <section className="feedViewport" aria-label="Danh sách video cuộn dọc">
        {mockVideos.map((video, index) => {
          const isLiked = likedIds.has(video.id);
          const isActive = activeId === video.id;
          const isManualPaused = manualPausedIds.has(video.id);

          return (
            <article className="feedItem" data-video-id={video.id} key={video.id}>
              <div className="phoneFrame">
                <button
                  className="videoTapTarget"
                  type="button"
                  onClick={() => togglePlay(video.id)}
                  aria-label={isManualPaused ? "Phát video" : "Tạm dừng video"}
                >
                  <video
                    ref={(node) => {
                      videoRefs.current[video.id] = node;
                    }}
                    className="videoElement"
                    src={video.videoUrl}
                    muted={muted}
                    loop
                    playsInline
                    preload={index === 0 ? "auto" : "metadata"}
                    poster=""
                  />
                  <span className={isManualPaused ? "playState playStateVisible" : "playState"}>
                    {isManualPaused ? (
                      <Play aria-hidden="true" size={34} fill="currentColor" />
                    ) : (
                      <Pause aria-hidden="true" size={34} fill="currentColor" />
                    )}
                  </span>
                </button>

                <div className="topBar">
                  <span className="reelTitle">
                    <Clapperboard aria-hidden="true" size={18} />
                    Reels
                  </span>
                  <span className={isActive ? "statusPill statusPillActive" : "statusPill"}>
                    {isActive ? "Đang phát" : "Sẵn sàng"}
                  </span>
                </div>

                <button
                  className="muteButton"
                  type="button"
                  onClick={() => setMuted((value) => !value)}
                  aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
                  title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
                >
                  {muted ? (
                    <VolumeX aria-hidden="true" size={20} />
                  ) : (
                    <Volume2 aria-hidden="true" size={20} />
                  )}
                </button>

                <div className="videoMeta">
                  <div className="authorRow">
                    <span className="avatarRing" aria-hidden="true">
                      <span>{getInitials(video.authorName)}</span>
                    </span>
                    <p className="author">@{video.authorName}</p>
                    <button className="followButton" type="button">
                      Theo dõi
                    </button>
                  </div>
                  <p className="description">{video.description}</p>
                  <p className="soundLine">
                    <Music2 aria-hidden="true" size={14} />
                    Nhạc gốc - {video.authorName}
                  </p>
                </div>

                <div className="actionRail" aria-label="Tương tác video">
                  <button
                    className={isLiked ? "actionButton actionButtonLiked" : "actionButton"}
                    type="button"
                    onClick={() => toggleLike(video.id)}
                    aria-label={isLiked ? "Bỏ thích" : "Thích video"}
                    title={isLiked ? "Bỏ thích" : "Thích"}
                  >
                    <Heart aria-hidden="true" size={24} fill={isLiked ? "currentColor" : "none"} />
                    <span>{formatCount(likesById[video.id])}</span>
                  </button>
                  <button className="actionButton" type="button" aria-label="Bình luận" title="Bình luận">
                    <MessageCircle aria-hidden="true" size={24} />
                    <span>{index + 18}</span>
                  </button>
                  <button className="actionButton" type="button" aria-label="Chia sẻ" title="Chia sẻ">
                    <Send aria-hidden="true" size={24} />
                    <span>Chia sẻ</span>
                  </button>
                  <button className="actionButton actionButtonIconOnly" type="button" aria-label="Lưu" title="Lưu">
                    <Bookmark aria-hidden="true" size={24} />
                  </button>
                  <button
                    className="actionButton actionButtonIconOnly"
                    type="button"
                    aria-label="Tùy chọn khác"
                    title="Tùy chọn khác"
                  >
                    <MoreHorizontal aria-hidden="true" size={24} />
                  </button>
                  <span className="creatorDisc" aria-hidden="true">
                    {getInitials(video.authorName)}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <nav className="bottomNav" aria-label="Điều hướng mobile">
        {mobileNavItems.map(({ label, icon: Icon }, index) => (
          <button className={index === 0 ? "bottomNavItem bottomNavItemActive" : "bottomNavItem"} key={label}>
            <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
