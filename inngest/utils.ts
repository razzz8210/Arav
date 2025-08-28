import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  await sandbox.setTimeout(3_600_000);
  return sandbox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}

// Helper function to sanitize strings by removing null bytes and other problematic characters
export const sanitizeString = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/\u0000/g, "") // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove other control characters except \n, \r, \t
    .trim();
};

// Helper function to sanitize file contents
export const sanitizeFiles = (files: {
  [path: string]: string;
}): { [path: string]: string } => {
  const sanitized: { [path: string]: string } = {};
  for (const [path, content] of Object.entries(files)) {
    sanitized[path] = sanitizeString(content);
  }
  return sanitized;
};

export const generateFragmentTitle = (fragmentTitleOutput: Message[]) => {
  if (fragmentTitleOutput[0].type !== "text") {
    return "Fragment";
  }

  let title = "";
  if (Array.isArray(fragmentTitleOutput[0].content)) {
    title = fragmentTitleOutput[0].content.map((txt) => txt).join("");
  } else {
    title = fragmentTitleOutput[0].content;
  }
  return sanitizeString(title);
};

export const generateResponse = (responseOutput: Message[]) => {
  if (responseOutput[0].type !== "text") {
    return "Here you go";
  }

  let response = "";
  if (Array.isArray(responseOutput[0].content)) {
    response = responseOutput[0].content.map((txt) => txt).join("");
  } else {
    response = responseOutput[0].content;
  }
  return sanitizeString(response);
};

// Helper function to check if the output is an error message
export const isCommandError = (output: string): boolean => {
  const errorPatterns = [
    /error:/i,
    /failed/i,
    /cannot/i,
    /permission denied/i,
    /no such file or directory/i,
    /command not found/i,
    /syntax error/i,
    /compilation failed/i,
    /build failed/i,
    /npm err!/i,
    /fatal:/i,
    /exception/i,
  ];
  return errorPatterns.some((pattern) => pattern.test(output));
};

// Helper function to check if the stderr is benign
export const isBenignStderr = (stderr: string) =>
  stderr
    .split("\n")
    .every(
      (line) => line.toLowerCase().includes("npm notice") || line.trim() === ""
    );
