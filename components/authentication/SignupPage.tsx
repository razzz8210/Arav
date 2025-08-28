"use client";

import "@/app/styles/authentication.scss";
import { VerifyOtp } from "@/components/authentication/VerifyOtp";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
 
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const otpRes = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok) {
        throw new Error(otpData.message || "Failed to send OTP");
      }

      // Start transition
      setIsTransitioning(true);
      setTimeout(() => {
        setStep("verify");
        setIsTransitioning(false);
      }, 300);

      toast.success(otpData.message || "OTP sent to your email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        toast.error("Google sign-up failed");
      } else if (result?.ok) {
        // Get the session after successful sign-in
        const session = await getSession();
        if (session?.user) {
          toast.success("Account created successfully! Redirecting...");
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      toast.error("Google sign-up failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "verify") {
      // Start transition
      setIsTransitioning(true);
      setTimeout(() => {
        setStep("signup");
        setIsTransitioning(false);
      }, 300);
    } else {
      router.back();
    }
  };

  return (
    <div className="centered-auth-container">
      {/* Back Button */}
      <button className="centered-auth-back-btn" onClick={handleBack}>
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Centered Form Card */}
      <div className="centered-auth-card">
        {/* Header */}

        <div className={`step-container ${isTransitioning ? 'transitioning' : ''}`}>
          {step === "signup" ? (
            <div className={`step-content signup-step ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              <div className="centered-auth-header">
                <h1>Create new account</h1>
                <p>Start your 7-day free trial</p>
              </div>
              <form onSubmit={handleRequestOtp} className="centered-auth-form">
                <div className="centered-auth-field">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="centered-auth-input"
                  />
                </div>

                <div className="centered-auth-field">
                  <label htmlFor="password">Password</label>
                  <PasswordInput
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="centered-auth-input"
                  />
                </div>

                <div className="centered-auth-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="centered-auth-input"
                  />
                </div>

                <div className="centered-auth-password-hint">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="m7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  At least 8 character
                </div>

                <button
                  type="submit"
                  className="centered-auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Continue"}
                </button>
              </form>
            </div>
          ) : (
            <div className={`step-content verify-step ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              <div className="centered-auth-header">
                <h1>Verify your email</h1>
                <p>Enter the code sent to your email</p>
              </div>
              <VerifyOtp formData={formData} />
            </div>
          )}
        </div>

        {/* Google Sign Up Button */}
        <button
          type="button"
          className="centered-auth-google-btn"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {googleLoading ? "Signing in..." : "Sign in with Google"}
        </button>

        {/* Sign In Link */}
        <div className="centered-auth-link">
          Already have an account? <Link href="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
