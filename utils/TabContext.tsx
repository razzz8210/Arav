"use client";
import { TabConfigGoTo } from "@/components/landing/PromptArea/data";
import { createContext, useContext, useState, ReactNode } from "react";

export type TabType =
  | "content-creator"
  | "product-builder"
  | "templates"
  | "avatars"
  | "reels"
  | "carousel"
  | "social-media-gallery"
  | "social-media-management"
  | "marketing-strategy"
  | "schedule-calendar"
  | "preview-reel"
  | "preview-avatar"
  | "preview-carousel";

type TabContextType = {
  selectedConfig: TabConfigGoTo;
  setSelectedConfig: (tab: TabConfigGoTo) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  toggleChat: () => void;
  isDraftSuccessModalOpen: boolean;
  setIsDraftSuccessModalOpen: (isOpen: boolean) => void;
  isCaptionsOpen: boolean;
  setIsCaptionsOpen: (isOpen: boolean) => void;
};

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<TabType>("product-builder");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isDraftSuccessModalOpen, setIsDraftSuccessModalOpen] = useState(false);
  const [isCaptionsOpen, setIsCaptionsOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] =
    useState<TabConfigGoTo>("product-builder");

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <TabContext.Provider
      value={{
        selectedConfig,
        setSelectedConfig,
        activeTab,
        setActiveTab,
        isChatOpen,
        setIsChatOpen,
        toggleChat,
        isDraftSuccessModalOpen,
        setIsDraftSuccessModalOpen,
        isCaptionsOpen,
        setIsCaptionsOpen,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useTab = (): TabContextType => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};
