import "@/app/styles/preview.scss";
import PostPreviewFrame from "@/components/gtm/social-media-management/PostPreviewFrame";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const SmmLoader = dynamic(() => import("@/components/lottie/SmmLoader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

interface AvatarTemplate {
  urls: string[];
  fileName: string;
  taskStatus: string;
  type: string;
  createdAt: number;
}

export const PreviewAvatar: React.FC = () => {
  const {
    lastPreviewUrl,
    projectId,
    setSelectedTemplate,
    setLastPreviewUrl,
    previewType,
    setPreviewType,
  } = useTemplate();
  const { setIsChatOpen, setIsCaptionsOpen, setActiveTab, activeTab } =
    useTab();

  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);
  const avatarRef = useRef<AvatarTemplate | null>(null);

  const isGenerating = (url: string) => {
    const trimmed = url.trim();
    if (trimmed === "") return true;
    return /^\d+%$/.test(trimmed);
  };

  const getProgress = (url: string) => {
    const trimmed = url.trim();
    if (trimmed === "") return 0;
    const match = trimmed.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  useEffect(() => {
    // Only start polling when there is a preview to watch
    if (!lastPreviewUrl || previewType !== "avatar") {
      setLoading(false);
      return;
    }

    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchAvatars = async (isInitial = false) => {
      if (isInitial) setLoading(true);

      try {
        const res = await fetch(
          `/api/templates/preview/avatars?projectId=${projectId}&file_name=${encodeURIComponent(
            lastPreviewUrl
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch video templates");

        const data = await res.json();

        const oldAvatar = avatarRef.current;
        const newAvatar: AvatarTemplate | null = data.avatars?.[0] ?? null;

        if (oldAvatar?.urls[0] !== newAvatar?.urls[0]) {
          avatarRef.current = newAvatar;
          forceUpdate((n) => n + 1);
        }

        const hasPending = newAvatar && isGenerating(newAvatar.urls[0]);
        if (!hasPending && pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;

          setSelectedTemplate({
            file_name: newAvatar?.fileName || "",
            url: newAvatar?.urls?.[0] || "",
            type: "avatar",
            previewGenerated: true,
            previewUrls: newAvatar?.urls || [],
          });
        }
      } catch (err) {
        console.error("error fetching avatars", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchAvatars(true);

    // Start polling
    pollingInterval = setInterval(() => {
      fetchAvatars(false);
    }, 10000);

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [projectId, lastPreviewUrl, previewType, setSelectedTemplate]);

  const previewAvatar = avatarRef.current;

  if (activeTab !== "preview-avatar") {
    avatarRef.current = null;
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
          {previewAvatar &&
            (isGenerating(previewAvatar.urls[0]) ? (
              <PostPreviewFrame>
                <div className="relative w-[250px] aspect-[2/3] rounded-[16px] overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: `${getProgress(previewAvatar.urls[0])}%`,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius:
                        getProgress(previewAvatar.urls[0]) === 100
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
                mediaSrc={previewAvatar.urls[0]}
              >
                <div className="w-[250px] aspect-[2/3] overflow-hidden rounded-[16px] bg-black/5">
                  <video
                    key={previewAvatar.fileName}
                    src={previewAvatar.urls[0]}
                    controls
                    className="w-full h-full object-cover"
                    playsInline
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
