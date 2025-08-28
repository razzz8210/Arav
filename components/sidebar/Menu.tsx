import { motion, type Variants } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import { cubicEasingFn } from "@/app/utils/easings";
import { classNames } from "@/app/utils/classNames";
import Sidebar from "@/components/sidebar/Sidebar";

interface MenuProps {
  usedIn?: "landingpage" | "project";
  menuState: "open" | "collapsed" | "minimised";
  setMenuState: (state: "open" | "collapsed" | "minimised") => void;
  pinned?: boolean;
  setPinned?: (value: boolean) => void;
}

export const Menu = ({
  usedIn = "landingpage",
  menuState,
  setMenuState,
  pinned = false,
  setPinned,
}: MenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);

  // Only apply landing page behavior when usedIn is "landingpage"
  const isLandingPage = usedIn === "landingpage";

  // For landing page: default to open and pinned
  const [localPinned, setLocalPinned] = useState(isLandingPage);
  const [localMenuState, setLocalMenuState] = useState<
    "open" | "collapsed" | "minimised"
  >(isLandingPage ? "open" : menuState);

  // Use local state for landing page, prop state for project pages
  const effectivePinned = isLandingPage ? localPinned : pinned;
  const effectiveMenuState = isLandingPage ? localMenuState : menuState;
  const effectiveSetPinned = isLandingPage ? setLocalPinned : setPinned;
  const effectiveSetMenuState = isLandingPage
    ? setLocalMenuState
    : setMenuState;

  const isExpanded = effectiveMenuState === "open";
  const isMini = effectiveMenuState === "minimised";
  const isCollapsed = effectiveMenuState === "collapsed";

  // effectiveOpen respects "pinned" and hover state
  const effectiveOpen = effectivePinned
    ? true
    : isCollapsed || isMini
    ? isHoveringEdge || isHoveringMenu
    : true;

  const width = useMemo(() => {
    if ((isCollapsed || isMini) && !effectiveOpen) return isMini ? 60 : 0;
    if (isExpanded || effectiveOpen) return 260;
    return 0;
  }, [isCollapsed, isMini, effectiveOpen, isExpanded]);

  const currentVariant =
    isCollapsed || isMini
      ? effectiveOpen
        ? "open"
        : isMini
        ? "mini"
        : "hidden"
      : isExpanded
      ? "open"
      : "mini";

  const menuVariants = {
    hidden: {
      opacity: 0,
      visibility: "hidden",
      left: -280,
      transition: { duration: 0.2, ease: cubicEasingFn },
    },
    mini: {
      opacity: 1,
      visibility: "initial",
      left: 0,
      transition: { duration: 0.2, ease: cubicEasingFn },
    },
    open: {
      opacity: 1,
      visibility: "initial",
      left: 0,
      transition: { duration: 0.2, ease: cubicEasingFn },
    },
  } satisfies Variants;

  const sidebarRenderState: "open" | "collapsed" | "minimised" = isCollapsed
    ? effectiveOpen
      ? "open"
      : "collapsed"
    : isMini
    ? effectiveOpen
      ? "open"
      : "minimised"
    : "open";

  // Handle logo click for landing page
  const handleLogoClick = () => {
    if (isLandingPage) {
      // Toggle between pinned and unpinned states
      const newPinnedState = !localPinned;
      setLocalPinned(newPinnedState);

      if (newPinnedState) {
        // When pinning, expand the sidebar
        setLocalMenuState("open");
      } else {
        // When unpinning, collapse the sidebar
        setLocalMenuState("collapsed");
      }
    }
  };

  // Handle hover away for landing page
  useEffect(() => {
    if (!isLandingPage) return;

    const handleMouseLeave = () => {
      if (!localPinned) {
        setLocalMenuState("collapsed");
      }
    };

    const menuElement = menuRef.current;
    if (menuElement) {
      menuElement.addEventListener("mouseleave", handleMouseLeave);
      return () =>
        menuElement.removeEventListener("mouseleave", handleMouseLeave);
    }
  }, [isLandingPage, localPinned]);

  return (
    <>
      {/* Hover edge for collapsed state - only on landing page */}
      {isLandingPage && isCollapsed && !effectivePinned && (
        <div
          onMouseEnter={() => !effectivePinned && setIsHoveringMenu(true)}
          onMouseLeave={() => !effectivePinned && setIsHoveringMenu(false)}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: 16,
            height: "100vh",
            zIndex: 998,
          }}
        />
      )}
      <motion.div
        ref={menuRef}
        onMouseEnter={() => !effectivePinned && setIsHoveringMenu(true)}
        onMouseLeave={() => !effectivePinned && setIsHoveringMenu(false)}
        data-lenis-prevent
        initial={"hidden"}
        animate={currentVariant}
        variants={menuVariants}
        style={{ width, zIndex: 999, overflow: "hidden" }}
        className={classNames(
          "flex selection-accent flex-col side-menu fixed top-0 h-full",
          "bg-white border-r border-gray-100",
          "shadow-sm text-sm"
        )}
      >
        <Sidebar
          usedIn={usedIn}
          menuState={sidebarRenderState}
          toggleMenuState={effectiveSetMenuState}
          pinned={effectivePinned}
          setPinned={effectiveSetPinned}
          onLogoClick={isLandingPage ? handleLogoClick : undefined}
        />
      </motion.div>
    </>
  );
};
