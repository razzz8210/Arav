import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

//Add a new post draft to the database.
export async function POST(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const {
      post_text,
      links,
      type,
      platform,
      schedule_date,
      status,
      project_id,
    } = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/add_draft_post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          post_text,
          links,
          type,
          platform,
          schedule_date,
          status,
          project_id,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

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
          error instanceof Error
            ? error.message
            : "Failed generate social media content",
      },
      { status: 500 }
    );
  }
}
