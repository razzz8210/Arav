import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

// Get all post drafts for the current user
export async function GET(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return new Response(JSON.stringify({ success: false, error: "Missing projectId" }), {
        status: 400,
      });
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get_draft_posts/${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const rawData = await response.json();

    return NextResponse.json({
      success: true,
      data: rawData,
    });
  } catch (error) {
    console.error("Error fetching draft posts:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch draft posts",
      },
      { status: 500 }
    );
  }
}
