import { TabSwitcher } from "@/components/gtm/TabSwitcher";
import Image from "next/image";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTemplate } from "@/utils/TemplateContext";
import { triggerSocialMediaRefetch } from "@/hooks/useSocialMediaRefetch";
import { useTab } from "@/utils/TabContext";
import Markdown from "react-markdown";
import DraftSuccessModal from "@/components/ui/DraftSuccessModal";

interface CaptionsTabProps {
  projectId: string;
  initialPrompt: string;
  modalTitle: string;
  modalSubtitle: string;
  setModalTitle: React.Dispatch<React.SetStateAction<string>>;
  setModalSubtitle: React.Dispatch<React.SetStateAction<string>>;
}

const socialMediaIcons = [
  "/icons/social-media/instagram.png",
  "/icons/social-media/facebook.png",
  "/icons/social-media/linkedin.png",
  "/icons/social-media/x.png",
];

export const CaptionsTab = ({
  projectId,
  initialPrompt,
  modalTitle,
  modalSubtitle,
  setModalTitle,
  setModalSubtitle,
}: CaptionsTabProps) => {
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const {
    selectedTemplate,
    selectedPlatform,
    contentData,
    setSelectedTemplate,
    setPreviewType,
    setLastPreviewUrl,
    setSelectedPlatform,
    setContentData,
  } = useTemplate();
  const {
    isDraftSuccessModalOpen,
    setIsDraftSuccessModalOpen,
    setActiveTab,
    setIsCaptionsOpen,
    setIsChatOpen,
  } = useTab();

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    toast.success(`Selected platform: ${platform}`);
  };

  const getTemplateType = (type: string) => {
    if (type === "hook") return "Reel";
    if (type === "avatar") return "Avatar";
    if (type === "slideshow") return "Carousel";
    return "Post";
  };

  const handleSaveDraft = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first!");
      return;
    }

    if (!selectedTemplate?.previewGenerated) {
      toast.error("Please wait for preview generation to complete!");
      return;
    }

    try {
      const payload = {
        post_text: contentData.content,
        links: selectedTemplate.previewUrls,
        type:
          selectedTemplate.type === "hook" || selectedTemplate.type === "avatar"
            ? "video"
            : "image",
        platform: selectedPlatform,
        schedule_date: "Not Scheduled",
        status: "draft",
        project_id: projectId,
      };

      const response = await fetch("/api/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unknown error");

      // Reset the selected template
      triggerSocialMediaRefetch();

      const templateType = getTemplateType(selectedTemplate.type || "");

      setModalTitle(
        `Your ${templateType} has been successfully saved to drafts!`
      );
      setModalSubtitle("Please check drafts from your dashboard.");

      setIsDraftSuccessModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleScheduleReel = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first!");
      return;
    }

    if (!selectedTemplate?.previewGenerated) {
      toast.error("Please wait for preview generation to complete!");
      return;
    }

    setActiveTab("schedule-calendar");
  };

  const handlePublish = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first!");
      return;
    }

    if (!selectedTemplate?.previewGenerated) {
      toast.error("Please wait for preview generation to complete!");
      return;
    }

    try {
      const payload = {
        post_text: contentData.content,
        links: selectedTemplate.previewUrls,
        type:
          selectedTemplate.type === "hook" || selectedTemplate.type === "avatar"
            ? "video"
            : "image",
        platform: selectedPlatform,
        schedule_date: "NA",
        status: "published",
        project_id: projectId,
      };

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

      const templateType = getTemplateType(selectedTemplate.type || "");

      setModalTitle(`Your ${templateType} has been successfully posted!`);
      setModalSubtitle("");
      setIsDraftSuccessModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const generateContent = useCallback(async () => {
    setIsGeneratingContent(true);
    try {
      const response = await fetch("/api/generate_social_media_content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_prompt: initialPrompt,
          platform: selectedPlatform.toLowerCase(),
          GTM_strategy: "captions",
          num_posts: 1,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setContentData(data.data);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error generating caption"
      );
    } finally {
      setIsGeneratingContent(false);
    }
  }, [initialPrompt, selectedPlatform, setContentData]);

  useEffect(() => {
    if (initialPrompt) {
      generateContent();
    }
  }, [initialPrompt, generateContent]);

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-[#272727] m-2 bg-[#EBEBEB]">
          {/* Fixed Header with TabSwitcher */}
          <div className="flex justify-center p-2 border-b border-gray-200">
            <TabSwitcher />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="pt-2">
              <h1 className="m-1">Caption</h1>
              {isGeneratingContent ? (
                <p className="m-4">Loading Caption...</p>
              ) : (
                <div className="m-4">
                  {contentData.content ? (
                    <Markdown>{contentData.content}</Markdown>
                  ) : (
                    "No content generated yet"
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Section */}
          <div className="border-b border-gray-200">
            <div className="flex items-center">
              <button
                className="w-[164px] h-[32px] flex items-center gap-2 cursor-pointer rounded-[120vw] border bg-[linear-gradient(91deg,rgba(255,255,255,0.09)_0.85%,rgba(156,125,255,0.1)_100%)] backdrop-blur-[64px] text-[12px] leading-[24px] font-normal text-center font-[Manrope] m-4 bg-clip-text text-transparent"
                style={{
                  borderImage:
                    "linear-gradient(90deg, rgba(156, 125, 255, 0.6), rgba(216, 110, 239, 0.6)) 1",
                  backgroundImage:
                    "linear-gradient(90deg, #9C7DFF 0%, #D86EEF 100%)",
                }}
                onClick={generateContent}
              >
                <Image
                  className="ml-3.5"
                  src="/icons/sparkles.png"
                  alt="regenerate-ai"
                  width={16}
                  height={16}
                />
                Regenerate Caption
              </button>
            </div>

            {/* Platforms Section */}
            <div className="px-4 py-3">
              <h2 className="m-1 mb-3">Platforms</h2>
              <div className="flex gap-2 items-center">
                {socialMediaIcons.map((iconsUrl, index) => (
                  <div key={index}>
                    <Image
                      src={iconsUrl}
                      alt="social-media-icons"
                      width={24}
                      height={24}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* User ID Section */}
            <div className="px-4 py-3">
              <h1 className="m-1 mb-3">User Id</h1>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center justify-between gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-gray-100 transition">
                      <div className="flex gap-1.5">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src="https://i.pravatar.cc/300"
                            alt={`@${selectedPlatform}`}
                          />
                          <AvatarFallback>
                            {selectedPlatform.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-500">
                          @{selectedPlatform.toLowerCase()}username123
                        </span>
                      </div>
                      <div>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
                  >
                    {["Instagram", "Linkedin", "TikTok"].map((platform) => (
                      <DropdownMenuItem
                        key={platform}
                        onClick={() => handlePlatformSelect(platform)}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedPlatform === platform
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <span>{platform}</span>
                        {selectedPlatform === platform && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3">
              <div className="flex justify-between items-center">
                <button
                  className="w-[110px] h-[40px] cursor-pointer rounded-md border border-[#2D2D2D] items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveDraft}
                  disabled={!contentData.content}
                >
                  Save Draft
                </button>
                <button
                  className="w-[110px] h-[40px] cursor-pointer rounded-md border border-[#2D2D2D] items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleScheduleReel}
                  disabled={!contentData.content}
                >
                  Schedule Reel
                </button>
                <button
                  className="w-[88px] h-[40px] cursor-pointer bg-[#9C7DFF] mr-2 text-white rounded-md items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePublish}
                  disabled={!contentData.content}
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isDraftSuccessModalOpen && (
        <DraftSuccessModal
          isOpen={isDraftSuccessModalOpen}
          onClose={() => setIsDraftSuccessModalOpen(false)}
          handleViewDrafts={() => {
            setIsDraftSuccessModalOpen(false);
            setSelectedTemplate(null);
            setPreviewType(null);
            setLastPreviewUrl(null);
            setIsChatOpen(false);
            setIsCaptionsOpen(false);
            setActiveTab("social-media-management");
          }}
          handleDashboard={() => {
            setIsDraftSuccessModalOpen(false);
            setSelectedTemplate(null);
            setPreviewType(null);
            setLastPreviewUrl(null);
            setIsChatOpen(true);
            setActiveTab("templates");
          }}
          title={modalTitle}
          subtitle={modalSubtitle}
          primaryText="Dashboard"
          secondaryText="View drafts"
        />
      )}
    </>
  );
};
