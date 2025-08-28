import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface Step {
  icon: string;
  text: string;
  color: string;
}

interface PerplexityStyleLoaderProps {
  className?: string;
}

export const PerplexityStyleLoader: React.FC<PerplexityStyleLoaderProps> = ({
  className = "",
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [stepLoopProgress, setStepLoopProgress] = useState<number>(0);

  const steps: Step[] = [
    {
      icon: "🔍",
      text: "Searching for growth opportunities",
      color: "#6B73FF",
    },
    {
      icon: "📊",
      text: "Analyzing your market fit...",
      color: "#00BCD4",
    },
    {
      icon: "⚙️",
      text: "Identifying what works best for you",
      color: "#4CAF50",
    },
    {
      icon: "✨",
      text: "Finding the perfect fit for your market.",
      color: "#FF9800",
    },
  ];

  // 🔁 Step animation loop (every 8 seconds)
  useEffect(() => {
    let animationFrameId: number;
    const stepDuration = 8000;

    const animateSteps = () => {
      const startTime = Date.now();

      const step = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed % stepDuration) / stepDuration;
        setStepLoopProgress(newProgress);
        animationFrameId = requestAnimationFrame(step);
      };

      animationFrameId = requestAnimationFrame(step);
    };

    animateSteps();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // ⏳ Progress bar animation (5 minutes)
  useEffect(() => {
    // let animationFrameId: number;
    // const duration = 1 * 60 * 1000; // 5 minutes

    // const startTime = Date.now();

    // const animateProgress = () => {
    //   const elapsed = Date.now() - startTime;
    //   const newProgress = Math.min(elapsed / duration, 1);
    //   setProgress(newProgress);
    //   if (newProgress < 1) {
    //     animationFrameId = requestAnimationFrame(animateProgress);
    //   }
    // };

    // animationFrameId = requestAnimationFrame(animateProgress);

    // return () => cancelAnimationFrame(animationFrameId);
    const duration = 1 * 60 * 1000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress >= 1) {
        clearInterval(interval);
      }
    }, 100); // update every 100ms

    return () => clearInterval(interval);
  }, []);

  const currentStep =
    Math.floor(stepLoopProgress * steps.length) % steps.length;

  const TypewriterText: React.FC<{ text: string; isActive: boolean }> = ({
    text,
    isActive,
  }) => {
    const { theme } = useTheme();

    // const [displayText, setDisplayText] = useState<string>("");

    // useEffect(() => {
    //   if (isActive) {
    //     setDisplayText(text);
    //     return;
    //   }


    //   let currentIndex = 0;
    //   const interval = setInterval(() => {
    //     if (currentIndex <= text.length) {
    //       setDisplayText(text.substring(0, currentIndex));
    //       currentIndex++;
    //     } else {
    //       clearInterval(interval);
    //     }
    //   }, 1200 / text.length);

    //   return () => clearInterval(interval);
    // }, [text, isActive]);
    return <span className={`${theme === 'dark' ? "text-white" : "text-black"}`} >{text}</span>;
  };

  const LoadingDots: React.FC<{ color: string }> = ({ color }) => {
    return (
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: color,
              animationDelay: `${index * 150}ms`,
              animationDuration: "600ms",
            }}
          />
        ))}
      </div>
    );
  };

  const SpinningIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
    // Convert hex to RGB and calculate luminance to determine if color is light or dark
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isDark = luminance < 0.5;
    
    return <div className={`animate-spin text-xs ${isDark ? 'text-white' : 'text-gray-800'}`}>{icon}</div>;
  };
  return (
    <div className={`w-full p-6 py-12 ${className}`}>
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 rounded-full mb-3">
        <div
          className="h-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2 border p-5 rounded-2xl max-w-xl mx-auto my-auto mt-[30vh]">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-center space-x-3">
              {/* Step Icon */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted ? "bg-green-500" : isActive ? "" : "bg-gray-300"
                }`}
                style={{
                  backgroundColor: isCompleted
                    ? "#4CAF50"
                    : isActive
                      ? step.color
                      : "#D1D5DB",
                }}
              >
                {isCompleted ? (
                  <span className="text-white text-xs">✓</span>
                ) : isActive ? (
                  index === 3 ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SpinningIcon icon={step.icon} color={step.color} />
                  )
                ) : (
                  <span className="text-gray-500 text-xs">{step.icon}</span>
                )}
              </div>

              {/* Step Text */}
              <div className="flex-1">
                <span
                  className={`text-[1rem] font-medium transition-all duration-300 ${
                    isCompleted
                      ? "text-gray-600"
                      : isActive
                        ? "text-black font-semibold"
                        : "text-gray-400"
                  }`}
                >
                  {isActive && !isCompleted ? (
                    <TypewriterText text={step.text} isActive={true} />
                  ) : (
                    step.text
                  )}
                </span>
              </div>

              {/* Loading Dots */}
              {isActive && !isCompleted && (
                <div className="w-8">
                  <LoadingDots color={step.color} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
