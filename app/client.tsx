"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";


export const Client =() => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.messages.getMany.queryOptions({  projectId: "your-project-id-here" }));

  return (
    <div>
      {JSON.stringify(data)}
    </div>
  )
}