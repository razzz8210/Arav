// app/api/folder-templates/route.ts
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authToken = await getUserTokenFromAuthAndCookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/templates/hook/categories`,
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
      folders: data || [],
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        folders: [],
      },
      { status: 500 }
    );
  }
}
