"use client";

import Image from "next/image";
import {
  Compass,
  Home,
  Pause,
  Play,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { type SVGProps, useEffect, useMemo, useRef, useState } from "react";

type VideoItem = {
  id: string;
  videoUrl: string;
  authorName: string;
  description: string;
  likesCount: number;
};

type NavView = "home" | "discover" | "profile";

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
  { id: "home", label: "Trang chủ", icon: Home },
  { id: "discover", label: "Khám phá", icon: Compass },
  { id: "profile", label: "Hồ sơ", icon: UserRound },
] as const satisfies ReadonlyArray<{ id: NavView; label: string; icon: typeof Home }>;

const mobileNavItems = navItems;

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

function HeartFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M12 21.25 10.58 20C5.36 15.36 2 12.38 2 8.72 2 5.73 4.34 3.4 7.32 3.4c1.68 0 3.3.78 4.36 2.02A5.72 5.72 0 0 1 16.04 3.4C19.02 3.4 21.36 5.73 21.36 8.72c0 3.66-3.36 6.64-8.58 11.28L12 21.25Z" />
    </svg>
  );
}

function ChatFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M12.1 3.25c5.2 0 9.4 3.62 9.4 8.08 0 4.45-4.2 8.07-9.4 8.07-.96 0-1.9-.12-2.78-.36l-4.46 2.08a.72.72 0 0 1-.98-.86l1.13-3.52a7.55 7.55 0 0 1-2.31-5.41c0-4.46 4.2-8.08 9.4-8.08Zm-3.63 7.36a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1Zm3.63 0a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1Zm3.63 0a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1Z" />
    </svg>
  );
}

function BookmarkFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M6.8 3h10.4c1 0 1.8.8 1.8 1.8v15.74a.7.7 0 0 1-1.08.58L12 17.3l-5.92 3.82A.7.7 0 0 1 5 20.54V4.8C5 3.8 5.8 3 6.8 3Z" />
    </svg>
  );
}

function PaperPlaneFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M3.48 2.4a.75.75 0 0 0-.93.94l2.43 7.91h8.52a.75.75 0 0 1 0 1.5H4.98l-2.43 7.9a.75.75 0 0 0 .93.95 60.6 60.6 0 0 0 18.44-8.99.75.75 0 0 0 0-1.22A60.6 60.6 0 0 0 3.48 2.4Z" />
    </svg>
  );
}

export default function VideoFeed() {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [activeView, setActiveView] = useState<NavView>("home");
  const [manualPausedIds, setManualPausedIds] = useState<Set<string>>(() => new Set());
  const [muted, setMuted] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set());
  const [progressById, setProgressById] = useState<Record<string, number>>({});

  const likesById = useMemo(() => {
    return mockVideos.reduce<Record<string, number>>((acc, video) => {
      acc[video.id] = video.likesCount + (likedIds.has(video.id) ? 1 : 0);
      return acc;
    }, {});
  }, [likedIds]);

  const bookmarksById = useMemo(() => {
    return mockVideos.reduce<Record<string, number>>((acc, video) => {
      acc[video.id] = Math.floor(video.likesCount * 0.4) + (bookmarkedIds.has(video.id) ? 1 : 0);
      return acc;
    }, {});
  }, [bookmarkedIds]);

  useEffect(() => {
    if (activeView !== "home") {
      Object.values(videoRefs.current).forEach((video) => video?.pause());
      return;
    }

    function getVisibleRatio(element: HTMLElement) {
      const rect = element.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

      return Math.max(0, visibleHeight) / rect.height;
    }

    function playMostVisibleVideo() {
      const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-video-id]"));
      const visibleCard = cards.find((card) => getVisibleRatio(card) >= 0.72);
      const id = visibleCard?.getAttribute("data-video-id");
      const video = id ? videoRefs.current[id] : null;

      if (!id || !video || manualPausedIds.has(id)) {
        return;
      }

      void video.play().catch(() => undefined);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-video-id");
          const video = entry.target.querySelector("video");

          if (!id || !video) {
            return;
          }

          if (entry.isIntersecting) {
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
    const frameId = window.requestAnimationFrame(playMostVisibleVideo);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [activeView, manualPausedIds]);

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

  function toggleBookmark(videoId: string) {
    setBookmarkedIds((current) => {
      const next = new Set(current);

      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }

      return next;
    });
  }

  function updateVideoProgress(videoId: string) {
    const video = videoRefs.current[videoId];

    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    setProgressById((current) => ({
      ...current,
      [videoId]: Math.min(video.currentTime / video.duration, 1),
    }));
  }

  return (
    <main className="appShell">
      <aside className="sideNav" aria-label="Điều hướng chính">
        <div className="brandLockup">
          <Image
            className="brandLogo"
            src="/veody-logo-horizontal.svg"
            alt="Veody"
            width={180}
            height={90}
            priority
          />
        </div>
        <nav className="navList">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              className={activeView === id ? "navItem navItemActive" : "navItem"}
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              aria-current={activeView === id ? "page" : undefined}
            >
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

      <section
        className={activeView === "home" ? "feedViewport" : "feedViewport feedViewportStatic"}
        aria-label={activeView === "home" ? "Danh sách video cuộn dọc" : "Trang đang phát triển"}
      >
        {activeView === "home" ? (
          mockVideos.map((video, index) => {
          const isLiked = likedIds.has(video.id);
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
                    autoPlay={index === 0}
                    playsInline
                    preload={index === 0 ? "auto" : "metadata"}
                    poster=""
                    onLoadedMetadata={() => updateVideoProgress(video.id)}
                    onTimeUpdate={() => updateVideoProgress(video.id)}
                  />
                  <span className={isManualPaused ? "playState playStateVisible" : "playState"}>
                    {isManualPaused ? (
                      <Play aria-hidden="true" size={34} fill="currentColor" />
                    ) : (
                      <Pause aria-hidden="true" size={34} fill="currentColor" />
                    )}
                  </span>
                </button>

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
                  <p className="author">{video.authorName}</p>
                  <p className="description">{video.description}</p>
                </div>

                <div className="videoProgressTrack" aria-hidden="true">
                  <span
                    className="videoProgressFill"
                    style={{ transform: `scaleX(${progressById[video.id] ?? 0})` }}
                  />
                </div>
              </div>

              <div className="actionRail" aria-label="Tương tác video">
                <div className="actionAvatarContainer">
                  <span className="actionAvatar">
                    <span>{getInitials(video.authorName)}</span>
                  </span>
                  <button className="actionFollowButton" type="button">+</button>
                </div>

                <button
                  className={isLiked ? "actionButton actionButtonLiked" : "actionButton"}
                  type="button"
                  onClick={() => toggleLike(video.id)}
                  aria-label={isLiked ? "Bỏ thích" : "Thích video"}
                  title={isLiked ? "Bỏ thích" : "Thích"}
                >
                  <div className="actionIconWrapper">
                    <HeartFilledIcon aria-hidden="true" className="actionGlyph" />
                  </div>
                  <span>{formatCount(likesById[video.id])}</span>
                </button>

                <button className="actionButton" type="button" aria-label="Bình luận" title="Bình luận">
                  <div className="actionIconWrapper">
                    <ChatFilledIcon aria-hidden="true" className="actionGlyph" />
                  </div>
                  <span>{formatCount(index + 188)}</span>
                </button>

                <button
                  className={bookmarkedIds.has(video.id) ? "actionButton actionButtonBookmarked" : "actionButton"}
                  type="button"
                  onClick={() => toggleBookmark(video.id)}
                  aria-label={bookmarkedIds.has(video.id) ? "Bỏ lưu" : "Lưu video"}
                  title={bookmarkedIds.has(video.id) ? "Bỏ lưu" : "Lưu"}
                >
                  <div className="actionIconWrapper">
                    <BookmarkFilledIcon aria-hidden="true" className="actionGlyph" />
                  </div>
                  <span>{formatCount(bookmarksById[video.id])}</span>
                </button>

                <button className="actionButton" type="button" aria-label="Chia sẻ" title="Chia sẻ">
                  <div className="actionIconWrapper">
                    <PaperPlaneFilledIcon aria-hidden="true" className="actionGlyph" />
                  </div>
                  <span>{formatCount(index + 35)}</span>
                </button>
              </div>
            </article>
          );
        })
        ) : (
          <div className="developmentView" role="status">
            <p>Đang trong quá trình phát triển</p>
          </div>
        )}
      </section>

      <nav className="bottomNav" aria-label="Điều hướng mobile">
        {mobileNavItems.map(({ id, label, icon: Icon }) => (
          <button
            className={activeView === id ? "bottomNavItem bottomNavItemActive" : "bottomNavItem"}
            key={id}
            type="button"
            onClick={() => setActiveView(id)}
            aria-current={activeView === id ? "page" : undefined}
          >
            <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
