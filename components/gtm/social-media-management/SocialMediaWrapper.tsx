import "@/app/styles/project/social-media-management.scss";
import { Gallery } from "@/components/gtm/content-creation/Gallery";
import { SocialMediaManagement } from "@/components/gtm/social-media-management/SocialMediaManagement";
import { Dropdown } from "@/components/ui/dropdown";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import { Plus } from "lucide-react";
import { useState } from "react";

interface SocialMediaWrapperProps {
  projectId: string;
}

export const SocialMediaWrapper = ({ projectId }: SocialMediaWrapperProps) => {
  const { activeTab, setActiveTab } = useTab();
  const { setSelectedTemplate } = useTemplate();

  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All Platforms");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const platformOptions = [
    "All Platforms",
    "Instagram",
    "Facebook",
    "LinkedIn",
    "Twitter",
    "TikTok",
  ];
  const statusOptions = ["All Status", "Scheduled", "Published", "Draft"];

  return (
    <div className="h-full w-full p-2">
      <div className="rounded-md bg-[#DCDCDC] border border-[#272727] flex flex-col h-full">
        <div className="w-auto h-auto mb-2 rounded-md">
          <div className="flex bg-transparent p-2.5 items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2 bg-white px-2 py-1 rounded-xl">
              <button
                onClick={() => setActiveTab("social-media-gallery")}
                className={`px-6 py-2 cursor-pointer rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "social-media-gallery"
                    ? "bg-purple-100 text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab("social-media-management")}
                className={`px-6 py-2 cursor-pointer rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "social-media-management"
                    ? "bg-purple-100 text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Social Media
              </button>
            </div>

            {/* Filters/Search – only show if in Social Media tab */}
            {activeTab === "social-media-management" && (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search Posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-3 placeholder:text-black border border-[#272727] rounded-md text-sm"
                  />
                  <Dropdown
                    value={platformFilter}
                    onChange={setPlatformFilter}
                    options={platformOptions}
                  />
                  <Dropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setActiveTab("templates");
                  }}
                  className="bg-[var(--social-media-button-primary)] flex gap-2 justify-center items-center text-white px-4 py-3 rounded-[15px] text-sm font-medium cursor-pointer hover:bg-[var(--social-media-button-primary-hover)]"
                >
                  <Plus size={15} /> Create New Post
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex flex-1 min-h-0 rounded-md">
          {/* {tab === "gallery" && (
          <div className="p-4">
            <Gallery
              projectId={projectId}
              startNew={() => {}}
              initialPrompt={""}
              switchToSocialMedia={() => {}}
            />
          </div>
        )}
        {tab === "social-media" && (
          <div className="p-4">
            <h3 className="text-lg font-semibold">Social Media Content</h3>
            <p>This is the social media tab content.</p>
          </div>
        )} */}

          {activeTab === "social-media-gallery" && (
            <Gallery projectId={projectId} />
          )}
          {activeTab === "social-media-management" && (
            <SocialMediaManagement
              projectId={projectId}
              searchTerm={searchTerm}
              platformFilter={platformFilter}
              statusFilter={statusFilter}
            />
          )}
        </div>
      </div>
    </div>
  );
};
