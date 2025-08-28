"use client";

import React, { useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { AuthenticatedMenu } from "@/components/sidebar/AuthenticatedMenu";
import { HelpCircle } from "lucide-react";
import { TourGuideRef } from "@/components/TourGuide";
import { TourGuideRef } from "@/components/TourGuide";

interface HeaderProps {
  tourRef?: React.RefObject<TourGuideRef>;
}

export const Header: React.FC<HeaderProps> = ({ tourRef }) => {
  const { authenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartTour = () => {
    if (tourRef?.current) {
      tourRef.current.startTour();
    }
  };

  if (!mounted) return null;

  return (
    <header 
      className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40"
      data-tour="header"
    >
      {/* Left section - Logo/Brand */}
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold text-gray-800">
          Cracked.AI
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-3">
        {/* Tour Guide Button - Only show when authenticated */}
        {authenticated && (
          <button
            onClick={handleStartTour}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
            title="Start guided tour"
          >
            <HelpCircle 
              size={16} 
              className="text-gray-400 group-hover:text-purple-500 transition-colors" 
            />
            <span className="hidden sm:block">Tour</span>
          </button>
        )}

        {/* Authentication Section */}
        {authenticated && user ? (
          <AuthenticatedMenu usedIn="header" />
        ) : (
          <div className="flex items-center gap-3">
            <a
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Sign Up
            </a>
          </div>
        )}
      </div>
    </header>
  );
};