"use client";

import { useTheme } from "next-themes";

export const Loader = () => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 rounded-full animate-spin bg-gradient-to-r from-purple-500 to-blue-500 p-[4px]">
        <div
          className={`w-full h-full rounded-full ${
            theme === "dark" ? "bg-black" : "bg-white"
          }`}
        />
      </div>
    </div>
  );
};
