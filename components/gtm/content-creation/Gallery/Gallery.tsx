import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteVideoModal } from "@/components/gtm/content-creation/DeleteVideoModal";
import PostPreviewFrame from "@/components/gtm/social-media-management/PostPreviewFrame";
import Image from "next/image";
import { useTab, TabType } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import styles from "@/components/gtm/content-creation/Gallery/Gallery.module.css";

const SmmLoader = dynamic(() => import("@/components/lottie/SmmLoader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

const Loader = dynamic(() => import("@/components/lottie/Loader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

interface VideoTemplate {
  urls: string[];
  fileName: string;
  createdAt: number;
  type: "avatar" | "reel" | "carousel" | "slideshow";
  taskStatus: string;
}

interface GalleryProps {
  projectId: string;
}

export const Gallery: React.FC<GalleryProps> = ({ projectId }) => {
  const TEMPLATE_WIDTH = 176;

  const { activeTab, setActiveTab, setIsCaptionsOpen, setIsChatOpen } =
    useTab();
  const { setLastPreviewUrl, setPreviewType, setGenerationCount } = useTemplate();

  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);
  const videoTemplatesRef = useRef<VideoTemplate[]>([]);
  const [deletingVideoIndex, setDeletingVideoIndex] = useState<number | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{
    index: number;
    template: VideoTemplate;
  } | null>(null);

  const isGenerating = (data: VideoTemplate): boolean => {
    const { urls, type, taskStatus } = data;
    if (type === "avatar") {
      const trimmed = urls[0].trim();
      if (trimmed === "") return true;
      return /^\d+%$/.test(trimmed);
    }
    if (type === "reel" || type === "carousel" || type === "slideshow") {
      return !(taskStatus === "completed" || taskStatus === "failed");
    }
    return false;
  };

  const isFailed = (data: VideoTemplate): boolean => {
    return data.taskStatus === "failed";
  };

  const getProgress = (template: VideoTemplate): number => {
    const { urls, type, taskStatus } = template;

    if (type === "avatar") {
      const trimmed = urls[0].trim();
      if (trimmed === "") return 0;
      const match = trimmed.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 0;
    }

    if (type === "reel" || type === "carousel" || type === "slideshow") {
      return taskStatus === "completed" ? 100 : 0;
    }

    return 0;
  };

  const showDeleteConfirmation = (index: number, template: VideoTemplate) => {
    setVideoToDelete({ index, template });
    setShowDeleteConfirm(true);
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete || deletingVideoIndex !== null) return;

    const { index, template } = videoToDelete;
    setDeletingVideoIndex(index);

    try {
      const res = await fetch(`/api/templates/delete?projectId=${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: template.fileName,
          type: template.type,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete video");

      videoTemplatesRef.current = videoTemplatesRef.current.filter(
        (_, i) => i !== index
      );
      forceUpdate((n) => n + 1);
      toast.success("Video deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete video"
      );
    } finally {
      setShowDeleteConfirm(false);
      setDeletingVideoIndex(null);
      setVideoToDelete(null);
    }
  };

  const cancelDeletion = () => {
    setShowDeleteConfirm(false);
    setVideoToDelete(null);
  };

  const fetchVideoTemplates = useCallback(async (isInitial = false, pollingInterval?: NodeJS.Timeout | null): Promise<NodeJS.Timeout | null> => {
      if (isInitial) setLoading(true);

      try {
        const res = await fetch(
          `/api/templates/preview/all?projectId=${projectId}`
        );
        if (!res.ok) throw new Error("Failed to fetch video templates");

        const data = await res.json();

        const newTemplates: VideoTemplate[] = data.templates || [];

        const total = newTemplates.length;
        setGenerationCount(total);

        let changed = false;

        const merged = newTemplates.map((newT, i) => {
          const oldT = videoTemplatesRef.current[i];

          if (!oldT) {
            changed = true;
            return newT;
          }

          if (isGenerating(oldT) && oldT.urls[0] !== newT.urls[0]) {
            changed = true;
            return newT;
          }

          return oldT;
        });

        if (merged.length !== videoTemplatesRef.current.length) {
          changed = true;
        }

        if (changed) {
          videoTemplatesRef.current = merged;
          forceUpdate((n) => n + 1);
        }

        // Stop polling if all videos are ready
        const hasPendingVideos = newTemplates.some((t) => isGenerating(t));
        if (!hasPendingVideos && pollingInterval) {
          clearInterval(pollingInterval);
          return null;
        }
        
        return pollingInterval || null;
      } catch (err) {
        console.error("error fetching templates", err);
        return pollingInterval || null;
      } finally {
        if (isInitial) setLoading(false);
      }
    }, [projectId, setGenerationCount]);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    fetchVideoTemplates(true);

    // Start polling
    pollingInterval = setInterval(async () => {
      pollingInterval = await fetchVideoTemplates(false, pollingInterval);
    }, 10000);

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [projectId, fetchVideoTemplates]);

  const templates = videoTemplatesRef.current;

  if (activeTab !== "social-media-gallery") {
    return null;
  }

  return (
    <div className={styles.galleryContainer}>
      {loading && (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      )}
      {!loading && templates.length <= 0 && (
        <div className={styles.emptyState}>
          No templates found. Please add or select a post to preview.
        </div>
      )}
      {!loading && templates?.length > 0 && (
        <div className={styles.contentContainer}>
          <div
            className={styles.templatesGrid}
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(${TEMPLATE_WIDTH}px, 1fr))`,
              maxWidth: `${Math.min(
                templates.length * (TEMPLATE_WIDTH + 16),
                1500
              )}px`,
            }}
          >
            {templates.map((template: VideoTemplate, index) => (
              <div
                key={`${template.fileName}-${index}`}
                onClick={() => { }}
                className={styles.templateItem}
              >
                {isGenerating(template) ? (
                  <div
                    className={styles.generatingContainer}
                    onClick={() => {
                      toast.info("Please wait for the generation to complete!");
                    }}
                  >
                    <div
                      className={`${styles.progressBar} ${getProgress(template) === 100
                        ? styles.progressBarCompleted
                        : styles.progressBarIncomplete
                        }`}
                      style={{
                        height: `${getProgress(template)}%`,
                      }}
                    />
                    <div className={styles.loaderContainer}>
                      <div
                        className={`${styles.loaderText} ${getProgress(template) > 50
                          ? styles.loaderTextDark
                          : styles.loaderTextLight
                          }`}
                      >
                        <div className={styles.loaderWrapper}>
                          <SmmLoader />
                        </div>
                      </div>
                    </div>

                    <div className={styles.percentageContainer}>
                      <div className={styles.percentageText}>
                        {getProgress(template)}%
                      </div>
                    </div>

                    <div className={styles.shimmer} />
                  </div>
                ) : isFailed(template) ? (
                  <div className={styles.failedContainer}>
                    <div className={styles.failedIcon}></div>
                    <div className={styles.failedText}>Generation Failed</div>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteConfirmation(index, template);
                      }}
                      title="Delete video"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={styles.templateContent}
                      onClick={() => {
                        // Unified flow for all template types including slideshow
                        setIsChatOpen(true);
                        setIsCaptionsOpen(true);
                        // Treat slideshow as carousel for preview purposes
                        const previewTypeForTemplate = template.type === "slideshow" ? "carousel" : template.type;
                        setPreviewType(previewTypeForTemplate as "reel" | "avatar" | "carousel");
                        setLastPreviewUrl(template.fileName);
                        const tabForTemplate = template.type === "slideshow" ? "carousel" : template.type;
                        setActiveTab(`preview-${tabForTemplate}` as TabType);
                      }}
                    >
                      {template.type === "carousel" && (
                        <Image
                          src={template.urls[0]}
                          alt={`Template ${index + 1}`}
                          fill
                          sizes="(min-width: 0px) 100%"
                          className={styles.templateImage}
                        />
                      )}
                      {template.type === "slideshow" && (
                        <Image
                          src={template.urls[0]}
                          alt={`Template ${index + 1}`}
                          fill
                          sizes="(min-width: 0px) 100%"
                          className={styles.templateImage}
                        />
                      )}
                      {(template.type === "reel" ||
                        template.type === "avatar") && (
                          <video
                            src={template.urls[0]}
                            className={styles.templateVideo}
                            muted
                            loop
                            preload="metadata"
                          />
                        )}
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirmation(index, template);
                        }}
                        title="Delete video"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <DeleteVideoModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeletion}
        onConfirm={handleDeleteVideo}
        isDeleting={deletingVideoIndex !== null}
      />
    </div>
  );
};
