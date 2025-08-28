export interface TemplateData {
  category?: string;
  file_name: string;
  url: string;
  tags?: string[];
  type?: "avatar" | "hook" | "slideshow";
  previewGenerated?: boolean;
  previewUrls?: string[];
}

export interface CaptionData {
  script: string;
  urls: string[];
}

export interface ContentData {
  platform: string;
  content: string;
}

export interface TemplateContextType {
  selectedTemplate: TemplateData | null;
  setSelectedTemplate: React.Dispatch<
    React.SetStateAction<TemplateData | null>
  >;
  initialPrompt: string;
  setInitialPrompt: React.Dispatch<React.SetStateAction<string>>;
  captionData: CaptionData | null;
  setCaptionData: React.Dispatch<React.SetStateAction<CaptionData | null>>;
  projectId: string;
  setProjectId: React.Dispatch<React.SetStateAction<string>>;
  lastPreviewUrl: string | null;
  setLastPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  previewType: "avatar" | "reel" | "carousel" | null;
  setPreviewType: React.Dispatch<
    React.SetStateAction<"avatar" | "reel" | "carousel" | null>
  >;
  selectedPlatform: string;
  setSelectedPlatform: React.Dispatch<React.SetStateAction<string>>;
  contentData: ContentData;
  setContentData: React.Dispatch<React.SetStateAction<ContentData>>;
  generationCount: number;
  setGenerationCount: (count: number) => void;
}
