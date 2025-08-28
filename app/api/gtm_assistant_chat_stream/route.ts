import { NextResponse } from "next/server";
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";

// POST /api/gtm_assistant_chat_stream
// Proxies streaming chat responses from backend using SSE
export async function POST(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const { session_id, user_query, user_inputs } = await request.json();

    if (
      typeof session_id !== "string" ||
      typeof user_query !== "string" ||
      typeof user_inputs !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body. Expecting { session_id: string, user_query: string, user_inputs: string }",
        },
        { status: 400 }
      );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/gtm_assistant_chat_stream`;

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ session_id, user_query, user_inputs }),
    });

    if (!backendResponse.ok || !backendResponse.body) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Backend error: ${backendResponse.status} - ${errorText}`,
        },
        { status: backendResponse.status || 500 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = backendResponse.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
