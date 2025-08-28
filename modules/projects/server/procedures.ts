import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { authenticatedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";

export const projectsRouter = createTRPCRouter({
  // Get user's projects
  getMany: authenticatedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.user.prismaId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
    return projects;
  }),
  getOne: authenticatedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.prismaId, // Ensure user can only access their own projects
        },
      });
      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return existingProject;
    }),
  create: authenticatedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Prompt is required" }).max(10000, {
          message: "Prompt is too long, maximum 10000 characters allowed",
        }),
        config: z.string().optional(),
      })
    )
    .mutation(async ({ input: { value, config }, ctx }) => {
      const authToken = await getUserTokenFromAuthAndCookies();
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_URL
        }/session/title?user_prompt=${encodeURIComponent(value)}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to generate session title",
        });
      }
      const data: { status: boolean; title: string } = await response.json();

      // Only create initial message and run code agent for product-builder or all configs
      const shouldCreateInitialMessage =
        config === "product-builder" || config === "all";

      const projectData: any = {
        name: data?.title || "Untitled Project",
        userId: ctx.user.prismaId,
        prompt: value,
      };

      // Add messages only if config requires initial message
      if (shouldCreateInitialMessage) {
        projectData.messages = {
          create: {
            content: value,
            role: "USER",
            type: "RESULT",
          },
        };
      }

      const createdProject = await prisma.project.create({
        data: projectData,
      });

      // Only run code agent if initial message was created
      if (shouldCreateInitialMessage) {
        await inngest.send({
          name: "code-agent/run",
          data: {
            value: value,
            projectId: createdProject.id,
          },
        });
      }
      return createdProject;
    }),
  delete: authenticatedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.prismaId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or you don't have access to it",
        });
      }

      // Delete the project (cascade will handle related messages and fragments)
      await prisma.project.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true, message: "Project deleted successfully" };
    }),
});
