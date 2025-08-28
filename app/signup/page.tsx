import { SignupPage } from "@/components/authentication/SignupPage";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// Static metadata for the signup page
export const metadata: Metadata = {
  title: "Sign Up - Cracked.AI",
  description: "Create your Cracked.AI account",
};

// Force dynamic rendering since we're using cookies and sessions
export const dynamic = "force-dynamic";

export default async function Signup() {
  // Check both NextAuth session and JWT cookies
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/");
  }

  return <SignupPage />;
}
