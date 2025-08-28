import PostPreviewFrame from "@/components/gtm/social-media-management/PostPreviewFrame";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SmmLoader = dynamic(() => import("@/components/lottie/SmmLoader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

interface ReelItem {
  urls: string[];
  fileName: string;
  taskStatus: string;
  type: string;
}

export const PreviewReel: React.FC = () => {
  const {
    projectId,
    lastPreviewUrl,
    previewType,
    setSelectedTemplate,
    setLastPreviewUrl,
    setPreviewType,
  } = useTemplate();
  const { setIsChatOpen, setIsCaptionsOpen, setActiveTab, activeTab } =
    useTab();

  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);
  const reelRef = useRef<ReelItem | null>(null);

  const isGenerating = (demo: ReelItem) => {
    return demo.taskStatus !== "completed";
  };

  const getProgress = (demo: ReelItem) => {
    return demo.taskStatus === "completed" ? 100 : 0;
    // const total = demo.totalItems ?? 0;
    // const processed = demo.processedItems ?? 0;
    // if (total <= 0) return 0;
    // const pct = Math.max(
    //   0,
    //   Math.min(100, Math.round((processed / total) * 100))
    // );
    // return pct;
  };

  useEffect(() => {
    if (!lastPreviewUrl || previewType !== "reel") {
      setLoading(false);
      return;
    }

    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchReels = async (isInitial = false) => {
      if (isInitial) setLoading(true);

      try {
        const res = await fetch(
          `/api/templates/preview/reels?file_name=${encodeURIComponent(
            lastPreviewUrl
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch reels");
        const data: { reels: ReelItem[] } = await res.json();

        const oldDemo = reelRef.current;
        const newDemo: ReelItem | null = data?.reels?.[0] ?? null;

        if (oldDemo?.taskStatus !== newDemo?.taskStatus) {
          reelRef.current = newDemo;
          forceUpdate((n) => n + 1);
        }

        const hasPending = newDemo?.taskStatus !== "completed";
        if (!hasPending && pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;

          setSelectedTemplate({
            file_name: newDemo?.fileName || "",
            url: newDemo?.urls?.[0] || "",
            type: "hook",
            previewGenerated: true,
            previewUrls: newDemo?.urls || [],
          });
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error generating reel preview"
        );
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchReels(true);
    pollingInterval = setInterval(() => fetchReels(false), 10000);

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [projectId, lastPreviewUrl, previewType, setSelectedTemplate]);

  const previewDemo = reelRef.current;

  if (activeTab !== "preview-reel") {
    reelRef.current = null;
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
          {previewDemo &&
            (isGenerating(previewDemo) ? (
              <PostPreviewFrame>
                <div className="relative w-[250px] aspect-[2/3] rounded-[16px] overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: `${getProgress(previewDemo)}%`,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius:
                        getProgress(previewDemo) === 100
                          ? "14px"
                          : "0 0 14px 14px",
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
              <PostPreviewFrame
                mediaType="video"
                mediaSrc={previewDemo.urls?.[0]}
              >
                <div className="w-[250px] aspect-[2/3] overflow-hidden rounded-[16px] bg-black/5">
                  <video
                    key={previewDemo.fileName}
                    src={previewDemo.urls?.[0]}
                    controls
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    loop
                    autoPlay
                  />
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
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .video-container {
            position: relative;
            display: inline-block;
          }
        `}</style>
      </div>
    </div>
  );
};
