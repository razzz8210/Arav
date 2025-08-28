import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { session_id, media_items, hook_demo_name, background_music_url } =
      await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing required path param: session_id" },
        { status: 400 }
      );
    }

    if (!Array.isArray(media_items) || media_items.length === 0) {
      return NextResponse.json(
        { error: "Request body must include non-empty media_items array" },
        { status: 400 }
      );
    }

    const authToken = await getUserTokenFromAuthAndCookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/hook-demo/${encodeURIComponent(
        session_id
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          media_items,
          hook_demo_name,
          background_music_url,
        }),
      }
    );

    const data = await response
      .json()
      .catch(() => ({ error: "Invalid JSON from external service" }));

    if (!response.ok) {
      return NextResponse.json(
        { error: (data as any)?.error || "Failed to create hook demo" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Error creating hook demo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
