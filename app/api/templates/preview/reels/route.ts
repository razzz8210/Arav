import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { extractReelData } from "@/utils/templates";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file_name");

  try {
    const authToken = await getUserTokenFromAuthAndCookies();

    const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/hook-demos`;
    const url = fileName
      ? `${baseUrl}?file_name=${encodeURIComponent(fileName)}`
      : baseUrl;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      reels: extractReelData(data),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
