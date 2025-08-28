import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { getUsersCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
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

    // Delete any existing OTPs for this email
    await prisma.oTP.deleteMany({
      where: { email: email.toLowerCase() },
    });

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

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.status) {
      // If email fails, delete the OTP record
      await prisma.oTP.deleteMany({
        where: { email: email.toLowerCase() },
      });

      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || "Failed to send OTP email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully to your email",
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
