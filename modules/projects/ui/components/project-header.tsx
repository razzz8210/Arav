import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GenerationsBadge } from "@/modules/projects/ui/components/generations-badge";
import { useTRPC } from "@/trpc/client";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronLeftIcon, HomeIcon } from "lucide-react";

interface Props {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  const { activeTab, setActiveTab, setIsChatOpen } = useTab();
  const { setLastPreviewUrl, setPreviewType, setSelectedTemplate } =
    useTemplate();

  return (
    <header className="p-2 flex justify-between items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="focus-visible:ring-0 hover:bg-gray-100 hover:opacity-75 transition-opacity pl-2! cursor-pointer"
          >
            <span className="text-l font-medium ">{project.name}</span>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-gray-100"
          >
            <a href="/">
              <HomeIcon />
              <span className="ml-2">Home</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-gray-100"
          >
            <div
              onClick={() => {
                setSelectedTemplate(null);
                setIsChatOpen(true);
                setLastPreviewUrl(null);
                setPreviewType(null);
                setActiveTab("product-builder");
              }}
            >
              <ChevronLeftIcon />
              <span className="ml-2">Dashboard</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {[
        "templates",
        "avatars",
        "reels",
        "carousel",
        "social-media-gallery",
        "social-media-management",
      ].includes(activeTab) && <GenerationsBadge projectId={projectId} />}
    </header>
  );
};
