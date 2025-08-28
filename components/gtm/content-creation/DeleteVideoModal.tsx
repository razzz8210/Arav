"use client";

import { memo } from "react";

interface DeleteVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteVideoModal = memo<DeleteVideoModalProps>(
  ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* Modal Content */}
        <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl p-0 max-w-md w-full shadow-2xl shadow-black/25 overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-border/30 bg-gradient-to-b from-background to-muted/20">
            <div className="w-20 h-20 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-destructive/10">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-destructive drop-shadow-sm"
              >
                <path
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Delete Video
            </h3>
            <p className="text-sm text-muted-foreground/80">
              This action cannot be undone
            </p>
          </div>

          {/* Body */}
          <div className="p-8 text-center">
            <p className="text-muted-foreground leading-relaxed text-base">
              Are you sure you want to delete this template?
              <br /> The template will be permanently removed and cannot be
              recovered.
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex gap-4">
            <button
              className="flex-1 cursor-pointer px-6 py-3.5 border-2 border-border/50 bg-background/80 text-foreground rounded-2xl font-semibold transition-all duration-300 hover:bg-muted/50 hover:border-border hover:shadow-lg hover:shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="flex-1 cursor-pointer px-6 py-3.5 border-none bg-gradient-to-r from-destructive to-destructive/90 text-white rounded-2xl font-semibold transition-all duration-300 hover:from-destructive/90 hover:to-destructive/80 hover:shadow-lg hover:shadow-destructive/25 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-3 backdrop-blur-sm"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-medium">Deleting...</span>
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-sm"
                  >
                    <path
                      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-medium">Delete Video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

DeleteVideoModal.displayName = "DeleteVideoModal";
