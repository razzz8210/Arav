"use client";

import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useAuth } from '@/utils/AuthContext';
import { TourManager, waitForElement } from '@/utils/tour-utils';
import { tourSteps, mobileTourSteps } from './TourSteps';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ResponsiveTourGuideRef {
  startTour: () => void;
  resetTour: () => void;
}

const ResponsiveTourGuide = forwardRef<ResponsiveTourGuideRef>((_, ref) => {
  const { authenticated, user } = useAuth();
  const isMobile = useIsMobile();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Choose steps based on device type
  const steps = isMobile ? mobileTourSteps : tourSteps;

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    startTour: async () => {
      if (authenticated && user) {
        // Wait for key elements to be ready
        const elementsReady = await Promise.all([
          waitForElement('[data-tour="sidebar-menu"]'),
          waitForElement('[data-tour="header"]'),
          waitForElement('[data-tour="chat"]'),
        ]);

        if (elementsReady.every(Boolean)) {
          setRun(true);
          setStepIndex(0);
          setIsReady(true);
        } else {
          console.warn('Some tour elements are not ready');
        }
      }
    },
    resetTour: () => {
      if (user) {
        TourManager.resetTour(user.id);
        setRun(false);
        setStepIndex(0);
      }
    },
  }));

  // Auto-start tour for first-time users
  useEffect(() => {
    if (authenticated && user && !TourManager.hasCompletedTour(user.id)) {
      // Auto-start after a delay to ensure UI is ready
      const timer = setTimeout(async () => {
        const elementsReady = await Promise.all([
          waitForElement('[data-tour="sidebar-menu"]'),
          waitForElement('[data-tour="header"]'),
          waitForElement('[data-tour="chat"]'),
        ]);

        if (elementsReady.every(Boolean)) {
          setRun(true);
          setStepIndex(0);
          setIsReady(true);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [authenticated, user]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      setIsReady(false);
      
      // Mark tour as completed for this user
      if (user) {
        TourManager.markTourCompleted(user.id);
      }
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  // Don't render if user is not authenticated or not ready
  if (!authenticated || !isReady) {
    return null;
  }

  const customStyles: Partial<Styles> = {
    options: {
      primaryColor: '#8b5cf6',
      width: isMobile ? 320 : 380,
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '14px',
      lineHeight: '1.6',
    },
    tooltipContainer: {
      textAlign: 'left' as const,
    },
    tooltipTitle: {
      color: '#111827',
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      margin: '0 0 12px 0',
    },
    tooltipContent: {
      color: '#6B7280',
      fontSize: '14px',
      lineHeight: '1.6',
    },
    buttonNext: {
      backgroundColor: '#8b5cf6',
      borderRadius: '10px',
      border: 'none',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 24px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    buttonBack: {
      backgroundColor: 'transparent',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      padding: '10px 20px',
      cursor: 'pointer',
      marginRight: '12px',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    buttonSkip: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#9ca3af',
      fontSize: '13px',
      fontWeight: '400',
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    buttonClose: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#9ca3af',
      fontSize: '18px',
      fontWeight: '400',
      width: '28px',
      height: '28px',
      cursor: 'pointer',
      position: 'absolute' as const,
      right: '12px',
      top: '12px',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    spotlight: {
      borderRadius: '12px',
      border: '4px solid #8b5cf6',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(2px)',
    },
    beacon: {
      inner: '#8b5cf6',
      outer: '#8b5cf6',
    },
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      run={run}
      steps={steps}
      stepIndex={stepIndex}
      showProgress={true}
      showSkipButton={true}
      styles={customStyles}
      locale={{
        back: 'Back',
        close: '✕',
        last: 'Finish Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.1))',
          },
        },
      }}
      spotlightClicks={false}
      disableOverlayClose={true}
      hideCloseButton={false}
      scrollToFirstStep={true}
      scrollOffset={isMobile ? 80 : 100}
      disableScrollParentFix={true}
    />
  );
});

ResponsiveTourGuide.displayName = 'ResponsiveTourGuide';

export default ResponsiveTourGuide;