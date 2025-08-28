import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gtmContent = searchParams.get("gtm_content");
    const style = searchParams.get("style");

    if (!gtmContent) {
      return NextResponse.json(
        { error: "gtm_content parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://crack-dev-backend-preprod-98451550634.asia-south1.run.app/generate_captions_slideshow?gtm_content=${encodeURIComponent(gtmContent)}&style=${style || 'business'}`,
      {
        method: "POST",
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
    console.error("Error generating captions slideshow:", error);
    return NextResponse.json(
      {
        error: "Failed to generate captions slideshow",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
