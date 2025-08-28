"use client";

import "@/app/styles/project/gallery-modal.scss";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { triggerSocialMediaRefetch } from "@/hooks/useSocialMediaRefetch";
import ScheduleModal from "@/components/gtm/ScheduleModal";
import { CaptionData } from "@/types/template";

interface VideoTemplate {
  url: string;
  // file_path: string;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTemplate: VideoTemplate | null;
  initialPrompt: string | null;
  projectId: string;
  switchToSocialMedia?: () => void;
}

const PLATFORMS = ["TikTok", "Instagram", "LinkedIn"];

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  videoTemplate,
  initialPrompt,
  projectId,
  switchToSocialMedia,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState("TikTok");
  const [captionData, setCaptionData] = useState<CaptionData>({
    script: "",
    urls: [],
  });

  const [scheduleModal, setScheduleModal] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = {
        post_text: captionData?.script || "",
        link: videoTemplate?.url || "",
        type: "video",
        platform: selectedPlatform,
        schedule_date: "Not Scheduled",
        status: "draft",
        project_id: projectId,
      };

      // // console.log("#LOG payload", payload);
      const response = await fetch("/api/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || "Unknown error");
      triggerSocialMediaRefetch();

      onClose();
      if (switchToSocialMedia) {
        switchToSocialMedia();
      }
    } catch (error) {
      // console.error("Error saving draft", error);
      toast.error("Error saving draft");
    }
  };

  const handleScheduleReel = () => {
    // TODO: Implement schedule reel logic
    // console.log("Scheduling reel...");
  };

  const handlePublish = async () => {
    // console.log("Publishing...");
    // Trigger refetch of social media data
    triggerSocialMediaRefetch();
    onClose();
    if (switchToSocialMedia) {
      switchToSocialMedia();
    }
  };

  const generateCaption = useCallback(async () => {
    setIsGeneratingCaption(true);
    try {
      const response = await fetch("/api/generate_captions/avatars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_prompt: initialPrompt }),
      });
      const data = await response.json();
      if (data.status) {
        setCaptionData(data);
      }
    } catch (error) {
      console.error("Error generating caption", error);
    } finally {
      setIsGeneratingCaption(false);
    }
  }, [initialPrompt]);

  const generatePost = async (platform: string) => {
    try {
      const response = await fetch("/api/generate_post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, GTM: initialPrompt }),
      });
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching post for platform", error);
    }
  };

  const generateSMContent = useCallback(async () => {
    setContentLoading(true);
    try {
      const body = {
        platform: selectedPlatform.toLowerCase(),
        GTM_strategy: initialPrompt,
        num_posts: 1,
      };

      const response = await fetch("/api/generate_social_media_content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || "Unknown error");

      const firstPostContent = data?.content || "";
      if (data) {
        setCaptionData((prev) => ({
          ...prev,
          script: firstPostContent,
        }));
      }
    } catch (err: any) {
      toast.error(err?.message || "Unknown error");
    } finally {
      setContentLoading(false);
    }
  }, [selectedPlatform, initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      if (!selectedPlatform) return;

      generateSMContent();
    }
  }, [selectedPlatform, isOpen, generateSMContent]);

  useEffect(() => {
    if (initialPrompt) {
      generateCaption();
    }
  }, [initialPrompt, generateCaption]);

  if (!isOpen || !videoTemplate) return null;

  return (
    <div className="video-template-modal__overlay" onClick={handleOverlayClick}>
      {scheduleModal && (
        <ScheduleModal
          onClose={() => setScheduleModal(false)}
          handleSchedule={handleScheduleReel}
        />
      )}
      <div className="video-template-modal">
        <div className="video-template-modal__header">
          <h2 className="video-template-modal__title">Prepare Your Reel</h2>
          <button
            className="video-template-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="video-template-modal__content">
          <div className="video-template-modal__video-section">
            <div className="video-template-modal__video-container">
              <div className="w-[300px] aspect-[9/16] overflow-hidden rounded-2xl">
                <video
                  src={videoTemplate.url}
                  controls
                  className="object-cover w-full h-full"
                  autoPlay
                  loop
                  muted
                />
              </div>
              <div className="video-template-modal__video-controls">
                <button className="video-template-modal__control-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <button className="video-template-modal__control-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 3h4a2 2 0 012 2v4m-6 9l4 4 4-4M9 21H5a2 2 0 01-2-2v-4m6-9L5 6 1 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button className="video-template-modal__control-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="video-template-modal__enhance-section">
              <button className="video-template-modal__enhance-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Want to Enhance This Image Using AI ?
              </button>
            </div>
          </div>

          <div className="video-template-modal__form-section">
            <div className="video-template-modal__platform-section">
              <label className="video-template-modal__label">Platform</label>
              <div className="video-template-modal__platform-selector">
                <div className="video-template-modal__platform-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="currentColor" />
                  </svg>
                </div>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="video-template-modal__platform-select"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="video-template-modal__caption-section">
              <label className="video-template-modal__label">Content</label>
              {contentLoading && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-600">Loading...</span>
                </div>
              )}
              {!contentLoading && (
                <>
                  <textarea
                    value={captionData.script}
                    onChange={(e) =>
                      setCaptionData({ ...captionData, script: e.target.value })
                    }
                    className="video-template-modal__caption-textarea"
                    rows={6}
                    placeholder="Enter your caption..."
                  />
                  <button
                    className="video-template-modal__regenerate-btn"
                    onClick={generateSMContent}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {isGeneratingCaption
                      ? "Generating Content..."
                      : "Regenerate Content"}
                  </button>
                </>
              )}
            </div>

            {!contentLoading && (
              <div className="video-template-modal__actions">
                <button
                  className="video-template-modal__action-btn video-template-modal__action-btn--secondary"
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </button>
                <button
                  className="video-template-modal__action-btn video-template-modal__action-btn--secondary"
                  onClick={handleScheduleReel}
                >
                  Schedule Reel
                </button>
                <button
                  className="video-template-modal__action-btn video-template-modal__action-btn--primary"
                  onClick={handlePublish}
                  disabled={
                    isPublishing || !captionData.script || isGeneratingCaption
                  }
                >
                  {isPublishing ? "Publishing..." : "Publish"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
