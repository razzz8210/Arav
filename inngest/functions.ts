import { anthropic, createAgent, createNetwork, createState, createTool, type Message, openai, type Tool } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "./client";
import { generateFragmentTitle, generateResponse, getSandbox, isBenignStderr, isCommandError, lastAssistantTextMessageContent, sanitizeFiles, sanitizeString } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT, PLANNING_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
  hasErrors: boolean;
  errorMessages: string[];
}

export const codeAgentFunction = inngest.createFunction(
  { 
    id: "codeAgent"
  },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    // Step 1: Initialize sandbox
    const oneHourInMilliseconds = 3_600_000;
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("CrackAI-Nextjs-1236");
      await sandbox.setTimeout(oneHourInMilliseconds / 2);
      return sandbox.sandboxId;
    });

    // Step 2: Get previous messages
    const { previousMessages, previousFiles } = await step.run("get-previous-messages-and-files", async () => {
      const formattedMessages: Message[] = [];
      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          fragment: true, // Include fragment data (files)
        },
      });
    
      // Format messages for the agent
      for (const message of messages) {
        formattedMessages.push({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
        });
      }
    
      // Find the most recent message with a fragment (successful result)
      const lastMessage = messages.find(msg => 
        msg.role === "ASSISTANT" && msg.fragment !== null
      );
    
      const previousFiles = lastMessage?.fragment?.files || {};
      console.log(`[CONTINUITY] Found ${Object.keys(previousFiles).length} files from previous fragment`);
    
      return { 
        previousMessages: formattedMessages.reverse(),
        previousFiles: previousFiles as { [path: string]: string },
      };
    });
    
    await step.run("restore-previous-files", async () => {
      if (Object.keys(previousFiles).length > 0) {
        const sandbox = await getSandbox(sandboxId);
        console.log(`[CONTINUITY] Restoring ${Object.keys(previousFiles).length} files to new sandbox`);
    
        await Promise.all(
          Object.entries(previousFiles).map(async ([filePath, content]) => {
            try {
              await sandbox.files.write(filePath, content);
              console.log(`[CONTINUITY] Restored file: ${filePath}`);
            } catch (e) {
              console.error(`[CONTINUITY] Error restoring file ${filePath}:`, e);
            }
          })
        );
        return `Restored ${Object.keys(previousFiles).length} files from previous session`;
      }
      return "No previous files to restore";
    });
    

    // Create state (not in a step as it's synchronous)
    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
        hasErrors: false,
        errorMessages: [],
      },
      {
        messages: previousMessages, // Include previous messages in the state
      },
    );

    // Step 2.5: Planning step - ask the agent to output a plan (list of files/components/pages)
    let plan = [];
    if (previousMessages.length === 1) {
      const planningAgent = createAgent({
        name: "planning-agent",
        description: "A planning agent that outputs a structured plan of Next.js 15+ files to be created for the user's request.",
        system: PLANNING_PROMPT,
        model: openai({ model: "gpt-4o" }),
      });
      const { output } = await planningAgent.run({
        previousFiles: previousFiles,
        ...event.data.value,
      });
      try {
        // Find the first text message in the output
        const textMsg = output.find((msg: any) => msg.type === "text");
        let content = "";
        
        if (textMsg && "content" in textMsg && typeof textMsg.content === "string") {
          content = textMsg.content;
        } else if (textMsg && "content" in textMsg && Array.isArray(textMsg.content)) {
          content = textMsg.content.join("");
        } else {
          console.error("[PLANNING] No text message with content found in output:", output);
        }

        // Clean up the content - remove markdown code blocks if present
        content = content.trim();
        if (content.startsWith('```json')) {
          content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (content.startsWith('```')) {
          content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Parse the cleaned JSON
        plan = JSON.parse(content);
      } catch (e) {
        console.error("[PLANNING] Failed to parse plan output:", output, e);
      }
    }

    // Create code agent (not in a step as it's synchronous)
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent that can create websites and applications",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 1, // Reduced for more consistent behavior
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Execute terminal commands in the sandbox environment",
          parameters: z.object({
            command: z.string().describe("The command to execute in the terminal"),
          }),
          handler: async ({ command }, { network }: Tool.Options<AgentState>) => {
            // console.log(`[TOOL] Executing command: ${command}`);
            const buffers = { stdout: "", stderr: "" };
            try {
              const sandbox = await getSandbox(sandboxId);
              const result = await sandbox.commands.run(command, {
                onStdout: (data: string) => {
                  buffers.stdout += data;
                },
                onStderr: (data: string) => {
                  buffers.stderr += data;
                },
              });
              let output = result.stdout || buffers.stdout;
              const errorOutput = result.stderr || buffers.stderr;
              const missingModuleMatch = output.match(/Cannot find module '(.*?)'/) || errorOutput.match(/Cannot find module '(.*?)'/);
              if (missingModuleMatch) {
                const missingPkg = missingModuleMatch[1];
                // console.log(`[TOOL] Detected missing module: ${missingPkg}`);
                try {
                  const installResult = await sandbox.commands.run(`npm install ${missingPkg}`);
                  output += `\n\nAuto-installed missing package: ${missingPkg}\n${installResult.stdout}`;
                } catch (installErr) {
                  const errorMsg = `Failed to install missing package "${missingPkg}": ${installErr}`;
                  console.error(errorMsg);
                  if (network?.state?.data) {
                    network.state.data.hasErrors = true;
                    network.state.data.errorMessages.push(errorMsg);
                  }
                  return errorMsg;
                }
              }

              if ((errorOutput && !isBenignStderr(errorOutput)) || isCommandError(output)) {
                if (network?.state?.data) {
                  network.state.data.hasErrors = true;
                  network.state.data.errorMessages.push(`Command "${command}" failed: ${errorOutput || output}`);
                }
              }
              return output || errorOutput || "Command completed";
            } catch (e) {
              const errorMsg = `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              console.error(errorMsg);
              if (network?.state?.data) {
                network.state.data.hasErrors = true;
                network.state.data.errorMessages.push(errorMsg);
              }
              return errorMsg;
            }
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox filesystem. Note: Initial files from the plan are already created, use this only for additional files or modifications.",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string().describe("The file path relative to the sandbox root"),
                content: z.string().describe("The content to write to the file"),
              })
            ).describe("Array of files to create or update"),
          }),
          handler: async ({ files }, { network }: Tool.Options<AgentState>) => {
            // console.log(`[TOOL] Agent requested to create/update ${files.length} files:`, files.map(f => f.path));
            try {
              const sandbox = await getSandbox(sandboxId);
              const updatedFiles = network?.state?.data?.files || {};
              
              for (const file of files) {
                // Check if this file was already created from the plan
                if (updatedFiles[file.path]) {
                  // console.log(`[TOOL] File ${file.path} already exists from plan, updating content`);
                } else {
                  // console.log(`[TOOL] Creating new file: ${file.path}`);
                }
                
                await sandbox.files.write(file.path, file.content);
                updatedFiles[file.path] = file.content;
              }
              
              if (network?.state?.data) {
                network.state.data.files = updatedFiles;
              }
              
              return `Successfully created/updated ${files.length} files: ${files.map(f => f.path).join(', ')}`;
            } catch (e) {
              const errorMsg = `Error creating/updating files: ${e}`;
              console.error(errorMsg);
              if (network?.state?.data) {
                network.state.data.hasErrors = true;
                network.state.data.errorMessages.push(errorMsg);
              }
              return errorMsg;
            }
          },
        }),
        
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox filesystem",
          parameters: z.object({
            files: z.array(z.string()).describe("Array of file paths to read"),
          }),
          handler: async ({ files }, { network }: Tool.Options<AgentState>) => {
            // console.log(`Reading ${files.length} files`);
            try {
              const sandbox = await getSandbox(sandboxId);
              const contents = [];
              
              for (const filePath of files) {
                // console.log(`Reading file: ${filePath}`);
                try {
                  const content = await sandbox.files.read(filePath);
                  contents.push({ path: filePath, content });
                } catch (fileError) {
                  // Check if it's just a "file not found" error (normal exploration)
                  const errorMsg = `${fileError}`;
                  const isFileNotFound = errorMsg.includes("NotFoundError") || 
                                        errorMsg.includes("does not exist") ||
                                        errorMsg.includes("No such file or directory") || 
                                        errorMsg.includes("cannot access") ||
                                        errorMsg.includes("not found");
                  
                  if (isFileNotFound) {
                    // This is normal exploration - file doesn't exist, not a real error
                    // console.log(`[EXPLORATION] File ${filePath} does not exist (normal)`);
                    contents.push({ path: filePath, content: `File '${filePath}' does not exist.` });
                  } else {
                    // This is a real error (permissions, corruption, etc.)
                    console.error(`[ERROR] Real error reading file ${filePath}: ${fileError}`);
                    if (network?.state?.data) {
                      network.state.data.hasErrors = true;
                      network.state.data.errorMessages.push(`Error reading file ${filePath}: ${fileError}`);
                    }
                    contents.push({ path: filePath, content: `Error: ${fileError}` });
                  }
                }
              }
              
              return JSON.stringify(contents, null, 2);
            } catch (e) {
              const errorMsg = `Error reading files: ${e}`;
              console.error(errorMsg);
              
              // Mark as error in state
              if (network?.state?.data) {
                network.state.data.hasErrors = true;
                network.state.data.errorMessages.push(errorMsg);
              }
              
              return errorMsg;
            }
          },
        }),
        
        createTool({
          name: "listFiles",
          description: "List files and directories in the sandbox. IMPORTANT: Only list directories that you know exist or have created. Check individual files with readFiles first before listing directories.",
          parameters: z.object({
            path: z.string().optional().describe("Directory path to list (default: current directory)"),
          }),
          handler: async ({ path = "." }, { network }: Tool.Options<AgentState>) => {
            // console.log(`Listing files in: ${path}`);
            try {
              const sandbox = await getSandbox(sandboxId);
              const result = await sandbox.commands.run(`ls -la ${path}`);
              
              // Check if the command failed
              if (result.stderr || isCommandError(result.stdout)) {
                const errorOutput = result.stderr || result.stdout;
                const isDirectoryNotFound = errorOutput.includes("No such file or directory") || 
                                          errorOutput.includes("cannot access") ||
                                          errorOutput.includes("not found");
                
                if (isDirectoryNotFound) {
                  // This is normal exploration - directory doesn't exist, not a real error
                  // console.log(`[EXPLORATION] Directory ${path} does not exist (normal)`);
                } else if (network?.state?.data) {
                  // This is a real error
                  network.state.data.hasErrors = true;
                  network.state.data.errorMessages.push(`Error listing files in ${path}: ${errorOutput}`);
                }
              }
              
              return result.stdout || result.stderr || "No output";
            } catch (e) {
              const errorMsg = `Error listing files: ${e}`;
              console.error(errorMsg);
              
              // Mark as error in state
              if (network?.state?.data) {
                network.state.data.hasErrors = true;
                network.state.data.errorMessages.push(errorMsg);
              }
              
              return errorMsg;
            }
          },
        }),
      ],
      
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantTextMessageText = lastAssistantTextMessageContent(result);
          // console.log("Assistant response:", lastAssistantTextMessageText);
          
          if (lastAssistantTextMessageText && network) {
            if (lastAssistantTextMessageText.includes("<task_summary>")) {
              // console.log("Found task summary, marking as complete");
              network.state.data.summary = lastAssistantTextMessageText;
            }
          }
          return result;
        },
      },
    });

    // Create network (not in a step as it's synchronous)
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 30,
      defaultState: state, 
      router: async ({ network }) => {
        if (!network.state.data) {
          network.state.data = { files: {}, summary: "", hasErrors: false, errorMessages: [] };
        } else {
          // Ensure all required properties exist without overwriting existing data
          if (!network.state.data.files) network.state.data.files = {};
          if (!network.state.data.summary) network.state.data.summary = "";
          if (typeof network.state.data.hasErrors !== 'boolean') network.state.data.hasErrors = false;
          if (!Array.isArray(network.state.data.errorMessages)) network.state.data.errorMessages = [];
        }
        const summary = network.state.data.summary;
        if (summary) {
          // console.log("Task completed, stopping network");
          return; // Stop execution
        }
        return codeAgent;
      },
    });

    // Step 2.6: For each file in the plan, generate content and create the file
    const createdFiles: { [path: string]: string } = {};
    
    if (plan && plan.length > 0) {
      const sandbox = await getSandbox(sandboxId);
      
      for (const { file, desc } of plan) {
        // Generate file content
        const fileContentAgent = createAgent({
          name: "file-content-agent",
          description: `Generate the full content for the file: ${file}. Description: ${desc}`,
          system: `You are a code generation agent for Next.js 15+ applications. Generate the full content for the file \"${file}\" as described: ${desc}.
              CRITICAL REQUIREMENTS:
              - This is a Next.js 15.3.4 application with App Router
              - Use TypeScript for all files
              - Use Tailwind CSS for styling (no separate CSS files)
              - Import Shadcn UI components from "@/components/ui/*"
              - For Next.js Link: import Link from "next/link" and use WITHOUT <a> tags
              - Add "use client" directive ONLY if using React hooks or browser APIs
              - Use modern React patterns and TypeScript

              CRITICAL: DO NOT GENERATE:
              - Sitemaps, page lists, or specifications
              - Markdown content or documentation
              - Comments about what to build
              - Planning or architectural notes
              - Any text that starts with "Sitemap", "Pages", or bullet points

              OUTPUT RULES:
              - Output ONLY executable TypeScript/TSX code
              - For TSX files: Complete React component with proper imports and exports
              - For TS files: Complete TypeScript module with proper types and exports
              - Start immediately with imports or "use client" directive
              - No explanations, no markdown blocks, no commentary
              - Must be valid, runnable code that compiles without errors

              Generate the complete file content now:`,
          model: openai({ model: "gpt-4.1" }),
        });
        const { output } = await fileContentAgent.run({
          previousFiles: previousFiles,
          ...event.data.value,
        });
        // // console.log(`[FILEGEN] Raw output for ${file}:`, output);
        
        // Find the first text message in output
        let fileContent = "";
        const textMsg = output.find((msg: any) => msg.type === "text");
        if (textMsg && "content" in textMsg && typeof textMsg.content === "string") {
          fileContent = textMsg.content;
        } else if (textMsg && "content" in textMsg && Array.isArray(textMsg.content)) {
          fileContent = textMsg.content.join("");
        } else {
          console.error(`[FILEGEN] No text message with content found for ${file}:`, output);
          continue;
        }
        
        // Create the file directly in the sandbox
        // console.log(`[FILEGEN] Creating file: ${file}`);
        try {
          await sandbox.files.write(file, fileContent);
          // Store the file content to return
          createdFiles[file] = fileContent;
          // console.log(`[FILEGEN] Successfully created file: ${file}`);
        } catch (e) {
          console.error(`[FILEGEN] Error creating file ${file}:`, e);
        }
      }
    }

    // Update the state with the created files
    state.data.files = { ...state.data.files, ...createdFiles };

    // Step 3: Run the network (main long-running operation)
    const result = await network.run(event.data.value, { state: state });

    // Step 4: Generate outputs
    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    // Include error information in the summary for better response generation
    let summaryForResponse = result.state.data.summary;
    if (result.state.data.hasErrors && result.state.data.errorMessages.length > 0) {
      summaryForResponse += `\n\nErrors encountered:\n${result.state.data.errorMessages.join('\n')}`;
    }

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(summaryForResponse);
    const { output: responseOutput } = await responseGenerator.run(summaryForResponse);

    // Improved error detection
    const isError = 
      !result.state.data.summary || 
      result.state.data.hasErrors ||
      result.state.data.errorMessages.length > 0 ||
      Object.keys(result.state.data.files || {}).length === 0;

    // Step 5: Get sandbox URL (only if not error)
    const sandboxUrl = !isError ? await step.run("get-sandbox-url", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      } catch (e) {
        console.error("Error getting sandbox URL:", e);
        return null;
      }
    }) : null;

    // Step 5.5: Verify build by checking if the server is running properly
    const buildVerification = !isError && sandboxUrl ? await step.run("verify-build", async () => {
      try {
        const response = await fetch(sandboxUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add a timeout to prevent hanging
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (response.status === 500) {
          console.log("[BUILD VERIFICATION] Server returned 500 - runtime error detected");
          
          // Extract error message from HTML response
          let errorMessage = "Runtime error detected: Server returned 500 status";
          try {
            const htmlContent = await response.text();
            
            // Look for the __NEXT_DATA__ script tag
            const scriptMatch = htmlContent.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
            if (scriptMatch) {
              const jsonData = JSON.parse(scriptMatch[1]);
              if (jsonData.err && jsonData.err.message) {
                errorMessage = `Build Error: ${jsonData.err.message}`;
              }
            }
          } catch (parseError) {
            console.error("[BUILD VERIFICATION] Error parsing HTML response:", parseError);
            // Keep the default error message if parsing fails
          }
          
          return { hasRuntimeError: true, status: response.status, errorMessage };
        } else if (response.status === 200) {
          console.log("[BUILD VERIFICATION] Server is running properly");
          return { hasRuntimeError: false, status: response.status };
        } else {
          console.log(`[BUILD VERIFICATION] Server returned status ${response.status}`);
          return { hasRuntimeError: false, status: response.status };
        }
      } catch (e) {
        console.error("[BUILD VERIFICATION] Error verifying build:", e);
        // If we can't reach the server, don't treat it as a runtime error
        // It might just be starting up or have network issues
        return { hasRuntimeError: false, error: `${e}` };
      }
    }) : { hasRuntimeError: false };

    // Update error status based on build verification
    if (buildVerification.hasRuntimeError) {
      result.state.data.hasErrors = true;
      const errorMsg = 'errorMessage' in buildVerification ? (buildVerification.errorMessage as string) : "Runtime error detected: Server returned 500 status";
      result.state.data.errorMessages.push(errorMsg);
    }

    // Re-evaluate error status after build verification
    const finalIsError = 
      !result.state.data.summary || 
      result.state.data.hasErrors ||
      result.state.data.errorMessages.length > 0 ||
      Object.keys(result.state.data.files || {}).length === 0;

    // Step 6: Save result to database
    await step.run("save-result", async () => {
      if (finalIsError) {
        // Create a more detailed error message
        let errorMessage = "Something went wrong. Please try again.";
        
        if (result.state.data.errorMessages.length > 0) {
          errorMessage = `Errors occurred during execution:\n${result.state.data.errorMessages.slice(0, 3).join('\n')}`;
          if (result.state.data.errorMessages.length > 3) {
            errorMessage += `\n... and ${result.state.data.errorMessages.length - 3} more errors.`;
          }
        }

        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: sanitizeString(errorMessage),
            role: "ASSISTANT",
            type: "ERROR",
          }
        });
      }

      // Sanitize files before saving to database
      const sanitizedFiles = sanitizeFiles(result.state.data.files || {});

      return await prisma.message.create({  
        data: {
          projectId: event.data.projectId,
          content: generateResponse(responseOutput),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl!,
              title: generateFragmentTitle(fragmentTitleOutput),
              files: sanitizedFiles,
            }
          }
        }
      });
    });

    // console.log("[FINAL] Files in result.state.data.files:", Object.keys(result.state.data.files || {}));
    // console.log("[FINAL] Total files count:", Object.keys(result.state.data.files || {}).length);

    // Sanitize all string data before returning
    const sanitizedFiles = sanitizeFiles(result.state.data.files || {});
    const sanitizedSummary = sanitizeString(result.state.data.summary || "");
    const sanitizedErrorMessages = (result.state.data.errorMessages || []).map(msg => sanitizeString(msg));

    return {
      url: sandboxUrl,
      title: generateFragmentTitle(fragmentTitleOutput),
      files: sanitizedFiles,
      summary: sanitizedSummary,
      hasErrors: result.state.data.hasErrors,
      errorMessages: sanitizedErrorMessages,
    };
  }
);


export const sandboxRestartFunction = inngest.createFunction(
  { id: "sandboxRestart"  },
  { event: "sandbox/restart" },
  async ({ event, step }) => {
    // Step 1: Create a new sandbox
    const oneHourInMilliseconds = 3_600_000;
    const newSandboxId = await step.run("create-new-sandbox", async () => {
      const sandbox = await Sandbox.create("CrackAI-Nextjs-1236");
      await sandbox.setTimeout(oneHourInMilliseconds / 4); // start sandbox for 15 minutes
      return sandbox.sandboxId;
    });

    // Step 2: Restore files from the fragment
    await step.run("restore-files", async () => {
      try {
        const sandbox = await getSandbox(newSandboxId);
        const files = event.data.files as { [path: string]: string };

        // Restore all files from the fragment
        for (const [filePath, content] of Object.entries(files)) {
          // console.log(`Restoring file: ${filePath}`);
          await sandbox.files.write(filePath, content);
        }

        return "Files restored successfully";
      } catch (e) {
        console.error("Error restoring files:", e);
        throw new Error(`Failed to restore files: ${e}`);
      }
    });

    // Step 3: Get the new sandbox URL
    const newSandboxUrl = await step.run("get-new-sandbox-url", async () => {
      try {
        const sandbox = await getSandbox(newSandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      } catch (e) {
        console.error("Error getting new sandbox URL:", e);
        throw new Error(`Failed to get sandbox URL: ${e}`);
      }
    });

    // Step 4: Update the fragment in the database
    await step.run("update-fragment", async () => {
      try {
        await prisma.fragment.update({
          where: {
            id: event.data.fragmentId,
          },
          data: {
            sandboxUrl: newSandboxUrl,
            updatedAt: new Date(),
          },
        });

        return "Fragment updated successfully";
      } catch (e) {
        console.error("Error updating fragment:", e);
        throw new Error(`Failed to update fragment: ${e}`);
      }
    });

    return {
      success: true,
      fragmentId: event.data.fragmentId,
      newSandboxUrl,
      message: "Sandbox restarted successfully",
    };
  }
);

