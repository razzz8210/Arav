import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { GalleryFile } from "@/components/gtm/content-creation/selected-template/UserGallery";

interface AddTextProps {
  isGeneratingCaption: boolean;
  generateCaption: () => Promise<string[]>;
  setIsGeneratingCaption: (isGenerating: boolean) => void;
  setShowTextPopup: (show: boolean) => void;
  postionOption: boolean;
  fileList: GalleryFile[];
  setFileList: Dispatch<SetStateAction<GalleryFile[]>>;
  selectedFileIndex: number;
  availableCaptions?: string[];
}

export const AddText = ({
  isGeneratingCaption,
  generateCaption,
  setShowTextPopup,
  postionOption,
  fileList,
  setFileList,
  selectedFileIndex,
  availableCaptions = [],
}: AddTextProps) => {
  const textPopupRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textInput, setTextInput] = useState<string>(
    fileList[selectedFileIndex].text
  );
  const [textPosition, setTextPosition] = useState<"top" | "bottom" | "middle">(
    fileList[selectedFileIndex].textPosition
  );

  const adjustTextareaHeight = () => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    const maxHeightPx = 200;
    const nextHeight = Math.min(element.scrollHeight, maxHeightPx);
    element.style.height = `${nextHeight}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [textInput]);

  return (
    <div className="fixed inset-0 z-40" onClick={() => setShowTextPopup(false)}>
      <div
        ref={textPopupRef}
        className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg p-4 shadow-lg min-w-[320px] z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          {/* Available Captions Section */}
          {availableCaptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Available Captions (Click to use):
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableCaptions.map((caption, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setTextInput(caption);
                      adjustTextareaHeight();
                    }}
                    className="p-2 text-xs bg-gray-50 hover:bg-[#9C7DFF]/10 border border-gray-200 rounded cursor-pointer transition-colors"
                  >
                    <span className="text-gray-600 font-medium">Caption {index + 1}:</span>
                    <p className="text-gray-800 mt-1 leading-tight">{caption}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              adjustTextareaHeight();
            }}
            placeholder={availableCaptions.length > 0 ? "Click a caption above or enter your own text..." : "Enter your text here..."}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9C7DFF] focus:border-transparent resize-none max-h-40 overflow-y-auto"
            autoFocus
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (textInput.trim()) {
                  setShowTextPopup(false);
                }
              } else if (e.key === "Escape") {
                setShowTextPopup(false);
              }
            }}
          />
          {postionOption && (
            <select
              value={textPosition}
              onChange={(e) => {
                setTextPosition(e.target.value as "top" | "bottom" | "middle");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9C7DFF] focus:border-transparent"
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          )}
        </div>
        <div className="flex justify-end mt-3 gap-2">
          <button
            onClick={() => {
              setShowTextPopup(false);
            }}
            className="px-3 cursor-pointer py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              generateCaption().then((result) => {
                if (result.length > 0) {
                  setTextInput(result[0]);
                }
              });
            }}
            className="px-3 cursor-pointer py-1 text-sm bg-[#9C7DFF90] text-white rounded hover:bg-[#9C7DFF] disabled:opacity-50"
            disabled={isGeneratingCaption}
          >
            {isGeneratingCaption ? "Generating..." : "Regenerate"}
          </button>
          <button
            onClick={() => {
              if (!textInput.trim()) {
                toast.error("Please provide a caption");
                return;
              }
              const newFileList = [...fileList];
              newFileList[selectedFileIndex].text = textInput;
              newFileList[selectedFileIndex].textPosition = textPosition;
              setFileList(newFileList);
              setShowTextPopup(false);
            }}
            className="px-3 cursor-pointer py-1 text-sm bg-[#9C7DFF90] text-white rounded hover:bg-[#9C7DFF] disabled:opacity-50"
            disabled={isGeneratingCaption}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
