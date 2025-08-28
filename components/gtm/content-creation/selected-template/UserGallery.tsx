import Image from "next/image";
import React, { Dispatch, useEffect, useMemo, useState } from "react";
import { CheckCircleIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface UserGalleryProps {
  onClose: () => void;
  setFileList: Dispatch<React.SetStateAction<GalleryFile[]>>;
}

export interface GalleryFile {
  file_name: string;
  download_url: string;
  text: string;
  textPosition: "top" | "bottom" | "middle";
  duration: number;
  file_type: "video" | "image";
}

export const UserGallery = ({ onClose, setFileList }: UserGalleryProps) => {
  const [type, setType] = useState<"video" | "image">("video");
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const isSelectDisabled = useMemo(() => !selectedFile || !!deletingFileId, [selectedFile, deletingFileId]);

  const Spinner = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`rounded-full animate-spin bg-gradient-to-r from-purple-500 to-blue-500 p-[2px] ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full rounded-full bg-white" />
    </div>
  );

  const fetchFiles = async (selectedType: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/uploaded-files?file_type=${selectedType}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch uploaded files");
      const data = await res.json();
      setFiles(Array.isArray(data?.files) ? data.files : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToAPI = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      if (type === "video") return file.type.startsWith("video/");
      if (type === "image") return file.type.startsWith("image/");
      return false;
    });

    if (validFiles.length === 0) {
      toast.error(`Please upload only ${type === "video" ? "video" : "image"} files.`);
      e.currentTarget.value = ""; // reset input
      return;
    }

    setIsUploading(true);
    try {
      for (const file of validFiles) {
        await uploadFileToAPI(file);
      }
      await fetchFiles(type);
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
      e.currentTarget.value = "";
    }
  };


  const handleDeleteFile = async (
    fileId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    if (!fileId) return;
    try {
      setDeletingFileId(fileId);
      const res = await fetch(`/api/user-data/${fileId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to delete file");
      }

      toast.success("File deleted");
      fetchFiles(type);
    } catch (err) {
      console.error("Delete file error", err);
      toast.error("Failed to delete file");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleSelectFile = (file: any) => {
    setFileList(
      (prev: any[]) =>
        [
          ...prev,
          {
            file_name: file.file_name,
            download_url: file.download_url,
            text: "",
            textPosition: "middle",
            duration: 5,
            file_type: file.file_type,
          },
        ] as any[]
    );
    onClose();
  };

  useEffect(() => {
    fetchFiles(type);
  }, [type]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 w-[900px] z-10 shadow-lg">
        {(loading || isUploading) && (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-white/70 z-20 rounded-2xl transition-opacity duration-200 ${loading || isUploading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
          >
            <div className="flex items-center gap-3 text-gray-700 text-sm font-medium">
              <Spinner size={18} />
              <span>{isUploading ? "Uploading…" : "Fetching files…"}</span>
            </div>
          </div>

        )}

        {/* Top controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "video" | "image")}
              className="border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9C7DFF]"
            >
              <option value="video">Videos</option>
              <option value="image">Images</option>
            </select>

            <div>
              <button
                type="button"
                onClick={() =>
                  document.getElementById("gallery-file-input")?.click()
                }
                disabled={isUploading}
                className="px-4 py-2 rounded-lg cursor-pointer bg-[#9C7DFF90] text-white font-medium shadow-sm hover:bg-[#9C7DFF] focus:outline-none focus:ring-2 focus:ring-[#9C7DFF] focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-2">
                  {isUploading && <Spinner size={14} />}
                  {isUploading ? "Uploading…" : "Add to Gallery"}
                </span>
              </button>

              <input
                id="gallery-file-input"
                type="file"
                accept={type === "video" ? "video/*" : "image/*"}
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="border border-gray-200 cursor-pointer px-4 py-2 rounded-lg bg-white text-gray-800 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSelectFile(selectedFile)}
              disabled={isSelectDisabled}
              className={`border border-transparent cursor-pointer px-4 py-2 rounded-lg text-white bg-[#9C7DFF90] hover:bg-[#9C7DFF] disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              Select File
            </button>
          </div>
        </div>

        {/* Local file preview */}
        {selectedFile instanceof File && (
          <div className="mb-6 flex items-center gap-4 p-3 border border-gray-200 rounded-xl bg-gray-50">
            {selectedFile.type?.startsWith("video/") ? (
              <video
                src={URL.createObjectURL(selectedFile)}
                className="w-20 h-20 object-cover rounded"
                muted
                loop
                preload="metadata"
                controls
              />
            ) : (
              <div className="w-20 h-20 relative rounded overflow-hidden">
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {selectedFile.name}
              </div>
              <div className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs cursor-pointer px-2 py-1 border border-gray-200 rounded bg-white hover:bg-gray-100"
            >
              Remove
            </button>
          </div>
        )}

        {/* Gallery */}
        {loading && (
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full h-40" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">
              <span>Failed to load files</span>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-600">
                <div className="mb-3">
                  <Spinner size={24} className="!p-[3px]" />
                </div>
                <p className="text-sm">No files found in your gallery.</p>
                <button
                  type="button"
                  onClick={() => document.getElementById("gallery-file-input")?.click()}
                  className="mt-4 px-4 py-2 rounded-lg cursor-pointer bg-[#9C7DFF90] text-white font-medium shadow-sm hover:bg-[#9C7DFF] focus:outline-none focus:ring-2 focus:ring-[#9C7DFF]"
                >
                  Upload files
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {files.map((file: any) => {
                  const isSelected = selectedFile === file;
                  const label = file?.label || file?.file_name || "Untitled";
                  return (
                    <div key={file._id || file.download_url} className="relative">
                      {file?._id && (
                        <button
                          aria-label="Delete file"
                          title="Delete file"
                          className="absolute cursor-pointer top-1 right-1 z-10 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white"
                          onClick={(e) => handleDeleteFile(file._id, e)}
                        >
                          {deletingFileId === file._id ? (
                            <span className="block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="h-3 w-3 cursor-pointer" />
                          )}
                        </button>
                      )}
                      <div
                        key={file._id}
                        className={`relative rounded-lg overflow-hidden border border-gray-200 hover:scale-105 transition cursor-pointer ${isSelected ? "ring-2 ring-[#9C7DFF]" : ""
                          }`}
                        onClick={() => setSelectedFile(isSelected ? null : file)}
                      >
                        {isSelected && (
                          <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-[#9C7DFF]" />
                        )}
                        {type === "video" ? (
                          <video
                            src={file.download_url}
                            className="w-full h-40 object-cover pointer-events-none"
                            muted
                            loop
                            preload="metadata"
                          />
                        ) : (
                          <Image
                            src={file?.download_url}
                            alt={`Template ${file?.file_name}`}
                            width={295}
                            height={517}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="text-center py-2 text-xs sm:text-sm truncate px-2">
                          {label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
