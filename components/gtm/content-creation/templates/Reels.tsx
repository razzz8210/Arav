import { SelectedTemplate } from "@/components/gtm/content-creation/selected-template/SelectedTemplate";
import MainContent from "@/components/gtm/content-creation/templates/MainContent";
import { useTemplate } from "@/utils/TemplateContext";
import { TemplateData } from "@/types/template";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

const Loader = dynamic(() => import("@/components/lottie/Loader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

const imageIcons = [
  {
    lightImage: "/icons/text.png",
    text: "Text",
    accept: "",
  },
  {
    lightImage: "/icons/preview.png",
    text: "Create",
    accept: "",
  },
];

const Reels = () => {
  const [templateSections, setTemplateSections] = useState<string[]>([]);
  const [selectedTemplateSection, setSelectedTemplateSection] =
    useState<string>("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const { selectedTemplate, setSelectedTemplate } = useTemplate();
  const [templates, setTemplates] = useState<TemplateData[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoadingTemplates(true);
        const res = await fetch("/api/templates/folder/reels");
        if (!res.ok) throw new Error("Failed to fetch folder templates");
        const data = await res.json();
        setTemplateSections(data.folders || []);
        setSelectedTemplateSection(data?.folders[0] || null);
      } catch (err) {
        console.error("Error fetching folder templates", err);
      }
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    if (!selectedTemplateSection) return;
    const controller = new AbortController();
    const { signal } = controller;

    const fetchTemplateData = async () => {
      setIsLoadingTemplates(true);
      try {
        setTemplates([]); // Reset template data for new selection

        const res = await fetch(
          `/api/templates/view/reels?page=1&limit=1000&category=${encodeURIComponent(
            selectedTemplateSection
          )}`,
          { signal }
        );

        if (!res.ok) throw new Error("Failed to fetch template data");

        const data = await res.json();

        if (Array.isArray(data)) {
          setTemplates(data);
        } else if (data.category && data.file_name && data.url) {
          setTemplates([data]);
        }
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error("Error fetching template data", err);
        }
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplateData();
    return () => controller.abort();
  }, [selectedTemplateSection]);

  return (
    <div
      className={`hidden sm:grid w-full h-full min-h-0 border border-[#272727] rounded-md ${selectedTemplate ? "grid-cols-2 gap-2" : "grid-cols-1"
        }`}
    >
      <div className="overflow-y-auto h-full min-h-0">
        <div className="overflow-x-auto pt-2 pb-2 hidden sm:flex rounded-full">
          <div className="w-max">
            {templateSections.length > 0 && (
              <div className="flex-nowrap flex items-center ml-[8px]">
                {templateSections.map((templateSection, index) => (
                  <button
                    onClick={() => setSelectedTemplateSection(templateSection)}
                    key={templateSection}
                    className={`tab-manager__tab-button flex-shrink-0 flex items-center gap-[10px] h-[44px] px-[12px] py-[6px] mr-2 rounded-[12px] border border-[#FFFFFF14] cursor-pointer
              ${selectedTemplateSection === templateSection
                        ? "bg-[#9C7DFF14] text-[#9C7DFF]"
                        : "bg-transparent text-[#272727] hover:bg-[#e0e0e0]"
                      }`}
                  >
                    <Image
                      alt="template-icon"
                      src="/icons/play.png"
                      width={16}
                      height={16}
                    />
                    {templateSection}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {Array.isArray(templates) && templates.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-[400px]">
            <Loader />
          </div>
        ) : (
          <MainContent
            templates={templates}
            setSelectedTemplate={setSelectedTemplate}
            isLoading={isLoadingTemplates}
          />
        )}
      </div>

      {selectedTemplate && (
        <SelectedTemplate
          imageIcons={imageIcons}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          type="reels"
          uploadFilePalette={true}
        />
      )}
    </div>
  );
};

export default Reels;
