import { X } from "lucide-react";

interface DraftSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleViewDrafts: () => void;
  handleDashboard: () => void;
  title: string;
  subtitle?: string;
  secondaryText: string
  primaryText: string
}

export default function DraftSuccessModal({
  isOpen,
  onClose,
  handleViewDrafts,
  handleDashboard,
  title,
  primaryText,
  secondaryText,
  subtitle,
}: DraftSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[90%] max-w-md p-8 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3.5 right-4 text-gray-400 hover:text-black"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Checkmark icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#3BCE8C] rounded-full w-14 h-14 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl font-semibold font-weight-700 text-black font-manrope">
          {title}
        </h2>
        <p className="text-sm text-black mt-2 mb-6 font-manrope">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={handleDashboard}
            className="px-4 py-2 cursor-pointer rounded-md border border-black text-black font-medium hover:bg-black hover:text-white transition"
          >
            {primaryText}
          </button>
          <button
            onClick={handleViewDrafts}
            className="px-4 py-2 cursor-pointer rounded-md bg-[#9C7DFF] text-white font-medium hover:bg-[#9C7DFF]/80 transition"
          >
            {secondaryText}
          </button>
        </div>
      </div>
    </div>
  );
}
