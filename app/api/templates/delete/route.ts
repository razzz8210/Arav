import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const { fileName, type } = await request.json();

  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PIPELINE_URL}/delete-video/`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          session_id: projectId,
          file_name: fileName,
          type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete video",
        success: false,
      },
      { status: 500 }
    );
  }
}
