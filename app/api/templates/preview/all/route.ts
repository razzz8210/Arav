import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import {
  extractAvatarData,
  extractCarouselData,
  extractReelData,
} from "@/utils/templates";
import { NextResponse } from "next/server";

interface Template {
  urls: string[];
  fileName: string;
  createdAt: number;
  type: string;
  taskStatus: string;
}

export async function GET(request: Request) {
  const authToken = await getUserTokenFromAuthAndCookies();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  const avatarUrl = `${process.env.NEXT_PUBLIC_PIPELINE_URL}/get-videos/?session_id=${projectId}`;
  const reelUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/hook-demos?session_id=${projectId}`;
  const carouselUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/slideshows?session_id=${projectId}`;

  try {
    // Fetch from all three APIs in parallel using Promise.allSettled
    const [avatarsResult, reelsResult, carouselResult] =
      await Promise.allSettled([
        fetch(avatarUrl, {
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        }),
        fetch(reelUrl, {
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        }),
        fetch(carouselUrl, {
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        }),
      ]);

    let templates: Template[] = [];

    if (avatarsResult.status === "fulfilled" && avatarsResult.value.ok) {
      templates = [
        ...templates,
        ...extractAvatarData((await avatarsResult.value.json()) ?? {}),
      ];
    }

    if (reelsResult.status === "fulfilled" && reelsResult.value.ok) {
      templates = [
        ...templates,
        ...extractReelData((await reelsResult.value.json()) ?? {}),
      ];
    }

    if (carouselResult.status === "fulfilled" && carouselResult.value.ok) {
      const carouselData = await carouselResult.value.json();
      templates = [...templates, ...extractCarouselData(carouselData ?? {})];
    }

    templates.sort((a, b) => b.createdAt - a.createdAt);

    if (avatarsResult.status === "rejected") {
      console.error("Failed to fetch avatars:", avatarsResult.reason);
    }
    if (reelsResult.status === "rejected") {
      console.error("Failed to fetch reels:", reelsResult.reason);
    }
    if (carouselResult.status === "rejected") {
      console.error("Failed to fetch carousel:", carouselResult.reason);
    }

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Error in templates/all API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        templates: [],
      },
      { status: 500 }
    );
  }
}
