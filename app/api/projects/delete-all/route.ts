import { NextResponse } from "next/server";
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";

export async function DELETE(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Call the backend API that handles MongoDB deletion
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/delete-all/${session_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Project data deletion completed via backend API",
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete project data via backend API",
      },
      { status: 500 }
    );
  }
}
