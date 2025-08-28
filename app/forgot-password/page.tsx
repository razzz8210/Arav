import { ForgotPasswordPage } from "@/components/authentication/ForgotPasswordPage";
import { isAuthenticated } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

// Set page metadata
export const metadata: Metadata = {
  title: "Forgot Password - Cracked.AI",
  description: "Reset your Cracked.AI account password",
};

// Force dynamic rendering since we're using cookies
export const dynamic = "force-dynamic";

export default async function ForgotPassword() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/");
  }

  return <ForgotPasswordPage />;
} 