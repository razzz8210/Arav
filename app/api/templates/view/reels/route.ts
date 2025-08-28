// app/api/hook-demo_templates/route.ts
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
      page,
      limit,
    });

    if (category) {
      queryParams.append("category", category);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/templates/hook?${queryParams.toString()}`,
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching template data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch template data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
