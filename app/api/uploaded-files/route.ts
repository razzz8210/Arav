import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters to filter by file type
    const authToken = await getUserTokenFromAuthAndCookies();
    const fileType = request.nextUrl.searchParams.get("file_type");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/user-data/list?file_type=${fileType}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      files: data.files,
    });
  } catch (error) {
    console.error("Error listing user files:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed delete draft post",
      },
      { status: 500 }
    );
  }
}
