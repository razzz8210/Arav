import { useTemplate } from "@/utils/TemplateContext";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import Markdown from "react-markdown";

export interface PostPreviewFrameProps {
  username?: string;
  avatarUrl?: string;
  location?: string;
  likesText?: string;
  caption?: string;
  hashtags?: string;
  dateText?: string;
  mediaType?: "image" | "video";
  mediaSrc?: string;
  children?: React.ReactNode; // if provided, replaces the media rendering
}

export const PostPreviewFrame: React.FC<PostPreviewFrameProps> = ({
  username = "Johndoe",
  avatarUrl = "https://i.pravatar.cc/150?u=johndoe",
  location = "Tokyo, Japan",
  likesText = "Liked by craig_love and 44,686 others",
  // caption =  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  hashtags = "#fyp #dogs #dogstagram #dogwalking #ai #app #innovation #newapp #applaunch",
  dateText = "September 19",
  mediaType = "image",
  mediaSrc,
  children,
}) => {
  const { contentData } = useTemplate();

  return (
    <div className="w-full max-w-md bg-white mb-4 rounded-lg shadow-lg p-6 space-y-4">
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-black">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 relative rounded-full overflow-hidden">
              <Image
                src={avatarUrl}
                alt="User avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <span className="font-semibold">{username}</span>
                {/* Verified Badge */}
                <svg
                  className="w-4 h-4 ml-1 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-3.5-3.5 1.41-1.41L11 14.17l6.09-6.09L18.5 9.5 11 17z" />
                </svg>
              </div>
              {location && (
                <span className="text-xs text-gray-500">
                  {location}
                </span>
              )}
            </div>
          </div>
          <MoreHorizontal
            size={24}
            className="text-gray-500"
          />
        </div>

        {/* Media */}
        <div className="relative rounded-lg overflow-hidden flex items-center justify-center">
          {children ? (
            children
          ) : mediaType === "video" && mediaSrc ? (
            <video
              src={mediaSrc}
              className="w-full h-auto"
              controls
              playsInline
              muted
              loop
              autoPlay
            />
          ) : mediaSrc ? (
            <div className="w-full relative aspect-square">
              <Image src={mediaSrc} alt="post-image" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-200" />
          )}
        </div>

        {/* Action Icons */}
        <div className="flex justify-between items-center py-3 text-gray-800">
          <div className="flex items-center space-x-4">
            <Heart size={24} className="hover:text-red-500 cursor-pointer" />
            <MessageCircle
              size={24}
              className="hover:text-gray-500 cursor-pointer"
            />
            <Send size={24} className="hover:text-gray-500 cursor-pointer" />
          </div>
          <Bookmark size={24} className="hover:text-gray-500 cursor-pointer" />
        </div>

        {/* Likes, Caption, and Date */}
        <div>
          <p className="text-sm font-semibold">{likesText}</p>
          <div className="text-sm mt-1">
            {contentData?.content ? (
              <Markdown>{contentData.content}</Markdown>
            ) : (
              <span className="text-gray-500">No content generated yet</span>
            )}
          </div>

          {hashtags && (
            <p className="text-sm text-blue-500 mt-1">
              {hashtags}
            </p>
          )}
          {dateText && (
            <p className="text-xs text-gray-500 mt-2">
              {dateText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPreviewFrame;
