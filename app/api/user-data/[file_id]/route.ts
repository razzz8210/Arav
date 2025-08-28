import { NextResponse } from "next/server";
import { getUserTokenFromAuthAndCookies } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    file_id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { file_id } = (await context.params) || {};

    if (!file_id) {
      return NextResponse.json(
        { success: false, error: "Missing required path param: file_id" },
        { status: 400 }
      );
    }

    const authToken = await getUserTokenFromAuthAndCookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/user-data/${encodeURIComponent(
        file_id
      )}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
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

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete user file",
      },
      { status: 500 }
    );
  }
}
