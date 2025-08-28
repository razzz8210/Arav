import { SelectedTemplate } from "@/components/gtm/content-creation/selected-template/SelectedTemplate";
import { useTemplate } from "@/utils/TemplateContext";
import { useTab } from "@/utils/TabContext";
import { TemplateData } from "@/types/template";
import dynamic from "next/dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { AddText } from "@/components/gtm/content-creation/selected-template/AddText";
import { X } from "lucide-react";

const Loader = dynamic(() => import("@/components/lottie/Loader"), {
  ssr: false,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

const SmmLoader = dynamic(() => import("@/components/lottie/SmmLoader"), {
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

interface TrendingTag {
  query: string;
  trend_breakdown: string[] | null;
}

interface TrendingTagsResponse {
  status: boolean;
  trending_tags: TrendingTag[];
}

interface ExtendedTemplateData extends TemplateData {
  query?: string;
  imageCount?: number;
}

interface GalleryFile {
  file_name: string;
  download_url: string;
  text: string;
  textPosition: "top" | "bottom" | "middle";
  duration: number;
  file_type: "image" | "video";
}

const Carousel: React.FC = () => {
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<TrendingTag | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [imageCount, setImageCount] = useState<number>(3);
  const [promptText, setPromptText] = useState<string>('');
  const [selectedPromptNumber, setSelectedPromptNumber] = useState<number>(3);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [editablePrompts, setEditablePrompts] = useState<string[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Image selection and text functionality states
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showTextPopup, setShowTextPopup] = useState<boolean>(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState<boolean>(false);
  const [fileList, setFileList] = useState<GalleryFile[]>([]);
  const [captionStyle, setCaptionStyle] = useState<"business" | "abstract" | "emotional">("business");
  const [availableCaptions, setAvailableCaptions] = useState<string[]>([]);
  const [isGeneratingSlideshow, setIsGeneratingSlideshow] = useState<boolean>(false);
  const [slideshowResponse, setSlideshowResponse] = useState<any>(null);
  const [showResponseBox, setShowResponseBox] = useState<boolean>(false);
  const textPopupRef = useRef<HTMLDivElement>(null);

  const {
    selectedTemplate: selectedCarousel,
    setSelectedTemplate: setSelectedCarousel,
    projectId,
  } = useTemplate();

  const { setActiveTab, setIsChatOpen } = useTab();

  // Function to handle image generation with selected count
  const handleImageGeneration = (tag: TrendingTag | null, count: number = 3) => {
    const queryToUse = tag ? tag.query : (promptText.trim() || "generated prompts");
    const extendedData: ExtendedTemplateData = {
      file_name: queryToUse,
      url: "", // No URL needed for trending tags
      category: "trending",
      query: queryToUse,
      imageCount: count,
    };
    setSelectedCarousel(extendedData);
  };

  // Handle tag selection
  const handleTagSelection = (tag: TrendingTag) => {
    setSelectedTag(tag);
    setPromptText(''); // Clear previous prompt text
    setGeneratedPrompts([]); // Clear previous generated prompts
    setEditablePrompts([]); // Clear previous editable prompts
    setGeneratedImages([]); // Clear previous generated images
  };

  // Handle prompt text change
  const handlePromptTextChange = (value: string) => {
    setPromptText(value);
    // Don't automatically clear the tag - let user manually decide
    // Tags will be disabled while there's text
  };

  // Handle sending prompt to generate image prompts API
  const handleSendPrompt = async () => {
    if (!selectedTag && !promptText.trim()) {
      toast.error("Please select a trending tag or enter prompt text");
      return;
    }

    setIsGeneratingPrompts(true);
    
    try {
      // Prepare request body based on requirements
      const requestBody: any = {
        prompt_count: selectedPromptNumber,
      };

      // If tag is selected, use tag query, otherwise use input text
      if (selectedTag) {
        requestBody.query = selectedTag.query;
        // Only send trending_breakdown if it exists and is not empty
        if (selectedTag.trend_breakdown && selectedTag.trend_breakdown.length > 0) {
          requestBody.trending_breakdown = selectedTag.trend_breakdown;
        }
      } else {
        // If no tag selected, use the input text as query
        requestBody.query = promptText.trim();
      }

      const response = await fetch("/api/generate-image-prompts", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate prompts: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status && data.prompts) {
        setGeneratedPrompts(data.prompts);
        setEditablePrompts([...data.prompts]); // Create editable copy
        toast.success(`Generated ${data.prompts.length} image prompts!`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating prompts:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to generate image prompts"
      );
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  // Handle editing individual prompts
  const handlePromptEdit = (index: number, newValue: string) => {
    const updatedPrompts = [...editablePrompts];
    updatedPrompts[index] = newValue;
    setEditablePrompts(updatedPrompts);
  };

  // Handle back button with confirmation
  const handleBackClick = () => {
    setShowBackConfirmation(true);
  };

  // Confirm going back (clears images)
  const confirmGoBack = () => {
    setGeneratedImages([]);
    setShowBackConfirmation(false);
  };

  // Cancel going back
  const cancelGoBack = () => {
    setShowBackConfirmation(false);
  };

  // Image selection functions
  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImageIndex(index);
    
    // Create file list for all images if not already created
    if (fileList.length !== generatedImages.length) {
      const newFileList: GalleryFile[] = generatedImages.map((imgUrl, i) => ({
        file_name: `generated_image_${i + 1}.jpg`,
        download_url: imgUrl,
        text: availableCaptions[i] || "", // Use available caption if exists
        textPosition: "middle",
        duration: 5,
        file_type: "image",
      }));
      
      setFileList(newFileList);
    }
  };

  const handleCloseSelection = () => {
    setSelectedImageIndex(null);
    setFileList([]);
    setShowTextPopup(false);
    setAvailableCaptions([]);
  };

  const handleIconClick = async (iconType: string) => {
    if (iconType === "Text") {
      setShowTextPopup(!showTextPopup);
      
      // Auto-generate captions when text popup is opened and no captions exist
      if (!showTextPopup && availableCaptions.length === 0) {
        try {
          const captions = await generateCaption();
          if (captions.length > 0) {
            setAvailableCaptions(captions);
            
            // Create file list for all images with their respective captions
            const newFileList: GalleryFile[] = generatedImages.map((imgUrl, i) => ({
              file_name: `generated_image_${i + 1}.jpg`,
              download_url: imgUrl,
              text: captions[i] || captions[0], // Use respective caption or fallback to first
              textPosition: "middle",
              duration: 5,
              file_type: "image",
            }));
            
            setFileList(newFileList);
          }
        } catch (error) {
          console.error("Error auto-generating captions:", error);
        }
      }
    } else if (iconType === "Create") {
      handlePreviewClick();
    }
  };

  // Handle preview click - generate slideshow
  const handlePreviewClick = async () => {
    if (isGeneratingSlideshow) {
      return;
    }

    // Validate that we have images and captions
    if (generatedImages.length === 0) {
      toast.error("No carousel available. Please generate carousel first.");
      return;
    }

    if (fileList.length === 0) {
      toast.error("No captions available. Please generate captions for carousel first.");
      return;
    }

    // Check if all images have captions
    const imagesWithoutCaptions = fileList.filter(file => !file.text.trim());
    if (imagesWithoutCaptions.length > 0) {
      toast.error(`Please add captions to all images before generating carousel. ${imagesWithoutCaptions.length} images missing captions.`);
      return;
    }

    if (!projectId) {
      toast.error("Session ID not found. Please refresh and try again.");
      return;
    }

    setIsGeneratingSlideshow(true);
    
    try {
      // Create media items for ALL images with their captions
      const mediaItems = fileList.map((file, index) => ({
        url: file.download_url,
        caption: file.text,
        position: file.textPosition,
      }));

      const response = await fetch(`/api/generate-slideshow/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          media_items: mediaItems
        }),
      });

      const data = await response.json();
      
      if (data.status) {
        // Store response data and show response box
        setSlideshowResponse(data);
        setShowResponseBox(true);
        console.log("Slideshow created:", data);
        
        // Store slideshow data in localStorage for gallery to use
        localStorage.setItem('latestSlideshow', JSON.stringify({
          file_name: data.file_name,
          slideshow_id: data.slideshow_id,
          session_id: projectId,
          timestamp: Date.now(),
          total_images: mediaItems.length // Store the number of images sent
        }));
        
        setTimeout(() => {
          setShowResponseBox(false);
          setIsChatOpen(false);
          setActiveTab("social-media-gallery");
        }, 3000); // Show response box for 3 seconds before redirecting
    } else {
        toast.error(data.message || "Failed to create slideshow");
      }
    } catch (error) {
      console.error("Error generating slideshow:", error);
      toast.error("Error generating slideshow. Please try again.");
    } finally {
      setIsGeneratingSlideshow(false);
    }
  };

  const generateCaption = useCallback(async (): Promise<string[]> => {
    if (!selectedTag?.query && !promptText.trim()) {
      return [];
    }

    // Prevent multiple simultaneous requests
    if (isGeneratingCaption) {
      console.log("Caption generation already in progress, skipping...");
      return [];
    }

    try {
      setIsGeneratingCaption(true);
      
      // Use the new slideshow captions API endpoint
      const gtmContent = selectedTag?.query || promptText.trim();
      const style = captionStyle; // Use configurable style
      
      const response = await fetch(`/api/generate-captions-slideshow?gtm_content=${encodeURIComponent(gtmContent)}&style=${style}`, {
        method: "POST"
      });

      const data = await response.json();
      if (!data.status || !data.captions) {
        setIsGeneratingCaption(false);
        return [];
      }

      setIsGeneratingCaption(false);
      
      // Store the captions for use in file list
      setAvailableCaptions(data.captions);
      
      // Update file list if it exists
      if (fileList.length > 0) {
        const updatedFileList = fileList.map((file, i) => ({
          ...file,
          text: data.captions[i] || data.captions[0] || file.text
        }));
        setFileList(updatedFileList);
      }
      
      return data.captions;
    } catch (error) {
      console.error("Error generating caption", error);
      setIsGeneratingCaption(false);
      return [];
    }
  }, [selectedTag, promptText, captionStyle]);

  // Carousel navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === generatedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? generatedImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Handle going back from prompts to trending tags
  const handleBackToTrendingTags = () => {
    setEditablePrompts([]);
    setGeneratedPrompts([]);
    setPromptText('');
    setSelectedTag(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (generatedImages.length > 1) {
        if (event.key === 'ArrowLeft') {
          setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? generatedImages.length - 1 : prevIndex - 1
          );
        } else if (event.key === 'ArrowRight') {
          setCurrentImageIndex((prevIndex) => 
            prevIndex === generatedImages.length - 1 ? 0 : prevIndex + 1
          );
        }
      }
    };

    if (generatedImages.length > 0) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [generatedImages.length]);

  // Auto-regenerate captions when style changes (only when style actually changes)
  useEffect(() => {
    if (selectedImageIndex !== null && availableCaptions.length > 0 && !isGeneratingCaption) {
      const regenerateCaptions = async () => {
        try {
          const captions = await generateCaption();
          if (captions.length > 0) {
            // Update file list with new captions
            const updatedFileList = fileList.map((file, i) => ({
              ...file,
              text: captions[i] || captions[0] || file.text
            }));
            setFileList(updatedFileList);
          }
        } catch (error) {
          console.error("Error regenerating captions for new style:", error);
        }
      };
      
      regenerateCaptions();
    }
  }, [captionStyle]); // Only depend on captionStyle to avoid infinite loops

  // Handle generating images from edited prompts
  const handleGenerateImages = async () => {
    if (editablePrompts.length === 0) {
      toast.error("No prompts available to generate carousel images");
      return;
    }

    setIsGeneratingImages(true);
    
    console.log("Sending prompts to generate images:", editablePrompts);
    
    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompts: editablePrompts
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate images: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("=== Generate Images API Debug ===");
      console.log("Response status:", response.status);
      console.log("Response data:", data);
      console.log("data.status:", data.status);
      console.log("data.images:", data.images);
      console.log("Array.isArray(data.images):", Array.isArray(data.images));
      console.log("Current generatedImages state:", generatedImages);
      
      if (data.status && data.images && Array.isArray(data.images)) {
        console.log("✅ Conditions met, setting images in state");
        setGeneratedImages(data.images);
        setCurrentImageIndex(0); // Reset carousel to first image
        toast.success(`Generated ${data.images.length} carousel images successfully!`);
        console.log("✅ Images set in state:", data.images);
        console.log("✅ Current image index reset to 0");
      } else {
        console.error("❌ Invalid response format:", data);
        console.error("❌ Conditions check:");
        console.error("  - data.status:", data.status);
        console.error("  - data.images exists:", !!data.images);
        console.error("  - is Array:", Array.isArray(data.images));
        throw new Error("Invalid response format or no images received");
      }
    } catch (error) {
      console.error("Error generating carousel images:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to generate carousel images"
      );
    } finally {
      setIsGeneratingImages(false);
    }
  };



  useEffect(() => {
    const fetchTrendingTags = async () => {
      setIsLoadingTags(true);
      try {
        const res = await fetch("/api/trending-tags");
        if (!res.ok) throw new Error("Failed to fetch trending tags");
        const data: TrendingTagsResponse = await res.json();
        setTrendingTags(data.trending_tags || []);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Error fetching trending tags"
        );
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTrendingTags();
  }, []);





  return (
    <div
      className={`hidden sm:grid w-full h-full min-h-0 border border-[#272727] rounded-md ${
        selectedCarousel || selectedImageIndex !== null ? "grid-cols-2 gap-2" : "grid-cols-1"
      }`}
    >
      <div className="flex flex-col h-full min-h-0">
        {/* Trending Tags Section - Scrollable (hidden when images are displayed or prompts are generated) */}
        {!(generatedImages.length > 0 || isGeneratingImages || editablePrompts.length > 0) && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="pt-4 pb-2 px-4">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Daily Trending Tags</h2>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-red-500 hover:text-red-700 underline px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Clear tag
                </button>
              )}
            </div>
          </div>

          {isLoadingTags ? (
            <div className="flex justify-center items-center h-full min-h-[400px]">
              <Loader />
            </div>
          ) : trendingTags.length > 0 ? (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, index) => (
                  <div
                    key={`trending-tag-${index}`}
                    onClick={() => {
                      if (promptText.trim()) {
                        toast.info("Please clear the input text first to select a tag");
                        return;
                      }
                      handleTagSelection(tag);
                    }}
                    className={`rounded-[8px] px-3 py-2 transition duration-300 border border-[#FFFFFF14] text-sm ${
                      promptText.trim() 
                        ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" 
                        : selectedTag?.query === tag.query
                        ? "bg-[#9C7DFF14] border-[#9C7DFF] text-[#9C7DFF] cursor-pointer"
                        : "bg-transparent text-gray-800 hover:bg-[#9C7DFF1A] hover:border-[#9C7DFF]/50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                    <img
                        alt="trending-icon"
                        src="/icons/sparkles.png"
                        width={14}
                        height={14}
                      />
                      <span className="font-medium capitalize truncate max-w-[200px]">{tag.query}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show related trends for selected tag */}
              {selectedTag && selectedTag.trend_breakdown && (
                <div className="mt-4 p-3 bg-[#FFFFFF08] rounded-lg border border-[#FFFFFF14]">
                  <p className="text-sm text-gray-600 mb-2">Related trends for "{selectedTag.query}":</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTag.trend_breakdown.slice(0, 8).map((trend, trendIndex) => (
                      <span
                        key={trendIndex}
                        className="px-2 py-1 text-xs bg-[#FFFFFF14] text-gray-700 rounded-md"
                      >
                        {trend}
                      </span>
                    ))}
                    {selectedTag.trend_breakdown.length > 8 && (
                      <span className="px-2 py-1 text-xs bg-[#FFFFFF14] text-gray-700 rounded-md">
                        +{selectedTag.trend_breakdown.length - 8} more
                      </span>
                    )}
                  </div>
              </div>
            )}
          </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600">No trending tags available.</p>
            </div>
          )}
        </div>
        )}

        {/* Generated Images Section - Clean Design (Full Screen when active) */}
        {(generatedImages.length > 0 || isGeneratingImages) ? (
          <div className="flex-1 flex flex-col min-h-0 p-3">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-full h-full flex flex-col">
              <div className="bg-white p-4 border-b border-gray-100 flex-shrink-0">
                {/* Back Button */}
                <div className="mb-4">
                  <button
                    onClick={handleBackClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <span className="text-lg">←</span>
                    Back to Edit Prompts
                  </button>
          </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#9C7DFF] to-[#8B6BFF] rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🖼️</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {isGeneratingImages ? "Generating Your Images..." : "Generated Images"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {isGeneratingImages ? "Creating stunning visuals from your prompts" : `${generatedImages.length} mobile-ready images`}
                      </p>
                    </div>
                  </div>
                  {!isGeneratingImages && generatedImages.length > 0 && (
                    <div className="flex gap-3">
                      <button
                  onClick={() => {
                          generatedImages.forEach((imageUrl, index) => {
                            const link = document.createElement('a');
                            link.href = imageUrl;
                            link.download = `generated-image-${index + 1}.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          });
                          toast.success("All images download started!");
                        }}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-[#9C7DFF] to-[#8B6BFF] text-white rounded-xl hover:shadow-lg transition-all duration-200"
                      >
                        Save All
                      </button>
                            </div>
                          )}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center p-4 min-h-0">
                {isGeneratingImages ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#9C7DFF]/20 rounded-full animate-spin border-t-[#9C7DFF] mx-auto mb-4"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-[#9C7DFF]/30 mx-auto"></div>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Creating Your Images</h3>
                      <p className="text-sm text-gray-600">This usually takes 5-10 seconds...</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative max-w-full overflow-hidden flex-1 flex flex-col justify-center">
                    {/* Main Carousel Display */}
                    <div className="flex justify-center mb-3 px-16">
                      <div className="relative w-full max-w-[250px]">
                        <div
                          onClick={() => handleImageClick(generatedImages[currentImageIndex], currentImageIndex)}
                          className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-75 cursor-pointer max-w-[250px] mx-auto"
                        >
                          <div className="relative aspect-[9/16] bg-gray-50">
                            <img
                              src={generatedImages[currentImageIndex]}
                              alt={`Generated image ${currentImageIndex + 1}`}
                              className="w-full h-full object-contain bg-white"
                              loading="lazy"
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                console.error("Image load error:", e);
                                console.error("Failed URL:", generatedImages[currentImageIndex]);
                              }}
                            />
                            
                            {/* Image Number Overlay */}
                            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                              {currentImageIndex + 1} / {generatedImages.length}
                            </div>
                          </div>
                        </div>
                        
                        {/* Navigation Arrows */}
                        {generatedImages.length > 1 && (
                          <>
                            <button
                              onClick={previousImage}
                              className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all duration-50 cursor-pointer"
                            >
                              <span className="text-gray-700 text-sm pointer-events-none">←</span>
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all duration-50 cursor-pointer"
                            >
                              <span className="text-gray-700 text-sm pointer-events-none">→</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Image Counter and Dots */}
                    {generatedImages.length > 1 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2">
                          {currentImageIndex + 1} of {generatedImages.length}
                        </p>
                        <div className="flex justify-center gap-1.5">
                          {generatedImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToImage(index)}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-50 cursor-pointer ${
                                index === currentImageIndex
                                  ? "bg-gray-800 w-4"
                                  : "bg-gray-300 hover:bg-gray-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                  </div>
                </div>
          </div>
        ) : (
          /* Generated Prompts Display - Editable Cards (Shows when no images) */
          editablePrompts.length > 0 && (
          <div className="border-t border-[#272727] p-4">
            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={handleBackToTrendingTags}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <span className="text-lg">←</span>
                Back to Trending Tags
              </button>
            </div>
            
            <h3 className="text-sm font-medium text-gray-800 mb-3">
              Generated Image Prompts ({editablePrompts.length}) - Edit as needed
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {editablePrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#FFFFFF08] rounded-lg border border-[#FFFFFF14] hover:border-[#9C7DFF]/30 transition-colors"
                >
                  <label className="text-xs text-gray-600 mb-2 block font-medium">
                    Prompt {index + 1}:
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => handlePromptEdit(index, e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF14] border border-[#FFFFFF14] rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#9C7DFF] resize-none min-h-[100px]"
                    placeholder="Edit your image prompt..."
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Characters: {prompt.length}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleGenerateImages}
                disabled={isGeneratingImages || editablePrompts.length === 0}
                className="px-6 py-2.5 bg-[#9C7DFF] text-white rounded-xl hover:bg-[#8B6BFF] transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl max-w-xs"
              >
                {isGeneratingImages ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </span>
                ) : (
                  `Generate ${editablePrompts.length} Image${editablePrompts.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
          )
        )}

        

        {/* Prompt Generation Area - hidden when images are displayed or prompts are generated */}
        {!(generatedImages.length > 0 || isGeneratingImages || editablePrompts.length > 0) && (
        <div className="border-t border-[#272727] flex flex-col h-56 sm:h-60 md:h-64 lg:h-72">
          <div className="flex-1 flex min-h-0 flex-col sm:flex-row">
            {/* Prompt Text Area - Left Side */}
            <div className="flex-1 flex flex-col p-3 sm:p-4 sm:border-r border-[#272727] min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <label className="text-sm font-medium text-gray-800">
                  Generate Image Prompt
                </label>
                {/* Active source info moved here */}
                {(selectedTag || promptText.trim()) && (
                  <div className="text-xs text-gray-600 bg-[#FFFFFF08] px-2 py-1 rounded border border-[#FFFFFF14]">
                    {selectedTag ? `Tag: "${selectedTag.query}"` : "Custom text"}
                  </div>
                )}
              </div>
              <textarea
                value={promptText}
                onChange={(e) => {
                  if (selectedTag) {
                    toast.info("Please clear the selected tag first to enter custom text");
                    return;
                  }
                  handlePromptTextChange(e.target.value);
                }}
                onClick={() => {
                  if (selectedTag) {
                    toast.info("Please clear the selected tag first to enter custom text");
                  }
                }}
                placeholder={selectedTag ? `Tag selected: "${selectedTag?.query}" - Clear tag to enter custom text` : "Enter your image generation prompt here..."}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none min-h-0 ${
                  selectedTag 
                    ? "bg-gray-100 border-gray-200 text-gray-400 placeholder-gray-400 cursor-not-allowed" 
                    : "bg-[#FFFFFF14] border-[#FFFFFF14] text-gray-800 placeholder-gray-600 focus:border-[#9C7DFF]"
                }`}
              />
              <div className="mt-2 flex items-center justify-between flex-shrink-0">
                <div className="text-xs text-gray-600">
                  {selectedTag ? `Tip: Using selected tag "${selectedTag?.query}"` : "Tip: Describe the image you want to generate in detail"}
                </div>
                {promptText.trim() && !selectedTag && (
                  <button
                    onClick={() => setPromptText('')}
                    className="text-xs text-red-500 hover:text-red-700 underline ml-2"
                  >
                    Clear text
                  </button>
                )}
              </div>
            </div>

            {/* Options Panel - Right Side */}
            <div className="w-full sm:w-48 md:w-52 lg:w-56 flex flex-col p-3 sm:p-4 border-t sm:border-t-0 border-[#272727] min-h-0">
              {/* Prompt Number Selection - Compact */}
              <div className="flex-shrink-0 mb-2">
                <h4 className="text-sm font-medium text-gray-800 mb-1">Prompt Count</h4>
                <p className="text-xs text-gray-600 mb-2">Generate multiple prompts (default: 3)</p>
                <div className="grid grid-cols-5 sm:grid-cols-3 gap-1 sm:gap-2 mb-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedPromptNumber(num)}
                      className={`p-1.5 sm:p-2 rounded-lg border transition-colors text-xs sm:text-sm ${
                        selectedPromptNumber === num
                          ? "border-[#9C7DFF] bg-[#9C7DFF14] text-[#9C7DFF]"
                          : "border-[#FFFFFF14] text-gray-800 hover:bg-[#FFFFFF14]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {/* Simplified status info - removed the problematic box */}
                <div className="p-2 bg-[#FFFFFF08] rounded-lg border border-[#FFFFFF14] max-w-full">
                  <p className="text-xs text-gray-600 text-center">
                    {selectedTag || promptText.trim() ? "Ready to generate prompts" : "Select tag or enter text to continue"}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons - Always visible at bottom */}
              <div className="mt-auto pt-2 flex-shrink-0">
                <div className="space-y-2">
                  <button
                    onClick={handleSendPrompt}
                    disabled={isGeneratingPrompts || (!selectedTag && !promptText.trim())}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed relative flex items-center justify-center min-h-[40px]"
                  >
                    {isGeneratingPrompts ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Send Prompt"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Back Confirmation Modal */}
        {showBackConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Save Your Images First!
                </h3>
                <p className="text-gray-600 mb-6">
                  All generated images will be lost when you go back to edit prompts. Please download or save any images you want to keep before continuing.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelGoBack}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmGoBack}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Continue Anyway
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}

      </div>

      {selectedCarousel && (
        <SelectedTemplate
          imageIcons={imageIcons}
          selectedTemplate={selectedCarousel}
          setSelectedTemplate={setSelectedCarousel}
          type="carousel"
          uploadFilePalette={true}
        />
      )}

      {/* Selected Image Panel */}
      {selectedImageIndex !== null && generatedImages[selectedImageIndex] && (
        <div className="bg-[#EBEBEB] mr-2 rounded-md border border-[#272727] h-full w-full flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center pb-6">
            {/* Image Icons */}
            <div className="flex mt-4 gap-4 justify-center items-center">
              {imageIcons.map((imageUrl, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-[40px] cursor-pointer h-[32px] rounded-[12px] bg-white opacity-100 px-[12px] py-[6px] flex items-center justify-center ${
                      imageUrl.text === "Create" && isGeneratingSlideshow
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => handleIconClick(imageUrl.text)}
                  >
                    {imageUrl.text === "Create" && isGeneratingSlideshow ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
                    ) : (
                      <img
                        src={imageUrl.lightImage}
                        width={16}
                        height={16}
                        alt="icon"
                      />
                    )}
                  </div>
                  <p className="text-[10px] font-normal text-center leading-[100%] text-[#3C3C3C] px-2 py-0.5 rounded-[4px] mb-2">
                    {imageUrl.text === "Create" && isGeneratingSlideshow ? "Creating..." : imageUrl.text}
                  </p>
                </div>
              ))}

              <button
                className="absolute top-37 cursor-pointer right-3 z-10 p-1 bg-black/50 rounded-full hover:bg-black/70"
                onClick={handleCloseSelection}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            
           

            {/* Selected Image Preview */}
            <div className="relative w-[260px] lg:w-[280px] xl:w-[295px] h-[400px] lg:h-[450px] xl:h-[480px] rounded-xl overflow-hidden mb-3 flex-shrink-0">
              <div className="rounded-[10px] overflow-hidden bg-black w-full h-full relative">
                <img
                  src={generatedImages[selectedImageIndex]}
                  alt={`Generated image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error("Selected image load error:", e);
                    console.error("Failed URL:", generatedImages[selectedImageIndex]);
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              
              {/* Text Overlay if exists */}
              {fileList[selectedImageIndex]?.text && (
                <div className={`absolute inset-0 flex items-${fileList[selectedImageIndex].textPosition === 'top' ? 'start' : fileList[selectedImageIndex].textPosition === 'bottom' ? 'end' : 'center'} justify-center p-4`}>
                  <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-center max-w-[90%]">
                    {fileList[selectedImageIndex].text}
                  </div>
                </div>
              )}
              
              {/* Image Number Badge */}
              <div className="absolute top-3 right-3 bg-white/90 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedImageIndex + 1} of {generatedImages.length}
              </div>
            </div>

            {/* Image Navigation */}
            {generatedImages.length > 1 && (
              <div className="flex justify-center items-center gap-3 mb-3">
                <button
                  onClick={() => {
                    const newIndex = selectedImageIndex === 0 ? generatedImages.length - 1 : selectedImageIndex - 1;
                    setSelectedImageIndex(newIndex);
                  }}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span className="text-gray-700 text-sm">←</span>
                </button>
                
                <div className="flex gap-2">
                  {generatedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                        index === selectedImageIndex
                          ? "bg-gray-800 w-6"
                          : "bg-gray-300 hover:bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const newIndex = selectedImageIndex === generatedImages.length - 1 ? 0 : selectedImageIndex + 1;
                    setSelectedImageIndex(newIndex);
                  }}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span className="text-gray-700 text-sm">→</span>
                </button>
              </div>
            )}

            {/* Compact Caption Info */}
            <div className="w-full max-w-[295px] px-4 space-y-2">
              {/* Current Caption - Compact */}
              {fileList[selectedImageIndex]?.text && (
                <div className="bg-white rounded-md border border-gray-200 p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-[#9C7DFF] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Caption {selectedImageIndex + 1}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                    {fileList[selectedImageIndex].text.length > 80 
                      ? fileList[selectedImageIndex].text.substring(0, 80) + '...' 
                      : fileList[selectedImageIndex].text}
                  </p>
                </div>
              )}

              {/* Generated Captions Status - Compact */}
              {availableCaptions.length > 0 && (
                <div className="bg-gray-50 rounded-md border border-gray-200 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      {availableCaptions.length} Captions Generated
                    </span>
                    <span className="text-xs text-[#9C7DFF]">
                      Style: {captionStyle}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Text Popup */}
      {showTextPopup && selectedImageIndex !== null && (
        <AddText
          isGeneratingCaption={isGeneratingCaption}
          generateCaption={generateCaption}
          setIsGeneratingCaption={setIsGeneratingCaption}
          setShowTextPopup={setShowTextPopup}
          postionOption={true}
          fileList={fileList}
          setFileList={setFileList}
          selectedFileIndex={selectedImageIndex || 0}
          availableCaptions={availableCaptions}
        />
      )}

      {/* Full-Screen Loading Overlay */}
      {isGeneratingSlideshow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="relative w-[200px] aspect-[2/3] rounded-[16px] overflow-hidden bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "60%", // Simulate progress
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "0 0 14px 14px",
                  transition: "height 0.8s ease",
                  zIndex: 1,
                }}
              />
              <div className="relative z-20 flex w-full justify-center items-center">
                <SmmLoader />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  zIndex: 30,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Creating...
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Creating Your Slideshow
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we process your {generatedImages.length} images and captions...
            </p>
          </div>
        </div>
      )}

      {/* Slideshow Response Box */}
      {showResponseBox && slideshowResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Slideshow Created Successfully!
              </h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="text-green-600 font-medium">
                    {slideshowResponse.status ? 'Success' : 'Failed'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Message:</span>
                    <p className="text-gray-600 mt-1">{slideshowResponse.message}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Slideshow ID:</span>
                    <p className="text-gray-600 mt-1 font-mono text-xs break-all">
                      {slideshowResponse.slideshow_id}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">File Name:</span>
                    <p className="text-gray-600 mt-1 font-mono text-xs break-all">
                      {slideshowResponse.file_name}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Images Processed:</span>
                    <p className="text-gray-600 mt-1">
                      {fileList.length} images with captions
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Redirecting to gallery in a moment...
              </p>
              <button
                onClick={() => {
                  setShowResponseBox(false);
                  setIsChatOpen(false);
                  setActiveTab("social-media-gallery");
                }}
                className="px-4 py-2 bg-[#9C7DFF] text-white rounded-lg hover:bg-[#8B6BFF] transition-colors"
              >
                Go to Gallery Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
