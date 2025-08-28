"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { TourGuideRef } from "@/components/TourGuide";

interface TourButtonProps {
  tourRef: React.RefObject<TourGuideRef>;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const TourButton: React.FC<TourButtonProps> = ({
  tourRef,
  className = "",
  variant = "ghost",
  size = "sm",
}) => {
  const handleStartTour = () => {
    if (tourRef?.current) {
      tourRef.current.startTour();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartTour}
      className={`flex items-center gap-2 ${className}`}
      title="Start guided tour"
    >
      <HelpCircle size={16} />
      <span className="hidden sm:inline">Tour</span>
    </Button>
  );
};