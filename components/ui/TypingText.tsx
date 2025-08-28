import { useEffect, useState } from "react";
import "@/app/styles/floating-input.scss";

interface TypingTextProps {
  fullText: string;
}

export default function TypingText({ fullText }: TypingTextProps) {
  const [typingText, setTypingText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypingText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        // Reset and start over after a pause
        setTimeout(() => {
          currentIndex = 0;
          setTypingText("");
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [fullText]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="floating-input-container">
      <div className="floating-input">
        <input
          type="text"
          value={typingText + (showCursor ? "|" : "")}
          className="floating-input__field"
          readOnly
          placeholder="Ask Cracked.AI to turn your idea into a production-ready product"
        />

        <div className="floating-input__buttons">
          <div className="floating-input__left-icons">
            {/* Paperclip Icon */}
            <button className="floating-input__icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.44 11.05L12.25 20.24C11.12 21.37 9.47 22 7.76 22S4.4 21.37 3.27 20.24C2.14 19.11 1.51 17.46 1.51 15.75S2.14 12.39 3.27 11.26L12.46 2.07C13.2 1.33 14.17 0.92 15.18 0.92S17.16 1.33 17.9 2.07C18.64 2.81 19.05 3.78 19.05 4.79S18.64 6.77 17.9 7.51L9.7 15.71C9.32 16.09 8.83 16.3 8.32 16.3S7.32 16.09 6.94 15.71C6.56 15.33 6.35 14.84 6.35 14.33S6.56 13.33 6.94 12.95L14.66 5.23"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Microphone Icon */}
            <button className="floating-input__icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15S15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 10V12C19 16.42 15.42 20 11 20H13C17.42 20 21 16.42 21 12V10H19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 20V23M8 23H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="floating-input__right-icons">
            {/* Lightning Icon */}
            <button className="floating-input__icon-btn floating-input__lightning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            {/* Send Button */}
            <button className="floating-input__submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
