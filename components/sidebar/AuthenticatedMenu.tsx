"use client";

import { useAuth } from "@/utils/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface AuthenticatedMenuProps {
  usedIn: "sidebar" | "mobile" | "header";
}

export const AuthenticatedMenu: React.FC<AuthenticatedMenuProps> = ({
  usedIn,
}) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDevelopment = () => {
    toast.success("This is section is under development!");
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    toast.success("Logged out successfully");

    // refresh page
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex justify-center items-center py-1 px-2 border border-transparent gap-4 cursor-pointer rounded-lg transition-colors hover:bg-[#f1f1f1]"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-md">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-black text-sm truncate">
            {user.name || "User"}
          </span>
        </div>
      </div>

      {showDropdown && (
        <div
          className={`absolute z-50 ${
            usedIn == "sidebar" ? "bottom-full" : "top-full"
          } right-0 bg-white border border-gray-200 rounded-lg shadow-xl py-2 mt-2 w-[160px]`}
        >
          <div
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={handleDevelopment}
          >
            <span>Profile</span>
          </div>
          <div
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={handleDevelopment}
          >
            <span>Settings</span>
          </div>
          <div className="h-px bg-gray-200 my-1"></div>
          <div
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors flex items-center gap-2"
            onClick={handleLogout}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign out</span>
          </div>
        </div>
      )}
    </div>
  );
};
