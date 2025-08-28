import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { extractAvatarData } from "@/utils/templates";
import { NextResponse } from "next/server";

// GET /api/videos - Get videos for a projectId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const fileName = searchParams.get("file_name");

  try {
    const authToken = await getUserTokenFromAuthAndCookies();

    const baseUrl = `${process.env.NEXT_PUBLIC_PIPELINE_URL}/get-videos/?session_id=${projectId}`;
    const url = fileName
      ? `${baseUrl}&file_name=${encodeURIComponent(fileName)}`
      : baseUrl;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();
    const avatars = extractAvatarData(data);

    return NextResponse.json({
      success: true,
      avatars,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error fetching avatars",
        avatars: [],
      },
      { status: 500 }
    );
  }
}
