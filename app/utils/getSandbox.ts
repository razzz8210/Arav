// src/utils/getSandbox.ts
import { Sandbox } from "@e2b/code-interpreter";
import { rehydrateSandbox } from "./rehydrateSandbox";

const sandboxMap = new Map<string, Sandbox>(); // sandboxId -> Sandbox

export async function getSandbox(sandboxId: string, projectId: string): Promise<Sandbox> {
  const cached = sandboxMap.get(sandboxId);

  if (cached) {
    try {
      await cached.commands.run("echo 'ping'"); // test sandbox still alive
      return cached;
    } catch (e) {
      console.warn(`[getSandbox] Cached sandbox ${sandboxId} expired, recreating...`);
    }
  }

  // Recreate sandbox
  const newSandbox = await Sandbox.create("CrackAI-Nextjs-1236");
  sandboxMap.set(newSandbox.sandboxId, newSandbox);

  try {
    await rehydrateSandbox(projectId, newSandbox);
    console.log(`[getSandbox] New sandbox ${newSandbox.sandboxId} created and rehydrated`);
  } catch (err) {
    console.error("[getSandbox] Error during rehydration:", err);
  }

  return newSandbox;
}
