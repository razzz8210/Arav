import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const usersCollection = await getUsersCollection();
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await prisma.oTP.create({
      data: {
        email: email.toLowerCase(),
        otp,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "User created successfully. Please verify your email with the OTP sent.",
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
