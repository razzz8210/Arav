import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

//Add a new post draft to the database.
export async function DELETE(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const { post_id, project_id } = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/delete_draft_post/${project_id}/${post_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // console.log("Draft post deleted successfully", response);
    const rawData = await response.json();

    return NextResponse.json({
      success: true,
      data: rawData,
    });
  } catch (error) {
    // console.error("Error generate social media content:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed delete draft post",
      },
      { status: 500 }
    );
  }
}
