// app/api/folder-carousels/route.ts
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/templates/slideshow/categories`,
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
      folders: data || [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching carousel folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel folders", folders: [] },
      { status: 500 }
    );
  }
}
