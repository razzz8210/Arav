// app/api/slideshow_templates/route.ts
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const category = searchParams.get("category");

    const authToken = await getUserTokenFromAuthAndCookies();

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page,
      limit: limit,
    });

    if (category) {
      queryParams.append("category", category);
    }

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/templates/slideshow?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        signal: request.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching slideshow templates:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch slideshow templates",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
