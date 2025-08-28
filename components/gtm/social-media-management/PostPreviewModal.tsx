import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialMediaPost } from "@/types/social-media";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  X,
} from "lucide-react";
import Image from "next/image";

interface PostPreviewModalProps {
  onClose: () => void;
  postDetails: SocialMediaPost | null;
}

const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  onClose,
  postDetails,
}) => {
  const author = {
    username: "username",
    avatar: "https://via.placeholder.com/150",
    verified: true,
  };

  const metadata = {
    likes: 100,
    comments: 10,
    shares: 10,
    timestamp: "2 hours ago",
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-xl w-[400px] h-[95%] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src="https://i.pravatar.cc/300"
                  alt={`@${postDetails?.platform}`}
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-900">
                  {author.username || "username"}
                </span>
                {author.verified && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-1 cursor-pointer hover:bg-gray-100 rounded-full"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1 flex justify-center items-center px-4 py-2">
          <div className="relative w-[20vw] h-[60vh] rounded-lg overflow-hidden bg-gray-100">
            {/* Content */}
            {postDetails?.type === "Reel" ? (
              <video
                src={postDetails?.thumbnail}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                controls={true}
              />
            ) : postDetails?.thumbnail ? (
              <Image
                src={postDetails.thumbnail}
                alt={postDetails?.title || "Post image"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
        </div>

        {/* Interaction Section - Instagram style with scrollable content */}
        <div className="px-4 py-2 flex-1 overflow-y-auto">
          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-3">
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <Heart className="w-6 h-6 text-gray-900" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-gray-900" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <Send className="w-6 h-6 text-gray-900" />
            </button>
            <div className="flex-1"></div>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <Bookmark className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          {/* Likes */}
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(metadata.likes)} likes
            </span>
          </div>

          {/* Caption - Instagram style */}
          <div className="mb-2">
            <span className="text-sm text-gray-900">
              <span className="font-semibold mr-2">
                {author.username || "username"}
              </span>
              {postDetails?.caption || postDetails?.title}
            </span>
          </div>

          {/* Comments */}
          {metadata.comments && metadata.comments > 0 && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">
                View all {formatNumber(metadata.comments)} comments
              </span>
            </div>
          )}

          {/* Timestamp */}
          <div className="mb-3">
            <span className="text-xs text-gray-400">{metadata.timestamp}</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-4 py-3 border-t border-gray-200">
          <button className="flex-1 cursor-pointer border border-gray-300 rounded-lg py-2 text-sm font-medium text-black hover:bg-gray-100">
            Edit
          </button>
          <button className="flex-1 cursor-pointer border border-gray-300 rounded-lg py-2 text-sm font-medium text-black hover:bg-gray-100">
            Schedule
          </button>
          <button className="flex-1 cursor-pointer bg-[var(--social-media-button-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--social-media-button-primary-hover)]">
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPreviewModal;
