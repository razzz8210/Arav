import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const fileName = searchParams.get("file_name");

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (sessionId) {
      queryParams.append("session_id", sessionId);
    }
    if (fileName) {
      queryParams.append("file_name", fileName);
    }

    const response = await fetch(
      `https://crack-dev-backend-preprod-98451550634.asia-south1.run.app/slideshows?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching slideshows:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch slideshows",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
