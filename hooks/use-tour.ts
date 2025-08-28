"use client";

import { useCallback, useRef } from 'react';
import { TourGuideRef } from '@/components/TourGuide';

export const useTour = () => {
  const tourRef = useRef<TourGuideRef>(null);

  const startTour = useCallback(() => {
    if (tourRef.current) {
      tourRef.current.startTour();
    }
  }, []);

  const resetTourForUser = useCallback((userId: string) => {
    localStorage.removeItem(`tour-completed-${userId}`);
  }, []);

  const hasTourCompleted = useCallback((userId: string) => {
    return !!localStorage.getItem(`tour-completed-${userId}`);
  }, []);

  return {
    tourRef,
    startTour,
    resetTourForUser,
    hasTourCompleted,
  };
};