import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ session_id: string }> }
) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { session_id } = await context.params;
    const body = await request.json();

    const response = await fetch(
      `https://crack-dev-backend-preprod-98451550634.asia-south1.run.app/generate_slideshow/${session_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating slideshow:", error);
    return NextResponse.json(
      {
        error: "Failed to generate slideshow",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
