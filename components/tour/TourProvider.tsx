"use client";

import React, { createContext, useContext, useRef } from 'react';
import TourGuide, { TourGuideRef } from '@/components/TourGuide';

interface TourContextType {
  startTour: () => void;
  tourRef: React.RefObject<TourGuideRef>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const tourRef = useRef<TourGuideRef>(null);

  const startTour = () => {
    if (tourRef.current) {
      tourRef.current.startTour();
    }
  };

  return (
    <TourContext.Provider value={{ startTour, tourRef }}>
      {children}
      <TourGuide ref={tourRef} />
    </TourContext.Provider>
  );
};