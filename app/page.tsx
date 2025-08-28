"use client";

import { Chat } from "@/components/chat/Chat";
import "./uno.css";
import { Header } from "@/components/header/Header";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/utils/AuthContext";
import { Menu } from "@/components/sidebar/Menu";
import { AuthDebug } from "@/components/AuthDebug";

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [menuState, setMenuState] = useState<
    "open" | "collapsed" | "minimised"
  >("open");
  const { authenticated } = useAuth();
  const [pinned, setPinned] = useState(false);
  const tourRef = useRef<TourGuideRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-full w-full min-h-screen">
      {/* Debug component - remove in production */}
      <AuthDebug />
      
      {/* Tour Guide Component */}
      <TourGuide ref={tourRef} />
      
      {/* Sidebar only if logged in and on larger screens */}
      {authenticated && (
        <div className="hidden md:block" data-tour="sidebar-menu">
          <Menu
            usedIn="landingpage"
            menuState={menuState}
            setMenuState={setMenuState}
            pinned={pinned}
            setPinned={setPinned}
          />
        </div>
      )}

      {/* Main area (Header + Content) */}
      <div
        className="flex flex-col flex-1 w-full min-w-0"
        style={{
          marginLeft: authenticated
            ? menuState === "minimised"
              ? 60
              : 0 // collapsed or open → no margin
            : 0,
          transition: "margin-left 0.2s ease",
        }}
      >
        {/* Header */}
        <Header tourRef={tourRef} />

        {/* Content */}
        <div className="flex-1 overflow-auto h-full w-full" data-tour="chat">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Page;