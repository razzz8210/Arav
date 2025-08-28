// src/utils/rehydrateSandbox.ts

import { Sandbox } from "@e2b/code-interpreter";
import { prisma } from "@/lib/db";

export const rehydrateSandbox = async (projectId: string, sandbox: Sandbox) => {
  const message = await prisma.message.findFirst({
    where: {
      projectId,
      role: "ASSISTANT",
      fragment: {
        isNot: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      fragment: true,
    },
  });

  if (!message?.fragment?.files) {
    console.log(`[rehydrateSandbox] No files to restore for project ${projectId}`);
    return;
  }

  const files = message.fragment.files as Record<string, string>;

  for (const [path, content] of Object.entries(files)) {
    if (typeof content === "string" && content.length < 100_000) {
      await sandbox.files.write(path, content);
    } else {
      console.warn(`[rehydrateSandbox] Skipping file due to size/type issue: ${path}`);
    }
  }

  console.log(`[rehydrateSandbox] Restored ${Object.keys(files).length} files into sandbox`);
};
