import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

//Generate social media content for specified platform (Instagram, LinkedIn, TikTok)
export async function POST(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const { platform, GTM_strategy, num_posts } = await request.json();
    // console.log("Request to generate social media content:", { platform, GTM_strategy, num_posts });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/generate_social_media_content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          platform,
          GTM_strategy,
          num_posts,
        }),
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
      data: {
        platform: data.platform,
        content: data?.posts?.[0]?.content,
      },
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
