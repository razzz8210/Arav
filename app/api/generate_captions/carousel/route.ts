import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST /api/generate_video_script - Generate video script
export async function POST(request: Request) {
  try {
    // Try to get user_prompt from query or body
    const { user_prompt, style } = await request.json().catch(() => null);
    if (!user_prompt) {
      return NextResponse.json(
        { error: "Missing user_prompt" },
        { status: 400 }
      );
    }

    console.log("{ user_prompt, style }", { user_prompt, style });

    const authToken = await getUserTokenFromAuthAndCookies();
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/generate_captions_slideshow?gtm_content=${encodeURIComponent(user_prompt)}&style=${style}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating video script:", error);
    return NextResponse.json(
      { error: "Failed to generate video script" },
      { status: 500 }
    );
  }
}
