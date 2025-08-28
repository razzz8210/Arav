import React, { useEffect, useRef, useState } from "react";
import "@/app/styles/components/tab-manager.scss";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { TabType, useTab } from "@/utils/TabContext";
import { toast } from "sonner";
import { useTemplate } from "@/utils/TemplateContext";
import { triggerSocialMediaRefetch } from "@/hooks/useSocialMediaRefetch";

interface Tab {
  id: TabType;
  label: string;
  img: string;
}

interface TabManagerProps {
  projectId: string;
  initialPrompt: string;
}

export const TabManager: React.FC<TabManagerProps> = ({
  projectId,
  initialPrompt,
}) => {
  const {
    toggleChat,
    activeTab,
    setActiveTab,
    setIsDraftSuccessModalOpen,
    setIsCaptionsOpen,
  } = useTab();

  const tabs: Tab[] = [
    { id: "templates", label: "Templates", img: "/icons/template.png" },
    { id: "avatars", label: "Avatars", img: "/icons/avatars.png" },
    { id: "reels", label: "Reels", img: "/icons/reels.png" },
    { id: "carousel", label: "Carousel", img: "/icons/assets.png" },
  ];
  // const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || "";

  const [filterOpen, setFilterOpen] = useState(false);
  const filterStatusRef = useRef<HTMLDivElement>(null);

  const { selectedTemplate, setSelectedTemplate } = useTemplate();

  const toggleFilterDropdown = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterOptionSelect = (val: TabType) => {
    setActiveTab(val);
    setFilterOpen(false);
  };

  const handleFilterMouseDown = (event: MouseEvent) => {
    if (
      filterStatusRef.current &&
      !filterStatusRef.current.contains(event.target as Node)
    ) {
      setFilterOpen(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first!");
      return;
    }

    try {
      const payload = {
        post_text: initialPrompt,
        links: [selectedTemplate.url],
        type: selectedTemplate.file_name.includes(".mp4") ? "video" : "image",
        platform: "instagram",
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
      setSelectedTemplate(null);
      triggerSocialMediaRefetch();

      setIsDraftSuccessModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handlePublish = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first!");
      return;
    }

    setIsCaptionsOpen(true);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleFilterMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleFilterMouseDown);
    };
  }, []);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden w-full sm:flex">
        <div className="tab-manager no-scrollbar hidden sm:flex rounded-md border border-[#272727]">
          <div className="tab-manager__nav justify-between">
            <div className="tab-manager__nav-container flex-wrap">
              <div
                className={`tab-manager__tab-button--active tab-manager__tab-button flex justify-center items-center gap-[10px] w-[196px] h-[40px] bg-[#DCDCDC] ml-[16px] border border-[#FFFFFF14] rounded-full p-1 cursor-pointer`}
                onClick={toggleChat}
              >
                <Image
                  alt="sidebar-icon"
                  src="/icons/sidebar.png"
                  width={16}
                  height={16}
                />
              </div>

              <div>
                <Image
                  alt="line-icon"
                  src="/icons/line.png"
                  width={16}
                  height={16}
                />
              </div>

              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedTemplate(null);
                  }}
                  className={`tab-manager__tab-button flex justify-center items-center gap-[10px] w-[196px] h-[40px] bg-[#DCDCDC] border border-[#FFFFFF14] rounded-full p-1 cursor-pointer ${activeTab === tab.id
                      ? "tab-manager__tab-button--active"
                      : "tab-manager__tab-button--inactive"
                    }`}
                >
                  <Image
                    alt="template-icon"
                    src={tab.img}
                    width={16}
                    height={16}
                  />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* <div className="flex gap-2 items-center">
              <button
                className="w-[110px] h-[40px] cursor-pointer rounded-md px-4 py-2 border border-[#2D2D2D]"
                onClick={handleSaveDraft}
              >
                Save Draft
              </button>
              <button
                className="w-[88px] h-[40px] cursor-pointer bg-[#9C7DFF] mr-2 text-white rounded-md px-4 py-2"
                onClick={handlePublish}
              >
                Publish
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden my-2 px-5 py-2" ref={filterStatusRef}>
        <div className="relative text-left">
          <div className="">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 focus:border-primary focus:outline-none"
              onClick={toggleFilterDropdown}
            >
              {/* {activeTabLabel} */}
              {filterOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          {filterOpen && (
            <div className="absolute z-[1] mt-1 w-full rounded-md bg-gray-100 ring-1 ring-black ring-opacity-5">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                {tabs.map((option) => {
                  return (
                    <button
                      key={option.id}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#CAF0F8]"
                      role="menuitem"
                      onClick={() => {
                        setSelectedTemplate(null);
                        handleFilterOptionSelect(option.id);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
