import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST /api/generate_video_script - Generate video script
export async function POST(request: Request) {
  try {
    // Try to get user_prompt from query or body
    const { searchParams } = new URL(request.url);
    let user_prompt = searchParams.get("user_prompt");
    if (!user_prompt) {
      const body = await request.json().catch(() => null);
      user_prompt = body?.user_prompt;
    }
    if (!user_prompt) {
      return NextResponse.json(
        { error: "Missing user_prompt" },
        { status: 400 }
      );
    }
    const authToken = await getUserTokenFromAuthAndCookies();
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/generate_hook_caption?gtm_content=${encodeURIComponent(user_prompt)}`,
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
