// app/api/folder-templates/route.ts
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authToken = await getUserTokenFromAuthAndCookies(); // Reuse your existing method
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/bgm_list`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
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
      files: data?.bgm_files?.files || [],
    });
  } catch (error) {
    console.error("Error fetching bgm list:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
