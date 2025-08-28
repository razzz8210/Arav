import { TemplateData } from "@/types/template";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface MainContentProps {
  templates: TemplateData[];
  setSelectedTemplate: (data: TemplateData | null) => void;
  isLoading?: boolean;
  onSelectTemplate?: (template: TemplateData) => void;
}

const TAG_CLASS_BY_NAME: Record<string, string> = {
  // Existing
  friendly: "bg-[#F0E6FF] text-[#6B21A8] border border-transparent",
  tech: "bg-[#E6F0FF] text-[#1D4ED8] border border-transparent",
  corporate: "bg-[#E6FFFA] text-[#0F766E] border border-transparent",
  emotive: "bg-[#FFE6F0] text-[#BE185D] border border-transparent",
  product: "bg-[#EDE9FE] text-[#6D28D9] border border-transparent",
  joyful: "bg-[#ECFCCB] text-[#4D7C0F] border border-transparent",

  // New common tags
  professional: "bg-[#F3F4F6] text-[#374151] border border-transparent",
  energetic: "bg-[#FFF7ED] text-[#C2410C] border border-transparent",
  clear: "bg-[#E0F2FE] text-[#0369A1] border border-transparent",
  engaging: "bg-[#ECFEFF] text-[#0E7490] border border-transparent",
  confident: "bg-[#E0E7FF] text-[#3730A3] border border-transparent",
};

const getTagClass = (tag: string): string => {
  const key = tag.toLowerCase();
  return (
    TAG_CLASS_BY_NAME[key] || "bg-gray-100 text-gray-700 border border-gray-200"
  );
};

const MainContent = ({
  templates,
  setSelectedTemplate,
  isLoading = false,
  onSelectTemplate,
}: MainContentProps) => {
  // Dynamic page sizing: 5 rows * number of columns that fit.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [videoLoadingStates, setVideoLoadingStates] = useState<
    Record<string, boolean>
  >({});

  const computeAndSetPage = useCallback(() => {
    const ROWS = 5;
    const CARD_MIN_WIDTH = 176; // minimum column width
    const GAP_PX = 24; // tailwind gap-6
    const container = containerRef.current;
    if (!container) return;
    const styles = getComputedStyle(container);
    const paddingX =
      parseFloat(styles.paddingLeft || "0") +
      parseFloat(styles.paddingRight || "0");
    const availableWidth = Math.max(0, container.clientWidth - paddingX);
    // Mirror CSS repeat(auto-fit, minmax(176px, 1fr)) to estimate columns
    const columns = Math.max(
      1,
      Math.floor((availableWidth + GAP_PX) / (CARD_MIN_WIDTH + GAP_PX))
    );
    return Math.max(ROWS * columns, ROWS);
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(() => computeAndSetPage());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, [computeAndSetPage]);

  useEffect(() => {
    const newPageSize = computeAndSetPage();
    if (newPageSize) {
      setPageSize(newPageSize);
      setVisibleCount(newPageSize);
    }
  }, [computeAndSetPage]);

  useEffect(() => {
    // If templates shrink (e.g., refetch), clamp visibleCount but keep at least one page
    if (visibleCount > templates.length) {
      setVisibleCount(Math.max(pageSize, templates.length));
    }
  }, [templates.length, visibleCount, pageSize]);

  const visibleTemplates = useMemo(
    () => templates.slice(0, visibleCount),
    [templates, visibleCount]
  );

  const canLoadMore = useMemo(
    () => visibleCount < templates.length || isLoading,
    [visibleCount, templates.length, isLoading]
  );

  const handleVideoLoad = (file_name: string) => {
    setVideoLoadingStates((prev) => ({
      ...prev,
      [file_name]: false,
    }));
  };

  const handleVideoError = (file_name: string) => {
    setVideoLoadingStates((prev) => ({
      ...prev,
      [file_name]: false,
    }));
  };

  return (
    <div
      ref={containerRef}
      className="grid gap-6 p-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(176px, 1fr))`,
      }}
    >
      {visibleTemplates.map(({ file_name, url, tags, type }, index) => (
        <div
          key={`${file_name}-${index}`}
          onClick={() => {
            if (onSelectTemplate) {
              onSelectTemplate({ file_name, url, tags, type });
            } else {
              setSelectedTemplate({ file_name, url, tags });
            }
          }}
          className="rounded-[13px] p-[6px] cursor-pointer transition duration-300 
              hover:bg-gradient-to-tr 
              hover:from-[#8841BB] hover:via-[#D86EEF] hover:to-[#2563EB]"
        >
          {file_name.includes(".png") && (
            <div
              className="relative w-full rounded-[12px] overflow-hidden bg-gray-200"
              style={{ aspectRatio: "9 / 16" }}
            >
              <Image
                src={url}
                alt={`Template ${index + 1}`}
                fill
                sizes="(min-width: 0px) 100%"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          {file_name.includes(".mp4") && (
            <div
              className="relative w-full rounded-[12px] overflow-hidden bg-gray-200"
              style={{ aspectRatio: "9 / 16" }}
            >
              {videoLoadingStates[file_name] !== false && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 5v10l8-5-8-5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              <video
                src={url}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                muted
                loop
                preload="metadata"
                onLoadedData={() => handleVideoLoad(file_name)}
                onError={() => handleVideoError(file_name)}
                onLoadStart={() =>
                  setVideoLoadingStates((prev) => ({
                    ...prev,
                    [file_name]: true,
                  }))
                }
              />
            </div>
          )}
          {/* Tags */}
          {Array.isArray(tags) && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 4).map((tag, i) => (
                <span
                  key={`${file_name}-tag-${i}`}
                  className={`text-[10px] leading-[100%] px-2 py-1 rounded-full ${getTagClass(
                    tag
                  )}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {canLoadMore && (
        <div className="col-span-full flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
            className="px-4 cursor-pointer py-2 text-sm rounded-md border border-[#FFFFFF14] bg-transparent text-[#272727] hover:bg-[#e0e0e0]"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default MainContent;
