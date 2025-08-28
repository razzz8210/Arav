"use client";

import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";

export const TabSwitcher = () => {
  const { activeTab, setActiveTab, setIsCaptionsOpen } = useTab();
  const {
    setSelectedTemplate,
    setLastPreviewUrl,
    lastPreviewUrl,
    previewType,
  } = useTemplate();
  const isActiveSubTab = [
    "templates",
    "avatars",
    "reels",
    "carousel",
    "preview-avatar",
    "preview-reel",
    "preview-carousel",
  ].includes(activeTab);

  return (
    <div className="flex items-center bg-[#FFFFFF] rounded-[12px] p-1 backdrop-blur-sm border border-gray-700/30 w-full max-w-sm mx-auto">
      <button
        onClick={() => {
          setActiveTab("product-builder");
          setIsCaptionsOpen(false);

          if (!lastPreviewUrl) {
            setSelectedTemplate(null);
          }
        }}
        className={`flex-1 px-4 cursor-pointer sm:px-6 py-3 rounded-[12px] text-sm font-medium transition-all duration-300 text-center ${
          activeTab === "product-builder"
            ? "bg-[#9C7DFF14] text-[#9C7DFF]"
            : "text-[#737373] hover:text-gray-300"
        }`}
      >
        Product
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>Builder
      </button>
      <button
        onClick={() => {
          if (lastPreviewUrl) {
            if (previewType === "avatar") {
              setIsCaptionsOpen(true);
              setActiveTab("preview-avatar");
            } else if (previewType === "reel") {
              setIsCaptionsOpen(true);
              setActiveTab("preview-reel");
            } else if (previewType === "carousel") {
              setIsCaptionsOpen(true);
              setActiveTab("preview-carousel");
            }
            return;
          }

          setActiveTab("templates");
          setIsCaptionsOpen(false);
          setSelectedTemplate(null);
          setLastPreviewUrl(null);
        }}
        // onClick={() => setActiveTab("marketing-strategy")}
        className={`flex-1 px-4 cursor-pointer sm:px-6 py-3 rounded-[12px] text-sm font-medium transition-all duration-300 text-center ${
          isActiveSubTab
            ? "bg-[#9C7DFF14] text-[#9C7DFF]"
            : "text-[#737373] hover:text-gray-300"
        }`}
      >
        Content
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>Creator
      </button>
    </div>
  );
};
