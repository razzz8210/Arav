"use client";

import { classNames } from "@/app/utils/classNames";
import { HeroText } from "@/components/landing/HeroText";
import { PromptArea } from "@/components/landing/PromptArea";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/utils/AuthContext";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// Dynamic Imports
const CommunityVideos = dynamic(
  () =>
    import("@/components/landing/CommunityVideos").then(
      (mod) => mod.CommunityVideos
    ),
  { loading: () => <Loader /> }
);
const Features = dynamic(
  () => import("@/components/landing/Features").then((mod) => mod.Features),
  { loading: () => <Loader /> }
);
const CrackedAiVideo = dynamic(
  () =>
    import("@/components/landing/CrackedAiVideo").then(
      (mod) => mod.CrackedAiVideo
    ),
  { loading: () => <Loader /> }
);
const Testimonials = dynamic(
  () =>
    import("@/components/landing/Testimonials").then((mod) => mod.Testimonials),
  { loading: () => <Loader /> }
);
const HeroFooter = dynamic(
  () => import("@/components/landing/HeroFooter").then((mod) => mod.HeroFooter),
  { loading: () => <Loader /> }
);
const Footer = dynamic(
  () => import("@/components/landing/Footer").then((mod) => mod.Footer),
  { loading: () => <Loader /> }
);

export const Chat = () => {
  const ref = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const { authenticated } = useAuth();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom ease-out
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={classNames(
        "relative flex h-full w-full overflow-hidden font-manrope"
      )}
    >
      <div className="w-full h-full min-h-screen">
        <PromptArea />
        {!authenticated && (
          <>
            <HeroText />
            <CrackedAiVideo />
            <Features />
            <CommunityVideos />
            <Testimonials />
            <HeroFooter />
            <Footer />
          </>
        )}
      </div>
    </div>
  );
};
