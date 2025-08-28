import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST /api/full-pipeline - Publish video pipeline
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, template, text, session_id } = body;
    if (!template || !text || !session_id) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${!template ? "template" : ""} ${
            !text ? "text" : ""
          } ${!session_id ? "session_id" : ""}`,
        },
        { status: 400 }
      );
    }
    const authToken = await getUserTokenFromAuthAndCookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PIPELINE_URL}/full-pipeline/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ url, template, text, session_id }),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error publishing pipeline:", error);
    return NextResponse.json(
      { error: "Failed to publish pipeline" },
      { status: 500 }
    );
  }
}
