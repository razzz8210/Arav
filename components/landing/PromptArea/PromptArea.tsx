import { SendButton } from "@/components/chat/SendButton.client";
import { useLoader } from "@/components/lottie/LoaderContext";
import { useTRPC } from "@/trpc/client";
import { useAuth } from "@/utils/AuthContext";
import { useTab } from "@/utils/TabContext";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getLoaderMessage,
  TabConfigGoTo,
  tabs,
} from "@/components/landing/PromptArea/data";
import styles from "@/components/landing/PromptArea/PromptArea.module.css";

export const PromptArea = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { setActiveTab, selectedConfig, setSelectedConfig } = useTab();
  const [input, setInput] = useState("");
  const [selectedTab, setSelectedTab] = useState("website");
  const [fullPlaceholder, setFullPlaceholder] = useState(tabs[0].placeholder);
  const [placeholder, setPlaceholder] = useState("");
  const { setLoaderMessage } = useLoader();
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] =
    useState<SpeechRecognition | null>(null);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseInputRef = useRef("");

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          // Store the current input as base text when starting recognition
          baseInputRef.current = input;
          setInterimText("");
        };

        recognition.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // Update interim text for real-time display
          setInterimText(interimTranscript);

          // Add final transcript to the actual input
          if (finalTranscript) {
            const newText = finalTranscript.trim();
            setInput((prev) => {
              const updated = prev + (prev ? " " : "") + newText;
              baseInputRef.current = updated; // Store the base text without interim
              return updated;
            });
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);

          switch (event.error) {
            case "not-allowed":
              toast.error(
                "Microphone access denied. Please allow microphone access and try again."
              );
              break;
            case "no-speech":
              toast.error("No speech detected. Please try again.");
              break;
            case "network":
              toast.error(
                "Network error occurred. Please check your connection."
              );
              break;
            default:
              toast.error("Speech recognition error. Please try again.");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // Clear interim text when recognition ends
          setInterimText("");
        };

        setSpeechRecognition(recognition);
        recognitionRef.current = recognition;
      } else {
        console.warn("Speech recognition not supported in this browser");
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [input]);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullPlaceholder.length) {
        setPlaceholder(fullPlaceholder.slice(0, currentIndex));
        currentIndex++;
      } else {
        // Reset and start over after a pause
        setTimeout(() => {
          currentIndex = 0;
          setPlaceholder("");
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [fullPlaceholder]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowLinkPopup(false);
        setLinkInput("");
      }
    };

    if (showLinkPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLinkPopup]);

  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        if (error.message.includes("UNAUTHORIZED")) {
          toast.error("Please sign in to start a new project");
          router.push("/signin");
        } else {
          toast.error(error.message);
        }
      },
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`);
      },
    })
  );

  const handleStartProject = () => {
    if (!user) {
      toast.error("Please sign in to start a new project");
      router.push("/signin");
      return;
    }

    if (input.trim()) {
      const message = getLoaderMessage(selectedTab);
      setLoaderMessage(message);
      createProject.mutate({
        value: input,
        config: selectedConfig,
      });
    }
  };

  // Handle microphone button click
  const handleMicClick = useCallback(() => {
    if (!speechRecognition) {
      toast.error(
        "Speech recognition not supported in this browser. Please try Chrome, Edge, or Safari."
      );
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
      setInterimText(""); // Clear interim text when stopping
    } else {
      try {
        // Store current input as base before starting recognition
        baseInputRef.current = input;
        speechRecognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Failed to start voice recognition. Please try again.");
      }
    }
  }, [speechRecognition, isListening, input]);

  return (
    <div className={styles.promptArea}>
      <div className={styles.container}>
        <div id="intro" className={styles.titleSection}>
          <div className={`${styles.titlePrimary} ${styles.titlePrimaryLight}`}>
            Create Apps, Websites, and Marketing Magic -
            <span className={styles.titleSecondary}>
              All by Chatting with AI .
            </span>
          </div>
        </div>

        <div className={styles.previewSection}>
          {tabs.map((tab) => (
            <video
              key={tab.id}
              src={tab.image}
              width={900}
              height={400}
              autoPlay
              loop
              muted
              playsInline
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              style={{
                display: selectedTab === tab.id ? "block" : "none",
              }}
            />
          ))}
        </div>

        {/* Tab buttons */}
        <div className={`${styles.tabs} ${styles.tabsLight}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${
                selectedTab === tab.id ? styles.tabActive : ""
              } ${styles.tabLight} ${
                selectedTab === tab.id ? styles.tabLightActive : ""
              }`}
              onClick={() => {
                setSelectedTab(tab.id);
                setActiveTab(tab.goTo === "all" ? "templates" : tab.goTo);
                setSelectedConfig(tab.goTo as TabConfigGoTo);
                setFullPlaceholder(tab.placeholder);
              }}
            >
              <div className={tab.icon}></div>
              {tab.title}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className={styles.inputSection}>
          <div className={styles.inputContainer}>
            <div className={`${styles.inputBox} ${styles.inputBoxLight}`}>
              <div className="relative">
                <textarea
                  disabled={createProject.isPending}
                  className={`${styles.inputTextarea} ${
                    createProject.isPending ? styles.inputTextareaDisabled : ""
                  } ${styles.inputTextareaLight}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      if (event.shiftKey) return;
                      event.preventDefault();
                      if (input.trim()) handleStartProject();
                    }
                  }}
                  value={
                    input +
                    (interimText ? (input ? " " : "") + interimText : "")
                  }
                  onChange={(e) => {
                    if (!isListening) {
                      setInput(e.target.value);
                    }
                  }}
                  placeholder={placeholder}
                  translate="no"
                />
              </div>

              <div className={styles.inputActions}>
                <div className="relative">
                  {showLinkPopup && (
                    <div ref={popupRef} className={styles.linkPopup}>
                      <input
                        type="text"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="Copy and Paste your link for Reference"
                        className={styles.linkInput}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Handle adding the link
                            if (linkInput.trim()) {
                              // You can add logic here to handle the link
                              console.log("Link added:", linkInput);
                              setLinkInput("");
                              setShowLinkPopup(false);
                            }
                          } else if (e.key === "Escape") {
                            setShowLinkPopup(false);
                            setLinkInput("");
                          }
                        }}
                      />
                      <div className={styles.linkPopupActions}>
                        <button
                          onClick={() => {
                            setShowLinkPopup(false);
                            setLinkInput("");
                          }}
                          className={`${styles.linkPopupButton} ${styles.linkPopupButtonCancel}`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (linkInput.trim()) {
                              // Handle adding the link
                              console.log("Link added:", linkInput);
                              setLinkInput("");
                              setShowLinkPopup(false);
                            }
                          }}
                          className={`${styles.linkPopupButton} ${styles.linkPopupButtonAdd}`}
                          disabled={!linkInput.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    className={styles.iconButton}
                    onClick={() => setShowLinkPopup(!showLinkPopup)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                  </button>
                </div>
                <button
                  className={`${styles.iconButton} ${styles.mic} ${
                    isListening ? styles.recording : ""
                  }`}
                  onClick={handleMicClick}
                  disabled={createProject.isPending}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{
                      color: isListening ? "#ef4444" : "currentColor",
                      animation: isListening
                        ? "pulse 1.5s ease-in-out infinite"
                        : "none",
                    }}
                  >
                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2Zm-5 7a7.002 7.002 0 0 0 6.32-4H18a6 6 0 0 1-12 0H5.68A7.002 7.002 0 0 0 12 18Z" />
                  </svg>
                  {isListening && <div className={styles.recordingIndicator} />}
                </button>
              </div>

              {createProject.isPending ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}>
                    <div className={styles.spinnerInner} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Square with up arrow when no text */}
                  {input.length === 0 && (
                    <button className={styles.arrowButton}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 19V5" />
                        <path d="m5 12 7-7 7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Send button when there's text */}
                  <SendButton
                    show={input.length > 0 && !createProject.isPending}
                    onClick={async () => handleStartProject()}
                    className={styles.gradientSendButton}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
