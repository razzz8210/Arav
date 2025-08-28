import PostPreviewFrame from "@/components/gtm/social-media-management/PostPreviewFrame";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SmmLoader = dynamic(() => import("@/components/lottie/SmmLoader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

interface SlideshowItem {
  urls: string[];
  fileName: string;
  taskStatus: string;
  type: string;
  createdAt: number;
}

export const PreviewCarousel: React.FC = () => {
  const {
    projectId,
    lastPreviewUrl,
    previewType,
    setSelectedTemplate,
    setLastPreviewUrl,
    setPreviewType,
  } = useTemplate();
  const {
    activeTab,
    setIsChatOpen,
    setIsCaptionsOpen,
    setActiveTab,
  } = useTab();

  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);
  const slideshowRef = useRef<SlideshowItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const isGenerating = (demo: SlideshowItem) => {
    const status = (demo.taskStatus || "").toLowerCase();
    const hasNoImages = getImageLinks(demo).length === 0;
    return status !== "completed" || hasNoImages;
  };

  const getProgress = (demo: SlideshowItem) => {
    return demo.taskStatus === "completed" ? 100 : 0;
    // const total = demo.total_items ?? 0;
    // const processed = demo.slideshow_links?.length ?? 0;
    // if (total <= 0) return 0;
    // const pct = Math.max(
    //   0,
    //   Math.min(100, Math.round((processed / total) * 100))
    // );
    // return pct;
  };

  useEffect(() => {
    if (!lastPreviewUrl || previewType !== "carousel") {
      setLoading(false);
      return;
    }

    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchSlideshows = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const res = await fetch(
          `/api/templates/preview/carousel?file_name=${encodeURIComponent(
            lastPreviewUrl
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch slideshows");
        const data: { carousel: SlideshowItem[] } = await res.json();

        const oldDemo = slideshowRef.current;
        const newDemo: SlideshowItem | null = data?.carousel?.[0] ?? null;

        if (oldDemo?.taskStatus !== newDemo?.taskStatus) {
          slideshowRef.current = newDemo;
          forceUpdate((n) => n + 1);
        }

        const hasPending = newDemo?.taskStatus !== "completed";
        if (!hasPending && pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;

          setSelectedTemplate({
            file_name: newDemo?.fileName || "",
            url: newDemo?.urls?.[0] || "",
            type: "slideshow",
            previewGenerated: true,
            previewUrls: newDemo?.urls || [],
          });
        }
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Error generating carousel preview"
        );
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchSlideshows(true);
    pollingInterval = setInterval(() => fetchSlideshows(false), 10000);

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [projectId, lastPreviewUrl, previewType, setSelectedTemplate]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const preview = slideshowRef.current;
        if (!preview) return 0;
        const totalSlides = getImageLinks(preview).length;
        return totalSlides > 0 ? (prev + 1) % totalSlides : 0;
      });
    }, 3000); // Change slide every 3 seconds

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    // Pause auto-play temporarily when user manually navigates
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const nextSlide = () => {
    const preview = slideshowRef.current;
    if (!preview) return;
    const totalSlides = getImageLinks(preview).length;
    if (totalSlides > 0) {
      goToSlide((currentSlide + 1) % totalSlides);
    }
  };

  const prevSlide = () => {
    const preview = slideshowRef.current;
    if (!preview) return;
    const totalSlides = getImageLinks(preview).length;
    if (totalSlides > 0) {
      goToSlide(currentSlide === 0 ? totalSlides - 1 : currentSlide - 1);
    }
  };

  const preview = slideshowRef.current;

  if (activeTab !== "preview-carousel") {
    slideshowRef.current = null;
    return null;
  }

  return (
    <div className="w-full h-full p-2">
      <div className="w-full h-full rounded-md border border-black bg-gray-100 overflow-y-auto">
        <button
          className="back-btn"
          onClick={() => {
            setSelectedTemplate(null);
            setPreviewType(null);
            setLastPreviewUrl(null);
            setIsChatOpen(false);
            setIsCaptionsOpen(false);
            setActiveTab("social-media-gallery");
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex items-center justify-center">
          {/* {loading && <Loader />} */}

          {preview &&
            (isGenerating(preview) ? (
              <PostPreviewFrame>
                <div className="relative w-[250px] aspect-[2/3] rounded-[16px] overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: `${getProgress(preview)}%`,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius:
                        getProgress(preview) === 100 ? "14px" : "0 0 14px 14px",
                      transition: "height 0.8s ease",
                      zIndex: 1,
                    }}
                  />
                  <div className="relative z-20 flex w-full justify-center items-center">
                    <SmmLoader />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                      animation: "shimmer 2s infinite",
                      zIndex: 3,
                    }}
                  />
                </div>
              </PostPreviewFrame>
            ) : (
              <PostPreviewFrame mediaType="image">
                <div className="w-[250px] aspect-[2/3] overflow-hidden rounded-[16px] bg-black/5">
                  {/* Instagram-style carousel */}
                  <div className="relative w-full h-full">
                    {getImageLinks(preview).length > 0 ? (
                      <>
                        {/* Images */}
                        {getImageLinks(preview).map((src, idx) => (
                          <Image
                            key={`${preview.fileName}-${idx}`}
                            src={src}
                            fill
                            className={`object-cover transition-opacity duration-300 ${
                              idx === currentSlide ? "opacity-100" : "opacity-0"
                            }`}
                            alt={`Slide ${idx + 1}`}
                          />
                        ))}

                        {/* Touch/Swipe Area */}
                        <div
                          className="absolute inset-0 z-5"
                          onTouchStart={onTouchStart}
                          onTouchMove={onTouchMove}
                          onTouchEnd={onTouchEnd}
                          onMouseEnter={() => setIsAutoPlaying(false)}
                          onMouseLeave={() => setIsAutoPlaying(true)}
                        />

                        {/* Navigation Arrows */}
                        {getImageLinks(preview).length > 1 && (
                          <>
                            <button
                              onClick={prevSlide}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={nextSlide}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}

                        {/* Dots Indicator */}
                        {getImageLinks(preview).length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                            {getImageLinks(preview).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                  idx === currentSlide
                                    ? "bg-white scale-125"
                                    : "bg-white/50 hover:bg-white/75"
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Slide Counter */}
                        {getImageLinks(preview).length > 1 && (
                          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
                            {currentSlide + 1} / {getImageLinks(preview).length}
                          </div>
                        )}

                        {/* Auto-play Indicator */}
                        {getImageLinks(preview).length > 1 && (
                          <div className="absolute top-3 left-3 bg-black/50 text-white p-1 rounded-full z-10">
                            {isAutoPlaying ? (
                              <Play size={12} className="text-white" />
                            ) : (
                              <Pause size={12} className="text-white" />
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          No images available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </PostPreviewFrame>
            ))}
        </div>
        <style jsx>{`
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

function getImageLinks(demo: SlideshowItem | null): string[] {
  if (!demo) return [];
  if (Array.isArray(demo.urls) && demo.urls.length > 0) return demo.urls;
  return [];
}

export default PreviewCarousel;
