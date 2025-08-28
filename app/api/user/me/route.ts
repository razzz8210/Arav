import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    // First check for NextAuth session
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      // User is authenticated via NextAuth
      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne(
        { email: session.user.email.toLowerCase() },
        {
          projection: {
            _id: 1,
            email: 1,
            name: 1,
            prismaId: 1,
          },
        }
      );

      if (user) {
        return NextResponse.json({
          status: true,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null,
            prismaId: user.prismaId,
          },
        });
      }
    }

    // Fallback to legacy JWT auth
    const userPayload = await getUserFromCookies();

    if (!userPayload) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userPayload.id) },
      {
        projection: {
          _id: 1,
          email: 1,
          name: 1,
          prismaId: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json({ status: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || null,
        prismaId: user.prismaId,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
