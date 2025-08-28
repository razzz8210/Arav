"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Dynamically import the Player component to avoid SSR issues
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-[150px] h-[150px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ),
  }
) as React.ComponentType<ComponentProps<typeof import("@lottiefiles/react-lottie-player").Player>>;

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen min-h-[200px]">
      <Player
        autoplay
        loop
        src="/animations/video_loader.json"
        style={{ width: "150px", height: "150px" }}
      />
    </div>
  );
};

export default Loader;