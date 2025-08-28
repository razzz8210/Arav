import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
        const { session_id } = await request.json();
  
    if (!session_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: session_id",
        },
        { status: 400 }
      );
    }

    const authToken = await getUserTokenFromAuthAndCookies();

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/get_conversation_history?session_id=${encodeURIComponent(session_id)}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      conversation_history: data,
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch conversation history",
      },
      { status: 500 }
    );
  }
}
