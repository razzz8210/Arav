import { SigninPage } from "@/components/authentication/SigninPage";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// Force dynamic rendering since we're using cookies and sessions
export const dynamic = "force-dynamic";

// Set page metadata (similar to `meta` in Remix)
export const metadata: Metadata = {
  title: "Sign In - Cracked.AI",
  description: "Sign in to your Cracked.AI account",
};

export default async function Signin() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/");
  }

  return <SigninPage />;
}
