import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { TabSwitcher } from "@/components/gtm/TabSwitcher";
import { Button } from "@/components/ui/button";
import { Fragment } from "@/generated/prisma";
import { MessageCard } from "@/modules/projects/ui/components/message-card";
import { MessageForm } from "@/modules/projects/ui/components/message-form";
import { MessageLoading } from "@/modules/projects/ui/components/message-loading";
import type { SandboxState } from "@/modules/projects/ui/views/project-view";
import { Loader2Icon, WrenchIcon } from "lucide-react";

interface Props {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
  sandboxState: SandboxState;
  setSandboxState: (state: SandboxState) => void;
  projectStarted: boolean;
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
  sandboxState,
  setSandboxState,
  projectStarted,
}: Props) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isFixing, setIsFixing] = useState(false);
  const [hasFirstMessage, setHasFirstMessage] = useState(false);

  // Fix message mutation
  const fixMessageMutation = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        );
      },
    })
  );

  const { data: messages = [] } = useQuery(
    trpc.messages.getMany.queryOptions(
      { projectId },
      {
        refetchInterval: 5000,
        enabled: projectStarted || hasFirstMessage,
      }
    )
  );

  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "USER";

  // If we have messages but haven't set hasFirstMessage yet, set it
  useEffect(() => {
    if (!projectStarted && messages.length > 0 && !hasFirstMessage) {
      setHasFirstMessage(true);
    }
  }, [messages.length, projectStarted, hasFirstMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  useEffect(() => {
    let cancelled = false;
    const preview = async () => {
      if (
        lastMessage?.role === "ASSISTANT" &&
        lastMessage?.fragment &&
        lastMessage.fragment?.sandboxUrl
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!cancelled) setActiveFragment(lastMessage.fragment);
      }
      if (lastMessage?.role === "ASSISTANT" && lastMessage?.type === "ERROR") {
        setActiveFragment(null);
      }
    };
    preview();
    return () => {
      cancelled = true;
    };
  }, [lastMessage, setActiveFragment]);

  useEffect(() => {
    if (activeFragment) {
      const updatedMessage = messages.find(
        (msg) => msg.fragment?.id === activeFragment.id
      );
      if (
        updatedMessage?.fragment &&
        updatedMessage.fragment.sandboxUrl !== activeFragment.sandboxUrl
      ) {
        setActiveFragment(updatedMessage.fragment);
        setSandboxState("active");
      }
    }
  }, [messages, activeFragment, setActiveFragment, setSandboxState]);

  const isLastMessageAssistantError =
    lastMessage?.role === "ASSISTANT" && lastMessage?.type === "ERROR";

  const handleFixError = async () => {
    if (!lastMessage) return;
    setIsFixing(true);
    try {
      await fixMessageMutation.mutateAsync({
        value: "Fix the error: " + lastMessage.content,
        projectId,
      });
    } finally {
      setIsFixing(false);
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
              <MessageCard
                key={message.id}
                content={message.content}
                role={message.role}
                fragment={message.fragment}
                createdAt={message.createdAt}
                isActiveFragment={activeFragment?.id === message.fragment?.id}
                onFragmentClick={() => setActiveFragment(message.fragment)}
                type={message.type}
              />
            ))}
          </div>

          <div>
            {isLastMessageUser && <MessageLoading />}
            {isLastMessageAssistantError && (
              <div className="flex justify-center my-2">
                <Button
                  size="sm"
                  className="gap-2 font-medium cursor-pointer"
                  onClick={handleFixError}
                  disabled={isFixing}
                >
                  {isFixing ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <WrenchIcon className="size-4" />
                  )}
                  {isFixing
                    ? "Asking Cracked.ai to fix..."
                    : "Ask Cracked.ai to fix errors"}
                </Button>
              </div>
            )}
          </div>

          <div ref={bottomRef} />
        </div>

        <div className="relative p-3 pt-1 bg-[#EBEBEB]">
          <MessageForm
            projectId={projectId}
            onFirstMessage={() => setHasFirstMessage(true)}
            hasFirstMessage={hasFirstMessage}
            isEnabled={projectStarted}
          />
        </div>
      </div>
    </div>
  );
};
