import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";
import { cookiesManager } from "@/app/utils/cookies";
import { getUsersCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, name, password } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { success: false, message: "Email, OTP, and password are required" },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email: email.toLowerCase(),
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in prisma
    const prismaUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      },
    });
    // Create user
    const user = await usersCollection.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || null,
      prismaId: prismaUser.id,
    });

    // Delete the OTP record
    await prisma.oTP.delete({
      where: { id: otpRecord.id },
    });

    // Generate JWT token
    const token = generateToken({
      id: user.insertedId.toString(),
      email,
      prismaId: prismaUser.id,
    });

    // Set token in cookie
    await cookiesManager.setUserToken(token);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.insertedId.toString(),
        email,
        name: name || null,
        prismaId: prismaUser.id,
      },
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
