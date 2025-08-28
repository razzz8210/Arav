import React from 'react';

export const CrackedAiVideo = () => {
  return (
    <div className="flex justify-center items-center w-full px-4 py-8 mt-[120px] mb-[120px] sm:mt-[100px] sm:mb-[100px] md:mt-[120px] md:mb-[120px] lg:mt-[120px] lg:mb-[120px]">
      <video
        src="/cracked-ai-main-sequence.mp4"
        autoPlay
        muted
        loop
        controls
        playsInline
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[85%] h-auto rounded-xl shadow-md"
      />
    </div>
  );
};
