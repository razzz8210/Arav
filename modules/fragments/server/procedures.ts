import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import {
  authenticatedProcedure,
  createTRPCRouter,
} from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const fragmentsRouter = createTRPCRouter({
  // Restart sandbox for a fragment
  restartSandbox: authenticatedProcedure
    .input(
      z.object({
        fragmentId: z.string().min(1, { message: "Fragment ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // First, find the fragment and verify ownership through the message->project->user chain
      const fragment = await prisma.fragment.findFirst({
        where: {
          id: input.fragmentId,
          message: {
            project: {
              userId: ctx.user.prismaId,
            },
          },
        },
        include: {
          message: {
            include: {
              project: true,
            },
          },
        },
      });

      if (!fragment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fragment not found or you don't have access to it",
        });
      }

      // Trigger the sandbox restart via Inngest
      await inngest.send({
        name: "sandbox/restart",
        data: {
          fragmentId: fragment.id,
          projectId: fragment.message.project.id,
          files: fragment.files,
          title: fragment.title,
        },
      });

      return { success: true, message: "Sandbox restart initiated" };
    }),
}); 