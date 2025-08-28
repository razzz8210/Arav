import { Input } from "@/components/ui/input";
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import {
  authenticatedProcedure,
  baseProcedure,
  createTRPCRouter,
} from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  getMany: authenticatedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      // First verify that the project belongs to the authenticated user
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.user.prismaId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or you don't have access to it",
        });
      }

      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          fragment: true,
        },
        orderBy: {
          updatedAt: "asc",
        },
      });

      return messages;
    }),

  // Create message (requires authentication and project ownership)
  create: authenticatedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Prompt is required" }).max(10000, {
          message: "Prompt is too long, maximum 10000 characters allowed",
        }),
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // First verify that the project belongs to the authenticated user
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.user.prismaId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or you don't have access to it",
        });
      }

      const createdMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return createdMessage;
    }),
});
