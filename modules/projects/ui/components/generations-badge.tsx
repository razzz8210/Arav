"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSocialMediaRefetch } from "@/hooks/useSocialMediaRefetch";
import { useTab } from "@/utils/TabContext";
import { useTemplate } from "@/utils/TemplateContext";

interface GenerationsBadgeProps {
  projectId: string;
}

export const GenerationsBadge: React.FC<GenerationsBadgeProps> = ({
  projectId,
}) => {
  const { posts } = useSocialMediaRefetch(projectId);
  const { setActiveTab, setIsChatOpen, setIsCaptionsOpen } = useTab();
  const { setSelectedTemplate, generationCount } = useTemplate();

  const onClick = () => {
    setSelectedTemplate(null);
    setIsChatOpen(false);
    setIsCaptionsOpen(false);
    setActiveTab("social-media-gallery");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="rounded-lg cursor-pointer gap-2 h-9 px-3 bg-[#9C7DFF1A] text-black hover:bg-[#9C7DFF33]"
      onClick={onClick}
    >
      <span className="text-sm font-medium">Generations</span>
      <span className="inline-grid place-items-center h-6 min-w-6 px-2 text-xs font-semibold rounded-md text-black bg-[#A855F71A]">
        {generationCount === undefined ? "…" : generationCount}
      </span>
    </Button>
  );
};

export default GenerationsBadge;
