import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { extractCarouselData } from "@/utils/templates";
import { NextResponse } from "next/server";

// GET /api/templates/preview/carousel?file_name=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file_name");

  try {
    const authToken = await getUserTokenFromAuthAndCookies();

    const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/slideshows`;
    const url = fileName
      ? `${baseUrl}?file_name=${encodeURIComponent(fileName)}`
      : baseUrl;

    const response = await fetch(url, {
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      carousel: extractCarouselData(data),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
