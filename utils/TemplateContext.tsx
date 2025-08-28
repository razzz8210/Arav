import { createContext, useContext, useState } from "react";
import {
  TemplateContextType,
  TemplateData,
  CaptionData,
  ContentData,
} from "@/types/template";

const TemplateContext = createContext<TemplateContextType>({
  selectedTemplate: null,
  setSelectedTemplate: () => { },
  initialPrompt: "",
  setInitialPrompt: () => { },
  captionData: null,
  setCaptionData: () => { },
  projectId: "",
  setProjectId: () => { },
  lastPreviewUrl: "",
  setLastPreviewUrl: () => { },
  previewType: null,
  setPreviewType: () => { },
  selectedPlatform: "",
  setSelectedPlatform: () => { },
  contentData: {
    platform: "",
    content: "",
  },
  setContentData: () => { },
  generationCount: 0,
  setGenerationCount: () => { }
});

export const TemplateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(
    null
  );
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [captionData, setCaptionData] = useState<CaptionData | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [lastPreviewUrl, setLastPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    "avatar" | "reel" | "carousel" | null
  >(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("TikTok");
  const [contentData, setContentData] = useState<ContentData>({
    platform: "",
    content: "",
  });

  const [generationCount, setGenerationCount] = useState<number>(0);

  return (
    <TemplateContext.Provider
      value={{
        selectedTemplate,
        setSelectedTemplate,
        initialPrompt,
        setInitialPrompt,
        captionData,
        setCaptionData,
        projectId,
        setProjectId,
        lastPreviewUrl,
        setLastPreviewUrl,
        previewType,
        setPreviewType,
        selectedPlatform,
        setSelectedPlatform,
        contentData,
        setContentData,
        generationCount,
        setGenerationCount,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
};
