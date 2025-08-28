import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      prismaId?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && user.email) {
          // Check/create user in your custom users collection
          const { getUsersCollection } = await import("./mongodb");
          const { prisma } = await import("./db");
          const usersCollection = await getUsersCollection();

          const existingUser = await usersCollection.findOne({ 
            email: user.email.toLowerCase() 
          });

          if (!existingUser) {
            // Create user in Prisma first
            const prismaUser = await prisma.user.create({
              data: {
                email: user.email.toLowerCase(),
                name: user.name,
                password: null, // OAuth users don't have passwords
              },
            });

            // Create user in your custom users collection
            await usersCollection.insertOne({
              email: user.email.toLowerCase(),
              name: user.name,
              image: user.image,
              provider: "google",
              googleId: profile?.sub,
              createdAt: new Date(),
              prismaId: prismaUser.id,
            });
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Allow sign in even if custom DB operation fails
      }
    },
    async session({ session, token }) {
      if (session.user) {
        // Use data from JWT token (which comes from your custom collection)
        session.user.id = (token.customUserId as string) || (token.sub as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.name = (token.name as string) || null;
        session.user.prismaId = (token.prismaId as string) || null;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // On initial sign in, get user data from your custom collection
      if (account?.provider === "google" && user?.email) {
        try {
          const { getUsersCollection } = await import("./mongodb");
          const usersCollection = await getUsersCollection();
          
          const customUser = await usersCollection.findOne({ 
            email: user.email.toLowerCase() 
          });
          
          if (customUser) {
            token.customUserId = customUser._id.toString();
            token.prismaId = customUser.prismaId;
            token.email = customUser.email;
            token.name = customUser.name;
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
        }
      }
      
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
