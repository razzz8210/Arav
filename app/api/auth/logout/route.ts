import { NextRequest, NextResponse } from "next/server";
import { cookiesManager } from "@/app/utils/cookies";

export async function POST(request: NextRequest) {
  try {
    // Remove the token from cookies
    await cookiesManager.removeUserToken();
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
