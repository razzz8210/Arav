'use client';

import React from 'react';
import { useLoader } from './LoaderContext';

const DynamicLoader = () => {
  const { loaderMessage } = useLoader();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      >
        <source src="/animations/website_loader.mp4" type="video/mp4" />
                Your browser does not support the video tag.
      </video>
      <div
        className="z-10 text-center font-bold text-2xl md:text-4xl px-4"
        style={{
          background: 'linear-gradient(270.09deg, #FFFFFF 0.51%, rgba(153, 153, 153, 0) 105.22%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        {loaderMessage}
      </div>
    </div>
  );
};

export default DynamicLoader;
