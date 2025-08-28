"use client";

import { classNames } from "@/app/utils/classNames";
import { TabManager } from "@/components/chat/TabManager";
import { ContentCreator } from "@/components/gtm/content-creation/ContentCreator";
import { CaptionsTab } from "@/components/gtm/content-creation/preview/CaptionsTab";
import { MarketingAssisstant } from "@/components/gtm/marketing-strategy/MarketingAssisstant";
import { MarketingStrategy } from "@/components/gtm/marketing-strategy/MarketingStrategy";
import { ProductBuilder } from "@/components/gtm/ProductBuilder";
import ScheduleCalendar from "@/components/gtm/social-media-management/ScheduleCalendar";
import { SocialMediaManagement } from "@/components/gtm/social-media-management/SocialMediaManagement";
import { SocialMediaWrapper } from "@/components/gtm/social-media-management/SocialMediaWrapper";
import { useLoader } from "@/components/lottie/LoaderContext";
import { Menu } from "@/components/sidebar/Menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Fragment } from "@/generated/prisma";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";
import { useTRPC } from "@/trpc/client";
import { useTab } from "@/utils/TabContext";
import { TemplateProvider } from "@/utils/TemplateContext";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { memo, useEffect, useState } from "react";

const PreviewAvatar = dynamic(
  () =>
    import("@/components/gtm/content-creation/preview/Avatar").then(
      (m) => m.PreviewAvatar
    ),
  { ssr: false }
);
const PreviewReel = dynamic(
  () =>
    import("@/components/gtm/content-creation/preview/Reel").then(
      (m) => m.PreviewReel
    ),
  { ssr: false }
);
const PreviewCarousel = dynamic(
  () =>
    import("@/components/gtm/content-creation/preview/Carousel").then(
      (m) => m.PreviewCarousel
    ),
  { ssr: false }
);

interface Props {
  projectId: string;
}

// Memoize components that don't depend on activeFragment to prevent unnecessary re-renders
const MemoizedSocialMediaManagement = memo(SocialMediaManagement);
const MemoizedMarketingStrategy = memo(MarketingStrategy);
const MemoizedContentCreator = memo(ContentCreator);

type SectionState = "chat" | "preview";
export type SandboxState = "active" | "restarting" | "error";

export const ProjectView = ({ projectId }: Props) => {
  const { setShowLoader } = useLoader();
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );
  const { prompt: initialPrompt } = project;

  if (!project) {
    notFound();
  }

  // Fetch messages to get the initial prompt
  const { data: messages } = useQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );

  // Extract initial prompt from messages
  const projectStarted = Array.isArray(messages) && messages?.length > 0;

  const { activeTab, setActiveTab, isChatOpen, isCaptionsOpen } = useTab();
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [activeSection, setActiveSection] = useState<SectionState>("chat");
  const [sandboxState, setSandboxState] = useState<SandboxState>("active");
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalSubtitle, setModalSubtitle] = useState<string>("");

  const [menuState, setMenuState] = useState<
    "open" | "collapsed" | "minimised"
  >("minimised");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setShowLoader(false);
  }, [setShowLoader]);

  const switchToContentCreator = () => {
    setActiveTab("templates");
  };

  return (
    <TemplateProvider>
      <Menu
        usedIn="project"
        menuState={menuState}
        setMenuState={(state) => setMenuState(state)}
        pinned={pinned}
        setPinned={setPinned}
      />
      <div
        className="h-[100dvh] overflow-hidden flex flex-col"
        style={{
          marginLeft: menuState === "minimised" ? 60 : 0,
          transition: "margin-left 0.2s",
        }}
      >
        <ProjectHeader projectId={projectId} />

        {/* Desktop View */}
        <div className="hidden sm:flex flex-1 min-h-0 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {isChatOpen && (
              <>
                <ResizablePanel
                  defaultSize={25}
                  minSize={20}
                  className="flex flex-col min-h-0"
                >
                  {isCaptionsOpen ? (
                    <CaptionsTab
                      projectId={projectId}
                      initialPrompt={initialPrompt || ""}
                      modalTitle={modalTitle}
                      modalSubtitle={modalSubtitle}
                      setModalTitle={setModalTitle}
                      setModalSubtitle={setModalSubtitle}
                    />
                  ) : ["templates", "avatars", "reels", "carousel"].includes(
                      activeTab
                    ) ? (
                    <MarketingAssisstant
                      projectId={projectId}
                      initialPrompt={initialPrompt || ""}
                    />
                  ) : (
                    <MessagesContainer
                      projectId={projectId}
                      activeFragment={activeFragment}
                      setActiveFragment={setActiveFragment}
                      sandboxState={sandboxState}
                      setSandboxState={setSandboxState}
                      projectStarted={projectStarted}
                    />
                  )}
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}
            <ResizablePanel
              defaultSize={isChatOpen ? 75 : 100}
              minSize={50}
              className="flex flex-col min-h-0"
            >
              {/* Keep all components mounted but control visibility */}
              <div
                className="flex-1 min-h-0"
                style={{
                  display: activeTab === "product-builder" ? "block" : "none",
                }}
              >
                <ProductBuilder
                  activeFragment={activeFragment}
                  sandboxState={sandboxState}
                  setSandboxState={setSandboxState}
                  projectStarted={projectStarted}
                />
              </div>

              <div
                className="flex-1 min-h-0"
                style={{
                  display: [
                    "templates",
                    "avatars",
                    "reels",
                    "carousel",
                  ].includes(activeTab)
                    ? "block"
                    : "none",
                }}
              >
                <MemoizedContentCreator
                  projectId={projectId}
                  initialPrompt={initialPrompt || ""}
                />
              </div>

              <div
                className="flex-1 min-h-0"
                style={{
                  display:
                    activeTab === "social-media-gallery" ||
                    activeTab === "social-media-management"
                      ? "block"
                      : "none",
                }}
              >
                <SocialMediaWrapper projectId={projectId} />
              </div>

              <div
                className="flex-1 min-h-0"
                style={{
                  display: activeTab === "schedule-calendar" ? "block" : "none",
                }}
              >
                <ScheduleCalendar
                  modalTitle={modalTitle}
                  modalSubtitle={modalSubtitle}
                  setModalTitle={setModalTitle}
                  setModalSubtitle={setModalSubtitle}
                />
              </div>

              <div
                className="flex-1 min-h-0"
                style={{
                  display: activeTab === "preview-avatar" ? "block" : "none",
                }}
              >
                <PreviewAvatar />
              </div>

              <div
                className="flex-1 min-h-0"
                style={{
                  display: activeTab === "preview-reel" ? "block" : "none",
                }}
              >
                <PreviewReel />
              </div>

              <div
                className="flex-1 min-h-0"
                style={{
                  display: activeTab === "preview-carousel" ? "block" : "none",
                }}
              >
                <PreviewCarousel />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden flex-1 min-h-0 relative overflow-hidden">
          <div className="flex flex-col h-full overflow-y-auto ">
            {activeSection == "chat" && (
              <>
                <MessagesContainer
                  projectId={projectId}
                  activeFragment={activeFragment}
                  setActiveFragment={setActiveFragment}
                  sandboxState={sandboxState}
                  setSandboxState={setSandboxState}
                  projectStarted={projectStarted}
                />
                <div className=" w-full px-3 pb-3 z-50 flex justify-center">
                  <SectionBar
                    activeSection={activeSection}
                    setSection={setActiveSection}
                  />
                </div>
              </>
            )}
            {activeSection == "preview" && (
              <div className="h-full overflow-y-auto pb-20 ">
                <div className="border ">
                  <div className="flex-shrink-0">
                    <TabManager
                      projectId={projectId}
                      initialPrompt={initialPrompt || ""}
                    />
                  </div>

                  <div
                    className="flex-1 min-h-0"
                    style={{
                      display: activeTab === "templates" ? "block" : "none",
                    }}
                  >
                    <ProductBuilder
                      activeFragment={activeFragment}
                      sandboxState={sandboxState}
                      setSandboxState={setSandboxState}
                      projectStarted={projectStarted}
                    />
                  </div>

                  <div
                    className="flex-1 min-h-0"
                    style={{
                      display: activeTab === "avatars" ? "block" : "none",
                    }}
                  >
                    <MemoizedContentCreator
                      projectId={projectId}
                      initialPrompt={initialPrompt || ""}
                    />
                  </div>

                  <div
                    className="flex-1 min-h-0"
                    style={{
                      display:
                        activeTab === "social-media-gallery" ||
                        activeTab === "social-media-management"
                          ? "block"
                          : "none",
                    }}
                  >
                    <MemoizedSocialMediaManagement
                      projectId={projectId}
                      searchTerm=""
                      platformFilter=""
                      statusFilter=""
                    />
                  </div>

                  <div
                    className="flex-1 min-h-0"
                    style={{
                      display: activeTab === "carousel" ? "block" : "none",
                    }}
                  >
                    <MemoizedMarketingStrategy projectId={projectId} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full px-3 pb-3 z-50 flex justify-center">
                  <SectionBar
                    activeSection={activeSection}
                    setSection={setActiveSection}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TemplateProvider>
  );
};

export default ProjectView;

type SectionType = "chat" | "preview";

interface SectionBarProps {
  activeSection: SectionType;
  setSection: (section: SectionType) => void;
}

const SectionBar: React.FC<SectionBarProps> = ({
  activeSection,
  setSection,
}) => {
  return (
    <div
      className="flex justify-center border gap-1 sm:gap-1.5 mt-[15px] mb-1 max-w-[370px] mx-3 sm:mx-auto px-1 py-1 bg-[#FFFFFF] text-black"
      style={{
        borderRadius: "50px",
      }}
    >
      <button
        className={classNames(
          "px-4 py-3 w-20 justify-center rounded-full  font-medium text-sm flex items-center gap-2 transition-all hover:shadow-lg",
          {
            "bg-gradient-to-r from-purple-500 text-white to-blue-500":
              activeSection === "chat",
            "bg-transparent": activeSection !== "chat",
          }
        )}
        onClick={() => setSection("chat" as SectionType)}
      >
        Chat
      </button>
      <button
        className={classNames(
          "px-4  py-3 w-20 rounded-full justify-center  font-medium text-sm flex items-center  transition-all hover:shadow-lg",
          {
            "bg-gradient-to-r from-purple-500 text-white to-blue-500":
              activeSection === "preview",
            "bg-transparent": activeSection !== "preview",
          }
        )}
        onClick={() => setSection("preview" as SectionType)}
      >
        Preview
      </button>
    </div>
  );
};
