import { useState, useRef, useEffect, useCallback } from "react";
import {
  ExternalLinkIcon,
  Loader2,
  RefreshCcwIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useTRPC } from "@/trpc/client";
import type { SandboxState } from "@/modules/projects/ui/views/project-view";

interface Props {
  data: Fragment;
  sandboxState: SandboxState;
  setSandboxState: (state: SandboxState) => void;
}

export function FragmentWeb({ data, sandboxState, setSandboxState }: Props) {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Restart sandbox mutation
  const restartSandboxMutation = useMutation(
    trpc.fragments.restartSandbox.mutationOptions({
      onSuccess: () => {
        setFragmentKey((prev) => prev + 1);
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries();
      },
      onError: (error: any) => {
        console.error("Failed to restart sandbox:", error);
        setSandboxState("error");
      },
    })
  );

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestart = useCallback(async () => {
    if (sandboxState === "restarting") return;
    setSandboxState("restarting");

    try {
      await restartSandboxMutation.mutateAsync({
        fragmentId: data.id,
      });
    } catch (error) {
      console.error("Restart failed:", error);
      setSandboxState("error");
    }
  }, [sandboxState, restartSandboxMutation, data.id, setSandboxState]);

  const checkSandbox = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/check-sandbox?url=${encodeURIComponent(data.sandboxUrl)}`
      );
      const result = await res.json();

      if (!result.available) {
        if (result.status === 502) {
          handleRestart();
        }
      }
    } catch (error) {
      console.error("Failed to check sandbox:", error);
      handleRestart(); // fallback on error
    }
  }, [data.sandboxUrl, handleRestart]);

  useEffect(() => {
    if (data?.sandboxUrl) {
      checkSandbox();
    }
  }, [checkSandbox, data?.sandboxUrl]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-2 bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom" align="start">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="cursor-pointer"
          >
            <RefreshCcwIcon />
          </Button>
        </Hint>

        <Hint text="Click to copy URL" side="bottom" align="start">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
            className="flex-1 justify-start text-start font-normal cursor-pointer"
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>

        <Hint text="Restart Sandbox" side="bottom" align="start">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRestart}
            disabled={sandboxState === "restarting"}
            className="cursor-pointer text-orange-600 border-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-900/20"
          >
            {sandboxState === "restarting" ? (
              <div className="animate-spin">
                <RotateCcwIcon className="h-4 w-4" />
              </div>
            ) : (
              <RotateCcwIcon className="h-4 w-4" />
            )}
          </Button>
        </Hint>

        <Hint text="Open in a new tab" side="bottom" align="start">
          <Button
            size="sm"
            disabled={!data.sandboxUrl}
            variant="outline"
            onClick={() => {
              if (!data.sandboxUrl) return;
              window.open(data.sandboxUrl, "_blank");
            }}
            className="cursor-pointer"
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>

      {sandboxState === "restarting" && (
        <div className="flex items-center justify-center h-full w-full">
          <div className="flex flex-col items-center justify-center space-y-3 p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow animate-pulse">
            <Loader2 className="w-6 h-6 text-red-600 dark:text-red-400 animate-spin" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Restarting Sandbox...
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 text-center">
              Please hold on while we prepare your environment.
            </p>
          </div>
        </div>
      )}
      {sandboxState === "active" && (
        <iframe
          ref={iframeRef}
          key={fragmentKey}
          className="flex flex-col w-full h-full"
          sandbox="allow-forms allow-scripts allow-same-origin"
          loading="lazy"
          src={data.sandboxUrl}
          onError={(e) => {
            console.error("Iframe error detected", e);
          }}
        />
      )}
    </div>
  );
}
