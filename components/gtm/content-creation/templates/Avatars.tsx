import { SelectedTemplate } from "@/components/gtm/content-creation/selected-template/SelectedTemplate";
import MainContent from "@/components/gtm/content-creation/templates/MainContent";
import { useTemplate } from "@/utils/TemplateContext";
import { TemplateData } from "@/types/template";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const Loader = dynamic(() => import("@/components/lottie/Loader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

const imageIcons = [
  {
    lightImage: "/icons/text.png",
    text: "Script",
    accept: "",
  },
  {
    lightImage: "/icons/preview.png",
    text: "Create",
    accept: "",
  },
];

export const Avatars = () => {
  const { selectedTemplate, setSelectedTemplate } = useTemplate();

  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTextPopup, setShowTextPopup] = useState(false);
  const textPopupRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAvatars = useCallback(async (
    pageNum: number = page,
    limitNum: number = limit
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/templates/view/avatars?page=${pageNum}&limit=${limitNum}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch video templates");
      const data = await res.json();
      const templates = data.templates || [];
      setTemplates(
        templates.map((template: any) => ({
          url: template.url,
          file_name: template.file_name,
          tags: template.tags,
        }))
      );

      // Update pagination info
      if (data.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err: any) {
      console.error("Error fetching video templates", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textPopupRef.current &&
        !textPopupRef.current.contains(event.target as Node)
      ) {
        setShowTextPopup(false);
      }
    };

    if (showTextPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTextPopup]);

  return (
    <div
      className={`hidden sm:grid w-full h-full min-h-0 border border-[#272727] rounded-md ${selectedTemplate ? "grid-cols-2" : "grid-cols-1"
        }`}
    >
      <div className="overflow-y-auto h-full min-h-0">
        {Array.isArray(templates) && templates.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-[400px]">
            <Loader />
          </div>
        ) : (
          <MainContent
            templates={templates}
            setSelectedTemplate={setSelectedTemplate}
            isLoading={loading}
          />
        )}
      </div>

      {selectedTemplate && (
        <SelectedTemplate
          imageIcons={imageIcons}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          type="avatars"
          uploadFilePalette={false}
        />
      )}
    </div>
  );
};
