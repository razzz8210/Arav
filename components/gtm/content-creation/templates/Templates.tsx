import MainContent from "@/components/gtm/content-creation/templates/MainContent";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import { TemplateData } from "@/types/template";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Loader = dynamic(() => import("@/components/lottie/Loader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

const Templates = () => {
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const { setActiveTab } = useTab();
  const { setSelectedTemplate } = useTemplate();
  const [templates, setTemplates] = useState<TemplateData[]>([]);

  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setIsLoadingTemplates(true);
        setTemplates([]); // Reset template data for new selection

        const res = await fetch("/api/templates/view/all?page=1&limit=1000");

        if (!res.ok) throw new Error("Failed to fetch template data");

        const data = await res.json();

        if (data.success && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        } else {
          console.error("Invalid template data format:", data);
        }

        setIsLoadingTemplates(false);
      } catch (err) {
        console.error("Error fetching template data", err);
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplateData();
  }, []);

  const handleSelectTemplate = (template: TemplateData) => {
    setSelectedTemplate(template);

    if (template.type === "avatar") {
      setActiveTab("avatars");
    } else if (template.type === "hook") {
      setActiveTab("reels");
    } else if (template.type === "slideshow") {
      setActiveTab("carousel");
    }
  };

  return (
    <div className="hidden sm:grid w-full h-full min-h-0 grid-cols-1">
      <div className="overflow-y-auto h-full min-h-0 border border-[#272727] rounded-md">
        {Array.isArray(templates) && templates.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-[400px]">
            <Loader />
          </div>
        ) : (
          <MainContent
            templates={templates}
            setSelectedTemplate={setSelectedTemplate}
            isLoading={isLoadingTemplates}
            onSelectTemplate={handleSelectTemplate}
          />
        )}
      </div>
    </div>
  );
};

export default Templates;
