"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const codeSnippets = [
  "import React from 'react'",
  "const Component = () => {",
  "  return (",
  "    <div className=\"container\">",
  "      <h1>Hello World</h1>",
  "    </div>",
  "  );",
  "};",
  "export default Component;",
  "function handleClick() {",
  "  console.log('Clicked!');",
  "}",
  "const [state, setState] = useState();",
  "useEffect(() => {",
  "  // Side effect here",
  "}, [dependency]);",
  "interface Props {",
  "  title: string;",
  "  children: React.ReactNode;",
  "}",
];

const generationMessages = [
  "Analyzing your request...",
  "Structuring components...",
  "Generating clean code...",
  "Adding optimal styles...",
  "Implementing best practices...",
  "Optimizing performance...",
  "Finalizing components...",
  "Almost ready...",
];

interface FloatingCodeProps {
  snippet: string;
  delay: number;
  duration: number;
  direction: "left" | "right";
  topPosition: number;
}

const FloatingCode = ({ snippet, delay, duration, direction, topPosition }: FloatingCodeProps) => {
  const animationClass = direction === "left" ? "animate-float-left" : "animate-float-right";
  
  return (
    <div
      className={cn(
        "absolute font-mono text-xs text-primary",
        "whitespace-nowrap pointer-events-none select-none font-medium",
        "bg-primary/10 px-2 py-1 rounded backdrop-blur-sm border border-primary/20",
        animationClass
      )}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
        top: `${topPosition}%`,
        left: direction === "left" ? "-300px" : "calc(100% + 50px)",
        zIndex: 1,
      }}
    >
      {snippet}
    </div>
  );
};

interface CodeGenerationAnimationProps {
  className?: string;
}

export const CodeGenerationAnimation = ({ className }: CodeGenerationAnimationProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  
  // Pre-calculate stable Y positions for each code snippet
  const stablePositions = useState(() => 
    codeSnippets.map(() => Math.random() * 70 + 15)
  )[0];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % generationMessages.length);
    }, 3000);

    const pulseInterval = setInterval(() => {
      setPulseKey((prev) => prev + 1);
    }, 2000);

    const animationInterval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 15000); // Restart animations every 15 seconds

    return () => {
      clearInterval(messageInterval);
      clearInterval(pulseInterval);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div className={cn("relative h-full w-full rounded-md overflow-hidden bg-background", className)}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]" />
      </div>

      {/* Floating Code Snippets */}
      <div key={animationKey} className="absolute inset-0 overflow-hidden">
        {codeSnippets.map((snippet, index) => (
          <FloatingCode
            key={`${snippet}-${index}-${animationKey}`}
            snippet={snippet}
            delay={index * 1.2}
            duration={10 + (index % 3) * 2}
            direction={index % 2 === 0 ? "left" : "right"}
            topPosition={stablePositions[index]}
          />
        ))}
      </div>

      {/* Central Content */}
      <div className="flex h-full flex-col items-center justify-center p-8">
        {/* Main Logo/Icon */}
        <div className="relative mb-8">
          <div
            key={pulseKey}
            className="h-20 w-20 rounded-full border-2 border-primary/30 animate-ping"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Generation Message */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Cracked.AI is crafting your code
          </h3>
          <p className="text-sm text-muted-foreground transition-all duration-500 ease-in-out">
            {generationMessages[currentMessage]}
          </p>
        </div>
      </div>

      {/* Custom CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-left {
            0% {
              transform: translateX(calc(100vw + 300px));
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translateX(-500px);
              opacity: 0;
            }
          }
          
          @keyframes float-right {
            0% {
              transform: translateX(-500px);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translateX(calc(100vw + 300px));
              opacity: 0;
            }
          }
          
          .animate-float-left {
            animation: float-left linear infinite;
          }
          
          .animate-float-right {
            animation: float-right linear infinite;
          }
        `
      }} />
    </div>
  );
}; 