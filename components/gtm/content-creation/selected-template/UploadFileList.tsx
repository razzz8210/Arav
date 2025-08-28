import { MusicDropdown } from "@/components/ui/music-dropdown";
import { useMusicContext } from "@/utils/MusicContext";
import Image from "next/image";

interface UploadFileListProps {
  fileList: any[];
  selectedFileIndex: number;
  onFileSelect: (index: number) => void;
  onMusicChange: (music: string) => void;
  selectedMusic: string;
  setIsGalleryOpen: (isOpen: boolean) => void;
  shouldShowMusic: boolean;
}

export const UploadFileList = ({
  fileList,
  selectedFileIndex,
  onFileSelect,
  onMusicChange,
  selectedMusic,
  setIsGalleryOpen,
  shouldShowMusic,
}: UploadFileListProps) => {
  const { musicOptions, isMusicLoading } = useMusicContext();

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Music Dropdown */}
        {shouldShowMusic && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <MusicDropdown
              value={selectedMusic}
              onChange={onMusicChange}
              options={musicOptions}
              placeholder="Select Music"
              placement="up"
              isLoading={isMusicLoading}
            />
          </div>
        )}

        {/* Uploaded Files */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto min-w-0">
          {fileList.map((file, idx) => (
            <div
              key={idx}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all hover:scale-105 ${
                selectedFileIndex === idx
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => onFileSelect(idx)}
            >
              {file.file_type === "image" ? (
                <Image
                  src={file.download_url}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              ) : file.file_type === "video" ? (
                <video
                  src={file.download_url}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  loop
                  preload="metadata"
                />
              ) : file.file_type === "audio" ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="text-lg mb-1">🎵</div>
                    <div className="text-xs text-gray-600 truncate px-1">
                      {file.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  Unsupported
                </div>
              )}

              {/* Selection indicator */}
              {selectedFileIndex === idx && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
              )}
            </div>
          ))}
          <div>
            {/* Add Button */}
            <label
              className="flex w-16 h-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-400 hover:bg-gray-100 transition flex-shrink-0 hover:scale-105"
              onClick={() => setIsGalleryOpen(true)}
            >
              <span className="text-2xl text-gray-400">+</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
