"use client";

import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles, ACTIONS, EVENTS } from 'react-joyride';
import { useAuth } from '@/utils/AuthContext';

export interface TourGuideRef {
  startTour: () => void;
}

const TourGuide = forwardRef<TourGuideRef>((_, ref) => {
  const { authenticated, user } = useAuth();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Expose startTour method via ref
  useImperativeHandle(ref, () => ({
    startTour: () => {
      if (authenticated) {
        setRun(true);
        setStepIndex(0);
      }
    },
  }));

  // Auto-start tour for first-time users after login
  useEffect(() => {
    if (authenticated && user) {
      // Check if user has seen the tour before
      const hasSeenTour = localStorage.getItem(`tour-completed-${user.id}`);
      if (!hasSeenTour) {
        // Delay to ensure DOM elements are rendered
        setTimeout(() => {
          setRun(true);
          setStepIndex(0);
        }, 1000);
      }
    }
  }, [authenticated, user]);

  const steps: Step[] = [
    {
      target: '[data-tour="sidebar-menu"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Welcome to Cracked.AI! 🎉</h3>
          <p className="text-gray-600">This is your sidebar menu where you can access chat history, create new chats, and manage your conversations.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="header"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Header Section 📍</h3>
          <p className="text-gray-600">The header contains important navigation options and your account settings. You can also restart this tour anytime using the tour button.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="chat"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Chat Area 💬</h3>
          <p className="text-gray-600">This is where the magic happens! Start typing your prompts here to create apps, websites, and marketing content with AI assistance.</p>
        </div>
      ),
      placement: 'top',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      
      // Mark tour as completed for this user
      if (user) {
        localStorage.setItem(`tour-completed-${user.id}`, 'true');
      }
    } else if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
    }
  };

  // Don't render if user is not authenticated
  if (!authenticated) {
    return null;
  }

  const customStyles: Partial<Styles> = {
    options: {
      primaryColor: '#8b5cf6',
      width: 380,
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    tooltipContainer: {
      textAlign: 'left' as const,
    },
    tooltipTitle: {
      color: '#111827',
      fontSize: '18px',
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
      borderRadius: '8px',
      border: 'none',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      padding: '10px 20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    buttonBack: {
      backgroundColor: 'transparent',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 18px',
      cursor: 'pointer',
      marginRight: '10px',
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
      fontSize: '16px',
      fontWeight: '400',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      position: 'absolute' as const,
      right: '12px',
      top: '12px',
      outline: 'none',
    },
    spotlight: {
      borderRadius: '8px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
        last: 'Done',
        next: 'Next',
        skip: 'Skip tour',
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))',
          },
        },
      }}
      spotlightClicks={false}
      disableOverlayClose={false}
      hideCloseButton={false}
      scrollToFirstStep={true}
      scrollOffset={100}
    />
  );
});

TourGuide.displayName = 'TourGuide';

export default TourGuide;