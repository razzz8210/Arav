import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TabSwitcher } from "@/components/gtm/TabSwitcher";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { useTab } from "@/utils/TabContext";

type ChatRole = "USER" | "ASSISTANT";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

interface Props {
  projectId: string;
  initialPrompt: string;
}

export const MarketingAssisstant = ({ projectId, initialPrompt }: Props) => {
  const { activeTab, setActiveTab } = useTab();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Avoid auto-scrolling on initial intro message; scroll on subsequent messages or during streaming
    if (messages.length > 1 || isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isStreaming]);

  useEffect(() => {
    const fetchConversationHistory = async () => {
      try {
        const res = await fetch("/api/get_conversation_history", {
          method: "POST",
          body: JSON.stringify({ session_id: projectId }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch conversation history");
        }

        const data = await res.json();
        const history = data.conversation_history;

        if (history && history.length > 0) {
          // Convert backend history format to our ChatMessage format
          const convertedHistory: ChatMessage[] = history.map((msg: any) => ({
            id: crypto.randomUUID(),
            role: msg.role === "user" ? "USER" : "ASSISTANT",
            content: msg.content,
            createdAt: new Date(),
          }));
          setMessages(convertedHistory.slice(1));
          return; // Don't generate initial message if we have history
        }

        // If no history exists, generate initial message
        generateInitialMessage();
      } catch (e) {
        console.error("Error fetching conversation history:", e);
        // If fetching history fails, generate initial message as fallback
        generateInitialMessage();
      }
    };

    const generateInitialMessage = () => {
      const trimmedInitial = (initialPrompt || "").trim();

      if (!trimmedInitial) return;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ASSISTANT",
        content: "",
        createdAt: new Date(),
      };

      setMessages([assistantMsg]);
      setIsStreaming(true);

      (async () => {
        try {
          const res = await fetch("/api/gtm_assistant_chat_stream", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
            },
            body: JSON.stringify({
              session_id: projectId,
              user_query:
                "Generate a short intro message for the user based on initial prompt",
              user_inputs: trimmedInitial,
            }),
          });

          if (!res.ok || !res.body) {
            const text = await res.text();
            throw new Error(text || "Streaming failed");
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";
          let assistantContent = "";

          const shouldInsertSpace = (prev: string, next: string) => {
            if (!prev || !next) return false;
            const end = prev[prev.length - 1];
            const start = next[0];
            if (/\s/.test(end) || /\s/.test(start)) return false;
            // Don't add space before common punctuation
            if (/^[.,!?;:\)\]\}"'"]/.test(start)) return false;
            // Don't add space right after opening punctuation
            if (/[\(\[\{"'"]$/.test(end)) return false;
            return true;
          };

          const appendWithSpacing = (chunkText: string) => {
            if (!chunkText) return;
            const toAppend = shouldInsertSpace(assistantContent, chunkText)
              ? ` ${chunkText}`
              : chunkText;
            assistantContent += toAppend;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: assistantContent }
                  : m
              )
            );
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              if (line.startsWith("data:")) {
                const payload = line.replace(/^data:\s*/, "").trim();
                try {
                  const json = JSON.parse(payload);
                  let piece = "";

                  // Handle the new redirect format
                  if (json?.redirect === "explanation" && json?.data?.chunk) {
                    piece = String(json.data.chunk);
                  }
                  // Handle the existing content format
                  else if (json?.type === "content" && json?.data?.chunk) {
                    piece = String(json.data.chunk);
                  }
                  // Handle other fallback formats
                  else if (json?.data?.content) {
                    piece = String(json.data.content);
                  } else if (json?.content) {
                    piece = String(json.content);
                  } else if (json?.text) {
                    piece = String(json.text);
                  } else if (json?.assistant_response) {
                    piece = String(json.assistant_response);
                  } else if (json?.message) {
                    piece = String(json.message);
                  }

                  const trimmed = piece.trim();
                  if (trimmed === "[DONE]" || trimmed === "DONE") continue;
                  appendWithSpacing(piece);
                } catch {
                  const trimmed = payload.trim();
                  if (trimmed === "[DONE]" || trimmed === "DONE") continue;
                  appendWithSpacing(payload);
                }
              }
            }
          }
        } catch (e) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id && m.content === ""
                ? { ...m, content: "Failed to load introduction." }
                : m
            )
          );
        } finally {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.filter((m) => !(m.id === assistantMsg.id && !m.content.trim()))
          );
        }
      })();
    };

    fetchConversationHistory();
  }, [initialPrompt, projectId]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const lower = trimmed.toLowerCase();
    if (lower.includes("reel")) {
      setActiveTab("reels");
    } else if (lower.includes("avatar")) {
      setActiveTab("avatars");
    } else if (lower.includes("carousel")) {
      setActiveTab("carousel");
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "USER",
      content: trimmed,
      createdAt: new Date(),
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "ASSISTANT",
      content: "",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/gtm_assistant_chat_stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          session_id: projectId,
          user_query: trimmed,
          user_inputs: initialPrompt,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "Streaming failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let assistantContent = "";

      const shouldInsertSpace = (prev: string, next: string) => {
        if (!prev || !next) return false;
        const end = prev[prev.length - 1];
        const start = next[0];
        if (/\s/.test(end) || /\s/.test(start)) return false;
        // Don't add space before common punctuation
        if (/^[.,!?;:\)\]\}"'"]/.test(start)) return false;
        // Don't add space right after opening punctuation
        if (/[\(\[\{"'"]$/.test(end)) return false;
        return true;
      };

      const appendWithSpacing = (chunkText: string) => {
        if (!chunkText) return;
        const toAppend = shouldInsertSpace(assistantContent, chunkText)
          ? ` ${chunkText}`
          : chunkText;
        assistantContent += toAppend;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: assistantContent } : m
          )
        );
      };

      // stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("data:")) {
            const payload = line.replace(/^data:\s*/, "").trim();
            try {
              const json = JSON.parse(payload);
              // Handle common shapes
              let piece = "";

              // Handle the new redirect format
              if (json?.redirect === "explanation" && json?.data?.chunk) {
                piece = String(json.data.chunk);
              }
              // Handle the existing content format
              else if (json?.type === "content" && json?.data?.chunk) {
                piece = String(json.data.chunk);
              }
              // Handle other fallback formats
              else if (json?.data?.content) {
                piece = String(json.data.content);
              } else if (json?.content) {
                piece = String(json.content);
              } else if (json?.text) {
                piece = String(json.text);
              } else if (json?.assistant_response) {
                piece = String(json.assistant_response);
              } else if (json?.message) {
                piece = String(json.message);
              }

              const trimmed = piece.trim();
              if (trimmed === "[DONE]" || trimmed === "DONE") continue;
              appendWithSpacing(piece);
            } catch {
              // If not JSON, append raw payload
              const trimmed = payload.trim();
              if (trimmed === "[DONE]" || trimmed === "DONE") continue;
              appendWithSpacing(payload);
            }
          }
        }
      }
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "ASSISTANT" && m.content === ""
            ? { ...m, content: "Failed to stream response." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      // Remove empty assistant bubble (e.g., if only DONE was received)
      setMessages((prev) =>
        prev.filter((m) => !(m.id === assistantMsg.id && !m.content.trim()))
      );
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-lg border border-[#272727] m-2 bg-[#EBEBEB]">
        <div className="flex justify-center mb-2 p-2">
          <TabSwitcher />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="pt-2 pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  message.role === "USER"
                    ? "flex justify-end pb-4 pr-2 pl-10"
                    : "flex justify-start pb-4 pl-2 pr-2"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-3 shadow-none break-words",
                    message.role === "USER"
                      ? "bg-muted text-foreground border-none whitespace-pre-wrap max-w-[80%]"
                      : "text-foreground"
                  )}
                >
                  {message.role === "ASSISTANT" ? (
                    <MarkdownRenderer
                      content={message.content}
                      className="m-0 break-words whitespace-pre-wrap"
                    />
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {message.content}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="mx-3 my-2 p-3 rounded-lg bg-[#F5F5F5] text-muted-foreground flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" />
                Streaming response...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="relative p-3 pt-1 bg-[#EBEBEB]">
          <div
            className={cn(
              "relative border p-4 pt-1 rounded-xl min-h-[18vh] bg-[#DCDCDC] transition-all"
            )}
          >
            <TextareaAutosize
              value={input}
              disabled={isStreaming}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent"
              placeholder="Describe what you want to build..."
            />
            <div className="flex items-end justify-end pt-2">
              <Button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className={cn(
                  "w-[30px] h-[30px] cursor-pointer rounded-[6px] border border-[#FFFFFF1A]",
                  !isStreaming && input.trim()
                    ? "bg-gradient-to-r from-[#A855F7] to-[#2563EB]"
                    : "bg-muted-foreground"
                )}
              >
                {isStreaming ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <ArrowUpIcon style={{ color: "white" }} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
