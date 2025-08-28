"use client";

import { Step } from 'react-joyride';

export const tourSteps: Step[] = [
  {
    target: '[data-tour="sidebar-menu"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Welcome to Cracked.AI! 🎉</h3>
        <p className="text-gray-600">
          This is your sidebar menu where you can access chat history, create new chats, and manage your conversations.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="header"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Header Section 📍</h3>
        <p className="text-gray-600">
          The header contains important navigation options and your account settings. You can also restart this tour anytime using the tour button.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="profile-menu"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Profile & Settings 👤</h3>
        <p className="text-gray-600">
          Access your profile information, account settings, and logout options from here.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="chat"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Chat Area 💬</h3>
        <p className="text-gray-600">
          This is where the magic happens! Start typing your prompts here to create apps, websites, and marketing content with AI assistance.
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="chat-history"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Chat History 📚</h3>
        <p className="text-gray-600">
          All your previous conversations are saved here. Click on any chat to continue where you left off.
        </p>
      </div>
    ),
    placement: 'right',
  },
];

// Mobile-specific tour steps
export const mobileTourSteps: Step[] = [
  {
    target: '[data-tour="mobile-header"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Welcome to Cracked.AI! 🎉</h3>
        <p className="text-gray-600">
          This is your main navigation area. Tap the menu icon to access your chat history and settings.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="mobile-chat"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Chat Area 💬</h3>
        <p className="text-gray-600">
          Start typing your prompts here to create apps, websites, and marketing content with AI assistance.
        </p>
      </div>
    ),
    placement: 'top',
  },
];