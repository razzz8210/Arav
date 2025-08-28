import { TabManager } from "@/components/chat/TabManager";
import { Avatars } from "@/components/gtm/content-creation/templates/Avatars";
import Carousel from "@/components/gtm/content-creation/templates/Carousel";
import Reels from "@/components/gtm/content-creation/templates/Reels";
import Templates from "@/components/gtm/content-creation/templates/Templates";
import DraftSuccessModal from "@/components/ui/DraftSuccessModal";
import { MusicProvider } from "@/utils/MusicContext";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import { useEffect } from "react";

interface ContentCreatorProps {
  projectId: string;
  initialPrompt: string;
}

export const ContentCreator = ({
  projectId,
  initialPrompt,
}: ContentCreatorProps) => {
  const {
    activeTab,
    isDraftSuccessModalOpen,
    setIsDraftSuccessModalOpen,
    setActiveTab,
    setIsChatOpen,
    setIsCaptionsOpen,
  } = useTab();

  const {
    setSelectedTemplate,
    setProjectId,
    setInitialPrompt,
    setLastPreviewUrl,
    setPreviewType,
  } = useTemplate();

  useEffect(() => {
    setProjectId(projectId);
    setInitialPrompt(initialPrompt);
  }, [projectId, initialPrompt, setProjectId, setInitialPrompt]);

  return (
    <div className="h-full w-full p-2 flex flex-col">
      <div className="w-auto h-auto mb-2">
        <TabManager projectId={projectId} initialPrompt={initialPrompt} />
      </div>

      <MusicProvider>
        {activeTab === "templates" && <Templates />}
        {activeTab === "avatars" && <Avatars />}
        {activeTab === "reels" && <Reels />}
        {activeTab === "carousel" && <Carousel />}
      </MusicProvider>

      {isDraftSuccessModalOpen && (
        <DraftSuccessModal
          isOpen={isDraftSuccessModalOpen}
          onClose={() => setIsDraftSuccessModalOpen(false)}
          handleViewDrafts={() => {
            setIsDraftSuccessModalOpen(false);
            setSelectedTemplate(null);
            setIsChatOpen(false);
            setIsCaptionsOpen(false);
            setActiveTab("social-media-management");
          }}
          handleDashboard={() => {
            setIsDraftSuccessModalOpen(false);
            setSelectedTemplate(null);
            setPreviewType(null);
            setLastPreviewUrl(null);
            setIsChatOpen(false);
            setActiveTab("templates");
          }}
          title="Your Reel has been successfully saved to drafts!"
          subtitle="Please check drafts from your dashboard."
          primaryText="Dashboard"
          secondaryText="View drafts"
        />
      )}
    </div>
  );
};
