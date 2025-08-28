"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Dynamically import the Player component to avoid SSR issues
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ),
  }
) as React.ComponentType<ComponentProps<typeof import("@lottiefiles/react-lottie-player").Player>>;

const SmmLoader = () => {
  return (
    <div className="flex items-center justify-center mt-16 w-full ">
      <Player autoplay loop src="/animations/smm_loader.json" />
    </div>
  );
};

export default SmmLoader;
