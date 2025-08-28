import { AddText } from "@/components/gtm/content-creation/selected-template/AddText";
import { UploadFileList } from "@/components/gtm/content-creation/selected-template/UploadFileList";
import {
  GalleryFile,
  UserGallery,
} from "@/components/gtm/content-creation/selected-template/UserGallery";
import { TemplateData } from "@/types/template";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SelectedTemplateProps {
  imageIcons: {
    text: string;
    accept: string;
    lightImage: string;
  }[];
  selectedTemplate: TemplateData | null;
  setSelectedTemplate: (template: TemplateData | null) => void;
  type: "reels" | "avatars" | "carousel";
  uploadFilePalette: boolean;
}

export const SelectedTemplate = ({
  imageIcons,
  selectedTemplate,
  setSelectedTemplate,
  type,
  uploadFilePalette,
}: SelectedTemplateProps) => {
  const { setActiveTab, setIsChatOpen } = useTab();
  const { initialPrompt, captionData, projectId } = useTemplate();

  const [showTextPopup, setShowTextPopup] = useState<boolean>(false);
  const [selectedMusic, setSelectedMusic] = useState<string>("");
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isGeneratingCaption, setIsGeneratingCaption] =
    useState<boolean>(false);
  const [isGeneratingPreview, setIsGeneratingPreview] =
    useState<boolean>(false);

  const [fileList, setFileList] = useState<GalleryFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const textPopupRef = useRef<HTMLDivElement>(null);

  const handleIconClick = async (iconType: string) => {
    if (iconType === "Text" || iconType === "Script") {
      setShowTextPopup(!showTextPopup);
    } else if (iconType === "Create") {
      handlePreviewClick();
    }
  };

  const handleMusicChange = (music: string) => {
    setSelectedMusic(music);
  };

  const handlePreviewClick = async () => {
    if (isGeneratingPreview) {
      return;
    }

    // caption of any fileList is empty
    if (fileList.some((file) => file.text === "")) {
      toast.error("Please provide a caption before generating a preview");
      return;
    }

    if (type === "reels" && !selectedMusic) {
      toast.error("Please select a music before generating a preview");
      return;
    }

    setIsGeneratingPreview(true);
    if (type === "avatars") {
      const payload = {
        url: captionData?.urls[0] || "",
        template: selectedTemplate?.file_name || "",
        text: fileList[selectedFileIndex]?.text || "",
        session_id: projectId,
      };

      try {
        const response = await fetch("/api/templates/generate/avatars", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        await response.json();
        setIsChatOpen(false);
        setActiveTab("social-media-gallery");
      } catch {
        toast.error("Error generating preview");
      } finally {
        setIsGeneratingPreview(false);
      }
    } else {
      const mediaItems = fileList.map((file) => ({
        url: file.download_url,
        caption: file.text,
        position: file.textPosition,
        ...(type === "reels" && { duration: file.duration }),
        ...(type === "reels" && { file_name: file.file_name }),
      }));

      const payload = {
        session_id: projectId,
        media_items: mediaItems,
        [type === "reels" ? "hook_demo_name" : "slideshow_name"]:
          selectedTemplate?.file_name,
        background_music_url: selectedMusic,
      };

      try {
        const url = `/api/templates/generate/${type}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        await response.json();
        setIsChatOpen(false);
        setActiveTab("social-media-gallery");
      } catch {
        toast.error("Error generating preview");
      } finally {
        setIsGeneratingPreview(false);
      }
    }
  };

  const generateCaption = useCallback(async (): Promise<string[]> => {
    if (!initialPrompt) {
      return [];
    }

    try {
      setIsGeneratingCaption(true);
      const response = await fetch(`/api/generate_captions/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_prompt: initialPrompt,
          ...(type === "carousel" ? { style: selectedTemplate?.category } : {}),
        }),
      });

      const data = await response.json();
      if (!data.status) {
        return [];
      }

      setIsGeneratingCaption(false);
      if (type === "reels") {
        return [data.caption];
      } else if (type === "carousel") {
        return data.captions;
      } else if (type === "avatars") {
        return [data.script];
      }
      return [];
    } catch (error) {
      console.error("Error generating caption", error);
      setIsGeneratingCaption(false);
      return [];
    }
  }, [
    initialPrompt,
    type,
    selectedTemplate?.category,
  ]);

  useEffect(() => {
    if (selectedTemplate) {
      if (type === "carousel") {
        setFileList(
          (selectedTemplate as any)?.images?.map((image: any) => ({
            file_name: image.file_name,
            download_url: image.url,
            text: "",
            textPosition: "middle",
            duration: 5,
            file_type: "image",
          }))
        );
        return;
      }
      setFileList([
        {
          file_name: selectedTemplate.file_name,
          download_url: selectedTemplate.url,
          text: "",
          textPosition: "middle",
          duration: 5,
          file_type: selectedTemplate.file_name.includes(".mp4")
            ? "video"
            : "image",
        },
      ]);
    }
  }, [selectedTemplate, type]);

  useEffect(() => {
    if (fileList.length > 0 && fileList[0]?.text === "") {
      generateCaption().then((result) => {
        result.forEach((caption, index) => {
          setFileList((prev) => {
            const newFileList = [...prev];
            newFileList[index].text = caption;
            return newFileList;
          });
        });
      });
    }
  }, [fileList, generateCaption]);

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
    <div className="bg-[#EBEBEB] mr-2 rounded-md border border-[#272727] h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center pb-6">
        {/* Image Icons */}
        <div className="flex mt-4 gap-4 justify-center items-center">
          {imageIcons.map((imageUrl, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`w-[40px] cursor-pointer h-[32px] rounded-[12px] bg-white opacity-100 px-[12px] py-[6px] flex items-center justify-center ${imageUrl.text === "Preview" && isGeneratingPreview
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                onClick={() => handleIconClick(imageUrl.text)}
              >
                {imageUrl.text === "Preview" && isGeneratingPreview ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
                ) : (
                  <Image
                    src={imageUrl.lightImage}
                    width={16}
                    height={16}
                    alt="icon"
                  />
                )}
              </div>
              <p className="text-[10px] font-normal text-center leading-[100%] text-[#3C3C3C] px-2 py-0.5 rounded-[4px] mb-2">
                {imageUrl.text}
              </p>
            </div>
          ))}

          <button
            className="absolute top-37 cursor-pointer right-3 z-10 p-1 bg-black/50 rounded-full hover:bg-black/70"
            onClick={() => setSelectedTemplate(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Reels / Avatars View */}
        <div className="relative w-[260px] lg:w-[280px] xl:w-[295px] max-h-[56vh] rounded-xl overflow-hidden mb-4">
          {/* Prefer selected uploaded file preview if chosen */}
          {fileList[selectedFileIndex] &&
            fileList[selectedFileIndex].file_type === "image" && (
              <div className="rounded-[10px] overflow-hidden bg-black w-full h-full">
                <Image
                  src={fileList[selectedFileIndex].download_url}
                  alt={fileList[selectedFileIndex].file_name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          {fileList[selectedFileIndex] &&
            fileList[selectedFileIndex].file_type === "video" && (
              <div className="rounded-[10px] overflow-hidden bg-black w-full h-full">
                <video
                  src={fileList[selectedFileIndex].download_url}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  loop
                  preload="metadata"
                  autoPlay
                  controls
                />
              </div>
            )}
          {!fileList[selectedFileIndex] &&
            selectedTemplate?.file_name.includes(".png") && (
              <div className="rounded-[10px] overflow-hidden bg-black w-full h-full">
                <Image
                  src={(fileList[selectedFileIndex] as any)?.url}
                  alt={`Template ${selectedTemplate?.file_name}`}
                  width={295}
                  height={517}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          {!fileList[selectedFileIndex] &&
            selectedTemplate?.file_name.includes(".mp4") && (
              <div className="rounded-[10px] overflow-hidden bg-black w-full h-full">
                <video
                  src={(fileList[selectedFileIndex] as any)?.url}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  loop
                  preload="metadata"
                  autoPlay
                  controls
                />
              </div>
            )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        </div>

        {/* Upload File List */}
        {uploadFilePalette && (
          <div className="w-full px-4">
            <UploadFileList
              fileList={fileList}
              selectedFileIndex={selectedFileIndex}
              onFileSelect={(index: number) => {
                setSelectedFileIndex(index);
              }}
              onMusicChange={handleMusicChange}
              selectedMusic={selectedMusic}
              setIsGalleryOpen={setIsGalleryOpen}
              shouldShowMusic={type === "reels" || type === "avatars"}
            />
          </div>
        )}
      </div>

      {/* Text Popup */}
      {showTextPopup && (
        <AddText
          isGeneratingCaption={isGeneratingCaption}
          generateCaption={generateCaption}
          setIsGeneratingCaption={setIsGeneratingCaption}
          setShowTextPopup={setShowTextPopup}
          postionOption={type === "reels" || type === "carousel"}
          fileList={fileList}
          setFileList={setFileList}
          selectedFileIndex={selectedFileIndex}
        />
      )}

      {/* User Gallery */}
      {isGalleryOpen && (
        <UserGallery
          onClose={() => setIsGalleryOpen(false)}
          setFileList={setFileList}
        />
      )}
    </div>
  );
};
