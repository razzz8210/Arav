import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { AuthUser, getAuthenticatedUser } from "@/lib/auth";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  let user: AuthUser | null = null;

  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.warn("Failed to get user from cookies:", error);
  }

  return {
    user,
    isAuthenticated: !!user,
  };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * @see: https://trpc.io/docs/server/context
 */
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Authenticated procedure that requires a valid user
export const authenticatedProcedure = baseProcedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.user, // Ensures user is not null
    },
  });
});
