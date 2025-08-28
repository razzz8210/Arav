import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/video-templates - Get video templates with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const authToken = await getUserTokenFromAuthAndCookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/templates/avatar?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      templates: data || [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching video templates:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        templates: [],
      },
      { status: 500 }
    );
  }
}
